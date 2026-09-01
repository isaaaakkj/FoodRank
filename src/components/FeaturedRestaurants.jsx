import RestaurantCard from './RestaurantCard'

const restaurants = [
  {
    id: 1,
    name: 'Bistrô das Montanhas',
    category: 'Brasileira',
    location: 'Capivari, Campos do Jordão',
    rating: '4.8',
    price: '$$$',
    image:
      'https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 2,
    name: 'Vila di Pasta',
    category: 'Italiana',
    location: 'Capivari, Campos do Jordão',
    rating: '4.7',
    price: '$$',
    image:
      'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 3,
    name: 'Kura Sushi',
    category: 'Japonesa',
    location: 'Abernéssia, Campos do Jordão',
    rating: '4.9',
    price: '$$$',
    image:
      'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 4,
    name: 'Manzano Burger',
    category: 'Hambúrguer',
    location: 'Capivari, Campos do Jordão',
    rating: '4.6',
    price: '$$',
    image:
      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=80',
  },
]

export default function FeaturedRestaurants() {
  return (
    <section className="mx-auto max-w-[1440px] py-12">

      {/* Cabeçalho */}
      <div className="mb-7 flex items-end justify-between">

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#a88b54]">
            Seleção FoodRank
          </p>

          <h2 className="mt-1 font-display text-3xl font-semibold text-[#28351f]">
            Restaurantes em destaque
          </h2>

          <p className="mt-2 text-sm text-[#6d6a61]">
            Lugares que estão conquistando quem ama comer bem.
          </p>
        </div>

        <button className="hidden rounded-full border border-[#cfc3b0] px-5 py-2.5 text-sm font-semibold text-[#604936] transition hover:border-[#28351f] hover:text-[#28351f] md:block">
          Ver todos
        </button>

      </div>

      {/* Cards */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {restaurants.map((restaurant) => (
          <RestaurantCard
            key={restaurant.id}
            restaurant={restaurant}
          />
        ))}
      </div>

    </section>
  )
}