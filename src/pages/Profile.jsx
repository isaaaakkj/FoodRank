import { useEffect, useState } from 'react'
import { ArrowLeft, ArrowUpRight, LogOut, MapPin, Pencil, Star, UserRound } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { getMyProfile, getMyReviewHistory } from '../services/profiles'
import { DEFAULT_BANNER_COLOR } from '../data/bannerColors'

const dateFormat = value => {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString('pt-BR')
}

export default function Profile() {
  const { user, loading: authLoading, available, error: authError, signIn, signOut } = useAuth()
  const [profile, setProfile] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [retryKey, setRetryKey] = useState(0)

  useEffect(() => {
    if (!user) return undefined
    let active = true
    Promise.all([getMyProfile(user.id), getMyReviewHistory(user.id)])
      .then(([data, reviews]) => {
        if (active) { setProfile(data); setHistory(reviews); setError('') }
      })
      .catch(err => { if (active) setError(err.message) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [user, retryKey])

  function retryProfile() {
    setError('')
    setLoading(true)
    setRetryKey(key => key + 1)
  }

  async function handleSignIn() {
    try { await signIn() } catch { setError('Não foi possível iniciar o login com Google.') }
  }

  async function handleSignOut() {
    try { await signOut() } catch { setError('Não foi possível sair da conta.') }
  }

  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url
  const avatarValid = typeof avatarUrl === 'string' && avatarUrl.startsWith('https://')
  const approved = history.filter(review => review.status === 'approved')

  return (
    <main id="main-content" tabIndex={-1} className="foodrank-profile min-h-screen bg-[#f7f3eb] px-4 py-7 text-[#28351f] md:px-8 md:py-10" style={{ fontFamily: "'Manrope', sans-serif" }}>
      <div className="mx-auto max-w-[1250px]">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-[#604936] hover:text-[#28351f]">
            <ArrowLeft size={17} /> Voltar para explorar
          </Link>
          <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#a88b54]">FoodRank · Comunidade</span>
        </div>

        {authError && <p role="alert" className="mb-4 text-[#6b3434]">{authError}</p>}
        {error && <p role="alert" className="mb-4 text-[#6b3434]">{error}</p>}

        {!available ? (
          <section className="rounded-3xl border border-[#ddd3c2] bg-[#faf8f3] p-10">O acesso à conta está indisponível até configurar o Supabase.</section>
        ) : authLoading || (user && loading) ? (
          <p role="status" className="rounded-3xl bg-[#faf8f3] p-9">Carregando seu perfil...</p>
        ) : !user ? (
          <section className="relative overflow-hidden rounded-[28px] bg-[#28351f] px-6 py-16 text-center text-[#f7f3eb] md:px-16">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_75%_20%,rgba(212,182,111,.24),transparent_45%)]" />
            <div className="relative">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-[#d4b66f]/50 bg-white/10"><UserRound size={37} /></div>
              <p className="mt-7 text-xs font-bold uppercase tracking-[0.24em] text-[#d4b66f]">Seu cantinho gastronômico</p>
              <h1 className="mx-auto mt-3 max-w-xl text-5xl leading-tight md:text-6xl" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>Um perfil com o seu sabor.</h1>
              <p className="mx-auto mt-5 max-w-lg leading-7 text-[#eee8db]">Entre com Google para personalizar sua foto, escolher seu @usuário e guardar suas experiências à mesa.</p>
              <button onClick={handleSignIn} className="mt-8 rounded-full bg-[#d4b66f] px-8 py-3.5 text-sm font-bold text-[#28351f] transition hover:bg-[#e6ca83]">Continuar com Google</button>
            </div>
          </section>
        ) : profile ? (
          <div className="space-y-6">
            <section aria-label="Informações do perfil" className="overflow-hidden rounded-[26px] border border-[#e1d7c8] bg-[#fcfaf6] shadow-[0_12px_40px_rgba(40,53,31,.06)]">
              <div
                className="profile-banner h-32 sm:h-36"
                style={{ backgroundColor: profile.banner_color || DEFAULT_BANNER_COLOR }}
                aria-label="Capa de cor personalizada do perfil"
              />
              <div className="relative px-5 pb-5 sm:px-9 sm:pb-7">
                <div className="flex flex-col items-center gap-4 pt-5 text-center sm:flex-row sm:items-center sm:gap-7 sm:text-left">
                  <div className="-mt-16 flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-full border-[5px] border-[#fcfaf6] bg-[#e8dfcf] text-[#604936] shadow-lg sm:-mt-14 sm:h-32 sm:w-32">
                    {avatarValid ? <img src={avatarUrl} alt="Foto do perfil" referrerPolicy="no-referrer" className="h-full w-full object-cover" /> : <UserRound size={43}/>}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h1 className="break-words text-3xl font-semibold leading-tight text-[#28351f] sm:text-4xl" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>{profile.display_name}</h1>
                    <p className="mt-1 break-all text-sm font-bold text-[#947447]">@{profile.username}</p>
                    <p className="mt-2 max-w-2xl whitespace-pre-wrap break-words text-sm leading-6 text-[#604936]">
                      {profile.bio || 'Adicione uma breve apresentação sobre você.'}
                    </p>
                  </div>
                  <Link to="/profile/edit" className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[#28351f] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#4b5b3d]">
                    <Pencil size={15}/> Editar perfil
                  </Link>
                </div>
                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#e7ddcf] pt-4">
                  <div className="flex items-center gap-3 text-[#28351f]">
                    <span className="text-xl font-bold">{approved.length}</span>
                    <span className="text-sm font-medium text-[#604936]">Avaliações publicadas</span>
                  </div>
                  <div className="flex flex-wrap gap-4">
                    <Link to="/" className="text-sm font-semibold text-[#604936] hover:underline">Explorar restaurantes</Link>
                    <button onClick={handleSignOut} className="inline-flex items-center gap-1 text-sm font-semibold text-[#777269] hover:text-[#6b3434]"><LogOut size={15}/> Sair</button>
                  </div>
                </div>
              </div>
            </section>

            <section aria-label="Avaliações do usuário" className="overflow-hidden rounded-[26px] border border-[#e1d7c8] bg-[#fcfaf6]">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e4dacb] px-6 py-5 md:px-9">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-bold text-[#28351f]">Minhas avaliações</h2>
                </div>
                <span className="rounded-full bg-[#eee7d9] px-4 py-2 text-xs font-bold text-[#604936]">{approved.length} publicadas</span>
              </div>

              {approved.length ? (
                <div className="space-y-4 bg-[#f7f3eb] p-4 md:p-6">
                  {approved.map(review => (
                    <article key={review.id} className="rounded-2xl border border-[#e1d7c8] bg-[#fcfaf6] px-5 py-5 shadow-sm md:px-7">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#e8dfcf] text-[#604936]">
                          {avatarValid ? <img src={avatarUrl} alt="" referrerPolicy="no-referrer" className="h-full w-full object-cover" /> : <UserRound size={22}/>}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-[#28351f]">@{profile.username}</p>
                          <p className="text-xs text-[#777269]">{dateFormat(review.created_at)}</p>
                        </div>
                        <span className="rounded-full bg-[#eee7d9] px-3 py-1.5 text-[11px] font-semibold text-[#604936]">
                          Publicada
                        </span>
                      </div>
                      <Link to={`/restaurant/${encodeURIComponent(review.restaurant_id)}?city=${encodeURIComponent(review.city)}&state=${encodeURIComponent(review.state)}`}
                        className="mt-4 inline-flex items-center gap-2 break-words text-xl font-semibold text-[#28351f] hover:underline">
                        {review.restaurant_name} <ArrowUpRight size={16}/>
                      </Link>
                      <p className="mt-2 flex items-center gap-1.5 text-xs text-[#777269]"><MapPin size={13}/>{review.city}, {review.state}</p>
                      <div className="mt-3 flex items-center gap-1 text-[#a88b54]" aria-label={`Nota ${review.rating} de 5`}>
                        {Array.from({ length: 5 }, (_, i) => <Star key={i} size={17} fill={i < Number(review.rating) ? 'currentColor' : 'none'}/>)}
                      </div>
                      <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-7 text-[#463626]">{review.comment}</p>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="px-6 py-12 text-center">
                  <h3 className="mt-4 text-lg font-bold text-[#28351f]">Sua primeira avaliação começa com uma descoberta.</h3>
                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#6d6a61]">Você ainda não publicou avaliações com esta conta. Encontre um restaurante e compartilhe sua experiência.</p>
                  <Link to="/" className="mt-5 inline-flex rounded-full bg-[#28351f] px-6 py-3 text-sm font-bold text-white">Encontrar restaurantes</Link>
                </div>
              )}
            </section>
          </div>
        ) : (
          <section className="rounded-3xl bg-[#fcfaf6] p-9">
            <h1 className="text-xl font-semibold text-[#28351f]">Não foi possível exibir o perfil.</h1>
            <p className="mt-2 max-w-xl text-sm text-[#604936]">O carregamento pode ter sido interrompido por uma instabilidade de conexão ou atualização do banco. Tente novamente.</p>
            <button
              type="button"
              onClick={retryProfile}
              className="mt-5 rounded-full bg-[#28351f] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#4b5b3d]"
            >
              Tentar novamente
            </button>
          </section>
        )}
      </div>
    </main>
  )
}
