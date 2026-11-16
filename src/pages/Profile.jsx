import { useEffect, useState } from 'react'
import { ArrowLeft, ArrowUpRight, CalendarDays, LogOut, MapPin, Pencil, Star, UserRound, UtensilsCrossed } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { getMyProfile, getMyReviewHistory } from '../services/profiles'

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

  useEffect(() => {
    if (!user) return undefined
    let active = true
    Promise.all([getMyProfile(user.id), getMyReviewHistory(user.id)])
      .then(([data, reviews]) => {
        if (active) { setProfile(data); setHistory(reviews) }
      })
      .catch(err => { if (active) setError(err.message) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [user])

  async function handleSignIn() {
    try { await signIn() } catch { setError('Não foi possível iniciar o login com Google.') }
  }

  async function handleSignOut() {
    try { await signOut() } catch { setError('Não foi possível sair da conta.') }
  }

  const fallbackAvatar = user?.user_metadata?.avatar_url
  const avatarUrl = profile?.avatar_url || fallbackAvatar
  const avatarValid = typeof avatarUrl === 'string' && avatarUrl.startsWith('https://')
  const approved = history.filter(review => review.status === 'approved')

  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen bg-[#f7f3eb] px-4 py-8 text-[#28351f] md:px-8 md:py-12" style={{ fontFamily: "'Manrope', sans-serif" }}>
      <div className="mx-auto max-w-[1100px]">
        <div className="flex items-center justify-between gap-4">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-[#604936] transition hover:text-[#28351f]">
            <ArrowLeft size={17} /> Voltar para explorar
          </Link>
          <span className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#a88b54]">FoodRank / Comunidade</span>
        </div>

        {authError && <p role="alert" className="mt-5 text-[#6b3434]">{authError}</p>}
        {error && <p role="alert" className="mt-5 text-[#6b3434]">{error}</p>}

        {!available ? (
          <section className="mt-9 rounded-3xl bg-white p-10 shadow-sm">O acesso à conta está indisponível até configurar o Supabase.</section>
        ) : authLoading || (user && loading) ? (
          <p role="status" className="mt-10">Carregando seu perfil...</p>
        ) : !user ? (
          <section className="relative mt-9 overflow-hidden rounded-[32px] bg-[#28351f] px-6 py-16 text-center text-[#f7f3eb] md:px-16">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_75%_20%,rgba(212,182,111,.24),transparent_45%)]" />
            <div className="relative">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-[#d4b66f]/50 bg-white/10"><UserRound size={37} /></div>
              <p className="mt-7 text-xs font-bold uppercase tracking-[0.24em] text-[#d4b66f]">Sua experiência gastronômica</p>
              <h1 className="mx-auto mt-3 max-w-xl text-5xl leading-tight md:text-6xl" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>Um espaço com o seu sabor.</h1>
              <p className="mx-auto mt-5 max-w-lg leading-7 text-[#eee8db]">Entre com Google para personalizar sua foto, escolher seu @usuário e acompanhar suas avaliações.</p>
              <button onClick={handleSignIn} className="mt-8 rounded-full bg-[#d4b66f] px-8 py-3.5 text-sm font-bold text-[#28351f] transition hover:bg-[#e6ca83]">Continuar com Google</button>
            </div>
          </section>
        ) : profile ? (
          <>
            <section className="relative mt-9 overflow-hidden rounded-[32px] bg-[#28351f] text-[#faf8f3] shadow-[0_20px_60px_rgba(40,53,31,.14)]">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_5%,rgba(212,182,111,.23),transparent_42%),linear-gradient(125deg,#172014,#28351f_65%,#493b2a)]" />
              <div className="relative px-6 pb-8 pt-10 md:px-12 md:pb-12 md:pt-14">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <p className="text-xs font-bold uppercase tracking-[0.26em] text-[#d4b66f]">O meu espaço no FoodRank</p>
                  <button onClick={handleSignOut} className="inline-flex items-center gap-2 rounded-full border border-white/25 px-4 py-2 text-xs font-semibold text-[#f7f3eb] transition hover:bg-white/10"><LogOut size={15} /> Sair</button>
                </div>
                <div className="mt-10 flex flex-col items-start gap-6 sm:flex-row sm:items-center md:gap-9">
                  <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-full border-[5px] border-[#d4b66f] bg-[#e8dfcf] text-[#604936] shadow-xl md:h-36 md:w-36">
                    {avatarValid ? <img src={avatarUrl} alt="Foto do perfil" referrerPolicy="no-referrer" className="h-full w-full object-cover" /> : <UserRound size={54} />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#d4b66f]">Explorador gastronômico</p>
                    <h1 className="mt-2 break-words text-4xl leading-tight md:text-6xl" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>{profile.display_name}</h1>
                    <p className="mt-2 break-all text-base font-semibold text-[#d4b66f]">@{profile.username}</p>
                    <p className="mt-4 max-w-xl whitespace-pre-wrap break-words text-sm leading-7 text-[#eee8db]">{profile.bio || 'Cada descoberta merece uma história. Adicione uma apresentação sobre você.'}</p>
                  </div>
                </div>
                <div className="mt-9 flex flex-wrap gap-3">
                  <Link to="/profile/edit" className="inline-flex items-center gap-2 rounded-full bg-[#d4b66f] px-6 py-3 text-sm font-bold text-[#28351f] transition hover:bg-[#e5c984]"><Pencil size={17} /> Editar perfil</Link>
                  <Link to="/" className="inline-flex items-center gap-2 rounded-full border border-white/35 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10">Explorar restaurantes <ArrowUpRight size={17}/></Link>
                </div>
              </div>
            </section>

            <div className="mt-6">
              <div className="flex max-w-sm items-center gap-5 rounded-3xl border border-[#e2d7c6] bg-[#fcfaf6] p-6">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#eee7d9] text-[#a88b54]">
                  <CalendarDays size={26} />
                </span>
                <div>
                  <p className="text-3xl font-semibold text-[#28351f]">{approved.length}</p>
                  <p className="mt-1 text-sm text-[#6d6a61]">Avaliações publicadas</p>
                </div>
              </div>
            </div>

            <section className="mt-12 pb-12">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.23em] text-[#a88b54]">Memórias à mesa</p>
                  <h2 className="mt-2 text-3xl md:text-4xl" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>Minhas avaliações</h2>
                </div>
                <span className="rounded-full border border-[#ddd3c2] px-4 py-2 text-xs font-semibold text-[#604936]">{history.length} registros</span>
              </div>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#6d6a61]">As avaliações vinculadas à sua conta aparecem aqui. Comentários antigos publicados sem login não são vinculados automaticamente.</p>

              {history.length ? (
                <div className="mt-7 grid gap-4 md:grid-cols-2">
                  {history.map(review => (
                    <article key={review.id} className="rounded-3xl border border-[#e2d7c6] bg-[#fcfaf6] p-6">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <span className="rounded-full bg-[#eee7d9] px-3 py-1 text-xs font-bold text-[#604936]">{review.status === 'approved' ? 'Publicada' : review.status === 'pending' ? 'Em análise' : 'Não aprovada'}</span>
                        <span className="text-xs text-[#777269]">{dateFormat(review.created_at)}</span>
                      </div>
                      <Link to={`/restaurant/${encodeURIComponent(review.restaurant_id)}?city=${encodeURIComponent(review.city)}&state=${encodeURIComponent(review.state)}`} className="mt-5 inline-flex items-center gap-2 text-xl font-semibold text-[#28351f] hover:underline">
                        {review.restaurant_name} <ArrowUpRight size={17}/>
                      </Link>
                      <p className="mt-2 flex items-center gap-1 text-xs text-[#777269]"><MapPin size={13}/>{review.city}, {review.state}</p>
                      <p className="mt-4 flex items-center gap-1 text-sm font-bold text-[#8d7041]"><Star size={17} fill="currentColor"/> {review.rating}/5</p>
                      <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-7 text-[#604936]">{review.comment}</p>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="mt-7 rounded-3xl border border-dashed border-[#cfc0a6] bg-[#fcfaf6] px-6 py-12 text-center">
                  <UtensilsCrossed size={32} className="mx-auto text-[#a88b54]" />
                  <h3 className="mt-4 text-xl font-semibold">Sua história começa com uma descoberta.</h3>
                  <p className="mt-2 text-sm text-[#6d6a61]">Você ainda não enviou avaliações com esta conta.</p>
                  <Link to="/" className="mt-5 inline-flex rounded-full bg-[#28351f] px-6 py-3 text-sm font-bold text-white">Encontrar restaurantes</Link>
                </div>
              )}
            </section>
          </>
        ) : (
          <p role="status" className="mt-9">Não foi possível exibir o perfil.</p>
        )}
      </div>
    </main>
  )
}
