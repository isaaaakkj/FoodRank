import { supabase } from './supabase'
import { isBannerColor } from '../data/bannerColors'

export async function getMyProfile(userId) {
  if (!supabase || !userId) return null
  const { data, error } = await supabase.from('profiles')
    .select('id,username,display_name,avatar_url,bio,banner_color')
    .eq('id', userId).single()
  if (error) throw new Error('Não foi possível carregar o perfil. Verifique a migração do banco.')
  return data
}

export async function saveMyProfile(userId, values) {
  if (!supabase || !userId) throw new Error('Entre na sua conta para editar o perfil.')
  const username = String(values.username ?? '').trim().toLowerCase()
  const displayName = String(values.display_name ?? '').trim()
  const bio = String(values.bio ?? '').trim()
  if (!/^[a-z0-9_]{3,15}$/.test(username)) {
    throw new Error('O @usuário deve ter de 3 a 15 caracteres: letras minúsculas, números ou _.')
  }
  if (displayName.length < 2 || displayName.length > 80 || bio.length > 300) {
    throw new Error('Confira o nome (2 a 80 caracteres) e a biografia (até 300).')
  }
  const update = { username, display_name: displayName, bio }
  if (values.banner_color !== undefined) {
    if (!isBannerColor(values.banner_color)) {
      throw new Error('Escolha uma das cores disponíveis para a capa.')
    }
    update.banner_color = values.banner_color
  }
  if (values.avatar_url !== undefined) {
    if (values.avatar_url !== null && (
      typeof values.avatar_url !== 'string' ||
      values.avatar_url.length > 1000 ||
      !values.avatar_url.startsWith('https://')
    )) throw new Error('Endereço da imagem inválido.')
    update.avatar_url = values.avatar_url
  }
  const { data, error } = await supabase.from('profiles')
    .update(update)
    .eq('id', userId)
    .select('id,username,display_name,avatar_url,bio,banner_color')
    .single()
  if (error?.code === '23505') throw new Error('Este @usuário já está em uso. Escolha outro.')
  if (error?.code === '23514') throw new Error('O @usuário precisa ter no máximo 15 caracteres.')
  if (error) throw new Error('Não foi possível salvar o perfil.')
  return data
}

export async function uploadMyAvatar(userId, file) {
  if (!supabase || !userId) throw new Error('Entre na sua conta para alterar a foto.')
  if (!file || !['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    throw new Error('Escolha uma imagem JPG, PNG ou WebP.')
  }
  if (file.size > 2 * 1024 * 1024 || file.size === 0) {
    throw new Error('A foto precisa ter até 2 MB.')
  }

  const extension = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }[file.type]
  const path = `${userId}/${crypto.randomUUID()}.${extension}`
  const bucket = supabase.storage.from('profile-avatars')
  const { error } = await bucket.upload(path, file, { contentType: file.type, upsert: false })
  if (error) throw new Error('Não foi possível enviar a foto. Tente novamente.')

  const { data } = bucket.getPublicUrl(path)
  return { url: data.publicUrl, path }
}

export async function removeUploadedAvatar(path) {
  if (!supabase || !path) return
  await supabase.storage.from('profile-avatars').remove([path])
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

export async function getPublicProfile(username) {
  if (!supabase || !/^[a-z0-9_]{3,15}$/.test(username)) return null
  const { data, error } = await supabase.from('profiles')
    .select('username,display_name,avatar_url,bio,banner_color')
    .eq('username', username)
    .maybeSingle()
  if (error) throw new Error('Não foi possível carregar o perfil público.')
  return data
}
