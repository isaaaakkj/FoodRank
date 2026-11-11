import { useState } from 'react'
import { Send, Star } from 'lucide-react'

export default function ReviewForm() {
  const [notice, setNotice] = useState('')
  const [name, setName] = useState('')
  const [restaurant, setRestaurant] = useState('')
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')

  function handleSubmit(event) {
    event.preventDefault()

    setNotice('Nenhuma avaliação foi salva. A publicação depende da implementação e aprovação do backend.')
  }

  return (
    <section className="mx-auto max-w-[1000px] py-10">

      <div className="rounded-2xl border border-[#ddd3c2] bg-[#eee7d9] p-6 md:p-8">

        <div className="mb-7">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#a88b54]">
            Sua opinião importa
          </p>

          <h2 className="mt-1 font-display text-3xl font-semibold text-[#28351f]">
            Deixe sua avaliação
          </h2>

          <p className="mt-2 text-sm text-[#6d6a61]">
            Formulário demonstrativo: avaliações ainda não são salvas nem publicadas. Não informe dados pessoais.
          </p>
        </div>

        {notice && <p role="status" className="mb-4 text-[#6b3434]">{notice}</p>}
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Nome */}
          <div>
            <label htmlFor="review-name" className="mb-2 block text-sm font-semibold text-[#20231d]">
              Seu nome ou apelido
            </label>

            <input
              id="review-name" maxLength={80} type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ex.: Maria"
              className="h-12 w-full rounded-xl border border-[#d8cbb7] bg-[#faf8f3] px-4 text-sm outline-none transition focus:border-[#28351f]"
            />
          </div>

          {/* Restaurante */}
          <div>
            <label htmlFor="review-restaurant" className="mb-2 block text-sm font-semibold text-[#20231d]">
              Restaurante
            </label>

            <select id="review-restaurant"
              value={restaurant}
              onChange={(event) => setRestaurant(event.target.value)}
              className="h-12 w-full rounded-xl border border-[#d8cbb7] bg-[#faf8f3] px-4 text-sm text-[#20231d] outline-none transition focus:border-[#28351f]"
            >
              <option value="">Escolha um restaurante</option>
              <option value="Bistrô das Montanhas">
                Bistrô das Montanhas
              </option>
              <option value="Vila di Pasta">
                Vila di Pasta
              </option>
              <option value="Kura Sushi">
                Kura Sushi
              </option>
              <option value="Manzano Burger">
                Manzano Burger
              </option>
            </select>
          </div>

          {/* Nota */}
          <div>
            <p id="rating-label" className="mb-2 block text-sm font-semibold text-[#20231d]">
              Sua nota
            </p>

            <div role="group" aria-labelledby="rating-label" className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  aria-pressed={star === rating}
                  aria-label={`Dar ${star} estrelas`}
                  onClick={() => setRating(star)}
                  className="transition hover:scale-110"
                >
                  <Star
                    size={28}
                    fill={star <= rating ? 'currentColor' : 'none'}
                    className={
                      star <= rating
                        ? 'text-[#a88b54]'
                        : 'text-[#b9ad99]'
                    }
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Comentário */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-[#20231d]">
              Comentário
            </label>

            <textarea id="review-comment" maxLength={2000}
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              placeholder="Conte como foi sua experiência..."
              rows="5"
              className="w-full resize-none rounded-xl border border-[#d8cbb7] bg-[#faf8f3] p-4 text-sm outline-none transition focus:border-[#28351f]"
            />
          </div>

          {/* Enviar */}
          <button
            type="submit"
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#28351f] px-6 text-sm font-semibold text-[#f7f3eb] transition hover:bg-[#4b5b3d] sm:w-auto"
          >
            <Send size={17} />
            Verificar disponibilidade
          </button>

        </form>

      </div>

    </section>
  )
}
