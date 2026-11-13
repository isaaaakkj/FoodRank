import process from 'node:process'
import { Buffer } from 'node:buffer'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { confirmedRestaurants, normalize, normalizeState } from '../supabase/functions/_shared/municipality.js'

function isPublicKey(value) {
  if (value?.startsWith('sb_publishable_')) return true
  try { return JSON.parse(Buffer.from(value.split('.')[1], 'base64url').toString()).role === 'anon' } catch { return false }
}

export async function verifyBackend({ url, key, cities, origin, fetcher = fetch, now = Date.now }) {
  const base = new URL(url)
  if (base.protocol !== 'https:' || base.username || base.password || base.search || base.hash) throw new Error('URL HTTPS pública do Supabase inválida')
  if (!isPublicKey(key)) throw new Error('Configure somente uma chave pública do Supabase')
  if (!Array.isArray(cities) || cities.length < 2 || cities.some(p => typeof p?.city !== 'string' || !p.city.trim() || typeof p?.state !== 'string' || !p.state.trim())) throw new Error('Configure ao menos dois municípios cobertos em FOODRANK_SMOKE_CITIES_JSON')
  if (new Set(cities.map(p => JSON.stringify([normalize(p.city), normalizeState(p.state)]))).size !== cities.length) throw new Error('Os municípios de verificação devem ser distintos')
  const appOrigin = new URL(origin).origin
  async function invoke(location) {
    const response = await fetcher(new URL('/functions/v1/get-restaurants', base), {
      method: 'POST', headers: { apikey: key, authorization: `Bearer ${key}`, Origin: appOrigin, 'Content-Type': 'application/json' },
      body: JSON.stringify(location), signal: AbortSignal.timeout(65000),
    })
    if (!response.ok) throw new Error(`Verificação do backend falhou: HTTP ${response.status}`)
    if (response.headers.get('access-control-allow-origin') !== appOrigin) throw new Error('CORS incompatível com a origem do aplicativo')
    const data = await response.json()
    if (data.schemaVersion !== 3 || !Array.isArray(data.restaurants) || !data.restaurants.length) throw new Error('Contrato geográfico ausente ou município de verificação sem cobertura')
    if (normalize(data.municipality?.city) !== normalize(location.city) || normalizeState(data.municipality?.state) !== normalizeState(location.state) || data.municipality?.country !== 'BR') throw new Error('Município da resposta incompatível com a consulta')
    if (confirmedRestaurants(data.restaurants, location.city, location.state).length !== data.restaurants.length) throw new Error('Restaurantes duplicados ou sem confirmação do município')
    if (data.restaurants.some(item => item.municipalityVerification === 'boundary' && !item.municipalityBoundaryId)) throw new Error('Evidência de limite municipal ausente')
    const remaining = Date.parse(data.expiresAt) - now()
    if (!Number.isFinite(remaining) || remaining <= 0 || remaining > 24 * 60 * 60 * 1000 + 5000) throw new Error('Validade do cache incompatível com 24 horas')
    return data
  }
  for (const location of cities) {
    const first = await invoke(location)
    const second = await invoke(location)
    if (second.cached !== true || second.expiresAt !== first.expiresAt) throw new Error('A segunda consulta não reutilizou o cache persistente')
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    if (existsSync('.env')) process.loadEnvFile('.env')
    await verifyBackend({
      url: process.env.VITE_SUPABASE_URL,
      key: process.env.VITE_SUPABASE_ANON_KEY,
      cities: JSON.parse(process.env.FOODRANK_SMOKE_CITIES_JSON ?? '[]'),
      origin: process.env.FOODRANK_APP_ORIGIN ?? 'https://isaaaakkj.github.io',
    })
    console.log('Backend validado: contrato municipal, CORS e reutilização do cache em municípios distintos.')
  } catch (error) {
    // Never print provider payloads, URLs with credentials or request headers.
    console.error(error instanceof SyntaxError || error instanceof TypeError ? 'Configuração ou resposta inválida para verificar o backend.' : error.message)
    process.exitCode = 1
  }
}
