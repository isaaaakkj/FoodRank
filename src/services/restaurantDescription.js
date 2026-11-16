// A descrição apresenta apenas informações fornecidas pela fonte de restaurantes.
// Não inventar cardápios, preços, história, serviços ou avaliações.
const categoryDescriptions = {
  'café': 'Cafeteria',
  'pizzaria': 'Pizzaria',
  'pizza': 'Pizzaria',
  'hambúrguer': 'Hamburgueria',
  'hamburguer': 'Hamburgueria',
  'fast food': 'Estabelecimento de alimentação rápida',
  'padaria': 'Padaria',
  'churrascaria': 'Churrascaria',
  'carnes': 'Restaurante especializado em carnes',
  'frutos do mar': 'Restaurante de frutos do mar',
  'restaurante': 'Restaurante',
}

function clean(value) {
  return typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : ''
}

export function getRestaurantDescription(restaurant) {
  const explicit = clean(restaurant?.description)
  if (explicit) return explicit

  const category = clean(restaurant?.category)
  const place = clean(restaurant?.location) || [clean(restaurant?.city), clean(restaurant?.state)].filter(Boolean).join(', ')
  const label = categoryDescriptions[category.toLocaleLowerCase('pt-BR')] ||
    (category ? `Restaurante de culinária ${category.toLocaleLowerCase('pt-BR')}` : 'Restaurante')

  const locationSentence = place ? ` em ${place}` : ''
  return `${label}${locationSentence}. Consulte a localização no mapa e as avaliações dos visitantes para conhecer melhor esta unidade.`
}
