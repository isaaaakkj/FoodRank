import { normalize, normalizeState } from '../../supabase/functions/_shared/municipality'

const aliases = {
  pizzaria: 'pizza', cafes: 'cafe', hamburguer: 'burger', brasileira: 'brazilian',
  italiana: 'italian', japonesa: 'japanese', vegetariana: 'vegetarian',
}

export function filterRestaurants(restaurants, { search = '', category = 'Todos', location }) {
  const selected = normalize(category)
  const words = normalize(search).split(' ').filter(Boolean)
  return restaurants.filter(item => {
    const cuisine = normalize(item.category)
    const categoryNames = Object.entries(aliases).filter(([, value]) => cuisine.includes(value)).map(([key]) => key)
    const text = normalize([item.name, item.category, ...categoryNames, item.location, item.city, item.state, normalizeState(item.state)].join(' '))
    return (!location || (normalize(item.city) === normalize(location.city) && normalizeState(item.state) === normalizeState(location.state))) &&
      (selected === 'todos' || cuisine.includes(selected) || cuisine.includes(aliases[selected] ?? selected)) &&
      words.every(word => text.includes(word))
  })
}
