
import { useEffect, useState } from 'react'
import { getRestaurants } from '../services/restaurants'

export default function useRestaurants(city, state, enabled = true) {
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function loadRestaurants() {
      try {
        setLoading(true)
        setError(null)

        const data = await getRestaurants(city, state)

        if (!cancelled) {
          setRestaurants(data)
        }
      } catch (err) {
        console.error('Erro ao buscar restaurantes:', err)

        if (!cancelled) {
          setError(
            err.message || 'Não foi possível buscar restaurantes.'
          )
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    if (enabled && city && state) {
      loadRestaurants()
    } else {
      setLoading(false)
      setError(null)
      setRestaurants([])
    }

    return () => {
      cancelled = true
    }
  }, [city, state, enabled])

  return {
    restaurants,
    loading,
    error,
  }
}
