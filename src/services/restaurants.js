const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search'
const OVERPASS_URL = 'https://overpass-api.de/api/interpreter'

const restaurantsCache = {}
const restaurantsPromise = {}

export async function getRestaurants(
  city = 'Campos do Jordão',
  state = 'São Paulo'
) {
  const normalizedCity = city.trim().toLowerCase()
  const normalizedState = state.trim().toLowerCase()

  const cacheKey = `${normalizedCity}-${normalizedState}`

  if (restaurantsCache[cacheKey]) {
    return restaurantsCache[cacheKey]
  }

  if (restaurantsPromise[cacheKey]) {
    return restaurantsPromise[cacheKey]
  }

  restaurantsPromise[cacheKey] = searchRestaurants(
    city,
    state,
    cacheKey
  )

  try {
    return await restaurantsPromise[cacheKey]
  } finally {
    delete restaurantsPromise[cacheKey]
  }
}

async function searchRestaurants(city, state, cacheKey) {
  const params = new URLSearchParams({
    q: `${city}, ${state}, Brasil`,
    format: 'jsonv2',
    countrycodes: 'br',
    limit: '1',
    addressdetails: '1',
  })

  const response = await fetch(
    `${NOMINATIM_URL}?${params.toString()}`
  )

  if (!response.ok) {
    throw new Error(
      'Não foi possível localizar a cidade.'
    )
  }

  const locations = await response.json()

  console.log('NOMINATIM:', locations)

  if (!locations.length) {
    throw new Error(
      `A cidade "${city}" não foi encontrada.`
    )
  }

  const location = locations[0]

  const latitude = Number(location.lat)
  const longitude = Number(location.lon)

  if (
    Number.isNaN(latitude) ||
    Number.isNaN(longitude)
  ) {
    throw new Error(
      'A localização encontrada é inválida.'
    )
  }

  const radius = 15000

  const query = `
    [out:json][timeout:30];

    (
      nwr["amenity"="restaurant"](around:${radius},${latitude},${longitude});
      nwr["amenity"="cafe"](around:${radius},${latitude},${longitude});
      nwr["amenity"="fast_food"](around:${radius},${latitude},${longitude});
    );

    out center tags;
  `

  const overpassResponse = await fetch(
    `${OVERPASS_URL}?data=${encodeURIComponent(query)}`
  )

  if (!overpassResponse.ok) {
    throw new Error(
      'O serviço de restaurantes não respondeu.'
    )
  }

  const data = await overpassResponse.json()

  console.log('OVERPASS:', data)

  const restaurants = data.elements
    .filter((item) => item.tags?.name)
    .map((item) => ({
      id: item.id,

      name: item.tags.name,

      latitude:
        item.lat ??
        item.center?.lat ??
        null,

      longitude:
        item.lon ??
        item.center?.lon ??
        null,

      category: getCategory(item.tags),

      location: getLocation(
        item.tags,
        city,
        state
      ),

      city,
      state,

      rating: '—',

      price: getPrice(item.tags),

      image: getImage(item.tags),
    }))

  const uniqueRestaurants = Array.from(
    new Map(
      restaurants.map((restaurant) => [
        restaurant.id,
        restaurant,
      ])
    ).values()
  )

  restaurantsCache[cacheKey] = uniqueRestaurants

  return uniqueRestaurants
}

function getCategory(tags) {
  if (tags.amenity === 'cafe') {
    return 'Café'
  }

  if (tags.amenity === 'fast_food') {
    return 'Fast Food'
  }

  if (tags.cuisine) {
    return formatCuisine(tags.cuisine)
  }

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
    if (cuisineMap[item]) {
      return cuisineMap[item]
    }
  }

  return cuisines[0]
    ? cuisines[0].charAt(0).toUpperCase() +
        cuisines[0].slice(1)
    : 'Restaurante'
}

function getLocation(tags, city, state) {
  if (tags['addr:street']) {
    return `${tags['addr:street']}, ${city} - ${state}`
  }

  return `${city} - ${state}`
}

function getPrice(tags) {
  if (tags.price_range) {
    return tags.price_range
  }

  return '$$'
}

function getImage(tags) {
  return (
    tags.image ||
    'https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=900&q=80'
  )
}