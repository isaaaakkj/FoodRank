import { useEffect, useState } from 'react'
import { ArrowLeft, LogOut, Save, Star, UserRound } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { getMyProfile, getMyReviewHistory, saveMyProfile } from '../services/profiles'

export default function Profile() {
  const { user, loading: authLoading, available, error: authError, signIn, signOut } = useAuth()
  const [profile, setProfile] = useState(null)
  const [form, setForm] = useState({ username: '', display_name: '', bio: '' })
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) return undefined
    let cancelled = false

    async function load() {
      setLoading(true)
      setError('')
      try {
        const [data, reviews] = await Promise.all([
          getMyProfile(user.id),
          getMyReviewHistory(user.id),
        ])
        if (cancelled) return
        setProfile(data)
        setHistory(reviews)
        setForm({ username: data.username, display_name: data.display_name, bio: data.bio })
      } catch (err) {
        if (!cancelled) setError(err.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [user])

  async function submit(event) {
    event.preventDefault()
    setSaving(true)
    setError('')
    setMessage('')
    try {
      const updated = await saveMyProfile(user.id, form)
      setProfile(updated)
      setForm({ username: updated.username, display_name: updated.display_name, bio: updated.bio })
      setMessage('Perfil atualizado com sucesso.')
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function login() {
    setError('')
    try { await signIn() } catch { setError('Não foi possível iniciar o login com Google.') }
  }

  async function logout() {
    setError('')
    try { await signOut() } catch { setError('Não foi possível sair da conta.') }
  }

  const avatarUrl = profile?.avatar_url
  const validAvatar = typeof avatarUrl === 'string' && avatarUrl.startsWith('https://')

  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen bg-[#f7f3eb] px-4 py-8 text-[#28351f]">
      <div className="mx-auto max-w-[1000px]">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-[#604936]">
          <ArrowLeft size={17} /> Voltar para explorar
        </Link>

        <h1 className="mt-7 font-display text-4xl font-semibold">Meu perfil</h1>

        {authError && <p role="alert" className="mt-4 text-[#6b3434]">{authError}</p>}
        {error && <p role="alert" className="mt-4 text-[#6b3434]">{error}</p>}
        {message && <p role="status" className="mt-4 text-[#365537]">{message}</p>}

        {!available ? (
          <section className="mt-7 rounded-2xl border border-[#ddd3c2] bg-[#faf8f3] p-8">
            O login está indisponível até configurar as chaves públicas do Supabase.
          </section>
        ) : authLoading ? (
          <p role="status" className="mt-6">Verificando sessão...</p>
        ) : !user ? (
          <section className="mt-7 rounded-2xl border border-[#ddd3c2] bg-[#faf8f3] p-8 text-center">
            <UserRound size={44} className="mx-auto text-[#604936]" />
            <h2 className="mt-4 font-display text-2xl">Entre para criar seu perfil</h2>
            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-[#6d6a61]">
              Use sua conta Google para ter nome, foto de perfil, @usuário exclusivo, biografia e histórico de novas avaliações vinculadas à sua conta.
            </p>
            <button onClick={login} className="mt-6 rounded-full bg-[#28351f] px-7 py-3 font-semibold text-white">
              Continuar com Google
            </button>
          </section>
        ) : loading ? (
          <p role="status" className="mt-6">Carregando perfil e avaliações...</p>
        ) : profile ? (
          <>
            <section className="mt-7 rounded-2xl border border-[#ddd3c2] bg-[#faf8f3] p-6 md:p-8">
              <div className="flex flex-wrap items-start gap-5">
                <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#e8dfcf] text-[#604936]">
                  {validAvatar ? (
                    <img src={avatarUrl} alt="Foto de perfil da conta Google" referrerPolicy="no-referrer" className="h-full w-full object-cover" />
                  ) : <UserRound size={40} />}
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="font-display text-2xl font-semibold">{profile.display_name}</h2>
                  <p className="mt-1 break-all text-[#604936]">@{profile.username}</p>
                  <p className="mt-2 text-sm text-[#6d6a61]">{profile.bio || 'Adicione uma descrição sobre você.'}</p>
                </div>
                <button onClick={logout} className="inline-flex items-center gap-2 rounded-full border border-[#d8cbb7] px-4 py-2 text-sm font-semibold">
                  <LogOut size={16} /> Sair
                </button>
              </div>

              <form onSubmit={submit} className="mt-8 grid gap-4">
                <h3 className="font-display text-xl font-semibold">Editar perfil</h3>
                <label htmlFor="profile-name" className="text-sm font-semibold">Nome público</label>
                <input id="profile-name" maxLength={80} minLength={2} required className="rounded-xl border border-[#d8cbb7] bg-white px-4 py-3" value={form.display_name} onChange={e => setForm(v => ({ ...v, display_name: e.target.value }))} />
                <label htmlFor="profile-username" className="text-sm font-semibold">@usuário único</label>
                <input id="profile-username" maxLength={40} minLength={3} required pattern="[a-z0-9_]{3,40}" title="Somente letras minúsculas, números e _" className="rounded-xl border border-[#d8cbb7] bg-white px-4 py-3" value={form.username} onChange={e => setForm(v => ({ ...v, username: e.target.value.toLowerCase() }))} />
                <p className="text-xs text-[#6d6a61]">Seu @usuário é exclusivo. Use 3–40 caracteres: letras minúsculas, números ou _.</p>
                <label htmlFor="profile-bio" className="text-sm font-semibold">Descrição</label>
                <textarea id="profile-bio" rows={3} maxLength={300} className="resize-y rounded-xl border border-[#d8cbb7] bg-white px-4 py-3" placeholder="Conte um pouco sobre você..." value={form.bio} onChange={e => setForm(v => ({ ...v, bio: e.target.value }))} />
                <p className="text-right text-xs text-[#6d6a61]">{form.bio.length}/300</p>
                <button type="submit" disabled={saving} className="inline-flex w-fit items-center gap-2 rounded-full bg-[#28351f] px-6 py-3 font-semibold text-white disabled:opacity-50">
                  <Save size={16} /> {saving ? 'Salvando...' : 'Salvar alterações'}
                </button>
                <p className="text-xs text-[#6d6a61]">A foto é importada da conta Google na criação do perfil. Não exibimos seu e-mail publicamente.</p>
              </form>
            </section>

            <section className="mt-8 rounded-2xl border border-[#ddd3c2] bg-[#faf8f3] p-6 md:p-8">
              <h2 className="font-display text-2xl font-semibold">Histórico de avaliações</h2>
              <p className="mt-2 text-sm text-[#6d6a61]">Avaliações publicadas após entrar com esta conta. Comentários antigos enviados sem login não podem ser vinculados automaticamente.</p>
              {history.length ? (
                <div className="mt-5">
                  {history.map(review => (
                    <article key={review.id} className="border-t border-[#ddd3c2] py-5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <Link to={`/restaurant/${encodeURIComponent(review.restaurant_id)}?city=${encodeURIComponent(review.city)}&state=${encodeURIComponent(review.state)}`} className="font-semibold underline decoration-[#c5b9a7] underline-offset-4">
                          {review.restaurant_name}
                        </Link>
                        <span className="text-xs text-[#6d6a61]">{new Date(review.created_at).toLocaleDateString('pt-BR')} · {review.status === 'approved' ? 'Publicada' : review.status === 'pending' ? 'Em análise' : 'Não aprovada'}</span>
                      </div>
                      <p className="mt-2 flex items-center gap-1 text-sm text-[#604936]"><Star size={15} fill="currentColor" /> {review.rating}/5</p>
                      <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6">{review.comment}</p>
                    </article>
                  ))}
                </div>
              ) : <p className="mt-5 text-sm text-[#6d6a61]">Você ainda não enviou avaliações com esta conta.</p>}
            </section>
          </>
        ) : null}
      </div>
    </main>
  )
}
