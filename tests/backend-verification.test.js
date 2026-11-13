// @vitest-environment node
import { it, expect, vi } from 'vitest'
import { verifyBackend } from '../scripts/verify-backend.mjs'

const cities = [{ city: 'Santo André', state: 'SP' }, { city: 'São Bernardo do Campo', state: 'SP' }]
const now = Date.UTC(2026, 10, 13)
const config = { url: 'https://example.supabase.co', key: 'sb_publishable_test', origin: 'https://isaaaakkj.github.io', cities, now: () => now }
function mockFetch(transform = data => data) {
  return vi.fn(async (_, options) => {
    const location = JSON.parse(options.body)
    return new Response(JSON.stringify(transform({
      schemaVersion: 3, municipality: { ...location, country: 'BR' }, cached: true,
      expiresAt: new Date(now + 24 * 60 * 60 * 1000).toISOString(),
      restaurants: [{ id: '1', name: 'Café', ...location, municipalityVerification: 'boundary', municipalityBoundaryId: 'municipio' }],
    })), { headers: { 'Access-Control-Allow-Origin': config.origin } })
  })
}
it('libera somente contrato compatível, cache e cidades distintas', async () => {
  const fetcher = mockFetch()
  await verifyBackend({ ...config, fetcher })
  expect(fetcher).toHaveBeenCalledTimes(4)
})
it.each([
  data => ({ ...data, schemaVersion: undefined }),
  data => ({ ...data, cached: false }),
  data => ({ ...data, restaurants: [{ ...data.restaurants[0], city: 'Outra cidade' }] }),
  data => ({ ...data, restaurants: [] }),
  data => ({ ...data, expiresAt: new Date(now + 25 * 60 * 60 * 1000).toISOString() }),
])('bloqueia publicação quando a resposta não é compatível', async transform => {
  await expect(verifyBackend({ ...config, fetcher: mockFetch(transform) })).rejects.toThrow()
})
it('não transmite chave privada nem aceita apenas uma cidade de teste', async () => {
  const fetcher = mockFetch()
  await expect(verifyBackend({ ...config, key: 'sb_secret_test', fetcher })).rejects.toThrow('pública')
  await expect(verifyBackend({ ...config, cities: [cities[0]], fetcher })).rejects.toThrow('dois')
  expect(fetcher).not.toHaveBeenCalled()
})
