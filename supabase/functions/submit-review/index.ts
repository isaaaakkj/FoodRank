import { createClient } from 'npm:@supabase/supabase-js@2'

const allowedOrigins = new Set([
  'https://isaaaakkj.github.io',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
])
const json = (body: unknown, status = 200, origin = '') => new Response(JSON.stringify(body), {
  status,
  headers: {
    'content-type': 'application/json',
    'access-control-allow-origin': allowedOrigins.has(origin) ? origin : 'https://isaaaakkj.github.io',
    'vary': 'Origin',
    'access-control-allow-headers': 'authorization, x-client-info, apikey, content-type',
    'access-control-allow-methods': 'POST, OPTIONS',
  },
})
const value = (input: unknown, max: number) =>
  typeof input === 'string' ? input.trim().slice(0, max + 1) : ''

Deno.serve(async (request) => {
  const origin = request.headers.get('origin') ?? ''
  if (request.method === 'OPTIONS') return json({}, 200, origin)
  if (request.method !== 'POST') return json({ error: 'Método não permitido.' }, 405, origin)
  if (!allowedOrigins.has(origin)) return json({ error: 'Origem não permitida.' }, 403, origin)

  const secret = Deno.env.get('TURNSTILE_SECRET_KEY')
  const url = Deno.env.get('SUPABASE_URL')
  const roleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!secret || !url || !roleKey) return json({ error: 'Serviço de avaliações não configurado.' }, 503, origin)

  let input: Record<string, unknown>
  try {
    if (Number(request.headers.get('content-length') || 0) > 10000) throw new Error('large')
    input = await request.json()
    if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('bad')
  } catch {
    return json({ error: 'Dados inválidos.' }, 400, origin)
  }

  const author_name = value(input.author_name, 80)
  const restaurant_id = value(input.restaurant_id, 150)
  const restaurant_name = value(input.restaurant_name, 160)
  const city = value(input.city, 100)
  const state = value(input.state, 100)
  const comment = value(input.comment, 2000)
  const rating = input.rating
  const token = value(input.turnstile_token, 2048)
  if (author_name.length < 2 || author_name.length > 80 ||
      !restaurant_id || restaurant_id.length > 150 ||
      !restaurant_name || restaurant_name.length > 160 ||
      !city || city.length > 100 || !state || state.length > 100 ||
      comment.length < 10 || comment.length > 2000 ||
      !Number.isInteger(rating) || Number(rating) < 1 || Number(rating) > 5 ||
      !token || token.length > 2048) {
    return json({ error: 'Preencha os campos corretamente e confirme a verificação.' }, 400, origin)
  }

  try {
    const check = new FormData()
    check.append('secret', secret)
    check.append('response', token)
    const verification = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST', body: check, signal: AbortSignal.timeout(8000),
    })
    const answer = await verification.json()
    const expectedHostname = Deno.env.get('TURNSTILE_HOSTNAME') || 'isaaaakkj.github.io'
    if (!verification.ok || answer.success !== true ||
        answer.hostname !== expectedHostname) {
      return json({ error: 'Verificação anti-bot inválida ou expirada. Tente novamente.' }, 403, origin)
    }

    const supabase = createClient(url, roleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
    const { error } = await supabase.from('reviews').insert({
      restaurant_id, restaurant_name, city, state, author_name,
      comment, rating, status: 'approved',
    })
    if (error) {
      console.error('review insert failed', error.code)
      return json({ error: 'Não foi possível enviar a avaliação.' }, 500, origin)
    }
    return json({ success: true, message: 'Avaliação publicada com sucesso.' }, 201, origin)
  } catch {
    return json({ error: 'Serviço temporariamente indisponível.' }, 503, origin)
  }
})
