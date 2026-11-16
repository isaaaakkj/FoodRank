import { Camera } from 'lucide-react'
import { useState } from 'react'
import { safeImageUrl } from '../services/images'

export default function RestaurantPhoto({ restaurant, className = '' }) {
  const url = safeImageUrl(restaurant?.image)
  const [failedUrl, setFailedUrl] = useState(null)
  const visible = Boolean(url && url !== failedUrl)

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#e9e1d3]">
      {visible ? (
        <img
          src={url}
          alt={`Foto de ${restaurant.name}`}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={() => setFailedUrl(url)}
          className={`h-full w-full object-cover ${className}`}
        />
      ) : (
        <div
          className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-[#e9e1d3] to-[#d7cbb8] px-4 text-center text-[#604936]"
          role="img"
          aria-label={`Foto de ${restaurant?.name ?? 'restaurante'} não disponível`}
        >
          <Camera size={35} strokeWidth={1.35} aria-hidden="true" />
          <span className="text-xs font-semibold tracking-wide">Foto não disponível</span>
        </div>
      )}
    </div>
  )
}
