const cuisineNames = {
  brazilian: 'Brasileira', brazilian_food: 'Brasileira', italian: 'Italiana', italian_food: 'Italiana',
  japanese: 'Japonesa', sushi: 'Japonesa', pizza: 'Pizzaria', burger: 'Hambúrguer', hamburger: 'Hambúrguer',
  vegetarian: 'Vegetariana', vegan: 'Vegetariana', steak_house: 'Carnes', barbecue: 'Churrascaria',
  mexican: 'Mexicana', chinese: 'Chinesa', french: 'Francesa', seafood: 'Frutos do mar',
}

export function restaurantCategory(properties) {
  const raw = properties.datasource?.raw ?? {}
  const categories = properties.categories ?? []
  if (raw.amenity === 'cafe' || categories.includes('catering.cafe')) return 'Café'
  const cuisines = String(properties.catering?.cuisine ?? raw.cuisine ?? '').toLowerCase().split(';').map(value => value.trim())
  for (const cuisine of cuisines) if (cuisineNames[cuisine]) return cuisineNames[cuisine]
  if (raw.amenity === 'fast_food' || categories.some(value => value.includes('fast_food'))) return 'Fast Food'
  return 'Restaurante'
}
