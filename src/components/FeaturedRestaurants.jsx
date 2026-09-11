import { useMemo, useState, useEffect } from 'react'
import RestaurantCard from './RestaurantCard'
import useRestaurants from '../hooks/useRestaurants'

export default function FeaturedRestaurants({ filters }) {
  const { restaurants, loading, error } = useRestaurants(
    filters.location.city,
    filters.location.state
  )

  const [visibleCount, setVisibleCount] = useState(8)

  useEffect(() => {
    setVisibleCount(8)
  }, [
    filters.location.city,
    filters.location.state,
    filters.search,
    filters.category,
  ])

  const filteredRestaurants = useMemo(() => {
    const searchText = filters.search.trim().toLowerCase()

    return restaurants.filter((restaurant) => {
      const name = restaurant.name?.toLowerCase() || ''
      const category = restaurant.category?.toLowerCase() || ''
      const location = restaurant.location?.toLowerCase() || ''

      const matchesSearch =
        searchText === '' ||
        name.includes(searchText) ||
        category.includes(searchText) ||
        location.includes(searchText)

      let matchesCategory = true

      if (filters.category !== 'Todos') {
        const selected = filters.category
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')

        const normalizedCategory = category
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')

        matchesCategory =
          normalizedCategory.includes(selected) ||
          (selected === 'pizzaria' &&
            normalizedCategory.includes('pizza')) ||
          (selected === 'cafes' &&
            normalizedCategory.includes('cafe')) ||
          (selected === 'hamburguer' &&
            normalizedCategory.includes('burger')) ||
          (selected === 'brasileira' &&
            normalizedCategory.includes('brazilian')) ||
          (selected === 'italiana' &&
            normalizedCategory.includes('italian')) ||
          (selected === 'japonesa' &&
            normalizedCategory.includes('japanese')) ||
          (selected === 'vegetariana' &&
            normalizedCategory.includes('vegetarian'))
      }

      return matchesSearch && matchesCategory
    })
  }, [
    restaurants,
    filters.search,
    filters.category,
  ])

  const visibleRestaurants = filteredRestaurants.slice(
    0,
    visibleCount
  )

  const hasMore =
    visibleCount < filteredRestaurants.length

  return (
    <section className="mx-auto max-w-[1440px] py-12">

      <div className="mb-7 flex items-end justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#a88b54]">
            FoodRank
          </p>

          <h2 className="mt-1 font-display text-3xl font-semibold text-[#28351f]">
            {filters.search
              ? 'Resultados da busca'
              : `Restaurantes em ${filters.location.city}`}
          </h2>

          <p className="mt-2 text-sm text-[#6d6a61]">
            {filters.search
              ? `Encontramos ${filteredRestaurants.length} restaurante${
                  filteredRestaurants.length === 1 ? '' : 's'
                } para sua busca.`
              : `Explore restaurantes encontrados em ${filters.location.city}, ${filters.location.state}.`}
          </p>
        </div>

        {!loading && !error && restaurants.length > 0 && (
          <span className="hidden rounded-full bg-[#eee7d9] px-4 py-2 text-xs font-semibold text-[#604936] sm:block">
            {filteredRestaurants.length} resultado
            {filteredRestaurants.length === 1 ? '' : 's'}
          </span>
        )}
      </div>

      {loading && (
        <div className="rounded-2xl border border-[#ddd3c2] bg-[#faf8f3] p-10 text-center">
          <p className="text-sm text-[#6d6a61]">
            Procurando restaurantes...
          </p>
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-[#c9aaaa] bg-[#f3e5e1] p-10 text-center">
          <p className="font-semibold text-[#6b3434]">
            Não foi possível carregar os restaurantes.
          </p>

          <p className="mt-2 text-sm text-[#6d6a61]">
            {error}
          </p>
        </div>
      )}

      {!loading &&
        !error &&
        filteredRestaurants.length === 0 && (
          <div className="rounded-2xl border border-[#ddd3c2] bg-[#faf8f3] p-10 text-center">
            <p className="font-display text-xl text-[#28351f]">
              Nenhum restaurante encontrado
            </p>

            <p className="mt-2 text-sm text-[#6d6a61]">
              Tente outra busca ou escolha outra categoria.
            </p>
          </div>
        )}

      {!loading &&
        !error &&
        visibleRestaurants.length > 0 && (
          <>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {visibleRestaurants.map((restaurant) => (
                <RestaurantCard
                  key={restaurant.id}
                  restaurant={restaurant}
                />
              ))}
            </div>

            {hasMore && (
              <div className="mt-10 flex justify-center">
                <button
                  onClick={() =>
                    setVisibleCount((current) => current + 8)
                  }
                  className="rounded-full border border-[#28351f] bg-[#28351f] px-7 py-3 text-sm font-semibold text-[#f7f3eb] transition hover:bg-[#4b5b3d]"
                >
                  Ver mais restaurantes
                </button>
              </div>
            )}

            {!hasMore && filteredRestaurants.length > 8 && (
              <p className="mt-8 text-center text-sm text-[#6d6a61]">
                Você chegou ao fim dos resultados.
              </p>
            )}
          </>
        )}

    </section>
  )
}