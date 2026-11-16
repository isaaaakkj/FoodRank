import { useMemo, useState } from 'react'
import { MapPin, Search, Send, Star } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import useRestaurants from '../hooks/useRestaurants'
import Turnstile from './Turnstile'
import { isTurnstileConfigured } from '../services/turnstileConfig'
import { submitReview } from '../services/reviews'

const normalizeText = (value) =>
  String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()

function restaurantAddress(item, city, state) {
  const detail = String(item.location ?? '').trim()
  const municipality = [item.city || city, item.state || state].filter(Boolean).join(', ')
  return detail ? `${detail} · ${municipality}` : municipality
}

function restaurantKey(item) {
  return [item.id, item.latitude ?? '', item.longitude ?? ''].join('|')
}

export default function ReviewForm({ location, enabled = false }) {
  const { user } = useAuth()
  const { restaurants, loading, error } = useRestaurants(location?.city, location?.state, enabled)
  const [notice, setNotice] = useState('')
  const [search, setSearch] = useState('')
  const [selectedKey, setSelectedKey] = useState('')
  const [suggestionsOpen, setSuggestionsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [token, setToken] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [widgetVersion, setWidgetVersion] = useState(0)

  const selected = restaurants.find((item) => restaurantKey(item) === selectedKey)

  const suggestions = useMemo(() => {
    const term = normalizeText(search)
    if (!term) return []

    return restaurants
      .filter((item) => {
        const searchable = [
          item.name,
          item.location,
          item.city || location?.city,
          item.state || location?.state,
        ].map(normalizeText).join(' ')
        return searchable.includes(term)
      })
      .slice(0, 8)
  }, [restaurants, search, location?.city, location?.state])

  const canSubmit =
    enabled &&
    Boolean(user) &&
    Boolean(selected) &&
    isTurnstileConfigured &&
    Boolean(token) &&
    !loading &&
    !error &&
    !submitting

  function selectRestaurant(item) {
    setSelectedKey(restaurantKey(item))
    setSearch(item.name)
    setSuggestionsOpen(false)
    setActiveIndex(0)
    setNotice('')
  }

  function handleRestaurantSearch(value) {
    setSearch(value)
    setSelectedKey('')
    setSuggestionsOpen(true)
    setActiveIndex(0)
    setNotice('')
  }

  function handleSearchKeys(event) {
    if (event.key === 'Escape') {
      setSuggestionsOpen(false)
      return
    }

    if (event.key === 'ArrowDown' && suggestions.length) {
      event.preventDefault()
      setSuggestionsOpen(true)
      setActiveIndex((index) => suggestionsOpen ? Math.min(index + 1, suggestions.length - 1) : 0)
    }

    if (event.key === 'ArrowUp' && suggestions.length) {
      event.preventDefault()
      setSuggestionsOpen(true)
      setActiveIndex((index) => Math.max(index - 1, 0))
    }

    if (event.key === 'Enter' && suggestionsOpen && suggestions.length) {
      event.preventDefault()
      selectRestaurant(suggestions[Math.min(activeIndex, suggestions.length - 1)])
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setNotice('')

    if (!canSubmit || comment.trim().length < 10 || rating < 1) {
      setNotice('Entre na sua conta, escolha uma filial da lista, nota, comentário (mínimo 10 caracteres) e verificação anti-bot.')
      return
    }

    setSubmitting(true)
    try {
      const response = await submitReview({
        restaurant_id: String(selected.id),
        restaurant_name: selected.name,
        city: selected.city || location.city,
        state: selected.state || location.state,
        rating,
        comment: comment.trim(),
      }, token)

      setNotice(response.message || 'Avaliação publicada com sucesso.')
      setSearch('')
      setSelectedKey('')
      setSuggestionsOpen(false)
      setRating(0)
      setComment('')
    } catch (err) {
      setNotice(err.message || 'Não foi possível enviar a avaliação.')
    } finally {
      setToken('')
      setWidgetVersion((version) => version + 1)
      setSubmitting(false)
    }
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
            Sua avaliação será publicada após o envio e a verificação anti-bot.
            O comentário será vinculado à sua conta e exibirá seu nome público.
          </p>
        </div>

        {notice && <p role="status" className="mb-4 text-sm text-[#604936]">{notice}</p>}

        <form onSubmit={handleSubmit} className="space-y-5">
          {user ? (
            <p className="rounded-xl border border-[#d8cbb7] bg-[#faf8f3] px-4 py-3 text-sm text-[#604936]">
              Avaliação vinculada à sua conta Google. Seu nome público será obtido do perfil.
            </p>
          ) : (
            <p className="rounded-xl border border-[#d8cbb7] bg-[#faf8f3] px-4 py-3 text-sm text-[#604936]">
              Para publicar avaliações e acompanhar o histórico, <Link to="/profile" className="font-semibold underline">entre com sua conta Google</Link>.
            </p>
          )}

          <div>
            <label htmlFor="review-restaurant" className="mb-2 block text-sm font-semibold text-[#20231d]">
              Restaurante e unidade
            </label>
            <div className="relative">
              <div className="flex h-12 items-center gap-3 rounded-xl border border-[#d8cbb7] bg-[#faf8f3] px-4 focus-within:border-[#28351f]">
                <Search size={18} aria-hidden="true" className="shrink-0 text-[#604936]" />
                <input
                  id="review-restaurant"
                  type="search"
                  role="combobox"
                  aria-autocomplete="list"
                  aria-expanded={suggestionsOpen && suggestions.length > 0}
                  aria-controls="review-restaurant-options"
                  aria-activedescendant={suggestionsOpen && suggestions.length > 0 ? `review-option-${activeIndex}` : undefined}
                  aria-describedby="review-restaurant-help"
                  autoComplete="off"
                  value={search}
                  onChange={(event) => handleRestaurantSearch(event.target.value)}
                  onFocus={() => { if (!selectedKey) setSuggestionsOpen(true) }}
                  onBlur={() => setSuggestionsOpen(false)}
                  onKeyDown={handleSearchKeys}
                  placeholder={!enabled ? 'Pesquise uma cidade primeiro' : 'Digite o nome do restaurante'}
                  disabled={!enabled || loading || Boolean(error) || submitting}
                  className="w-full bg-transparent text-sm text-[#20231d] outline-none placeholder:text-[#777269] disabled:cursor-not-allowed"
                />
              </div>

              {suggestionsOpen && !selectedKey && suggestions.length > 0 && (
                <ul
                  id="review-restaurant-options"
                  role="listbox"
                  aria-label="Filiais encontradas"
                  className="absolute z-20 mt-1 max-h-72 w-full overflow-y-auto rounded-xl border border-[#d8cbb7] bg-[#faf8f3] py-1 shadow-lg"
                >
                  {suggestions.map((item, index) => (
                    <li
                      key={restaurantKey(item)}
                      id={`review-option-${index}`}
                      role="option"
                      aria-selected={index === activeIndex}
                      className={index === activeIndex ? 'bg-[#eee7d9]' : ''}
                    >
                      <button
                        type="button"
                        tabIndex={-1}
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => selectRestaurant(item)}
                        className="w-full px-4 py-3 text-left hover:bg-[#eee7d9]"
                      >
                        <span className="block font-semibold text-[#28351f]">{item.name}</span>
                        <span className="mt-1 flex items-start gap-1 text-xs text-[#604936]">
                          <MapPin size={14} aria-hidden="true" className="mt-0.5 shrink-0" />
                          {restaurantAddress(item, location?.city, location?.state)}
                        </span>
                        {item.latitude != null && item.longitude != null && Number.isFinite(Number(item.latitude)) && Number.isFinite(Number(item.longitude)) && (
                          <span className="block pl-5 text-xs text-[#6d6a61]">
                            Coordenadas: {Number(item.latitude).toFixed(5)}, {Number(item.longitude).toFixed(5)}
                          </span>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <p id="review-restaurant-help" className="mt-2 text-xs text-[#6d6a61]">
              Digite o nome e selecione a filial correta. O nome digitado sozinho não seleciona um restaurante.
            </p>

            {loading && <p role="status" className="mt-2 text-sm text-[#6d6a61]">Carregando restaurantes...</p>}
            {error && <p role="alert" className="mt-2 text-sm text-[#6b3434]">{error}</p>}
            {!enabled && <p className="mt-2 text-sm text-[#6d6a61]">Escolha estado e cidade na busca acima.</p>}
            {enabled && !loading && !error && search.trim() && !selected && suggestions.length === 0 && (
              <p role="status" className="mt-2 text-sm text-[#6d6a61]">
                Nenhuma unidade encontrada. Confira o nome ou pesquise outra cidade.
              </p>
            )}
            {selected && (
              <div className="mt-3 rounded-xl border border-[#c8bca5] bg-[#faf8f3] p-3 text-sm text-[#28351f]">
                <p className="font-semibold">Unidade selecionada: {selected.name}</p>
                <p className="mt-1 text-[#604936]">{restaurantAddress(selected, location?.city, location?.state)}</p>
              </div>
            )}
          </div>

          <div>
            <p id="rating-label" className="mb-2 block text-sm font-semibold text-[#20231d]">Sua nota</p>
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
              required
              minLength={10}
              maxLength={2000}
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              rows={5}
              placeholder="Conte como foi sua experiência..."
              className="w-full resize-none rounded-xl border border-[#d8cbb7] bg-[#faf8f3] p-4 text-sm outline-none focus:border-[#28351f]"
            />
          </div>

          <Turnstile key={widgetVersion} onToken={setToken} />
          <button
            type="submit"
            disabled={!canSubmit}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#28351f] px-6 text-sm font-semibold text-[#f7f3eb] transition hover:bg-[#4b5b3d] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            <Send size={17} />
            {submitting ? 'Enviando...' : 'Enviar avaliação'}
          </button>
        </form>
      </div>
    </section>
  )
}
