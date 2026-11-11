import { supabase } from './supabase'

const publicFields = 'id,restaurant_id,restaurant_name,city,state,author_name,rating,comment,created_at'

export async function getApprovedReviews(limit = 20) {
  if (!supabase) throw new Error('Supabase não configurado.')
  const { data, error } = await supabase
    .from('reviews')
    .select(publicFields)
    .order('created_at', { ascending: false })
    .limit(Math.min(Math.max(limit, 1), 50))
  if (error) throw new Error('Não foi possível carregar as avaliações.')
  return data ?? []
}

export async function submitReview(review, turnstileToken) {
  if (!supabase) throw new Error('Supabase não configurado.')
  const { data, error } = await supabase.functions.invoke('submit-review', {
    body: { ...review, turnstile_token: turnstileToken },
  })
  if (error || !data?.success) throw new Error(data?.error || 'Falha ao enviar avaliação. Tente novamente.')
  return data
}

export async function getRestaurantReviews(restaurantId, city, state) {
  if (!supabase) throw new Error('Supabase não configurado.')
  const { data, error } = await supabase.from('reviews')
    .select(publicFields)
    .eq('restaurant_id', String(restaurantId))
    .eq('city', city)
    .eq('state', state)
    .order('created_at', { ascending: false })
    .limit(30)
  if (error) throw new Error('Não foi possível carregar as avaliações.')
  return data ?? []
}
