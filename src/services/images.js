import fallbackImage from '../assets/images/hero.png'
export { fallbackImage }
export function safeImageUrl(value) {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' ? url.href : fallbackImage
  } catch { return fallbackImage }
}
