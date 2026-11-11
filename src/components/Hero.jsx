import { useState } from 'react'
import { MapPin, Search, ChevronDown } from 'lucide-react'

const states = [
  { uf: 'AC', name: 'Acre' },
  { uf: 'AL', name: 'Alagoas' },
  { uf: 'AP', name: 'Amapá' },
  { uf: 'AM', name: 'Amazonas' },
  { uf: 'BA', name: 'Bahia' },
  { uf: 'CE', name: 'Ceará' },
  { uf: 'DF', name: 'Distrito Federal' },
  { uf: 'ES', name: 'Espírito Santo' },
  { uf: 'GO', name: 'Goiás' },
  { uf: 'MA', name: 'Maranhão' },
  { uf: 'MT', name: 'Mato Grosso' },
  { uf: 'MS', name: 'Mato Grosso do Sul' },
  { uf: 'MG', name: 'Minas Gerais' },
  { uf: 'PA', name: 'Pará' },
  { uf: 'PB', name: 'Paraíba' },
  { uf: 'PR', name: 'Paraná' },
  { uf: 'PE', name: 'Pernambuco' },
  { uf: 'PI', name: 'Piauí' },
  { uf: 'RJ', name: 'Rio de Janeiro' },
  { uf: 'RN', name: 'Rio Grande do Norte' },
  { uf: 'RS', name: 'Rio Grande do Sul' },
  { uf: 'RO', name: 'Rondônia' },
  { uf: 'RR', name: 'Roraima' },
  { uf: 'SC', name: 'Santa Catarina' },
  { uf: 'SP', name: 'São Paulo' },
  { uf: 'SE', name: 'Sergipe' },
  { uf: 'TO', name: 'Tocantins' },
]

export default function Hero({ onLocationSearch, onLocationChange }) {
  const [selectedState, setSelectedState] = useState('')
  const [city, setCity] = useState('')

  function handleSearch(event) {
    event.preventDefault()
    if (!selectedState || !city.trim()) {
      return
    }

    onLocationSearch({
      state: selectedState,
      city: city.trim(),
    })
  }

  return (
    <section className="relative mx-auto mt-5 max-w-[1440px] overflow-hidden rounded-2xl bg-[#28351f] px-6 py-20 lg:px-10">

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_30%,rgba(168,139,84,0.18),transparent_35%),linear-gradient(110deg,#172014,#28351f_55%,#463626)]" />

      <div className="relative z-10 max-w-4xl">

        <p className="mb-3 font-display text-lg italic text-[#d4b66f]">
          Descubra os melhores restaurantes
        </p>

        <h2 className="font-display text-5xl font-semibold leading-[1.05] text-[#faf7ef] md:text-6xl">
          Encontre seu próximo sabor
        </h2>

        <p className="mt-5 max-w-xl text-base text-[#eee8db] md:text-lg">
          Explore restaurantes, sabores únicos e experiências gastronômicas
          incríveis em todo o Brasil.
        </p>

        <form onSubmit={handleSearch} className="mt-8 grid gap-3 md:grid-cols-[1fr_1fr_auto]">

          {/* ESTADO */}
          <div className="flex h-14 items-center gap-3 rounded-xl bg-[#faf8f3] px-5">

            <MapPin
              size={20}
              className="shrink-0 text-[#604936]"
            />

            <div className="min-w-0 flex-1">

              <label htmlFor="state" className="block text-xs text-[#777269]">Estado</label>

              <select id="state" required
                value={selectedState}
                onChange={(event) => {
                  setSelectedState(event.target.value)
                  setCity('')
                  onLocationChange()
                }}
                className="w-full cursor-pointer appearance-none bg-transparent text-sm font-medium text-[#20231d] outline-none"
              >
                <option value="">
                  Escolha um estado
                </option>

                {states.map((state) => (
                  <option
                    key={state.uf}
                    value={state.name}
                  >
                    {state.name}
                  </option>
                ))}
              </select>

            </div>

            <ChevronDown
              size={17}
              className="shrink-0 text-[#604936]"
            />

          </div>

          {/* CIDADE */}
          <div className="flex h-14 items-center gap-3 rounded-xl bg-[#faf8f3] px-5">

            <MapPin
              size={20}
              className="shrink-0 text-[#604936]"
            />

            <div className="min-w-0 flex-1">

              <label htmlFor="city" className="block text-xs text-[#777269]">Cidade</label>

              <input
                id="city" required maxLength={100} type="text"
                value={city}
                onChange={(event) => { setCity(event.target.value); onLocationChange() }}
                placeholder={
                  selectedState
                    ? 'Digite a cidade'
                    : 'Escolha o estado primeiro'
                }
                disabled={!selectedState}
                className="w-full bg-transparent text-sm font-medium text-[#20231d] outline-none placeholder:text-[#777269] disabled:cursor-not-allowed"
              />

            </div>

          </div>

          {/* BUSCAR */}
          <button
            type="submit"
            disabled={!selectedState || !city.trim()}
            className="flex h-14 items-center justify-center gap-2 rounded-xl bg-[#d4b66f] px-7 font-semibold text-[#28351f] transition hover:bg-[#e1c889] disabled:cursor-not-allowed disabled:opacity-50"
          >

            <Search size={18} />

            Buscar

          </button>

        </form>

      </div>

    </section>
  )
}