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
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.75fr)_minmax(270px,.8fr)] lg:items-start">
            <div className="min-w-0 overflow-hidden rounded-[28px] border border-[#e1d7c8] bg-[#fcfaf6] shadow-[0_14px_45px_rgba(40,53,31,.07)]">
              <section aria-label="Apresentação do perfil">
                <div className="relative h-44 overflow-hidden bg-[#28351f] sm:h-52 md:h-60">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_25%,rgba(212,182,111,.35),transparent_33%),linear-gradient(120deg,#172014,#28351f_52%,#594630)]" />
                  <div className="absolute -right-16 -top-24 h-72 w-72 rounded-full border border-[#d4b66f]/20" />
                  <div className="absolute -right-4 -top-10 h-56 w-56 rounded-full border border-[#d4b66f]/20" />
                  <div className="absolute bottom-5 left-6 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.23em] text-[#e4c78a] md:left-9">
                    <UtensilsCrossed size={17} /> Meu espaço
                  </div>
                </div>

                <div className="relative px-5 pb-9 text-center sm:px-8">
                  <div className="mx-auto -mt-[72px] flex h-36 w-36 items-center justify-center overflow-hidden rounded-full border-[6px] border-[#fcfaf6] bg-[#e8dfcf] text-[#604936] shadow-[0_10px_26px_rgba(0,0,0,.13)]">
                    {avatarValid ? (
                      <img src={avatarUrl} alt="Foto do perfil" referrerPolicy="no-referrer" className="h-full w-full object-cover" />
                    ) : <UserRound size={58} />}
                  </div>
                  <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.24em] text-[#a88b54]">Explorador gastronômico</p>
                  <h1 className="mx-auto mt-2 max-w-xl break-words text-4xl font-semibold leading-tight text-[#28351f] md:text-5xl" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
                    {profile.display_name}
                  </h1>
                  <p className="mt-2 break-all text-sm font-bold text-[#947447]">@{profile.username}</p>
                  <p className="mx-auto mt-4 max-w-lg whitespace-pre-wrap break-words text-sm leading-7 text-[#604936]">
                    {profile.bio || 'Explorando sabores e colecionando boas experiências. Adicione uma apresentação sobre você.'}
                  </p>
                  <div className="mt-6 flex flex-wrap justify-center gap-3">
                    <Link to="/profile/edit" className="inline-flex items-center gap-2 rounded-full bg-[#28351f] px-6 py-3 text-sm font-bold text-[#faf8f3] transition hover:bg-[#4b5b3d]">
                      <Pencil size={16} /> Editar perfil
                    </Link>
                    <Link to="/" className="inline-flex items-center gap-2 rounded-full border border-[#c9b99f] px-6 py-3 text-sm font-bold text-[#604936] transition hover:bg-[#eee7d9]">
                      Descobrir restaurantes <ArrowUpRight size={16} />
                    </Link>
                  </div>
                </div>
              </section>

              <section aria-label="Avaliações do usuário" className="border-t border-[#e4dacb]">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e4dacb] px-6 py-5 md:px-9">
                  <div className="flex items-center gap-3 text-[#28351f]">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#eee7d9] text-[#947447]"><Coffee size={19}/></span>
                    <h2 className="text-lg font-bold">Minhas avaliações</h2>
                  </div>
                  <span className="rounded-full bg-[#eee7d9] px-4 py-2 text-xs font-bold text-[#604936]">{approved.length} publicadas</span>
                </div>

                {history.length ? (
                  <div className="space-y-4 bg-[#f7f3eb] p-4 md:p-6">
                    {history.map(review => (
                      <article key={review.id} className="rounded-2xl border border-[#e1d7c8] bg-[#fcfaf6] px-5 py-5 shadow-sm md:px-7">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#e8dfcf] text-[#604936]">
                            {avatarValid ? <img src={avatarUrl} alt="" referrerPolicy="no-referrer" className="h-full w-full object-cover" /> : <UserRound size={23} />}
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
                          className="mt-5 inline-flex items-center gap-2 break-words text-xl font-semibold text-[#28351f] hover:underline">
                          {review.restaurant_name} <ArrowUpRight size={16} />
                        </Link>
                        <p className="mt-2 flex items-center gap-1.5 text-xs text-[#777269]"><MapPin size={13}/>{review.city}, {review.state}</p>
                        <div className="mt-4 flex items-center gap-1 text-[#a88b54]" aria-label={`Nota ${review.rating} de 5`}>
                          {Array.from({ length: 5 }, (_, i) => <Star key={i} size={17} fill={i < Number(review.rating) ? 'currentColor' : 'none'} />)}
                        </div>
                        <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-7 text-[#463626]">{review.comment}</p>
                        <div className="mt-6 border-t border-[#e9e0d3] pt-4 text-xs text-[#947447]">Experiência compartilhada no FoodRank</div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="px-6 py-14 text-center">
                    <UtensilsCrossed size={32} className="mx-auto text-[#a88b54]" />
                    <h3 className="mt-4 text-xl font-bold text-[#28351f]">Sua história começa com uma descoberta.</h3>
                    <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#6d6a61]">Você ainda não enviou avaliações com esta conta. Comentários antigos sem login não são vinculados automaticamente.</p>
                    <Link to="/" className="mt-5 inline-flex rounded-full bg-[#28351f] px-6 py-3 text-sm font-bold text-white">Encontrar restaurantes</Link>
                  </div>
                )}
              </section>
            </div>

            <aside className="space-y-5 lg:sticky lg:top-6" aria-label="Informações do perfil">
              <section className="rounded-[24px] border border-[#e1d7c8] bg-[#fcfaf6] p-6">
                <p className="text-[11px] font-bold uppercase tracking-[0.19em] text-[#a88b54]">Em números</p>
                <h2 className="mt-2 text-xl font-semibold text-[#28351f]">Seu diário de sabores</h2>
                <div className="mt-6 flex items-center gap-4 rounded-2xl bg-[#eee7d9] p-5">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#fcfaf6] text-[#a88b54]"><CalendarDays size={23}/></span>
                  <div><p className="text-3xl font-bold text-[#28351f]">{approved.length}</p><p className="text-xs font-semibold text-[#604936]">Avaliações publicadas</p></div>
                </div>
                <p className="mt-4 text-xs leading-6 text-[#777269]">Aqui aparecem apenas as avaliações aprovadas. Você pode acompanhar as demais no seu histórico.</p>
              </section>

              <section className="rounded-[24px] border border-[#e1d7c8] bg-[#fcfaf6] p-6">
                <h2 className="text-lg font-bold text-[#28351f]">Personalize seu espaço</h2>
                <p className="mt-3 text-sm leading-7 text-[#6d6a61]">Atualize sua foto, o nome de usuário e a descrição quando quiser.</p>
                <Link to="/profile/edit" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#604936] hover:underline">
                  Ir para edição <ArrowUpRight size={16}/>
                </Link>
                <button onClick={handleSignOut} className="mt-6 flex items-center gap-2 text-xs font-semibold text-[#777269] hover:text-[#6b3434]">
                  <LogOut size={15}/> Sair da conta
                </button>
              </section>
            </aside>
          </div>
        ) : (
          <p role="status" className="rounded-3xl bg-[#fcfaf6] p-9">Não foi possível exibir o perfil.</p>
        )}
      </div>
    </main>
  )
}
