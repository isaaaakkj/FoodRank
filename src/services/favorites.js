import { supabase } from './supabase'

export const LEGACY_FAVORITES_KEY = 'foodrank-favorites-v1'
const fields = ['id', 'name', 'city', 'state', 'category', 'location', 'image', 'rating', 'price']
const MAX_ITEMS = 200

export function favoriteKey(item) {
  return JSON.stringify([String(item.id), String(item.city ?? ''), String(item.state ?? '')])
}

export function normalizeFavorite(item) {
  if (!item || item.id == null || typeof item.name !== 'string' || !item.name.trim()) return null
  const result = {}
  for (const field of fields) {
    const value = item[field]
    if (value == null || !['string', 'number'].includes(typeof value)) continue
    result[field] = typeof value === 'string' ? value.slice(0, field === 'name' ? 160 : 700) : value
  }
  result.id = String(item.id).slice(0, 160)
  result.name = item.name.trim().slice(0, 160)
  return favoriteKey(result).length <= 500 ? result : null
}

export function readLegacyFavorites(storage = window.localStorage) {
  try {
    const value = JSON.parse(storage.getItem(LEGACY_FAVORITES_KEY) || '[]')
    if (!Array.isArray(value)) return []
    const seen = new Set()
    return value.map(normalizeFavorite).filter(item => {
      if (!item) return false
      const key = favoriteKey(item)
      if (seen.has(key)) return false
      seen.add(key)
      return true
    }).slice(0, MAX_ITEMS)
  } catch {
    return []
  }
}

export async function fetchMyFavorites(userId) {
  if (!supabase || !userId) throw new Error('Entre na sua conta para ver seus favoritos.')
  const { data, error } = await supabase.from('favorites')
    .select('restaurant_key,restaurant')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(MAX_ITEMS)
  if (error) throw new Error('Não foi possível sincronizar os favoritos com sua conta.')
  return (data ?? []).map(row => normalizeFavorite(row.restaurant)).filter(Boolean)
}

export async function importLegacyFavorites(userId) {
  if (!supabase || !userId) return
  const local = readLegacyFavorites()
  if (!local.length) return
  const rows = local.map(restaurant => ({
    user_id: userId,
    restaurant_key: favoriteKey(restaurant),
    restaurant,
  }))
  const { error } = await supabase.from('favorites').upsert(rows, {
    onConflict: 'user_id,restaurant_key',
    ignoreDuplicates: true,
  })
  if (error) throw new Error('Não foi possível importar os favoritos antigos. Eles permanecem salvos neste navegador.')
  try { window.localStorage.removeItem(LEGACY_FAVORITES_KEY) } catch { /* Os dados já foram enviados. */ }
}

export async function saveFavorite(userId, restaurant) {
  if (!supabase || !userId) throw new Error('Entre na sua conta para salvar restaurantes.')
  const normalized = normalizeFavorite(restaurant)
  if (!normalized) throw new Error('Não foi possível identificar o restaurante.')
  const { error } = await supabase.from('favorites').insert({
    user_id: userId,
    restaurant_key: favoriteKey(normalized),
    restaurant: normalized,
  })
  if (error && error.code !== '23505') throw new Error('Não foi possível salvar o favorito. Tente novamente.')
  return normalized
}

export async function removeFavorite(userId, restaurant) {
  if (!supabase || !userId) throw new Error('Entre na sua conta para editar favoritos.')
  const { error } = await supabase.from('favorites')
    .delete()
    .eq('user_id', userId)
    .eq('restaurant_key', favoriteKey(restaurant))
  if (error) throw new Error('Não foi possível remover o favorito. Tente novamente.')
}
