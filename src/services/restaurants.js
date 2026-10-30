
const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search'

const OVERPASS_SERVERS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
]

const CACHE_DURATION = 6 * 60 * 60 * 1000
const GEO_CACHE_DURATION = 30 * 24 * 60 * 60 * 1000
const REQUEST_TIMEOUT = 30000

const memoryCache = new Map()
const pendingRequests = new Map()

function readCache(key) {
  try {
    const stored = localStorage.getItem(key)

    if (!stored) return null

    const cache = JSON.parse(stored)

    if (Date.now() - cache.timestamp > cache.duration) {
      localStorage.removeItem(key)
      return null
    }

    return cache.data
  } catch {
    return null
  }
}

function saveCache(key, data, duration) {
  const cache = {
    timestamp: Date.now(),
    duration,
    data,
  }

  try {
    localStorage.setItem(key, JSON.stringify(cache))
  } catch {
    // O funcionamento continua mesmo se o armazenamento estiver cheio.
  }
}

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController()

  const timeout = setTimeout(
    () => controller.abort(),
    REQUEST_TIMEOUT
  )

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    })

    if (!response.ok) {
      throw new Error(`Erro HTTP ${response.status}`)
    }

    return response
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('O servidor demorou para responder.')
    }

    throw error
  } finally {
    clearTimeout(timeout)
  }
}

export async function getRestaurants(city, state) {
  if (!city?.trim() || !state?.trim()) {
    return []
  }

  const normalizedCity = city.trim().toLowerCase()
  const normalizedState = state.trim().toLowerCase()
  const cacheKey = `foodrank-restaurants-${normalizedCity}-${normalizedState}`

  const memoryResult = memoryCache.get(cacheKey)

  if (
    memoryResult &&
    Date.now() - memoryResult.timestamp < CACHE_DURATION
  ) {
    return memoryResult.data
  }

  const savedResult = readCache(cacheKey)

  if (savedResult) {
    memoryCache.set(cacheKey, {
      timestamp: Date.now(),
      data: savedResult,
    })

    return savedResult
  }

  if (pendingRequests.has(cacheKey)) {
    return pendingRequests.get(cacheKey)
  }

  const request = searchRestaurants(city.trim(), state.trim())
    .then((restaurants) => {
      memoryCache.set(cacheKey, {
        timestamp: Date.now(),
        data: restaurants,
      })

      saveCache(cacheKey, restaurants, CACHE_DURATION)

      return restaurants
    })
    .finally(() => {
      pendingRequests.delete(cacheKey)
    })

  pendingRequests.set(cacheKey, request)

  return request
}

async function getCityCoordinates(city, state) {
  const cacheKey = `foodrank-coordinates-${city.toLowerCase()}-${state.toLowerCase()}`

  const savedCoordinates = readCache(cacheKey)

  if (savedCoordinates) {
    return savedCoordinates
  }

  const params = new URLSearchParams({
    q: `${city}, ${state}, Brasil`,
    format: 'jsonv2',
    countrycodes: 'br',
    limit: '1',
  })

  const response = await fetchWithTimeout(
    `${NOMINATIM_URL}?${params.toString()}`,
    {
      headers: {
        Accept: 'application/json',
      },
    }
  )

  const locations = await response.json()

  if (!locations.length) {
    throw new Error(`A cidade "${city}" não foi encontrada.`)
  }

  const coordinates = {
    latitude: Number(locations[0].lat),
    longitude: Number(locations[0].lon),
  }

  if (
    !Number.isFinite(coordinates.latitude) ||
    !Number.isFinite(coordinates.longitude)
  ) {
    throw new Error('A localização encontrada é inválida.')
  }

  saveCache(cacheKey, coordinates, GEO_CACHE_DURATION)

  return coordinates
}

async function searchOverpass(latitude, longitude) {
  const radius = 5000

  const query = `
  [out:json][timeout:25];

  (
    nwr["amenity"="restaurant"]["name"](around:${radius},${latitude},${longitude});
    nwr["amenity"="cafe"]["name"](around:${radius},${latitude},${longitude});
    nwr["amenity"="fast_food"]["name"](around:${radius},${latitude},${longitude});
  );

  out center tags;
`

  let lastError

  for (const server of OVERPASS_SERVERS) {
    try {
      const response = await fetchWithTimeout(server, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
        },
        body: new URLSearchParams({ data: query }),
      })

      const data = await response.json()

      if (!Array.isArray(data.elements)) {
        throw new Error('Resposta inválida do serviço de restaurantes.')
      }

      return data.elements
    } catch (error) {
      lastError = error
    }
  }

  throw lastError || new Error('Os servidores de restaurantes estão indisponíveis.')
}

async function searchRestaurants(city, state) {
  const { latitude, longitude } = await getCityCoordinates(city, state)

  const elements = await searchOverpass(latitude, longitude)

  const restaurants = elements
    .filter((item) => item.tags?.name)
    .map((item) => ({
      id: `${item.type}-${item.id}`,
      osmId: item.id,
      osmType: item.type,

      name: item.tags.name,

      latitude: item.lat ?? item.center?.lat ?? null,
      longitude: item.lon ?? item.center?.lon ?? null,

      category: getCategory(item.tags),
      location: getLocation(item.tags, city, state),

      city,
      state,

      externalRating: null,
      externalRatingCount: null,
      foodrankRating: null,
      rating: null,

      price: getPrice(item.tags),
      image: getImage(item.tags),
    }))

  return Array.from(
    new Map(
      restaurants.map((restaurant) => [
        restaurant.id,
        restaurant,
      ])
    ).values()
  )
}

function getCategory(tags) {
  if (tags.amenity === 'cafe') return 'Café'
  if (tags.amenity === 'fast_food') return 'Fast Food'
  if (tags.cuisine) return formatCuisine(tags.cuisine)

  return 'Restaurante'
}

function formatCuisine(cuisine) {
  const cuisineMap = {
    brazilian: 'Brasileira',
    brazilian_food: 'Brasileira',
    italian: 'Italiana',
    italian_food: 'Italiana',
    japanese: 'Japonesa',
    sushi: 'Japonesa',
    pizza: 'Pizzaria',
    burger: 'Hambúrguer',
    hamburger: 'Hambúrguer',
    vegetarian: 'Vegetariana',
    vegan: 'Vegetariana',
    steak_house: 'Carnes',
    barbecue: 'Churrascaria',
    cafe: 'Café',
    coffee_shop: 'Café',
    bakery: 'Padaria',
    bakery_cafe: 'Café',
    mexican: 'Mexicana',
    chinese: 'Chinesa',
    french: 'Francesa',
    seafood: 'Frutos do mar',
  }

  const cuisines = cuisine
    .toLowerCase()
    .split(';')
    .map((item) => item.trim())

  for (const item of cuisines) {
    if (cuisineMap[item]) return cuisineMap[item]
  }

  return cuisines[0]
    ? cuisines[0].charAt(0).toUpperCase() + cuisines[0].slice(1)
    : 'Restaurante'
}

function getLocation(tags, city, state) {
  if (tags['addr:street']) {
    return `${tags['addr:street']}, ${city} - ${state}`
  }

  return `${city} - ${state}`
}

function getPrice(tags) {
  return tags.price_range || '$$'
}

function getImage(tags) {
  return (
    tags.image ||
    'https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=900&q=80'
  )
}
