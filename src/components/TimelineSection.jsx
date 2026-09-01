import { ArrowRight } from 'lucide-react'
import ReviewCard from './ReviewCard'

const reviews = [
  {
    id: 1,
    name: 'Marina',
    date: 'Hoje',
    restaurant: 'Bistrô das Montanhas',
    rating: '4.8',
    likes: 24,
    comment:
      'Ambiente muito aconchegante e a comida estava excelente. O atendimento também foi impecável.',
  },
  {
    id: 2,
    name: 'Lucas',
    date: 'Ontem',
    restaurant: 'Vila di Pasta',
    rating: '4.7',
    likes: 18,
    comment:
      'A massa estava muito boa e o lugar tem uma atmosfera incrível para jantar.',
  },
  {
    id: 3,
    name: 'Beatriz',
    date: 'Há 2 dias',
    restaurant: 'Kura Sushi',
    rating: '4.9',
    likes: 31,
    comment:
      'Um dos melhores restaurantes japoneses que já experimentei. Com certeza voltaria.',
  },
]

export default function TimelineSection() {
  return (
    <section className="mx-auto max-w-[1000px] py-12">

      {/* Cabeçalho */}
      <div className="mb-3 flex items-end justify-between">

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#a88b54]">
            Comunidade FoodRank
          </p>

          <h2 className="mt-1 font-display text-3xl font-semibold text-[#28351f]">
            O que estão dizendo
          </h2>
        </div>

        <button className="hidden items-center gap-2 text-sm font-semibold text-[#604936] transition hover:text-[#28351f] md:flex">
          Ver timeline
          <ArrowRight size={17} />
        </button>

      </div>

      {/* Reviews */}
      <div>
        {reviews.map((review) => (
          <ReviewCard
            key={review.id}
            review={review}
          />
        ))}
      </div>

      {/* Botão mobile */}
      <button className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-[#cfc3b0] py-3 text-sm font-semibold text-[#604936] transition hover:border-[#28351f] hover:text-[#28351f] md:hidden">
        Ver timeline
        <ArrowRight size={17} />
      </button>

    </section>
  )
}