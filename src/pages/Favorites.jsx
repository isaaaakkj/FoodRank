import { Link } from 'react-router-dom'
import useFavorites from '../hooks/useFavorites'
import RestaurantCard from '../components/RestaurantCard'

export default function Favorites() {
  const { favorites, loggedIn, loading, error, retry } = useFavorites()

  return <main id="main-content" tabIndex={-1} className="mx-auto max-w-[1440px] px-4 py-8">
    <Link to="/" className="underline">Voltar para explorar</Link>
    <h1 className="mt-6 font-display text-3xl text-[#28351f]">Restaurantes salvos</h1>
    {!loggedIn ? (
      <div className="my-5 rounded-xl border border-[#ddd3c2] bg-[#faf8f3] p-6">
        <p>Entre com Google para salvar restaurantes na sua conta e acessar os favoritos em outros dispositivos.</p>
        <p className="mt-2 text-sm text-[#604936]">Se você já tinha favoritos neste navegador, tentaremos importá-los quando entrar.</p>
        <Link to="/profile" className="mt-4 inline-block rounded-full bg-[#28351f] px-5 py-3 text-sm font-semibold text-white">Entrar com Google</Link>
      </div>
    ) : loading ? (
      <p role="status" className="my-5">Sincronizando favoritos...</p>
    ) : error ? (
      <div role="alert" className="my-5 rounded-xl border border-[#ddd3c2] bg-[#faf8f3] p-5">
        <p>{error}</p>
        <button type="button" onClick={retry} className="mt-3 font-semibold underline">Tentar novamente</button>
      </div>
    ) : (
      <>
        <p className="my-4 text-sm text-[#604936]">Favoritos vinculados à sua conta Google, disponíveis ao entrar em outros dispositivos.</p>
        {favorites.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {favorites.map(item => <RestaurantCard key={JSON.stringify([item.id, item.city, item.state])} restaurant={item} />)}
          </div>
        ) : <p role="status">Você ainda não salvou restaurantes. Use o coração de um cartão para começar.</p>}
      </>
    )}
  </main>
}
