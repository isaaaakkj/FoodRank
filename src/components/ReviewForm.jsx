import { useEffect, useMemo, useState } from 'react'
import { MapPin, Search, Send, Star, UserRound, MessageCircle, Store, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import useRestaurants from '../hooks/useRestaurants'
import Turnstile from './Turnstile'
import { isTurnstileConfigured } from '../services/turnstileConfig'
import { submitReview } from '../services/reviews'
import { getMyProfile } from '../services/profiles'

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

export default function ReviewForm({ location, enabled = false, fixedRestaurant = null, onSubmitted }) {
  const { user } = useAuth()
  const [authorProfile, setAuthorProfile] = useState(null)
  useEffect(() => {
    if (!user?.id) return undefined
    let active = true
    getMyProfile(user.id)
      .then(profile => { if (active) setAuthorProfile(profile) })
      .catch(() => { if (active) setAuthorProfile(null) })
    return () => { active = false }
  }, [user?.id])
  const publicName = user?.id && authorProfile?.id === user.id
    ? authorProfile.display_name
    : user?.user_metadata?.full_name || user?.user_metadata?.name || 'Seu perfil'
  const publicAvatar = user?.id && authorProfile?.id === user.id
    ? authorProfile.avatar_url
    : user?.user_metadata?.avatar_url
  const avatarValid = typeof publicAvatar === 'string' && publicAvatar.startsWith('https://')
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

  const selected = fixedRestaurant || restaurants.find((item) => restaurantKey(item) === selectedKey)

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
      if (!fixedRestaurant) {
        setSearch('')
        setSelectedKey('')
      }
      setSuggestionsOpen(false)
      setRating(0)
      setComment('')
      onSubmitted?.()
    } catch (err) {
      setNotice(err.message || 'Não foi possível enviar a avaliação.')
    } finally {
      setToken('')
      setWidgetVersion((version) => version + 1)
      setSubmitting(false)
    }
  }

  return (
    <section className="mx-auto max-w-[1100px] py-12" aria-labelledby="review-title">
      <div className="overflow-hidden rounded-[30px] border border-[#d8cbb7] bg-[#fcfaf6] shadow-[0_24px_60px_rgba(40,53,31,.10)]">
        <div className="relative overflow-hidden bg-[#28351f] px-6 py-9 text-[#faf8f3] sm:px-9 md:py-11">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_93%_4%,rgba(212,182,111,.27),transparent_47%),linear-gradient(120deg,#172014,#28351f_66%,#493b2a)]" />
          <div className="relative flex items-start gap-4">
            <div className="mt-1 hidden h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-[#d4b66f]/55 text-[#d4b66f] sm:flex">
              <MessageCircle size={29} aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[.23em] text-[#d4b66f]">Sua opinião importa</p>
              <h2 id="review-title" className="mt-2 font-display text-3xl font-semibold leading-tight sm:text-4xl">Deixe sua avaliação</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#eee8db] sm:text-base">
                Conte sua experiência e ajude outras pessoas a descobrirem bons restaurantes.
              </p>
            </div>
          </div>
        </div>
        <div className="p-5 sm:p-8 md:p-10">
          {notice && <p role="status" className="mb-6 rounded-xl border border-[#d8cbb7] bg-[#eee7d9] px-4 py-3 text-sm text-[#604936]">{notice}</p>}

        <form onSubmit={handleSubmit} className="space-y-7">
          {user ? (
            <div className="flex items-center gap-4 rounded-2xl border border-[#e0d4c2] bg-[#f1e9dc] px-4 py-4 sm:px-5">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-[#d4b66f] bg-[#e8dfcf] text-[#604936] sm:h-16 sm:w-16">
                {avatarValid ? (
                  <img src={publicAvatar} alt="" referrerPolicy="no-referrer" className="h-full w-full object-cover" />
                ) : <UserRound size={24} aria-hidden="true" />}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[.12em] text-[#777269]">Avaliando como</p>
                <p className="truncate text-lg font-bold text-[#28351f]">{publicName}</p>
              </div>
            </div>
          ) : (
            <p className="rounded-2xl border border-[#d8cbb7] bg-[#f1e9dc] px-5 py-4 text-sm text-[#604936]">
              Para publicar avaliações e acompanhar o histórico, <Link to="/profile" className="font-semibold underline">entre com sua conta Google</Link>.
            </p>
          )}

          <div className="grid items-stretch gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)]">
          {fixedRestaurant ? (
            <div className="min-w-0 rounded-2xl border border-[#e2d7c6] bg-[#f6f0e7] p-4 sm:p-5">
              <p className="mb-3 flex items-center gap-2 text-sm font-bold text-[#28351f]">
                <Store size={19} className="text-[#8d7041]" aria-hidden="true" />
                Restaurante selecionado
              </p>
              <div className="rounded-xl border border-[#c8bca5] bg-[#faf8f3] p-4">
                <p className="font-display text-lg font-semibold text-[#28351f]">{fixedRestaurant.name}</p>
                <p className="mt-2 flex items-start gap-2 text-sm text-[#604936]">
                  <MapPin size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
                  {restaurantAddress(fixedRestaurant, location?.city, location?.state)}
                </p>
              </div>
              <p className="mt-3 text-xs text-[#6d6a61]">A avaliação será vinculada a esta unidade.</p>
            </div>
          ) : (
          <div className="min-w-0 rounded-2xl border border-[#e2d7c6] bg-[#f6f0e7] p-4 sm:p-5">
            <label htmlFor="review-restaurant" className="mb-3 flex items-center gap-2 text-sm font-bold text-[#28351f]">
              <Store size={19} className="text-[#8d7041]" aria-hidden="true" />
              Restaurante e unidade <span className="text-[#9d4a3b]">*</span>
            </label>
            <div className="relative">
              <div className="flex h-14 items-center gap-3 rounded-xl border border-[#d8cbb7] bg-white px-4 shadow-sm transition focus-within:border-[#d4b66f] focus-within:ring-2 focus-within:ring-[#d4b66f]/25">
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

          )}

          <div className="min-w-0 rounded-2xl border border-[#e2d7c6] bg-[#f6f0e7] p-4 sm:p-5">
            <p id="rating-label" className="mb-3 flex items-center gap-2 text-sm font-bold text-[#28351f]">
              <Star size={19} className="text-[#8d7041]" aria-hidden="true" />
              Sua nota <span className="text-[#9d4a3b]">*</span>
            </p>
            <div role="group" aria-labelledby="rating-label" className="flex min-h-14 flex-wrap items-center gap-1 sm:gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  aria-pressed={star === rating}
                  aria-label={`Dar ${star} estrelas`}
                  onClick={() => setRating(star)}
                  className="rounded-lg p-1 transition hover:scale-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#28351f]"
                >
                  <Star size={30} fill={star <= rating ? 'currentColor' : 'none'} className={star <= rating ? 'text-[#a88b54]' : 'text-[#bcae95]'} />
                </button>
              ))}
            </div>
            <p className="mt-3 text-xs font-semibold text-[#604936]">{rating ? `${rating} de 5 estrelas` : 'Selecione de 1 a 5 estrelas'}</p>
          </div>
        </div>

          <div>
            <label htmlFor="review-comment" className="mb-3 flex items-center gap-2 text-sm font-bold text-[#28351f]">
              <MessageCircle size={19} className="text-[#8d7041]" aria-hidden="true" />
              Seu comentário <span className="text-[#9d4a3b]">*</span>
            </label>
            <textarea
              id="review-comment"
              required
              minLength={10}
              maxLength={2000}
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              rows={5}
              placeholder="O que você achou do restaurante? Conte sobre atendimento, comida e ambiente..."
              className="w-full min-h-44 resize-y rounded-2xl border border-[#d8cbb7] bg-white p-5 text-sm leading-7 text-[#20231d] shadow-sm outline-none transition focus:border-[#d4b66f] focus:ring-2 focus:ring-[#d4b66f]/25"
            />
            <div className="mt-2 flex justify-between gap-3 text-xs text-[#777269]">
              <span>Mínimo de 10 caracteres</span>
              <span aria-live="polite">{comment.length}/2000</span>
            </div>
          </div>

          <Turnstile key={widgetVersion} onToken={setToken} />
          <div className="flex flex-wrap items-center justify-end gap-3 border-t border-[#e2d7c6] pt-6">
            <button
              type="button"
              onClick={() => { if (!fixedRestaurant) { setSearch(''); setSelectedKey('') } setRating(0); setComment(''); setNotice('') }}
              disabled={submitting}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-[#cfc0a6] px-6 text-sm font-bold text-[#604936] transition hover:bg-[#eee7d9] disabled:opacity-50"
            >
              <X size={17} /> Limpar
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#28351f] px-7 text-sm font-bold text-[#faf8f3] shadow-md transition hover:bg-[#4b5b3d] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send size={17} />
              {submitting ? 'Publicando...' : 'Publicar avaliação'}
            </button>
          </div>
        </form>
        </div>
      </div>
    </section>
  )
}
