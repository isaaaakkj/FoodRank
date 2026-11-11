import { safeImageUrl, fallbackImage } from '../services/images'
import FavoriteButton from '../components/FavoriteButton'
import { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft, MapPin, Star } from 'lucide-react'

import RestaurantMap from '../components/RestaurantMap'
import { getRestaurants } from '../services/restaurants'

export default function Restaurant() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const city = searchParams.get('city')
  const state = searchParams.get('state')

  const [restaurant, setRestaurant] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function loadRestaurant() {
      try {
        setLoading(true)
        setError(false)
        setRestaurant(null)

        if (!city || !state) {
          throw new Error('Cidade e estado não informados.')
        }

        const restaurants = await getRestaurants(city, state)

        if (cancelled) return

        const foundRestaurant = restaurants.find(
          (item) => String(item.id) === String(id)
        )

        setRestaurant(foundRestaurant || null)

      } catch {
        if (!cancelled) {
          setError(true)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadRestaurant()

    return () => {
      cancelled = true
    }
  }, [id, city, state])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f3eb]">
        <p className="text-sm text-[#6d6a61]">
          Carregando restaurante...
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#f7f3eb] px-6 text-center">
        <h1 className="font-display text-3xl font-semibold text-[#28351f]">
          Não foi possível carregar
        </h1>

        <p className="mt-2 text-sm text-[#6d6a61]">
          Não conseguimos recuperar os dados deste restaurante.
        </p>

        <button
          onClick={() => navigate('/')}
          className="mt-6 rounded-full bg-[#28351f] px-6 py-3 text-sm font-semibold text-[#f7f3eb]"
        >
          Voltar para explorar
        </button>
      </div>
    )
  }

  if (!restaurant) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#f7f3eb] px-6 text-center">
        <h1 className="font-display text-3xl font-semibold text-[#28351f]">
          Restaurante não encontrado
        </h1>

        <p className="mt-2 text-sm text-[#6d6a61]">
          Não conseguimos encontrar esse restaurante.
        </p>

        <button
          onClick={() => navigate('/')}
          className="mt-6 rounded-full bg-[#28351f] px-6 py-3 text-sm font-semibold text-[#f7f3eb]"
        >
          Voltar para explorar
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f7f3eb]">

      <header className="border-b border-[#ddd3c2] bg-[#f7f3eb]">
        <div className="mx-auto flex h-[82px] max-w-[1440px] items-center px-6 lg:px-10">

          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-sm font-semibold text-[#604936] transition hover:text-[#28351f]"
          >
            <ArrowLeft size={18} />
            Voltar
          </button>

          <div className="ml-auto font-display text-2xl font-bold text-[#28351f]">
            FoodRank
          </div>

        </div>
      </header>

      <main className="mx-auto max-w-[1200px] px-4 py-8 lg:px-6">

        <div className="relative h-[320px] overflow-hidden rounded-2xl md:h-[440px]">

          <img
            src={safeImageUrl(restaurant.image)} loading="lazy" referrerPolicy="no-referrer" onError={event => { event.currentTarget.onerror = null; event.currentTarget.src = fallbackImage }}
            alt={restaurant.name}
            className="h-full w-full object-cover"
          />

        <FavoriteButton restaurant={restaurant} />

        </div>

        <section className="py-8">

          <div className="flex flex-col justify-between gap-5 md:flex-row">

            <div>

              <span className="rounded-full bg-[#eee7d9] px-3 py-1.5 text-xs font-semibold text-[#604936]">
                {restaurant.category}
              </span>

              <h1 className="mt-3 font-display text-4xl font-semibold text-[#28351f] md:text-5xl">
                {restaurant.name}
              </h1>

              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-[#6d6a61]">

                <span className="flex items-center gap-1.5">
                  <MapPin size={16} className="text-[#604936]" />
                  {restaurant.location}
                </span>

                <span className="text-[#c5b9a7]">•</span>

                <span>{restaurant.price}</span>

              </div>

            </div>

            <div className="flex h-fit items-center gap-2 rounded-xl border border-[#ddd3c2] bg-[#faf8f3] px-5 py-3">

              <Star
                size={21}
                fill="currentColor"
                className="text-[#a88b54]"
              />

              <div>
                <strong className="text-lg text-[#604936]">
                  {restaurant.rating ?? '—'}
                </strong>

                <p className="text-xs text-[#6d6a61]">
                  Avaliações
                </p>
              </div>

            </div>

          </div>

        </section>

        <div className="grid gap-8 lg:grid-cols-[1.4fr_0.8fr]">

          <section className="rounded-2xl border border-[#ddd3c2] bg-[#faf8f3] p-6 md:p-8">

            <h2 className="font-display text-2xl font-semibold text-[#28351f]">
              Sobre o restaurante
            </h2>

            <p className="mt-4 leading-7 text-[#6d6a61]">
              Conheça este restaurante em {restaurant.city} e descubra
              uma nova experiência gastronômica.
            </p>

          </section>

          <section className="overflow-hidden rounded-2xl border border-[#ddd3c2] bg-[#faf8f3]">

            {restaurant.latitude != null && restaurant.longitude != null ? (
              <RestaurantMap
                latitude={restaurant.latitude}
                longitude={restaurant.longitude}
                name={restaurant.name}
              />
            ) : (
              <div className="flex h-[320px] items-center justify-center bg-[#eee7d9]">
                <div className="text-center">
                  <MapPin
                    size={38}
                    className="mx-auto text-[#604936]"
                  />

                  <h3 className="mt-3 font-display text-xl font-semibold text-[#28351f]">
                    Localização
                  </h3>

                  <p className="mt-1 text-sm text-[#6d6a61]">
                    Localização não disponível
                  </p>
                </div>
              </div>
            )}

          </section>

        </div>

      </main>

    </div>
  )
}