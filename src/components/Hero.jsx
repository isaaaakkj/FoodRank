import {
    MapPin,
    CalendarDays,
    Users,
    ChevronDown,
    Search,
  } from 'lucide-react'
  
  export default function Hero() {
    return (
      <section className="relative mx-auto mt-5 max-w-[1440px] overflow-hidden rounded-2xl bg-[#28351f] px-6 py-20 lg:px-10">
  
        {/* Textura/iluminação do fundo */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_30%,rgba(168,139,84,0.18),transparent_35%),linear-gradient(110deg,#172014,#28351f_55%,#463626)]" />
  
        {/* Conteúdo */}
        <div className="relative z-10 max-w-3xl">
  
          <p className="mb-3 font-display text-lg italic text-[#d4b66f]">
            Descubra os melhores restaurantes em
          </p>
  
          <h2 className="font-display text-5xl font-semibold leading-[1.05] text-[#faf7ef] md:text-6xl">
            Campos do Jordão, SP
          </h2>
  
          <p className="mt-5 max-w-xl text-base text-[#eee8db] md:text-lg">
            Explore lugares incríveis, sabores únicos e experiências memoráveis.
          </p>
  
          {/* Barra de busca */}
          <div className="mt-8 grid gap-3 lg:grid-cols-[1.35fr_1fr_0.9fr_auto]">
  
            {/* Localização */}
            <button className="flex h-14 items-center gap-3 rounded-xl bg-[#faf8f3] px-5 text-left">
              <MapPin size={20} className="text-[#604936]" />
  
              <div className="flex-1">
                <span className="block text-xs text-[#777269]">
                  Localização
                </span>
  
                <span className="text-sm font-medium text-[#20231d]">
                  Campos do Jordão, SP
                </span>
              </div>
  
              <ChevronDown size={17} className="text-[#604936]" />
            </button>
  
            {/* Data */}
            <button className="flex h-14 items-center gap-3 rounded-xl bg-[#faf8f3] px-5 text-left">
              <CalendarDays size={20} className="text-[#604936]" />
  
              <div className="flex-1">
                <span className="block text-xs text-[#777269]">
                  Quando?
                </span>
  
                <span className="text-sm font-medium text-[#20231d]">
                  Escolha uma data
                </span>
              </div>
            </button>
  
            {/* Pessoas */}
            <button className="flex h-14 items-center gap-3 rounded-xl bg-[#faf8f3] px-5 text-left">
              <Users size={20} className="text-[#604936]" />
  
              <div className="flex-1">
                <span className="block text-xs text-[#777269]">
                  Pessoas
                </span>
  
                <span className="text-sm font-medium text-[#20231d]">
                  2 pessoas
                </span>
              </div>
  
              <ChevronDown size={17} className="text-[#604936]" />
            </button>
  
            {/* Botão */}
            <button className="flex h-14 items-center justify-center gap-2 rounded-xl bg-[#d4b66f] px-7 font-semibold text-[#28351f] transition hover:bg-[#e1c889]">
              <Search size={18} />
              Buscar
            </button>
  
          </div>
        </div>
      </section>
    )
  }