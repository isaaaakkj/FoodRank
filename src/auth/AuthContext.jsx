import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../services/supabase'

const AuthContext = createContext(null)
const siteUrl = () => new URL(import.meta.env.BASE_URL, window.location.origin).href

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(Boolean(supabase))
  const [error, setError] = useState('')

  useEffect(() => {
    if (!supabase) return undefined
    let active = true
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, next) => {
      if (active) {
        setSession(next)
        setLoading(false)
      }
    })
    supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (!active) return
      if (sessionError) setError('Não foi possível recuperar sua sessão.')
      setSession(data.session)
      setLoading(false)
    })
    return () => { active = false; subscription.unsubscribe() }
  }, [])

  async function signIn() {
    if (!supabase) throw new Error('Supabase não configurado.')
    setError('')
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: siteUrl() },
    })
    if (oauthError) {
      setError('Não foi possível iniciar o acesso com Google.')
      throw oauthError
    }
  }

  async function signOut() {
    if (!supabase) return
    const { error: signOutError } = await supabase.auth.signOut()
    if (signOutError) throw signOutError
  }

  const value = {
    user: session?.user ?? null,
    session, loading, error, signIn, signOut, available: Boolean(supabase),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth requer AuthProvider')
  return context
}
