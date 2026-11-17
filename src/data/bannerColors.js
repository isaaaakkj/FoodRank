// Paleta de tons sóbrios para combinar com a foto sem perder a identidade FoodRank.
export const DEFAULT_BANNER_COLOR = '#28351f'

export const BANNER_COLORS = [
  { name: 'Verde FoodRank', value: '#28351f' },
  { name: 'Verde oliva', value: '#42563d' },
  { name: 'Verde sálvia', value: '#566a63' },
  { name: 'Vinho', value: '#5c4540' },
  { name: 'Azul ardósia', value: '#4a5365' },
  { name: 'Marrom café', value: '#7a6054' },
]

export function isBannerColor(value) {
  return BANNER_COLORS.some(color => color.value === value)
}
