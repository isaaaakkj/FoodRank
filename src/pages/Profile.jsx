import { useEffect, useState } from 'react'
import { ArrowLeft, ArrowUpRight, CalendarDays, Coffee, LogOut, MapPin, Pencil, Star, UserRound, UtensilsCrossed } from 'lucide-react'
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

  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url
  const avatarValid = typeof avatarUrl === 'string' && avatarUrl.startsWith('https://')
  const approved = history.filter(review => review.status === 'approved')

  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen bg-[#f7f3eb] px-4 py-7 text-[#28351f] md:px-8 md:py-10" style={{ fontFamily: "'Manrope', sans-serif" }}>
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
              <div className="relative h-24 overflow-hidden bg-[#28351f] sm:h-28">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_10%,rgba(212,182,111,.4),transparent_40%),linear-gradient(120deg,#172014,#28351f_55%,#604936)]" />
                <div className="absolute -right-8 -top-20 h-56 w-56 rounded-full border border-[#d4b66f]/25" />
                <div className="absolute bottom-3 right-5 text-[10px] font-bold uppercase tracking-[0.22em] text-[#e4c78a]">Meu espaço · FoodRank</div>
              </div>

              <div className="relative px-5 pb-5 sm:px-9 sm:pb-7">
                <div className="-mt-11 flex flex-col items-center gap-3 sm:-mt-12 sm:flex-row sm:items-end sm:gap-6">
                  <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border-[5px] border-[#fcfaf6] bg-[#e8dfcf] text-[#604936] shadow-lg sm:h-28 sm:w-28">
                    {avatarValid ? <img src={avatarUrl} alt="Foto do perfil" referrerPolicy="no-referrer" className="h-full w-full object-cover" /> : <UserRound size={43} />}
                  </div>
                  <div className="min-w-0 flex-1 text-center sm:pb-1 sm:text-left">
                    <h1 className="break-words text-3xl font-semibold leading-tight text-[#28351f] sm:text-4xl" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>{profile.display_name}</h1>
                    <p className="mt-1 break-all text-sm font-bold text-[#947447]">@{profile.username}</p>
                  </div>
                  <div className="hidden sm:flex sm:pb-1">
                    <Link to="/profile/edit" className="inline-flex items-center gap-2 rounded-full bg-[#28351f] px-5 py-2.5 text-sm font-bold text-[#faf8f3] transition hover:bg-[#4b5b3d]">
                      <Pencil size={15}/> Editar perfil
                    </Link>
                  </div>
                </div>

                <p className="mx-auto mt-4 max-w-3xl whitespace-pre-wrap break-words text-center text-sm leading-6 text-[#604936] sm:mx-0 sm:text-left">
                  {profile.bio || 'Explorando sabores e colecionando boas experiências. Adicione uma apresentação sobre você.'}
                </p>

                <div className="mt-5 flex flex-col items-center justify-between gap-4 border-t border-[#e7ddcf] pt-4 sm:flex-row">
                  <div className="flex items-center gap-3 rounded-xl bg-[#eee7d9] px-4 py-2.5 text-[#28351f]">
                    <CalendarDays size={19} className="text-[#947447]"/>
                    <span className="text-xl font-bold">{approved.length}</span>
                    <span className="text-xs font-semibold text-[#604936]">Avaliações publicadas</span>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <Link to="/profile/edit" className="inline-flex items-center gap-2 rounded-full bg-[#28351f] px-5 py-2.5 text-xs font-bold text-white sm:hidden"><Pencil size={15}/> Editar perfil</Link>
                    <Link to="/" className="inline-flex items-center gap-2 rounded-full border border-[#c9b99f] px-5 py-2.5 text-xs font-bold text-[#604936] hover:bg-[#eee7d9]">Explorar <ArrowUpRight size={15}/></Link>
                    <button onClick={handleSignOut} className="inline-flex items-center gap-2 px-2 py-2 text-xs font-semibold text-[#777269] hover:text-[#6b3434]"><LogOut size={15}/> Sair</button>
                  </div>
                </div>
              </div>
            </section>

            <section aria-label="Avaliações do usuário" className="overflow-hidden rounded-[26px] border border-[#e1d7c8] bg-[#fcfaf6]">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e4dacb] px-6 py-5 md:px-9">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#eee7d9] text-[#947447]"><Coffee size={19}/></span>
                  <h2 className="text-lg font-bold text-[#28351f]">Minhas avaliações</h2>
                </div>
                <span className="rounded-full bg-[#eee7d9] px-4 py-2 text-xs font-bold text-[#604936]">{approved.length} publicadas</span>
              </div>

              {history.length ? (
                <div className="space-y-4 bg-[#f7f3eb] p-4 md:p-6">
                  {history.map(review => (
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
                          {review.status === 'approved' ? 'Publicada' : review.status === 'pending' ? 'Em análise' : 'Não aprovada'}
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
                  <UtensilsCrossed size={30} className="mx-auto text-[#a88b54]"/>
                  <h3 className="mt-4 text-lg font-bold text-[#28351f]">Sua história começa com uma descoberta.</h3>
                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#6d6a61]">Você ainda não enviou avaliações com esta conta. Comentários antigos sem login não são vinculados automaticamente.</p>
                  <Link to="/" className="mt-5 inline-flex rounded-full bg-[#28351f] px-6 py-3 text-sm font-bold text-white">Encontrar restaurantes</Link>
                </div>
              )}
            </section>
          </div>
        ) : (
          <p role="status" className="rounded-3xl bg-[#fcfaf6] p-9">Não foi possível exibir o perfil.</p>
        )}
      </div>
    </main>
  )
}
