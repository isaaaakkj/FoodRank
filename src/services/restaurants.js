
import { supabase } from './supabase'
import { municipalityKey, confirmedRestaurants } from '../../supabase/functions/_shared/municipality'

const CACHE_DURATION = 6 * 60 * 60 * 1000

const memoryCache = new Map()
const pendingRequests = new Map()

function readCache(key) {
  try {
    const stored = localStorage.getItem(key)

    if (!stored) return null

    const cache = JSON.parse(stored)

    if (Date.now() - cache.timestamp >= cache.duration) {
      localStorage.removeItem(key)
      return null
    }

    return Array.isArray(cache.data) && Number.isFinite(cache.timestamp) && cache.duration === CACHE_DURATION && cache.timestamp <= Date.now() ? cache : null
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

  const cacheKey = municipalityKey(city, state)

  const memoryResult = memoryCache.get(cacheKey)

  if (
    memoryResult &&
    Date.now() - memoryResult.timestamp < CACHE_DURATION
  ) {
    return confirmedRestaurants(memoryResult.data, city, state)
  }

  const savedResult = readCache(cacheKey)

  if (savedResult) {
    memoryCache.set(cacheKey, {
      timestamp: savedResult.timestamp,
      data: savedResult.data,
    })

    return confirmedRestaurants(savedResult.data, city, state)
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
  if (!supabase) throw new Error('Busca indisponível: configure as variáveis públicas do Supabase e gere um novo build.')

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
    throw new Error('Não foi possível buscar os restaurantes. Tente novamente em instantes.')
  }

  if (data?.error) {
    throw new Error('O serviço de restaurantes está temporariamente indisponível.')
  }

  if (!Array.isArray(data?.restaurants)) {
    throw new Error(
      'A resposta do servidor não contém uma lista válida de restaurantes.'
    )
  }

  if (data.restaurants.some(item => item && !['boundary', 'address'].includes(item.municipalityVerification))) {
    const error = new Error('O serviço precisa confirmar o município dos restaurantes antes de exibi-los. A atualização geográfica do backend está pendente.')
    error.code = 'MUNICIPALITY_VERIFICATION_REQUIRED'
    throw error
  }

  return confirmedRestaurants(data.restaurants, city, state)
}
