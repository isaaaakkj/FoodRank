import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import ReviewCard from './ReviewCard'
import { getApprovedReviews } from '../services/reviews'

export default function TimelineSection({ showLink = true }) {
  const [reviews, setReviews] = useState([])
  const [status, setStatus] = useState('loading')
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let cancelled = false
    getApprovedReviews(showLink ? 5 : 30)
      .then(items => { if (!cancelled) { setReviews(items); setStatus('ready') } })
      .catch(() => { if (!cancelled) setStatus('error') })
    return () => { cancelled = true }
  }, [showLink, attempt])

  return (
    <section className="mx-auto max-w-[1000px] py-12" aria-labelledby="community-heading">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#a88b54]">Comunidade FoodRank</p>
          <h2 id="community-heading" className="mt-1 font-display text-3xl font-semibold text-[#28351f]">Avaliações da comunidade</h2>
        </div>
        {showLink && <Link to="/timeline" className="hidden items-center gap-2 text-sm font-semibold text-[#604936] md:flex">Ver timeline <ArrowRight size={17} /></Link>}
      </div>
      {status === 'loading' && <p role="status" className="text-sm text-[#6d6a61]">Carregando avaliações...</p>}
      {status === 'error' && (
        <div role="alert" className="rounded-2xl border border-[#ddd3c2] bg-[#faf8f3] p-8 text-center">
          <p>Não foi possível carregar as avaliações.</p>
          <button type="button" onClick={() => { setStatus('loading'); setAttempt(n => n + 1) }} className="mt-3 underline">Tentar novamente</button>
        </div>
      )}
      {status === 'ready' && (reviews.length
        ? <div>{reviews.map(review => <ReviewCard key={review.id} review={review} />)}</div>
        : <div role="status" className="rounded-2xl border border-[#ddd3c2] bg-[#faf8f3] p-8 text-center">
            <p className="font-display text-xl font-semibold text-[#28351f]">Ainda não há avaliações publicadas</p>
            <p className="mt-3 text-sm text-[#6d6a61]">As avaliações enviadas aparecem aqui após atualizar a página.</p>
          </div>)}
      {showLink && <Link to="/timeline" className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-[#cfc3b0] py-3 text-sm font-semibold text-[#604936] md:hidden">Ver timeline <ArrowRight size={17} /></Link>}
    </section>
  )
}
