import { safeImageUrl, fallbackImage } from '../services/images'
import FavoriteButton from './FavoriteButton'
import { MapPin, Star } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function RestaurantCard({ restaurant }) {
  const navigate = useNavigate()

  function openRestaurant() {
    const city = encodeURIComponent(restaurant.city || '')
    const state = encodeURIComponent(restaurant.state || '')

    navigate(`/restaurant/${encodeURIComponent(restaurant.id)}?city=${city}&state=${state}`)
  }

  return (
    <article className="group overflow-hidden rounded-2xl border border-[#ded5c6] bg-[#faf8f3] transition duration-300 hover:-translate-y-1 hover:shadow-lg">

      <div className="relative h-56 overflow-hidden">
        <img
          src={safeImageUrl(restaurant.image)} loading="lazy" referrerPolicy="no-referrer" onError={event => { event.currentTarget.onerror = null; event.currentTarget.src = fallbackImage }}
          alt={restaurant.name}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />

        <FavoriteButton restaurant={restaurant} />

        <span className="absolute bottom-4 left-4 rounded-full bg-[#28351f]/90 px-3 py-1.5 text-xs font-semibold text-[#f7f3eb] backdrop-blur">
          {restaurant.category}
        </span>
      </div>

      <div className="p-5">

        <div className="flex items-start justify-between gap-3">

          <div>
            <h3 className="font-display text-xl font-semibold text-[#28351f]">
              {restaurant.name}
            </h3>

            <div className="mt-2 flex items-center gap-1.5 text-sm text-[#6d6a61]">
              <MapPin size={15} className="text-[#604936]" />
              {restaurant.location}
            </div>
          </div>

          <div className="flex items-center gap-1 rounded-lg bg-[#eee7d9] px-2.5 py-1.5">
            <Star
              size={15}
              fill="currentColor"
              className="text-[#a88b54]"
            />

            <span className="text-sm font-bold text-[#604936]">
              {restaurant.rating ?? '—'}
            </span>
          </div>

        </div>

        <div className="mt-4 flex items-center justify-between border-t border-[#ded5c6] pt-4">

          <span className="text-sm text-[#6d6a61]">
            {restaurant.price}
          </span>

          <button
            onClick={openRestaurant}
            className="text-sm font-semibold text-[#6b3434] transition hover:text-[#28351f]"
          >
            Ver restaurante →
          </button>

        </div>

      </div>

    </article>
  )
}
