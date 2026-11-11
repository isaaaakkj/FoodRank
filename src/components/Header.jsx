import { Link } from 'react-router-dom'
import { Search, Bell, UserRound } from 'lucide-react'

export default function Header({ search, onSearchChange }) {
  return (
    <header className="w-full border-b border-[#ddd3c2]/70 bg-[#f7f3eb]">
      <a href="#main-content" className="skip-link" onClick={event => {
        event.preventDefault()
        document.getElementById('main-content')?.focus()
      }}>Pular para o conteúdo</a>
      <div className="mx-auto flex min-h-[82px] max-w-[1440px] flex-wrap items-center gap-5 px-4 py-4 lg:px-10">

        {/* Logo */}
        <div className="flex min-w-fit items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#28351f] text-[#28351f]">
            <span className="text-2xl">✦</span>
          </div>

          <div>
            <h1 className="font-display text-2xl font-bold leading-none text-[#28351f]">
              FoodRank
            </h1>

            <p className="mt-1 text-[8px] font-semibold uppercase tracking-[0.18em] text-[#6d6a61]">
              Descubra. Experimente. Saboreie.
            </p>
          </div>
        </div>

        {/* Busca */}
        <div className="order-last w-full md:order-none md:max-w-[400px] md:flex-1">
          <div className="flex h-11 items-center gap-3 rounded-full border border-[#d8cbb7] bg-[#faf8f3] px-5 transition focus-within:border-[#28351f]">

            <Search
              size={19}
              strokeWidth={1.7}
              className="text-[#604936]"
            />

            <input
              aria-label="Filtrar restaurantes por nome, cozinha ou localização"
              type="search"
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Filtrar restaurantes, cozinhas ou localização"
              className="w-full bg-transparent text-sm text-[#20231d] outline-none placeholder:text-[#777269]"
            />

          </div>
        </div>

        {/* Navegação */}
        <nav aria-label="Navegação principal" className="ml-auto flex flex-wrap items-center gap-4">
          <Link to="/" className="text-sm font-semibold text-[#28351f]">Explorar</Link>

          <Link to="/timeline" className="text-sm font-medium text-[#20231d] transition hover:text-[#28351f]">Timeline</Link>

          <Link to="/favorites" className="text-sm font-medium text-[#20231d] transition hover:text-[#28351f]">Salvos</Link>
        </nav>

        {/* Ações */}
        <div className="flex items-center gap-5">
          <button
            disabled title="Notificações indisponíveis neste MVP" aria-label="Notificações indisponíveis"
            className="text-[#20231d] transition hover:text-[#28351f]"
          >
            <Bell size={21} strokeWidth={1.7} />
          </button>

          <button
            disabled title="O FoodRank não utiliza contas" aria-label="Perfil indisponível"
            className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-[#d8cbb7] bg-[#e8dfcf]"
          >
            <UserRound size={20} className="text-[#604936]" />
          </button>
        </div>

      </div>
    </header>
  )
}
