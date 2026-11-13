import { normalize, normalizeState, municipalityKey, confirmedRestaurants } from '../_shared/municipality.js'
import { restaurantCategory } from './categories.js'

export const CACHE_MS = 24 * 60 * 60 * 1000

// Dependencies are injected so tests never contact production services.
export function createHandler({ cache, fetchMunicipality, now = Date.now }) {
  const pending = new Map()
  return async ({ city, state }) => {
    if (typeof city !== 'string' || typeof state !== 'string' || !normalize(city) || !normalize(state) || city.length > 100 || state.length > 100) {
      throw new Error('Município inválido')
    }
    const key = municipalityKey(city, state)
    const envelope = (restaurants, cached, createdAt) => ({
      restaurants, cached, schemaVersion: 3,
      municipality: { city: normalize(city), state: normalizeState(state), country: 'BR' },
      expiresAt: new Date(createdAt + CACHE_MS).toISOString(),
    })
    const stored = await cache.get(key)
    const age = now() - Date.parse(stored?.created_at)
    if (stored?.version === 3 && Number.isFinite(age) && age >= 0 && age < CACHE_MS && Array.isArray(stored.restaurants)) {
      return envelope(confirmedRestaurants(stored.restaurants, city, state), true, Date.parse(stored.created_at))
    }
    if (pending.has(key)) return pending.get(key)
    const request = (async () => {
      const restaurants = confirmedRestaurants(await fetchMunicipality(city, state), city, state)
      const timestamp = now()
      await cache.set(key, { version: 3, restaurants, created_at: new Date(timestamp).toISOString() })
      return envelope(restaurants, false, timestamp)
    })().finally(() => pending.delete(key))
    pending.set(key, request)
    return request
  }
}

export function geoapifyProvider(apiKey, fetcher = fetch) {
  async function request(path, params, deadline) {
    const url = new URL(`https://api.geoapify.com/${path}`)
    url.search = new URLSearchParams({ ...params, apiKey }).toString()
    const response = await fetcher(url, { signal: AbortSignal.any([AbortSignal.timeout(15000), deadline]) })
    if (!response.ok) throw new Error('Provedor geográfico indisponível')
    const data = await response.json()
    if (!Array.isArray(data.features)) throw new Error('Resposta geográfica inválida')
    return data.features
  }
  return async (city, state) => {
    const deadline = AbortSignal.timeout(55000)
    const matches = await request('v1/geocode/search', { city, state, country: 'Brazil', type: 'city', filter: 'countrycode:br', limit: '10' }, deadline)
    const candidates = matches.map(item => item.properties).filter(p =>
      p && normalize(p.country_code) === 'br' && p.result_type === 'city' &&
      normalize(p.city ?? p.name) === normalize(city) &&
      normalizeState(p.state_code ?? p.state) === normalizeState(state) && p.place_id)
    const unique = [...new Map(candidates.map(p => [p.place_id, p])).values()]
    if (unique.length !== 1) throw new Error('Não foi possível confirmar o município e seus limites')
    const municipality = unique[0]
    const restaurants = []
    // A place filter uses the provider's boundary, never a radius or ranking bias.
    for (let offset = 0; offset < 10000; offset += 500) {
      const page = await request('v2/places', {
        categories: 'catering.restaurant,catering.cafe,catering.fast_food',
        filter: `place:${municipality.place_id}`, limit: '500', offset: String(offset),
      }, deadline)
      for (const feature of page) {
        const p = feature.properties
        if (!p?.place_id || !p.name) continue
        const coordinates = feature.geometry?.coordinates
        if (feature.geometry?.type !== 'Point' || !Array.isArray(coordinates) || coordinates.length < 2 || !coordinates.every(Number.isFinite) || Math.abs(coordinates[0]) > 180 || Math.abs(coordinates[1]) > 90) continue
        restaurants.push({
          id: p.datasource?.raw?.osm_id && p.datasource.raw.osm_type ? `${p.datasource.raw.osm_type}-${p.datasource.raw.osm_id}` : `geoapify-${p.place_id}`,
          osmId: p.datasource?.raw?.osm_id ?? null, osmType: p.datasource?.raw?.osm_type ?? null,
          name: p.name, category: restaurantCategory(p),
          city: municipality.city ?? municipality.name, state: municipality.state ?? normalizeState(municipality.state_code),
          location: p.formatted ?? [p.street, p.housenumber].filter(Boolean).join(', '),
          longitude: coordinates[0], latitude: coordinates[1],
          municipalityVerification: 'boundary', municipalityBoundaryId: municipality.place_id,
          price: p.datasource?.raw?.price_range || '$$', rating: null,
          externalRating: null, externalRatingCount: null, foodrankRating: null,
          image: p.datasource?.raw?.image || 'https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=900&q=80',
        })
      }
      if (page.length < 500) return restaurants
    }
    // Do not cache or present silently truncated coverage as a complete response.
    throw new Error('Limite de cobertura do provedor atingido')
  }
}
