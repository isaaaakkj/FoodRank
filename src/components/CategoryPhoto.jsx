import { useState } from 'react'
import { getCategoryImage } from '../services/categoryImages'

export default function CategoryPhoto({ category, className = '' }) {
  const image = getCategoryImage(category)
  const [brokenUrl, setBrokenUrl] = useState(null)
  const src = brokenUrl === image.url ? image.fallbackUrl : image.url

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#e9e1d3]">
      <img
        src={src}
        alt={image.alt}
        loading="lazy"
        decoding="async"
        onError={() => { if (src !== image.fallbackUrl) setBrokenUrl(image.url) }}
        className={`h-full w-full object-cover ${className}`}
      />
      <span className="absolute bottom-3 right-3 max-w-[60%] rounded-full bg-[#faf8f3]/90 px-2.5 py-1 text-[10px] font-medium text-[#604936]">
        Imagem ilustrativa
      </span>
    </div>
  )
}
