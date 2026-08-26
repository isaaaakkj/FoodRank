import { Search, Bell, UserRound } from 'lucide-react'

export default function Header() {
  return (
    <header className="w-full border-b border-[#ddd3c2]/70 bg-[#f7f3eb]">
      <div className="mx-auto flex h-[82px] max-w-[1440px] items-center gap-8 px-6 lg:px-10">

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
        <div className="hidden max-w-[500px] flex-1 md:block">
          <div className="flex h-11 items-center gap-3 rounded-full border border-[#d8cbb7] bg-[#faf8f3] px-5 transition focus-within:border-[#28351f]">
            <Search size={19} strokeWidth={1.7} className="text-[#604936]" />

            <input
              type="text"
              placeholder="Buscar restaurantes, cozinhas ou pratos"
              className="w-full bg-transparent text-sm text-[#20231d] outline-none placeholder:text-[#777269]"
            />
          </div>
        </div>

        {/* Navegação */}
        <nav className="ml-auto hidden items-center gap-8 md:flex">
          <button className="text-sm font-medium text-[#20231d] transition hover:text-[#28351f]">
            Explorar
          </button>

          <button className="relative text-sm font-semibold text-[#28351f]">
            Timeline
            <span className="absolute -bottom-[29px] left-0 h-[2px] w-full bg-[#28351f]" />
          </button>

          <button className="text-sm font-medium text-[#20231d] transition hover:text-[#28351f]">
            Salvos
          </button>
        </nav>

        {/* Ações */}
        <div className="flex items-center gap-5">
          <button
            aria-label="Notificações"
            className="text-[#20231d] transition hover:text-[#28351f]"
          >
            <Bell size={21} strokeWidth={1.7} />
          </button>

          <button
            aria-label="Perfil"
            className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-[#d8cbb7] bg-[#e8dfcf]"
          >
            <UserRound size={20} className="text-[#604936]" />
          </button>
        </div>

      </div>
    </header>
  )
}