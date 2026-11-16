import FavoriteButton from './FavoriteButton'
import CategoryPhoto from './CategoryPhoto'
import { MapPin } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { getRestaurantDescription } from '../services/restaurantDescription'

export default function RestaurantCard({ restaurant }) {
  const navigate = useNavigate()

  function openRestaurant() {
    const city = encodeURIComponent(restaurant.city || '')
    const state = encodeURIComponent(restaurant.state || '')
    navigate(`/restaurant/${encodeURIComponent(restaurant.id)}?city=${city}&state=${state}`)
  }

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[#ded5c6] bg-[#faf8f3] transition duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="relative h-52 shrink-0 overflow-hidden">
        <CategoryPhoto category={restaurant.category} className="transition duration-500 group-hover:scale-105" />
        <FavoriteButton restaurant={restaurant} />
        <span className="absolute bottom-3 left-3 rounded-full bg-[#28351f]/90 px-3 py-1.5 text-xs font-semibold text-[#f7f3eb] backdrop-blur">
          {restaurant.category || 'Restaurante'}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-xl font-semibold text-[#28351f]">
          {restaurant.name}
        </h3>

        <p className="mt-3 text-sm leading-6 text-[#6d6a61]">
          {getRestaurantDescription(restaurant)}
        </p>

        <div className="mt-4 flex items-start gap-1.5 text-sm text-[#604936]">
          <MapPin size={15} className="mt-0.5 shrink-0" aria-hidden="true" />
          <span>{restaurant.location || [restaurant.city, restaurant.state].filter(Boolean).join(', ') || 'Localização não informada'}</span>
        </div>

        <div className="mt-auto flex justify-end border-t border-[#ded5c6] pt-4">
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
