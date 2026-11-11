import { useSyncExternalStore } from 'react'
const key = 'foodrank-favorites-v1'
const listeners = new Set()
let favorites = []
let error = ''
function read() {
  try {
    const items = JSON.parse(localStorage.getItem(key) || '[]')
    return Array.isArray(items) ? items.filter(item => item && item.id != null && typeof item.name === 'string').slice(0, 200) : []
  } catch { return [] }
}
favorites = read()
function emit() { listeners.forEach(listener => listener()) }
window.addEventListener('storage', event => { if (event.key === key || event.key === null) { favorites = read(); emit() } })
const subscribe = listener => { listeners.add(listener); return () => listeners.delete(listener) }
const identity = item => JSON.stringify([String(item.id), item.city, item.state])
export default function useFavorites() {
  const items = useSyncExternalStore(subscribe, () => favorites)
  function toggle(restaurant) {
    const exists = items.some(item => identity(item) === identity(restaurant))
    const fields = ['id', 'name', 'city', 'state', 'category', 'location', 'image', 'rating', 'price']
    const saved = Object.fromEntries(fields.map(field => [field, restaurant[field]]))
    const next = exists ? items.filter(item => identity(item) !== identity(restaurant)) : [...items, saved]
    try {
      if (next.length > 200) throw new Error('limit')
      localStorage.setItem(key, JSON.stringify(next))
      favorites = next
      error = ''
    } catch { error = 'NÃ£o foi possÃ­vel salvar. O armazenamento pode estar bloqueado, cheio ou no limite de 200 favoritos.' }
    emit()
    return error
  }
  return { favorites: items, toggle, isFavorite: restaurant => items.some(item => identity(item) === identity(restaurant)), error }
}
