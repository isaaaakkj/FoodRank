import { useEffect, useState } from 'react'
import { ArrowLeft, Camera, Check, ImagePlus, Save, UserRound, X } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { getMyProfile, saveMyProfile, uploadMyAvatar, removeUploadedAvatar } from '../services/profiles'
import { BANNER_COLORS, DEFAULT_BANNER_COLOR } from '../data/bannerColors'

export default function EditProfile() {
  const { user, loading: authLoading, available } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [form, setForm] = useState({ username: '', display_name: '', bio: '', banner_color: DEFAULT_BANNER_COLOR })
  const [photo, setPhoto] = useState(null)
  const [preview, setPreview] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) return undefined
    let active = true
    getMyProfile(user.id)
      .then(data => {
        if (!active) return
        setProfile(data)
        setForm({
          username: data.username || '',
          display_name: data.display_name || '',
          bio: data.bio || '',
          banner_color: data.banner_color || DEFAULT_BANNER_COLOR,
        })
      })
      .catch(err => { if (active) setError(err.message) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [user])


  function selectPhoto(event) {
    const file = event.target.files?.[0]
    if (!file) return
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      setError('Selecione uma foto JPG, PNG ou WebP.')
      event.target.value = ''
      return
    }
    if (file.size > 2 * 1024 * 1024 || file.size === 0) {
      setError('A foto deve ter até 2 MB.')
      event.target.value = ''
      return
    }
    setError('')
    setPhoto(file)
    const reader = new FileReader()
    reader.onload = () => setPreview(typeof reader.result === 'string' ? reader.result : '')
    reader.readAsDataURL(file)
  }

  async function submit(event) {
    event.preventDefault()
    if (!user || saving) return
    setSaving(true)
    setError('')
    let uploadedPath = null
    try {
      const changes = { ...form }
      if (photo) {
        const uploaded = await uploadMyAvatar(user.id, photo)
        changes.avatar_url = uploaded.url
        uploadedPath = uploaded.path
      }
      await saveMyProfile(user.id, changes)
      window.dispatchEvent(new Event('foodrank:profile-updated'))
      navigate('/profile', { replace: true })
    } catch (err) {
      if (uploadedPath) await removeUploadedAvatar(uploadedPath)
      setError(err.message || 'Não foi possível salvar o perfil.')
    } finally {
      setSaving(false)
    }
  }

  const avatar = preview || profile?.avatar_url || user?.user_metadata?.avatar_url
  const avatarValid = typeof avatar === 'string' && (preview || avatar.startsWith('https://'))

  return (
    <main id="main-content" tabIndex={-1} className="foodrank-profile-edit min-h-screen bg-[#f7f3eb] px-4 py-8 text-[#28351f] md:px-8 md:py-12" style={{ fontFamily: "'Manrope', sans-serif" }}>
      <div className="mx-auto max-w-[880px]">
        <Link to="/profile" className="inline-flex items-center gap-2 text-sm font-semibold text-[#604936] hover:text-[#28351f]"><ArrowLeft size={17}/> Voltar ao perfil</Link>
        <div className="mt-9">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#a88b54]">Seu perfil, suas escolhas</p>
          <h1 className="mt-3 text-4xl md:text-6xl" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>Editar perfil</h1>
          <p className="mt-3 max-w-xl text-sm leading-7 text-[#6d6a61]">Personalize a maneira como você aparece na comunidade FoodRank.</p>
        </div>

        {!available ? (
          <div className="mt-8 rounded-3xl bg-white p-8">O Supabase não está configurado.</div>
        ) : authLoading || (user && loading) ? (
          <p role="status" className="mt-8">Carregando dados...</p>
        ) : !user ? (
          <div className="mt-8 rounded-3xl bg-white p-8">Você precisa entrar na conta para editar seu perfil. <Link to="/profile" className="font-bold underline">Acessar perfil</Link></div>
        ) : profile ? (
          <form onSubmit={submit} className="profile-edit-form mt-8 space-y-6">
            <section className="overflow-hidden rounded-[28px] border border-[#e4dac9] bg-[#fcfaf6] shadow-sm">
              <div className="bg-[#28351f] px-6 py-5 text-white md:px-9">
                <div className="flex items-center gap-3"><Camera size={20} className="text-[#d4b66f]"/><h2 className="text-base font-bold">Sua foto</h2></div>
                <p className="mt-1 text-xs text-[#eee8db]">Escolha uma imagem que represente você.</p>
              </div>
              <div className="flex flex-col items-center gap-6 p-7 sm:flex-row sm:p-9">
                <div className="flex h-32 w-32 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-[#d4b66f] bg-[#e8dfcf] text-[#604936]">
                  {avatarValid ? <img src={avatar} alt="Prévia da foto de perfil" referrerPolicy="no-referrer" className="h-full w-full object-cover"/> : <UserRound size={54}/>}
                </div>
                <div className="min-w-0 flex-1">
                  <label htmlFor="profile-photo" className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#28351f] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#46563c]">
                    <ImagePlus size={17}/> Escolher foto
                  </label>
                  <input id="profile-photo" type="file" accept="image/jpeg,image/png,image/webp" onChange={selectPhoto} className="sr-only" />
                  <p className="mt-3 text-xs leading-6 text-[#777269]">JPG, PNG ou WebP. Até 2 MB. A foto será exibida no perfil.</p>
                  {photo && (
                    <button type="button" onClick={() => { setPhoto(null); setPreview('') }} className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[#6b3434]"><X size={14}/> Descartar nova foto</button>
                  )}
                </div>
              </div>
            </section>

            <section className="overflow-hidden rounded-[28px] border border-[#e4dac9] bg-[#fcfaf6] shadow-sm" aria-labelledby="banner-color-title">
              <div className="p-6 md:p-9">
                <h2 id="banner-color-title" className="text-xl font-bold text-[#28351f]">Cor da capa</h2>
                <p className="mt-2 text-sm leading-6 text-[#777269]">Escolha um tom para combinar com sua foto. A capa fica lisa e sem desenhos.</p>
                <div className="mt-5 overflow-hidden rounded-2xl border border-[#d8cbb7]">
                  <div className="h-24 w-full transition-colors" style={{ backgroundColor: form.banner_color }} aria-label="Prévia da cor da capa" />
                  <div className="flex items-center gap-3 bg-[#fcfaf6] px-5 py-3">
                    <span className="text-sm font-semibold text-[#28351f]">Prévia da capa</span>
                    <span className="ml-auto text-xs text-[#777269]">{BANNER_COLORS.find(color => color.value === form.banner_color)?.name}</span>
                  </div>
                </div>
                <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3" role="group" aria-label="Escolher cor da capa">
                  {BANNER_COLORS.map(color => (
                    <button
                      key={color.value}
                      type="button"
                      aria-label={color.name}
                      aria-pressed={form.banner_color === color.value}
                      onClick={() => setForm(current => ({ ...current, banner_color: color.value }))}
                      className={`flex items-center gap-3 rounded-xl border px-3 py-3 text-left text-xs font-semibold transition ${form.banner_color === color.value ? 'border-[#a88b54] ring-2 ring-[#a88b54]/30' : 'border-[#d8cbb7] hover:border-[#a88b54]'}`}
                    >
                      <span className="h-7 w-7 shrink-0 rounded-full border border-black/10" style={{ backgroundColor: color.value }} />
                      <span className="min-w-0 flex-1 text-[#28351f]">{color.name}</span>
                      {form.banner_color === color.value && <Check size={16} className="shrink-0 text-[#a88b54]" />}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            <section className="rounded-[28px] border border-[#e4dac9] bg-[#fcfaf6] p-6 shadow-sm md:p-9">
              <h2 className="text-xl font-bold">Informações públicas</h2>
              <p className="mt-1 text-xs leading-6 text-[#777269]">As informações abaixo aparecem no seu perfil. Seu e-mail não é exibido.</p>

              <div className="mt-7 space-y-6">
                <div>
                  <label htmlFor="profile-name" className="mb-2 block text-sm font-bold">Nome de exibição</label>
                  <input id="profile-name" required minLength={2} maxLength={80} value={form.display_name} onChange={event => setForm(v => ({...v, display_name: event.target.value}))}
                    className="profile-edit-input w-full rounded-xl border border-[#d8cbb7] bg-white px-4 py-3.5 text-sm text-[#28351f] transition" placeholder="Como você quer ser chamado?" />
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <label htmlFor="profile-username" className="text-sm font-bold">Nome de usuário</label>
                    <span className="text-xs font-medium text-[#777269]">{form.username.length}/15</span>
                  </div>
                  <div className="profile-edit-input flex items-center rounded-xl border border-[#d8cbb7] bg-white px-4 transition">
                    <span className="font-bold text-[#a88b54]">@</span>
                    <input id="profile-username" required minLength={3} maxLength={15} pattern="[a-z0-9_]{3,15}" title="Use 3 a 15 caracteres: letras minúsculas, números e _"
                      value={form.username} onChange={event => setForm(v => ({ ...v, username: event.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 15) }))}
                      className="w-full bg-transparent px-2 py-3.5 text-sm text-[#28351f]" placeholder="seu_usuario" />
                  </div>
                  <p className="mt-2 text-xs leading-6 text-[#777269]">De 3 a 15 caracteres. Apenas letras, números e _. Cada nome de usuário é exclusivo.</p>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <label htmlFor="profile-bio" className="text-sm font-bold">Sobre você</label>
                    <span className="text-xs font-medium text-[#777269]">{form.bio.length}/300</span>
                  </div>
                  <textarea id="profile-bio" rows={4} maxLength={300} value={form.bio} onChange={event => setForm(v => ({ ...v, bio: event.target.value }))}
                    className="profile-edit-input w-full resize-y rounded-xl border border-[#d8cbb7] bg-white px-4 py-3.5 text-sm text-[#28351f] transition" placeholder="Suas comidas favoritas, histórias e descobertas..." />
                </div>
              </div>
            </section>

            {error && <p role="alert" className="rounded-xl border border-[#c9aaaa] bg-[#f3e5e1] p-4 text-sm font-semibold text-[#6b3434]">{error}</p>}
            <div className="flex flex-wrap items-center justify-end gap-3 pb-10">
              <Link to="/profile" className="rounded-full border border-[#d8cbb7] px-6 py-3 text-sm font-bold text-[#604936]">Cancelar</Link>
              <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-full bg-[#28351f] px-7 py-3 text-sm font-bold text-white transition hover:bg-[#46563c] disabled:opacity-50">
                {saving ? <Check size={17}/> : <Save size={17}/>} {saving ? 'Salvando...' : 'Salvar alterações'}
              </button>
            </div>
          </form>
        ) : (
          <p role="status" className="mt-8">Não foi possível carregar as informações do perfil.</p>
        )}
      </div>
    </main>
  )
}
