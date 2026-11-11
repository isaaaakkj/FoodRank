import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

function isPublicKey(value) {
  if (value?.startsWith('sb_publishable_')) return true
  try {
    const payload = value.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    return JSON.parse(atob(payload)).role === 'anon'
  } catch { return false }
}

function configuredClient() {
  try {
    if (new URL(url).protocol !== 'https:' || !isPublicKey(key)) return null
    return createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    })
  } catch {
    return null
  }
}

// Configuração ausente ou inválida não deve impedir a renderização.
export const supabase = configuredClient()
