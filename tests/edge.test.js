import { it, expect, vi } from 'vitest'
import { createHandler, geoapifyProvider, CACHE_MS } from '../supabase/functions/get-restaurants/handler'

const restaurant = { id: '1', name: 'Café', city: 'São Paulo', state: 'SP', municipalityVerification: 'boundary' }
it('cache Supabase dura 24h, expira no limite e separa municípios', async () => {
  let time = Date.UTC(2026, 10, 13)
  const rows = new Map()
  const cache = { get: vi.fn(key => rows.get(key)), set: vi.fn((key, value) => rows.set(key, value)) }
  const provider = vi.fn(async () => [restaurant])
  const handler = createHandler({ cache, fetchMunicipality: provider, now: () => time })
  expect((await handler({ city: 'São Paulo', state: 'SP' })).cached).toBe(false)
  time += CACHE_MS - 1
  expect((await handler({ city: 'sao paulo', state: 'São Paulo' })).cached).toBe(true)
  expect(provider).toHaveBeenCalledTimes(1)
  time += 1
  expect((await handler({ city: 'São Paulo', state: 'SP' })).cached).toBe(false)
  expect((await handler({ city: 'Guarulhos', state: 'SP' })).restaurants).toEqual([])
  expect(rows.size).toBe(2)
})
it('falhas geográficas não gravam vazio no cache', async () => {
  const cache = { get: vi.fn(), set: vi.fn() }
  const handler = createHandler({ cache, fetchMunicipality: vi.fn().mockRejectedValue(new Error('offline')) })
  await expect(handler({ city: 'São Paulo', state: 'SP' })).rejects.toThrow('offline')
  expect(cache.set).not.toHaveBeenCalled()
})
it('Geoapify usa limite municipal e mantém evidência geográfica sem raio', async () => {
  const fetcher = vi.fn()
    .mockResolvedValueOnce({ ok: true, json: async () => ({ features: [{ properties: { country_code: 'br', result_type: 'city', city: 'São Paulo', state: 'São Paulo', place_id: 'municipio' } }] }) })
    .mockResolvedValueOnce({ ok: true, json: async () => ({ features: [{ properties: { name: 'Café', place_id: 'cafe', formatted: 'Centro', datasource: { raw: { osm_type: 'n', osm_id: 123, cuisine: 'pizza' } } }, geometry: { type: 'Point', coordinates: [-46, -23] } }] }) })
  const result = await geoapifyProvider('mock', fetcher)('sao paulo', 'SP')
  expect(fetcher.mock.calls[1][0].searchParams.get('filter')).toBe('place:municipio')
  expect(result[0]).toMatchObject({ id: 'n-123', category: 'Pizzaria', city: 'São Paulo', municipalityVerification: 'boundary', municipalityBoundaryId: 'municipio' })
})
it('recusa geocoder de outra cidade ou estado sem fazer busca por proximidade', async () => {
  const fetcher = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ features: [{ properties: { city: 'Guarulhos', state: 'SP', country_code: 'br', result_type: 'city', place_id: 'outro' } }] }) })
  await expect(geoapifyProvider('mock', fetcher)('São Paulo', 'SP')).rejects.toThrow('confirmar')
  expect(fetcher).toHaveBeenCalledTimes(1)
})

it('imagem é associada ao local correto e não cria foto fictícia', async () => {
  const features = [
    { properties: { name: 'Com foto', place_id: 'foto', wiki_and_media: { image: 'https://example.org/local.jpg' } }, geometry: { type: 'Point', coordinates: [-46.1, -23.1] } },
    { properties: { name: 'Sem foto', place_id: 'sem-foto' }, geometry: { type: 'Point', coordinates: [-46.2, -23.2] } },
  ]
  const fetcher = vi.fn()
    .mockResolvedValueOnce({ ok: true, json: async () => ({ features: [{ properties: { country_code: 'br', result_type: 'city', city: 'São Paulo', state: 'São Paulo', place_id: 'municipio' } }] }) })
    .mockResolvedValueOnce({ ok: true, json: async () => ({ features }) })
  const results = await geoapifyProvider('mock', fetcher)('São Paulo', 'SP')
  expect(results[0].image).toBe('https://example.org/local.jpg')
  expect(results[1].image).toBeNull()
})
