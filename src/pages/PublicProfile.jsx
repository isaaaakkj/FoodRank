import { useEffect, useState } from 'react'
import { ArrowLeft, ArrowUpRight, MapPin, Star, UserRound } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { getPublicProfile } from '../services/profiles'
import { getPublicUserReviews } from '../services/reviews'
import { DEFAULT_BANNER_COLOR, isBannerColor } from '../data/bannerColors'

function dateLabel(value) {
  if (!value) return ''
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString('pt-BR')
}

export default function PublicProfile() {
  const { username = '' } = useParams()
  const [attempt, setAttempt] = useState(0)
  const [result, setResult] = useState({ username: '', status: 'loading', profile: null, reviews: [] })

  useEffect(() => {
    let active = true
    Promise.all([getPublicProfile(username), getPublicUserReviews(username)])
      .then(([profile, reviews]) => {
        if (!active) return
        setResult({ username, status: profile ? 'ready' : 'not-found', profile, reviews })
      })
      .catch(() => {
        if (active) setResult({ username, status: 'error', profile: null, reviews: [] })
      })
    return () => { active = false }
  }, [username, attempt])

  const isLoading = result.username !== username || result.status === 'loading'
  const profile = result.profile
  const avatarValid = typeof profile?.avatar_url === 'string' && profile.avatar_url.startsWith('https://')
  const bannerColor = isBannerColor(profile?.banner_color) ? profile.banner_color : DEFAULT_BANNER_COLOR

  return (
    <main id="main-content" tabIndex={-1} className="foodrank-profile min-h-screen bg-[#f7f3eb] px-4 py-7 text-[#28351f] md:px-8 md:py-10" style={{ fontFamily: "'Manrope', sans-serif" }}>
      <div className="mx-auto max-w-[1100px]">
        <div className="mb-7 flex flex-wrap items-center justify-between gap-3">
          <Link to="/timeline" className="inline-flex items-center gap-2 text-sm font-semibold text-[#604936] hover:underline">
            <ArrowLeft size={17} /> Voltar à comunidade
          </Link>
          <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#a88b54]">FoodRank · Perfil da comunidade</span>
        </div>

        {isLoading ? (
          <p role="status" className="rounded-3xl bg-[#fcfaf6] p-9">Carregando perfil...</p>
        ) : result.status === 'not-found' ? (
          <div className="rounded-3xl bg-[#fcfaf6] p-9">
            <h1 className="text-2xl font-semibold text-[#28351f]">Perfil não encontrado</h1>
            <p className="mt-3 text-sm text-[#604936]">Este nome de usuário não está disponível.</p>
          </div>
        ) : result.status === 'error' ? (
          <div role="alert" className="rounded-3xl bg-[#fcfaf6] p-9">
            <h1 className="text-2xl font-semibold text-[#28351f]">Não foi possível carregar o perfil.</h1>
            <button type="button" onClick={() => setAttempt(n => n + 1)} className="mt-5 rounded-full bg-[#28351f] px-6 py-3 text-sm font-semibold text-white">Tentar novamente</button>
          </div>
        ) : (
          <div className="space-y-6">
            <section aria-label="Perfil público" className="overflow-hidden rounded-[26px] border border-[#e1d7c8] bg-[#fcfaf6] shadow-[0_12px_40px_rgba(40,53,31,.06)]">
              <div className="h-32 sm:h-36" style={{ backgroundColor: bannerColor }} aria-label="Cor do banner escolhida pelo usuário" />
              <div className="px-5 pb-6 sm:px-9">
                <div className="flex flex-col items-center gap-4 pt-5 text-center sm:flex-row sm:items-center sm:gap-7 sm:text-left">
                  <div className="-mt-16 flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-full border-[5px] border-[#fcfaf6] bg-[#e8dfcf] text-[#604936] shadow-lg sm:-mt-14 sm:h-32 sm:w-32">
                    {avatarValid ? <img src={profile.avatar_url} alt="Foto do perfil" referrerPolicy="no-referrer" className="h-full w-full object-cover" /> : <UserRound size={43} />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h1 className="break-words text-3xl font-semibold leading-tight text-[#28351f] sm:text-4xl" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>{profile.display_name}</h1>
                    <p className="mt-1 break-all text-sm font-bold text-[#947447]">@{profile.username}</p>
                    <p className="mt-2 max-w-2xl whitespace-pre-wrap break-words text-sm leading-6 text-[#604936]">{profile.bio || 'Este usuário ainda não adicionou uma biografia.'}</p>
                  </div>
                </div>
                <div className="mt-5 border-t border-[#e7ddcf] pt-4 text-sm text-[#604936]">
                  <strong className="mr-2 text-lg text-[#28351f]">{result.reviews.length}</strong>
                  Avaliações publicadas
                </div>
              </div>
            </section>

            <section aria-label="Avaliações publicadas" className="overflow-hidden rounded-[26px] border border-[#e1d7c8] bg-[#fcfaf6]">
              <div className="border-b border-[#e4dacb] px-6 py-5 md:px-9">
                <h2 className="text-lg font-bold text-[#28351f]">Avaliações de @{profile.username}</h2>
              </div>
              {result.reviews.length ? (
                <div className="space-y-4 bg-[#f7f3eb] p-4 md:p-6">
                  {result.reviews.map(review => (
                    <article key={review.id} className="rounded-2xl border border-[#e1d7c8] bg-[#fcfaf6] p-5 shadow-sm md:p-7">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-sm font-semibold text-[#28351f]">{dateLabel(review.created_at)}</span>
                        <span className="flex items-center gap-1 text-sm font-bold text-[#a88b54]" aria-label={`Nota ${review.rating} de 5`}>
                          <Star size={16} fill="currentColor" /> {review.rating}/5
                        </span>
                      </div>
                      <Link to={`/restaurant/${encodeURIComponent(review.restaurant_id)}?city=${encodeURIComponent(review.city)}&state=${encodeURIComponent(review.state)}`} className="mt-4 inline-flex items-center gap-2 break-words text-xl font-semibold text-[#28351f] hover:underline">
                        {review.restaurant_name} <ArrowUpRight size={16} />
                      </Link>
                      <p className="mt-2 flex items-center gap-1.5 text-xs text-[#777269]"><MapPin size={13} /> {review.city}, {review.state}</p>
                      <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-7 text-[#463626]">{review.comment}</p>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="px-6 py-12 text-center text-sm text-[#6d6a61]">Este usuário ainda não publicou avaliações.</div>
              )}
            </section>
          </div>
        )}
      </div>
    </main>
  )
}
