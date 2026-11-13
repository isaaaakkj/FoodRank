import { useEffect, useState } from 'react'
import { getRestaurants } from '../services/restaurants'

export default function useRestaurants(city, state, enabled = true) {
  const [result, setResult] = useState(null)
  const [attempt, setAttempt] = useState(0)
  const key = JSON.stringify([city, state, enabled, attempt])
  const active = Boolean(enabled && city && state)

  useEffect(() => {
    if (!active) return
    let cancelled = false
    getRestaurants(city, state).then(
      restaurants => { if (!cancelled) setResult({ key, restaurants }) },
      error => {
        if (!cancelled) setResult({ key, restaurants: [], error: error?.code === 'MUNICIPALITY_VERIFICATION_REQUIRED'
          ? 'A atualização geográfica do serviço está pendente. Não exibimos restaurantes sem confirmação de município.'
          : 'Verifique sua conexão e tente novamente. Se o problema persistir, a busca pode estar indisponível.' })
      },
    )
    return () => { cancelled = true }
  }, [city, state, active, key])

  const current = active && result?.key === key ? result : null
  return {
    restaurants: current?.restaurants ?? [],
    loading: active && !current,
    error: current?.error ?? null,
    retry: () => setAttempt(value => value + 1),
  }
}
