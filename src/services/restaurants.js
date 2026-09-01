const OVERPASS_URL = 'https://overpass-api.de/api/interpreter'

export async function getRestaurants() {
  const query = `
    [out:json][timeout:25];
    area["name"="Campos do Jordão"]["boundary"="administrative"]->.searchArea;

    (
      nwr["amenity"="restaurant"](area.searchArea);
      nwr["amenity"="cafe"](area.searchArea);
      nwr["amenity"="fast_food"](area.searchArea);
    );

    out center tags;
  `

  const response = await fetch(
    `${OVERPASS_URL}?data=${encodeURIComponent(query)}`
  )

  if (!response.ok) {
    throw new Error('Não foi possível buscar os restaurantes.')
  }

  const data = await response.json()

  return data.elements
    .filter((place) => place.tags?.name)
    .map((place) => ({
      id: place.id,
      name: place.tags.name,
      category: getCategory(place.tags),
      location: getLocation(place.tags),
      rating: '—',
      price: getPrice(place.tags),
      image: getImage(place.tags),
    }))
}

function getCategory(tags) {
  if (tags.amenity === 'cafe') return 'Café'
  if (tags.amenity === 'fast_food') return 'Fast Food'

  return tags.cuisine
    ? formatCuisine(tags.cuisine)
    : 'Restaurante'
}

function formatCuisine(cuisine) {
    const cuisineMap = {
      brazilian: 'Brasileira',
      brazilian_food: 'Brasileira',
  
      italian: 'Italiana',
      italian_food: 'Italiana',
  
      japanese: 'Japonesa',
      sushi: 'Japonesa',
  
      pizza: 'Pizzaria',
  
      burger: 'Hambúrguer',
      hamburger: 'Hambúrguer',
  
      vegetarian: 'Vegetariana',
      vegan: 'Vegetariana',
  
      steak_house: 'Carnes',
      barbecue: 'Churrascaria',
  
      cafe: 'Café',
      coffee_shop: 'Café',
  
      bakery: 'Padaria',
      bakery_cafe: 'Café',
  
      mexican: 'Mexicana',
      chinese: 'Chinesa',
      french: 'Francesa',
      seafood: 'Frutos do mar',
    }
  
    const cuisines = cuisine
      .toLowerCase()
      .split(';')
      .map((item) => item.trim())
  
    for (const item of cuisines) {
      if (cuisineMap[item]) {
        return cuisineMap[item]
      }
    }
  
    return cuisines[0]
      ? cuisines[0].charAt(0).toUpperCase() + cuisines[0].slice(1)
      : 'Restaurante'
  }

function getLocation(tags) {
  return (
    tags['addr:suburb'] ||
    tags['addr:street'] ||
    'Campos do Jordão, SP'
  )
}

function getPrice(tags) {
  if (tags.price_range) return tags.price_range

  return '$$'
}

function getImage(tags) {
  return (
    tags.image ||
    'https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=900&q=80'
  )
}