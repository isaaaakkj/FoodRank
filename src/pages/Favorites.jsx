import { Link } from 'react-router-dom'
import useFavorites from '../hooks/useFavorites'
import RestaurantCard from '../components/RestaurantCard'
export default function Favorites() {
  const { favorites } = useFavorites()
  return <main className="mx-auto max-w-[1440px] px-4 py-8"><Link to="/" className="underline">Voltar para explorar</Link><h1 className="mt-6 font-display text-3xl text-[#28351f]">Restaurantes salvos</h1><p className="my-4">Favoritos armazenados somente neste navegador, sem conta. Limpar os dados do site remove esta lista.</p>{favorites.length ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{favorites.map(item => <RestaurantCard key={JSON.stringify([item.id, item.city, item.state])} restaurant={item} />)}</div> : <p role="status">Você ainda não salvou restaurantes. Use o coração de um cartão para começar.</p>}</main>
}
