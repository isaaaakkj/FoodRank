import { useEffect, useState } from 'react'
import { getRestaurants } from '../services/restaurants'

export default function useRestaurants() {
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function loadRestaurants() {
      try {
        setLoading(true)

        const data = await getRestaurants()

        setRestaurants(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadRestaurants()
  }, [])

  return {
    restaurants,
    loading,
    error,
  }
}