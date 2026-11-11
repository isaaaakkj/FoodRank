import { useState } from 'react'
import { Send, Star } from 'lucide-react'
import useRestaurants from '../hooks/useRestaurants'
import Turnstile from './Turnstile'
import { isTurnstileConfigured } from '../services/turnstileConfig'
import { submitReview } from '../services/reviews'

export default function ReviewForm({ location, enabled = false }) {
  const { restaurants, loading, error } = useRestaurants(location?.city, location?.state, enabled)
  const [notice, setNotice] = useState('')
  const [name, setName] = useState('')
  const [restaurantId, setRestaurantId] = useState('')
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [token, setToken] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [widgetVersion, setWidgetVersion] = useState(0)
  const selected = restaurants.find(item => String(item.id) === restaurantId)
  const canSubmit = enabled && Boolean(selected) && isTurnstileConfigured && Boolean(token) && !loading && !error && !submitting

  async function handleSubmit(event) {
    event.preventDefault()
    setNotice('')
    if (!canSubmit || name.trim().length < 2 || comment.trim().length < 10 || rating < 1) {
      setNotice('Preencha nome, restaurante, nota, comentário (mínimo 10 caracteres) e verificação anti-bot.')
      return
    }
    setSubmitting(true)
    try {
      const response = await submitReview({
        author_name: name.trim(),
        restaurant_id: String(selected.id),
        restaurant_name: selected.name,
        city: location.city,
        state: location.state,
        rating,
        comment: comment.trim(),
      }, token)
      setNotice(response.message || 'Avaliação recebida e aguardando moderação.')
      setName('')
      setRestaurantId('')
      setRating(0)
      setComment('')
    } catch (err) {
      setNotice(err.message || 'Não foi possível enviar a avaliação.')
    } finally {
      setToken('')
      setWidgetVersion(n => n + 1)
      setSubmitting(false)
    }
  }

  return (
    <section className="mx-auto max-w-[1000px] py-10" aria-labelledby="review-title">
      <div className="rounded-2xl border border-[#ddd3c2] bg-[#eee7d9] p-6 md:p-8">
        <div className="mb-7">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#a88b54]">Sua opinião importa</p>
          <h2 id="review-title" className="mt-1 font-display text-3xl font-semibold text-[#28351f]">Deixe sua avaliação</h2>
          <p className="mt-2 text-sm text-[#6d6a61]">Sua avaliação será enviada para moderação e só aparecerá publicamente depois de aprovada. Use um apelido, não informe dados pessoais.</p>
        </div>
        {notice && <p role="status" className="mb-4 text-sm text-[#604936]">{notice}</p>}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="review-name" className="mb-2 block text-sm font-semibold text-[#20231d]">Seu nome ou apelido</label>
            <input id="review-name" required minLength={2} maxLength={80} type="text"
              value={name} onChange={event => setName(event.target.value)} placeholder="Ex.: Maria"
              className="h-12 w-full rounded-xl border border-[#d8cbb7] bg-[#faf8f3] px-4 text-sm outline-none focus:border-[#28351f]" />
          </div>
          <div>
            <label htmlFor="review-restaurant" className="mb-2 block text-sm font-semibold text-[#20231d]">Restaurante</label>
            <select id="review-restaurant" required value={restaurantId} onChange={event => setRestaurantId(event.target.value)}
              disabled={!enabled || loading || Boolean(error) || restaurants.length === 0}
              className="h-12 w-full rounded-xl border border-[#d8cbb7] bg-[#faf8f3] px-4 text-sm text-[#20231d] disabled:opacity-60">
              <option value="">{!enabled ? 'Pesquise uma cidade primeiro' : loading ? 'Carregando restaurantes...' : error ? 'Busca indisponível' : restaurants.length === 0 ? 'Nenhum restaurante disponível' : 'Escolha um restaurante'}</option>
              {restaurants.map(item => <option key={item.id} value={String(item.id)}>{item.name}</option>)}
            </select>
          </div>
          <div>
            <p id="rating-label" className="mb-2 block text-sm font-semibold text-[#20231d]">Sua nota</p>
            <div role="group" aria-labelledby="rating-label" className="flex gap-2">
              {[1, 2, 3, 4, 5].map(star => (
                <button key={star} type="button" aria-pressed={star === rating}
                  aria-label={`Dar ${star} estrelas`} onClick={() => setRating(star)} className="transition hover:scale-110">
                  <Star size={28} fill={star <= rating ? 'currentColor' : 'none'}
                    className={star <= rating ? 'text-[#a88b54]' : 'text-[#b9ad99]'} />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label htmlFor="review-comment" className="mb-2 block text-sm font-semibold text-[#20231d]">Comentário</label>
            <textarea id="review-comment" required minLength={10} maxLength={2000}
              value={comment} onChange={event => setComment(event.target.value)} rows={5}
              placeholder="Conte como foi sua experiência..."
              className="w-full resize-none rounded-xl border border-[#d8cbb7] bg-[#faf8f3] p-4 text-sm outline-none focus:border-[#28351f]" />
          </div>
          <Turnstile key={widgetVersion} onToken={setToken} />
          <button type="submit" disabled={!canSubmit}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#28351f] px-6 text-sm font-semibold text-[#f7f3eb] transition hover:bg-[#4b5b3d] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto">
            <Send size={17} />{submitting ? 'Enviando...' : 'Enviar avaliação'}
          </button>
        </form>
      </div>
    </section>
  )
}
