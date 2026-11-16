import { useEffect, useState } from 'react'
import { useAuth } from '../auth/useAuth'
import { FavoritesContext } from './favoritesContext'
import { favoriteKey, fetchMyFavorites, importLegacyFavorites, removeFavorite, saveFavorite } from '../services/favorites'

export function FavoritesProvider({ children }) {
  const { user, loading: authLoading } = useAuth()
  const userId = user?.id ?? null
  const [store, setStore] = useState({ ownerId: null, favorites: [], error: '' })
  const [version, setVersion] = useState(0)

  useEffect(() => {
    if (!userId) return undefined
    let cancelled = false

    async function sync() {
      try {
        await importLegacyFavorites(userId)
        const items = await fetchMyFavorites(userId)
        if (!cancelled) setStore({ ownerId: userId, favorites: items, error: '' })
      } catch (err) {
        if (!cancelled) setStore({ ownerId: userId, favorites: [], error: err.message })
      }
    }
    sync()
    return () => { cancelled = true }
  }, [userId, version])

  const loaded = Boolean(userId && store.ownerId === userId && !store.error)
  const favorites = loaded ? store.favorites : []
  const error = store.ownerId === userId ? store.error : ''
  const loading = authLoading || Boolean(userId && store.ownerId !== userId)
  const isFavorite = restaurant => favorites.some(item => favoriteKey(item) === favoriteKey(restaurant))

  async function toggle(restaurant) {
    if (!userId) throw new Error('Entre com Google para salvar restaurantes favoritos.')
    if (!loaded) throw new Error('Os favoritos ainda não foram sincronizados. Tente novamente.')
    const key = favoriteKey(restaurant)
    const exists = favorites.some(item => favoriteKey(item) === key)
    if (exists) {
      await removeFavorite(userId, restaurant)
      setStore(current => current.ownerId === userId
        ? { ...current, favorites: current.favorites.filter(item => favoriteKey(item) !== key) }
        : current)
    } else {
      if (favorites.length >= 200) throw new Error('Limite de 200 favoritos atingido.')
      const saved = await saveFavorite(userId, restaurant)
      setStore(current => current.ownerId === userId
        ? { ...current, favorites: current.favorites.some(item => favoriteKey(item) === key) ? current.favorites : [saved, ...current.favorites] }
        : current)
    }
  }

  const value = {
    favorites, toggle, isFavorite, error, loading, loggedIn: Boolean(userId),
    retry: () => setVersion(previous => previous + 1),
  }
  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>
}
