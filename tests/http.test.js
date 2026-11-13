// @vitest-environment node
import { it, expect, vi } from 'vitest'
import { createHttpHandler } from '../supabase/functions/get-restaurants/http'
import { createHandler } from '../supabase/functions/get-restaurants/handler'

const origin = 'https://isaaaakkj.github.io'
function setup(search = vi.fn().mockResolvedValue({ restaurants: [], schemaVersion: 3 })) {
  return { search, handler: createHttpHandler({ search, publicKeys: ['public-test'], allowedOrigins: [origin] }) }
}
function request(body = { city: 'São Paulo', state: 'SP' }, headers = {}) {
  return new Request('https://project.supabase.co/functions/v1/get-restaurants', {
    method: 'POST', headers: { origin, apikey: 'public-test', 'content-type': 'application/json', ...headers }, body: JSON.stringify(body),
  })
}
it('preflight permite somente a origem configurada, sem exigir login', async () => {
  const { handler, search } = setup()
  const response = await handler(new Request('https://example.test', { method: 'OPTIONS', headers: { origin } }))
  expect(response.status).toBe(204)
  expect(response.headers.get('access-control-allow-origin')).toBe(origin)
  expect(search).not.toHaveBeenCalled()
})
it('recusa outra origem ou chave sem chamar provedor/banco', async () => {
  const { handler, search } = setup()
  const blocked = await handler(request(undefined, { origin: 'https://other.test' }))
  expect(blocked.status).toBe(403)
  expect(blocked.headers.has('access-control-allow-origin')).toBe(false)
  expect((await handler(request(undefined, { apikey: 'wrong' }))).status).toBe(401)
  expect(search).not.toHaveBeenCalled()
})
it.each([null, {}, { city: '', state: 'SP' }, { city: 'x'.repeat(101), state: 'SP' }])('valida entrada %j', async body => {
  const { handler, search } = setup()
  expect((await handler(request(body))).status).toBe(400)
  expect(search).not.toHaveBeenCalled()
})
it('recusa JSON inválido, tipo incorreto e corpo grande', async () => {
  const { handler } = setup()
  const malformed = new Request('https://example.test', { method: 'POST', headers: { apikey: 'public-test', 'content-type': 'application/json' }, body: '{' })
  expect((await handler(malformed)).status).toBe(400)
  expect((await handler(request({}, { 'content-type': 'text/plain' }))).status).toBe(415)
  expect((await handler(request({ city: 'x'.repeat(9000), state: 'SP' }))).status).toBe(413)
})
it('não expõe detalhes de exceções nem permite configuração vazia', async () => {
  const { handler } = setup(vi.fn().mockRejectedValue(new Error('private-provider-details')))
  const response = await handler(request())
  expect(response.status).toBe(503)
  expect(await response.text()).not.toContain('private-provider-details')
  const disabled = createHttpHandler({ search: vi.fn(), publicKeys: [], allowedOrigins: [] })
  expect((await disabled(request())).status).toBe(503)
})
it('integra HTTP, confirmação municipal e cache persistente de 24 horas', async () => {
  const rows = new Map()
  const cafe = { id: '1', name: 'Café', city: 'São Paulo', state: 'SP', municipalityVerification: 'boundary' }
  const provider = vi.fn(async () => [cafe, { ...cafe, id: '2', city: 'Guarulhos' }])
  const search = createHandler({ cache: { get: key => rows.get(key), set: (key, value) => rows.set(key, value) }, fetchMunicipality: provider })
  const { handler } = setup(search)
  const first = await handler(request())
  const body = await first.json()
  expect(first.headers.get('cache-control')).toBe('no-store')
  expect(body).toMatchObject({ schemaVersion: 3, cached: false, restaurants: [cafe], municipality: { city: 'sao paulo', state: 'SP', country: 'BR' } })
  const second = await (await handler(request({ city: 'sao paulo', state: 'São Paulo' }))).json()
  expect(second.cached).toBe(true)
  expect(second.expiresAt).toBe(body.expiresAt)
  expect(provider).toHaveBeenCalledTimes(1)
})
