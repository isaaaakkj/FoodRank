import { approvedRestaurantPhotos } from '../data/approvedRestaurantPhotos'

// Match stable POI id, city/state and physical location to avoid reusing a
// photo for another branch of the same chain or for a moved business.
export function resolveApprovedRestaurantPhoto(restaurant, approvedPhotos) {
  if (!restaurant || restaurant.id == null) return null
  const latitude = Number(restaurant.latitude)
  const longitude = Number(restaurant.longitude)
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null

  const normalize = (value) => String(value ?? '').normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '').trim().toLowerCase()

  const photo = approvedPhotos.find(item =>
    String(item.id) === String(restaurant.id) &&
    normalize(item.city) === normalize(restaurant.city) &&
    normalize(item.state) === normalize(restaurant.state) &&
    Number.isFinite(Number(item.latitude)) &&
    Number.isFinite(Number(item.longitude)) &&
    Math.abs(Number(item.latitude) - latitude) < 0.0005 &&
    Math.abs(Number(item.longitude) - longitude) < 0.0005
  )

  if (!photo || !['commons', 'authorized'].includes(photo.source)) return null
  const imageUrl = safeImageUrl(photo.imageUrl)
  const sourceUrl = safeImageUrl(photo.sourceUrl)
  const licenseUrl = safeImageUrl(photo.licenseUrl)
  if (!imageUrl || !sourceUrl || !photo.author?.trim() || !photo.license?.trim()) return null
  if (photo.source === 'commons') {
    if (!new URL(sourceUrl).hostname.endsWith('wikimedia.org')) return null
    if (!new URL(imageUrl).hostname.endsWith('wikimedia.org')) return null
    if (!licenseUrl) return null
  } else if (!photo.permissionReference?.trim()) {
    return null
  }

  return { ...photo, imageUrl, sourceUrl, licenseUrl }
}

// Aceita apenas imagens HTTPS. A foto genérica antiga não representa a unidade.
const legacyPlaceholder = 'images.unsplash.com/photo-1515003197210-e0cd71810b5f'
export function safeImageUrl(value) {
  if (typeof value !== 'string' || !value.trim()) return null
  try {
    const url = new URL(value.trim())
    if (url.protocol !== 'https:' || url.href.includes(legacyPlaceholder)) return null
    return url.href
  } catch { return null }
}

export function getApprovedRestaurantPhoto(restaurant) {
  return resolveApprovedRestaurantPhoto(restaurant, approvedRestaurantPhotos)
}
