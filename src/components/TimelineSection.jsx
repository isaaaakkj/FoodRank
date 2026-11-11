import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

export default function TimelineSection({ showLink = true }) {
  return (
    <section className="mx-auto max-w-[1000px] py-12" aria-labelledby="community-heading">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#a88b54]">
            Comunidade FoodRank
          </p>
          <h2 id="community-heading" className="mt-1 font-display text-3xl font-semibold text-[#28351f]">
            Avaliações da comunidade
          </h2>
        </div>
        {showLink && (
          <Link to="/timeline" className="hidden items-center gap-2 text-sm font-semibold text-[#604936] transition hover:text-[#28351f] md:flex">
            Ver timeline <ArrowRight size={17} />
          </Link>
        )}
      </div>
      <div role="status" className="rounded-2xl border border-[#ddd3c2] bg-[#faf8f3] p-8 text-center">
        <p className="font-display text-xl font-semibold text-[#28351f]">
          Ainda não há avaliações verificadas
        </p>
        <p className="mt-3 text-sm leading-6 text-[#6d6a61]">
          Estamos preparando um sistema para receber avaliações reais. Até lá, não exibimos comentários ou notas inventadas.
        </p>
      </div>
      {showLink && (
        <Link to="/timeline" className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-[#cfc3b0] py-3 text-sm font-semibold text-[#604936] transition hover:border-[#28351f] hover:text-[#28351f] md:hidden">
          Ver timeline <ArrowRight size={17} />
        </Link>
      )}
    </section>
  )
}
