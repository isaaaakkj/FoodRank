import { Heart, Star } from 'lucide-react'

export default function ReviewCard({ review }) {
  return (
    <article className="border-b border-[#ddd3c2] py-7">

      <div className="flex gap-4">

        {/* Avatar */}
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#28351f] font-semibold text-[#f7f3eb]">
          {review.name.charAt(0).toUpperCase()}
        </div>

        <div className="min-w-0 flex-1">

          {/* Nome + data */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="font-semibold text-[#20231d]">
                {review.name}
              </h3>

              <p className="text-xs text-[#6d6a61]">
                {review.date}
              </p>
            </div>

            {/* Nota */}
            <div className="flex items-center gap-1">
              <Star
                size={16}
                fill="currentColor"
                className="text-[#a88b54]"
              />

              <span className="text-sm font-bold text-[#604936]">
                {review.rating}
              </span>
            </div>
          </div>

          {/* Restaurante */}
          <p className="mt-3 text-sm text-[#6d6a61]">
            avaliou{' '}
            <span className="font-semibold text-[#604936]">
              {review.restaurant}
            </span>
          </p>

          {/* Comentário */}
          <p className="mt-3 leading-7 text-[#20231d]">
            {review.comment}
          </p>

          {/* Ações */}
          <div className="mt-4 flex items-center gap-5">

            <button className="flex items-center gap-2 text-sm text-[#6d6a61] transition hover:text-[#6b3434]">
              <Heart size={17} strokeWidth={1.8} />
              {review.likes}
            </button>

            <button className="text-sm font-medium text-[#604936] transition hover:text-[#28351f]">
              Responder
            </button>

          </div>

        </div>
      </div>

    </article>
  )
}