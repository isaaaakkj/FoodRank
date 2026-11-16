const categoryLabels = {
  restaurant: 'restaurante',
  burger: 'hamburgueria',
  pizza: 'pizzaria',
  cafe: 'cafeteria',
  japanese: 'culinária japonesa',
  brazilian: 'culinária brasileira',
  vegetarian: 'culinária vegetariana',
  barbecue: 'churrascaria',
  bakery: 'padaria',
  seafood: 'frutos do mar',
  fastfood: 'alimentação rápida',
  mexican: 'culinária mexicana',
  chinese: 'culinária chinesa',
  french: 'culinária francesa',
  italian: 'culinária italiana',
}

export function getCategoryImageKey(category) {
  const text = String(category ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()

  if (/hamburg|burger/.test(text)) return 'burger'
  if (/pizz/.test(text)) return 'pizza'
  if (/cafe|coffee/.test(text)) return 'cafe'
  if (/japone|sushi/.test(text)) return 'japanese'
  if (/brasileir|brazilian/.test(text)) return 'brazilian'
  if (/vegetarian|vegan/.test(text)) return 'vegetarian'
  if (/churrasc|carnes|steak|barbecue/.test(text)) return 'barbecue'
  if (/padaria|bakery/.test(text)) return 'bakery'
  if (/frutos do mar|seafood/.test(text)) return 'seafood'
  if (/fast.food|lanche rapido/.test(text)) return 'fastfood'
  if (/mexican/.test(text)) return 'mexican'
  if (/chines|chinese/.test(text)) return 'chinese'
  if (/frances|french/.test(text)) return 'french'
  if (/italian/.test(text)) return 'italian'
  return 'restaurant'
}

export function getCategoryImage(category) {
  const key = getCategoryImageKey(category)
  return {
    key,
    url: `${import.meta.env.BASE_URL}category-images/${key}.jpg`,
    fallbackUrl: `${import.meta.env.BASE_URL}category-images/restaurant.jpg`,
    alt: `Imagem ilustrativa de ${categoryLabels[key]}`,
  }
}
