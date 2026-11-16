import { Camera } from 'lucide-react'
import { useState } from 'react'
import { getApprovedRestaurantPhoto } from '../services/images'

export default function RestaurantPhoto({ restaurant, className = '' }) {
  const photo = getApprovedRestaurantPhoto(restaurant)
  const [failedUrl, setFailedUrl] = useState(null)
  const visible = Boolean(photo && photo.imageUrl !== failedUrl)

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#e9e1d3]">
      {visible ? (
        <>
          <img
            src={photo.imageUrl}
            alt={`Foto verificada de ${restaurant.name}`}
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
            onError={() => setFailedUrl(photo.imageUrl)}
            className={`h-full w-full object-cover ${className}`}
          />
          <div className="absolute bottom-0 left-0 right-0 bg-[#172014]/85 px-3 py-1.5 text-[10px] text-white">
            Foto: {photo.author} ·{' '}
            <a href={photo.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline">
              Fonte
            </a>
            {' · '}
            {photo.licenseUrl ? (
              <a href={photo.licenseUrl} target="_blank" rel="noopener noreferrer" className="underline">
                {photo.license}
              </a>
            ) : (
              <span>{photo.license}</span>
            )}
          </div>
        </>
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
