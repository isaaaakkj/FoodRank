import { createClient } from 'npm:@supabase/supabase-js@2.118.0'
import { createHandler, geoapifyProvider } from './handler.js'
import { createHttpHandler } from './http.js'
import { supabaseCache } from './cache.js'

let search: ReturnType<typeof createHandler> | undefined

function configuredSearch() {
  if (search) return search
  const apiKey = Deno.env.get('GEOAPIFY_API_KEY')
  const url = Deno.env.get('SUPABASE_URL')
  const backendKey = Deno.env.get('FOODRANK_BACKEND_KEY') || Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!apiKey || !url || !backendKey) throw new Error('Configuração ausente')
  const db = createClient(url, backendKey, { auth: { persistSession: false } })
  const cache = supabaseCache(db)
  search = createHandler({ cache, fetchMunicipality: geoapifyProvider(apiKey) })
  return search
}

const publicKeys = [Deno.env.get('FOODRANK_PUBLIC_API_KEY'), Deno.env.get('SUPABASE_ANON_KEY')].filter((value): value is string => Boolean(value))
const allowedOrigins = (Deno.env.get('FOODRANK_ALLOWED_ORIGINS') ?? '').split(',').map(value => value.trim())

Deno.serve(createHttpHandler({
  publicKeys, allowedOrigins,
  search: (body: { city: string; state: string }) => configuredSearch()(body),
}))
