import { useState } from 'react'
import { Heart } from 'lucide-react'
import useFavorites from '../hooks/useFavorites'
export default function FavoriteButton({ restaurant }) {
  const { toggle, isFavorite } = useFavorites()
  const [message, setMessage] = useState('')
  const selected = isFavorite(restaurant)
  return <div className="absolute right-4 top-4 z-[1]">
    <button type="button" aria-pressed={selected} aria-label={`${selected ? 'Remover dos favoritos' : 'Favoritar'}: ${restaurant.name}`} onClick={() => { setMessage(toggle(restaurant)) }} className="flex h-11 w-11 items-center justify-center rounded-full bg-[#faf8f3] text-[#604936] shadow-sm"><Heart size={20} fill={selected ? 'currentColor' : 'none'} /></button>
    {message && <p role="alert" className="absolute right-0 mt-2 w-56 rounded-lg bg-[#faf8f3] p-3 text-sm">{message}</p>}
  </div>
}
