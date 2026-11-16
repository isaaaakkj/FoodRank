import { useState } from 'react'
import { Heart } from 'lucide-react'
import { Link } from 'react-router-dom'
import useFavorites from '../hooks/useFavorites'

export default function FavoriteButton({ restaurant }) {
  const { toggle, isFavorite, loggedIn, loading } = useFavorites()
  const [message, setMessage] = useState('')
  const [pending, setPending] = useState(false)
  const selected = isFavorite(restaurant)

  async function handleClick() {
    if (!loggedIn) {
      setMessage('Entre com Google para salvar seus restaurantes nesta conta.')
      return
    }
    setPending(true)
    setMessage('')
    try {
      await toggle(restaurant)
    } catch (err) {
      setMessage(err.message || 'Não foi possível atualizar seus favoritos.')
    } finally {
      setPending(false)
    }
  }

  return <div className="absolute right-4 top-4 z-[1]">
    <button
      type="button"
      disabled={pending || loading}
      aria-pressed={selected}
      aria-label={`${selected ? 'Remover dos favoritos' : 'Favoritar'}: ${restaurant.name}`}
      onClick={handleClick}
      className="flex h-11 w-11 items-center justify-center rounded-full bg-[#faf8f3] text-[#604936] shadow-sm disabled:opacity-60"
    ><Heart size={20} fill={selected ? 'currentColor' : 'none'} /></button>
    {message && <div role="alert" className="absolute right-0 mt-2 w-60 rounded-lg border border-[#ddd3c2] bg-[#faf8f3] p-3 text-sm shadow-lg">
      <p>{message}</p>
      {!loggedIn && <Link to="/profile" className="mt-2 inline-block font-semibold underline">Entrar com Google</Link>}
    </div>}
  </div>
}
