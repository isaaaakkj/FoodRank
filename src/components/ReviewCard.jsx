import { Star } from 'lucide-react'

export default function ReviewCard({ review }) {
  const name = review.author_name || 'Visitante'
  const date = review.created_at ? new Date(review.created_at).toLocaleDateString('pt-BR') : ''
  return (
    <article className="border-b border-[#ddd3c2] py-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div aria-hidden="true" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#28351f] font-semibold text-[#f7f3eb]">{name.charAt(0).toUpperCase()}</div>
          <div>
            <h3 className="font-semibold text-[#20231d]">{name}</h3>
            <p className="text-xs text-[#6d6a61]">{date}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-[#604936]" aria-label={`${review.rating} de 5 estrelas`}>
          <Star size={16} fill="currentColor" className="text-[#a88b54]" />
          <span className="text-sm font-bold">{review.rating}/5</span>
        </div>
      </div>
      <p className="mt-3 text-sm text-[#6d6a61]">Avaliou <strong>{review.restaurant_name}</strong> — {review.city}, {review.state}</p>
      <p className="mt-3 whitespace-pre-wrap break-words leading-7 text-[#20231d]">{review.comment}</p>
    </article>
  )
}
