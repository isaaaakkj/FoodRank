import { useMemo } from 'react'
import RestaurantCard from './RestaurantCard'
import useRestaurants from '../hooks/useRestaurants'

export default function FeaturedRestaurants({ filters }) {
  const { restaurants, loading, error } = useRestaurants()

  const filteredRestaurants = useMemo(() => {
    const searchText = filters.search.trim().toLowerCase()

    return restaurants.filter((restaurant) => {
      const name = restaurant.name?.toLowerCase() || ''
      const category = restaurant.category?.toLowerCase() || ''
      const location = restaurant.location?.toLowerCase() || ''

      // Pesquisa por nome, categoria ou localização
      const matchesSearch =
        searchText === '' ||
        name.includes(searchText) ||
        category.includes(searchText) ||
        location.includes(searchText)

      // Filtro por categoria
      let matchesCategory = true

      if (filters.category !== 'Todos') {
        const selected = filters.category.toLowerCase()

        matchesCategory =
          category.includes(selected) ||
          (selected === 'pizzaria' && category.includes('pizza')) ||
          (selected === 'cafés' && category.includes('cafe')) ||
          (selected === 'hambúrguer' && category.includes('burger')) ||
          (selected === 'brasileira' && category.includes('brazilian')) ||
          (selected === 'italiana' && category.includes('italian')) ||
          (selected === 'japonesa' && category.includes('japanese')) ||
          (selected === 'vegetariana' && category.includes('vegetarian'))
      }

      return matchesSearch && matchesCategory
    })
  }, [restaurants, filters.search, filters.category])

  const featured = filteredRestaurants.slice(0, 8)

  return (
    <section className="mx-auto max-w-[1440px] py-12">

      <div className="mb-7 flex items-end justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#a88b54]">
            Seleção FoodRank
          </p>

          <h2 className="mt-1 font-display text-3xl font-semibold text-[#28351f]">
            Restaurantes em destaque
          </h2>

          <p className="mt-2 text-sm text-[#6d6a61]">
            {filters.search
              ? `Resultados para "${filters.search}"`
              : filters.category !== 'Todos'
                ? `Restaurantes de culinária ${filters.category.toLowerCase()}`
                : 'Lugares encontrados em Campos do Jordão.'}
          </p>
        </div>
      </div>

      {/* Carregando */}
      {loading && (
        <div className="rounded-2xl border border-[#ddd3c2] bg-[#faf8f3] p-10 text-center">
          <p className="text-sm text-[#6d6a61]">
            Procurando restaurantes...
          </p>
        </div>
      )}

      {/* Erro */}
      {error && (
        <div className="rounded-2xl border border-[#c9aaaa] bg-[#f3e5e1] p-10 text-center">
          <p className="font-semibold text-[#6b3434]">
            Não foi possível carregar os restaurantes.
          </p>

          <p className="mt-2 text-sm text-[#6d6a61]">
            Tente atualizar a página.
          </p>
        </div>
      )}

      {/* Nenhum resultado */}
      {!loading && !error && featured.length === 0 && (
        <div className="rounded-2xl border border-[#ddd3c2] bg-[#faf8f3] p-10 text-center">
          <p className="font-display text-xl text-[#28351f]">
            Nenhum restaurante encontrado
          </p>

          <p className="mt-2 text-sm text-[#6d6a61]">
            Tente outra busca ou escolha outra categoria.
          </p>
        </div>
      )}

      {/* Resultados */}
      {!loading && !error && featured.length > 0 && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((restaurant) => (
            <RestaurantCard
              key={restaurant.id}
              restaurant={restaurant}
            />
          ))}
        </div>
      )}

    </section>
  )
}