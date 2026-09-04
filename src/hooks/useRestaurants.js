import { useEffect, useState } from 'react'
import { getRestaurants } from '../services/restaurants'

export default function useRestaurants(city, state) {
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function loadRestaurants() {
      try {
        setLoading(true)
        setError(null)
        setRestaurants([])

        const data = await getRestaurants(city, state)

        if (!cancelled) {
          setRestaurants(data)
        }
      } catch (err) {
        console.error('Erro ao buscar restaurantes:', err)

        if (!cancelled) {
          setRestaurants([])
          setError(
            err.message ||
              'Não foi possível buscar restaurantes.'
          )
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    if (city && state) {
      loadRestaurants()
    } else {
      setRestaurants([])
      setLoading(false)
    }

    return () => {
      cancelled = true
    }
  }, [city, state])

  return {
    restaurants,
    loading,
    error,
  }
}