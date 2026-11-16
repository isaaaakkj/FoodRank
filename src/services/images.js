// Aceita somente endereços HTTPS informados para o estabelecimento.
// A antiga fotografia genérica não representa o restaurante e não deve aparecer como foto real.
const legacyPlaceholder = 'images.unsplash.com/photo-1515003197210-e0cd71810b5f'

export function safeImageUrl(value) {
  if (typeof value !== 'string' || !value.trim()) return null
  try {
    const url = new URL(value.trim())
    if (url.protocol !== 'https:' || url.hostname === '' || url.href.includes(legacyPlaceholder)) return null
    return url.href
  } catch {
    return null
  }
}
