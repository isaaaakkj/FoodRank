import { it, expect, vi } from 'vitest'
import { supabaseCache } from '../supabase/functions/get-restaurants/cache'
import { municipalityKey } from '../supabase/functions/_shared/municipality'
import { restaurantCategory } from '../supabase/functions/get-restaurants/categories'

it('usa o schema real sem migrar ou ler chaves legadas', async () => {
  const value = { restaurants: [], created_at: new Date().toISOString() }
  const upsert = vi.fn().mockResolvedValue({ error: null })
  const eq = vi.fn().mockReturnValue({ maybeSingle: async () => ({ data: { restaurants: [], fetched_at: value.created_at, expires_at: new Date(Date.now() + 86400000).toISOString() }, error: null }) })
  const from = vi.fn().mockReturnValue({ upsert, select: vi.fn().mockReturnValue({ eq }) })
  const cache = supabaseCache({ from })
  const key = municipalityKey('São Paulo', 'São Paulo')
  await cache.set(key, value)
  expect(from).toHaveBeenCalledWith('restaurant_cache')
  expect(upsert).toHaveBeenCalledWith(expect.objectContaining({ cache_key: key, city: 'sao paulo', state: 'SP', fetched_at: value.created_at }))
  const saved = upsert.mock.calls[0][0]
  expect(Date.parse(saved.expires_at) - Date.parse(saved.fetched_at)).toBe(86400000)
  expect(await cache.get(key)).toEqual({ ...value, version: 3 })
  expect(eq).toHaveBeenCalledWith('cache_key', key)
})
it('mantém categorias do raw OSM usadas pela função atual', () => {
  expect(restaurantCategory({ datasource: { raw: { cuisine: 'pizza' } } })).toBe('Pizzaria')
  expect(restaurantCategory({ datasource: { raw: { cuisine: 'burger', amenity: 'fast_food' } } })).toBe('Hambúrguer')
  expect(restaurantCategory({ categories: ['catering.cafe'] })).toBe('Café')
})
