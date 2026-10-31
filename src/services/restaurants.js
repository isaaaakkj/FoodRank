
import { supabase } from './supabase'

const CACHE_DURATION = 6 * 60 * 60 * 1000

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

export async function getRestaurants(city, state) {
  if (!city?.trim() || !state?.trim()) {
    return []
  }

  const normalizedCity = city.trim().toLowerCase()
  const normalizedState = state.trim().toLowerCase()

  // A versão 2 evita reutilizar dados antigos do Overpass.
  const cacheKey = `foodrank-restaurants-v2-${normalizedCity}-${normalizedState}`

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

  const request = searchRestaurants(
    city.trim(),
    state.trim()
  )
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

async function searchRestaurants(city, state) {
  const { data, error } = await supabase.functions.invoke(
    'get-restaurants',
    {
      body: {
        city,
        state,
      },
    }
  )

  if (error) {
    console.error('Erro ao consultar a Edge Function:', error)

    throw new Error(
      error.message || 'Não foi possível buscar os restaurantes.'
    )
  }

  if (data?.error) {
    throw new Error(data.error)
  }

  if (!Array.isArray(data?.restaurants)) {
    throw new Error(
      'A resposta do servidor não contém uma lista válida de restaurantes.'
    )
  }

  return data.restaurants
}
