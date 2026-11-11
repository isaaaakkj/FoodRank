import { useState } from 'react'
import { Send, Star } from 'lucide-react'
import useRestaurants from '../hooks/useRestaurants'

export default function ReviewForm({ location, enabled = false }) {
  const { restaurants, loading, error } = useRestaurants(
    location?.city,
    location?.state,
    enabled
  )
  const [notice, setNotice] = useState('')
  const [name, setName] = useState('')
  const [restaurant, setRestaurant] = useState('')
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')

  function handleSubmit(event) {
    event.preventDefault()
    setNotice('A publicação de avaliações ainda está em desenvolvimento. Nenhum comentário foi enviado ou armazenado.')
  }

  return (
    <section className="mx-auto max-w-[1000px] py-10" aria-labelledby="review-title">
      <div className="rounded-2xl border border-[#ddd3c2] bg-[#eee7d9] p-6 md:p-8">
        <div className="mb-7">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#a88b54]">
            Sua opinião importa
          </p>
          <h2 id="review-title" className="mt-1 font-display text-3xl font-semibold text-[#28351f]">
            Deixe sua avaliação
          </h2>
          <p className="mt-2 text-sm text-[#6d6a61]">
            Estamos preparando a publicação de avaliações reais. Por enquanto, este formulário não envia nem salva comentários.
          </p>
        </div>

        {notice && <p role="status" className="mb-4 text-sm text-[#6b3434]">{notice}</p>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="review-name" className="mb-2 block text-sm font-semibold text-[#20231d]">
              Seu nome ou apelido
            </label>
            <input
              id="review-name"
              maxLength={80}
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ex.: Maria"
              className="h-12 w-full rounded-xl border border-[#d8cbb7] bg-[#faf8f3] px-4 text-sm outline-none transition focus:border-[#28351f]"
            />
          </div>

          <div>
            <label htmlFor="review-restaurant" className="mb-2 block text-sm font-semibold text-[#20231d]">
              Restaurante
            </label>
            <select
              id="review-restaurant"
              value={restaurant}
              onChange={(event) => setRestaurant(event.target.value)}
              disabled={!enabled || loading || Boolean(error) || restaurants.length === 0}
              className="h-12 w-full rounded-xl border border-[#d8cbb7] bg-[#faf8f3] px-4 text-sm text-[#20231d] outline-none transition focus:border-[#28351f] disabled:opacity-60"
            >
              <option value="">
                {!enabled ? 'Pesquise uma cidade primeiro' : loading ? 'Carregando restaurantes...' : error ? 'Busca indisponível' : restaurants.length === 0 ? 'Nenhum restaurante disponível' : 'Escolha um restaurante'}
              </option>
              {restaurants.map((item) => (
                <option key={item.id} value={String(item.id)}>
                  {item.name}
                </option>
              ))}
            </select>
            {error && <p role="status" className="mt-2 text-sm text-[#6b3434]">Não foi possível carregar os restaurantes para avaliação.</p>}
          </div>

          <div>
            <p id="rating-label" className="mb-2 block text-sm font-semibold text-[#20231d]">
              Sua nota
            </p>
            <div role="group" aria-labelledby="rating-label" className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  aria-pressed={rating === star}
                  aria-label={`Dar ${star} estrelas`}
                  onClick={() => setRating(star)}
                  className="transition hover:scale-110"
                >
                  <Star
                    size={28}
                    fill={star <= rating ? 'currentColor' : 'none'}
                    className={star <= rating ? 'text-[#a88b54]' : 'text-[#b9ad99]'}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="review-comment" className="mb-2 block text-sm font-semibold text-[#20231d]">
              Comentário
            </label>
            <textarea
              id="review-comment"
              maxLength={2000}
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              placeholder="Conte como foi sua experiência..."
              rows={5}
              className="w-full resize-none rounded-xl border border-[#d8cbb7] bg-[#faf8f3] p-4 text-sm outline-none transition focus:border-[#28351f]"
            />
          </div>

          <button
            type="submit"
            disabled
            title="Publicação de avaliações em desenvolvimento"
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#28351f] px-6 text-sm font-semibold text-[#f7f3eb] opacity-60 sm:w-auto"
          >
            <Send size={17} />
            Publicação em desenvolvimento
          </button>
        </form>
      </div>
    </section>
  )
}
