const MAX_BODY_BYTES = 8192

async function readBody(request) {
  if (!request.headers.get('content-type')?.toLowerCase().startsWith('application/json')) {
    throw Object.assign(new Error('Use JSON'), { status: 415 })
  }
  if (Number(request.headers.get('content-length')) > MAX_BODY_BYTES) {
    throw Object.assign(new Error('Corpo muito grande'), { status: 413 })
  }
  const reader = request.body?.getReader()
  if (!reader) throw Object.assign(new Error('JSON ausente'), { status: 400 })
  const chunks = []
  let size = 0
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      size += value.byteLength
      if (size > MAX_BODY_BYTES) throw Object.assign(new Error('Corpo muito grande'), { status: 413 })
      chunks.push(value)
    }
  } finally {
    await reader.cancel()
  }
  const bytes = new Uint8Array(size)
  let offset = 0
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength }
  try { return JSON.parse(new TextDecoder().decode(bytes)) } catch {
    throw Object.assign(new Error('JSON inválido'), { status: 400 })
  }
}

// This checks the project's public application key, not a user account/login.
// Public keys and CORS are not a substitute for provider quotas or abuse controls.
export function createHttpHandler({ search, publicKeys, allowedOrigins }) {
  const keys = new Set(publicKeys.filter(Boolean))
  const origins = new Set(allowedOrigins.filter(Boolean))
  return async request => {
    const origin = request.headers.get('origin')
    const headers = {
      'Content-Type': 'application/json', 'Cache-Control': 'no-store', Vary: 'Origin',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      ...(origin && origins.has(origin) ? { 'Access-Control-Allow-Origin': origin } : {}),
    }
    const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers })
    if (!keys.size || !origins.size) return json({ error: 'Serviço sem configuração válida' }, 503)
    if (origin && !origins.has(origin)) return json({ error: 'Origem não permitida' }, 403)
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers })
    if (request.method !== 'POST') return json({ error: 'Método não permitido' }, 405)
    if (!keys.has(request.headers.get('apikey'))) return json({ error: 'Chave pública inválida' }, 401)
    let body
    try {
      body = await readBody(request)
    } catch (error) {
      return json({ error: 'Envie um JSON válido de até 8 KiB' }, error.status ?? 400)
    }
    if (typeof body?.city !== 'string' || typeof body?.state !== 'string' || !body.city.trim() || !body.state.trim() || body.city.length > 100 || body.state.length > 100) {
      return json({ error: 'Município inválido' }, 400)
    }
    try { return json(await search({ city: body.city.trim(), state: body.state.trim() })) } catch {
      return json({ error: 'Não foi possível confirmar os restaurantes deste município. Tente novamente.' }, 503)
    }
  }
}
