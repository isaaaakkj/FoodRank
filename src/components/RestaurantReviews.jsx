import { useEffect, useState } from 'react'
import ReviewCard from './ReviewCard'
import { getRestaurantReviews } from '../services/reviews'

export default function RestaurantReviews({ restaurant }) {
  const [state, setState] = useState({ loading: true, reviews: [], error: '' })
  useEffect(() => {
    let cancelled = false
    getRestaurantReviews(restaurant.id, restaurant.city, restaurant.state)
      .then(reviews => { if (!cancelled) setState({ loading: false, reviews, error: '' }) })
      .catch(() => { if (!cancelled) setState({ loading: false, reviews: [], error: 'Avaliações indisponíveis no momento.' }) })
    return () => { cancelled = true }
  }, [restaurant.id, restaurant.city, restaurant.state])
  return (
    <section className="mt-8 rounded-2xl border border-[#ddd3c2] bg-[#faf8f3] p-6 md:p-8" aria-labelledby="restaurant-reviews">
      <h2 id="restaurant-reviews" className="font-display text-2xl font-semibold text-[#28351f]">Avaliações da comunidade</h2>
      {state.loading ? <p role="status" className="mt-4">Carregando avaliações...</p>
        : state.error ? <p role="alert" className="mt-4">{state.error}</p>
          : state.reviews.length ? <div>{state.reviews.map(review => <ReviewCard key={review.id} review={review} />)}</div>
            : <p className="mt-4 text-sm text-[#6d6a61]">Ainda não existem avaliações aprovadas para este restaurante.</p>}
    </section>
  )
}
