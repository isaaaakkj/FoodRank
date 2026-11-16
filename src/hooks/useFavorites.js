import { useContext } from 'react'
import { FavoritesContext } from '../favorites/favoritesContext'

export default function useFavorites() {
  const context = useContext(FavoritesContext)
  if (!context) throw new Error('useFavorites requer FavoritesProvider')
  return context
}
