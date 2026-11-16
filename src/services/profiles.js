import { supabase } from './supabase'

export async function getMyProfile(userId) {
  if (!supabase || !userId) return null
  const { data, error } = await supabase.from('profiles')
    .select('id,username,display_name,avatar_url,bio')
    .eq('id', userId).single()
  if (error) throw new Error('Não foi possível carregar o perfil. Verifique a migração do banco.')
  return data
}

export async function saveMyProfile(userId, values) {
  if (!supabase || !userId) throw new Error('Entre na sua conta para editar o perfil.')
  const username = String(values.username ?? '').trim().toLowerCase()
  const displayName = String(values.display_name ?? '').trim()
  const bio = String(values.bio ?? '').trim()
  if (!/^[a-z0-9_]{3,40}$/.test(username)) throw new Error('O usuário deve ter entre 3 e 40 caracteres: letras minúsculas, números ou _.')
  if (displayName.length < 2 || displayName.length > 80 || bio.length > 300) throw new Error('Confira o nome e a descrição (até 300 caracteres).')
  const { data, error } = await supabase.from('profiles')
    .update({ username, display_name: displayName, bio })
    .eq('id', userId)
    .select('id,username,display_name,avatar_url,bio')
    .single()
  if (error?.code === '23505') throw new Error('Este @usuário já está em uso. Escolha outro.')
  if (error) throw new Error('Não foi possível salvar o perfil.')
  return data
}

export async function getMyReviewHistory(userId) {
  if (!supabase || !userId) return []
  const { data, error } = await supabase.from('reviews')
    .select('id,restaurant_id,restaurant_name,city,state,author_name,rating,comment,created_at,status')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(100)
  if (error) throw new Error('Não foi possível carregar o histórico.')
  return data ?? []
}
