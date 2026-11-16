import { useEffect, useRef, useState } from 'react'
import { MapPin, Search, ChevronDown, Check } from 'lucide-react'

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

export default function Hero({ initialLocation, onLocationSearch, onLocationChange, search, onSearchChange, searchEnabled }) {
  const [selectedState, setSelectedState] = useState(initialLocation.state)
  const [city, setCity] = useState(initialLocation.city)
  const [stateMenuOpen, setStateMenuOpen] = useState(false)
  const statePickerRef = useRef(null)
  const stateOptionRefs = useRef([])

  useEffect(() => {
    if (!stateMenuOpen) return

    function closeOnOutsideClick(event) {
      if (!statePickerRef.current?.contains(event.target)) setStateMenuOpen(false)
    }

    function closeOnEscape(event) {
      if (event.key === 'Escape') setStateMenuOpen(false)
    }

    document.addEventListener('pointerdown', closeOnOutsideClick)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [stateMenuOpen])

  function chooseState(stateName) {
    if (selectedState !== stateName) {
      setSelectedState(stateName)
      setCity('')
      onLocationChange()
    }
    setStateMenuOpen(false)
    statePickerRef.current?.querySelector('button')?.focus()
  }

  function moveStateFocus(index) {
    stateOptionRefs.current[(index + states.length) % states.length]?.focus()
  }

  function handleStateTriggerKeyDown(event) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      setStateMenuOpen(true)
      const selectedIndex = states.findIndex(state => state.name === selectedState)
      const next = event.key === 'ArrowDown' ? Math.max(0, selectedIndex) : selectedIndex < 0 ? states.length - 1 : selectedIndex
      requestAnimationFrame(() => moveStateFocus(next))
    }
  }

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
    <section className="relative mx-auto mt-5 max-w-[1440px] rounded-2xl bg-[#28351f] px-6 py-20 lg:px-10">

      <div className="pointer-events-none absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_75%_30%,rgba(168,139,84,0.18),transparent_35%),linear-gradient(110deg,#172014,#28351f_55%,#463626)]" />

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
          <div ref={statePickerRef} className="relative min-w-0">
            <button
              id="state"
              type="button"
              aria-label="Estado"
              aria-haspopup="listbox"
              aria-expanded={stateMenuOpen}
              aria-controls="state-options"
              onKeyDown={handleStateTriggerKeyDown}
              onClick={() => setStateMenuOpen(open => !open)}
              className={`flex h-14 w-full items-center gap-3 rounded-xl border bg-[#faf8f3] px-5 text-left shadow-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d4b66f] ${stateMenuOpen ? 'border-[#d4b66f] ring-2 ring-[#d4b66f]/30' : 'border-transparent hover:border-[#d8cbb7]'}`}
            >
              <MapPin size={20} className="shrink-0 text-[#604936]" />
              <span className="min-w-0 flex-1">
                <span className="block text-xs text-[#777269]">Estado</span>
                <span className="block truncate text-sm font-medium text-[#20231d]">
                  {selectedState || 'Escolha um estado'}
                </span>
              </span>
              <ChevronDown
                size={17}
                className={`shrink-0 text-[#604936] transition-transform ${stateMenuOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {stateMenuOpen && (
              <div
                id="state-options"
                role="listbox"
                aria-label="Escolha um estado"
                className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 max-h-72 overflow-y-auto overscroll-contain rounded-2xl border border-[#d8cbb7] bg-[#faf8f3] p-2 shadow-2xl"
              >
                <p className="px-3 pb-2 pt-1 text-xs font-semibold uppercase tracking-widest text-[#a88b54]">
                  Estados do Brasil
                </p>
                {states.map((state, index) => (
                  <button
                    key={state.uf}
                    ref={element => { stateOptionRefs.current[index] = element }}
                    type="button"
                    role="option"
                    aria-selected={selectedState === state.name}
                    onClick={() => chooseState(state.name)}
                    onKeyDown={event => {
                      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
                        event.preventDefault()
                        moveStateFocus(index + (event.key === 'ArrowDown' ? 1 : -1))
                      }
                      if (event.key === 'Escape') {
                        event.preventDefault()
                        setStateMenuOpen(false)
                        statePickerRef.current?.querySelector('button')?.focus()
                      }
                    }}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#d4b66f] ${
                      selectedState === state.name
                        ? 'bg-[#28351f] font-semibold text-[#faf8f3]'
                        : 'text-[#463626] hover:bg-[#eee7d9] focus:bg-[#eee7d9]'
                    }`}
                  >
                    <span>{state.name}</span>
                    {selectedState === state.name && <Check size={17} />}
                  </button>
                ))}
              </div>
            )}
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

        <div className="mt-4">
          <label htmlFor="restaurant-search" className="mb-2 block text-sm font-medium text-[#faf7ef]">
            Pesquisar restaurantes
          </label>
          <div className={`flex h-14 items-center gap-3 rounded-xl border border-[#d8cbb7] bg-[#faf8f3] px-5 transition ${searchEnabled ? 'focus-within:border-[#d4b66f]' : 'opacity-70'}`}>
            <Search size={20} className="shrink-0 text-[#604936]" />
            <input
              id="restaurant-search"
              type="search"
              disabled={!searchEnabled}
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder={searchEnabled ? 'Pesquise por restaurante, culinária ou localização' : 'Escolha o estado e a cidade e clique em Buscar'}
              className="w-full bg-transparent text-sm text-[#20231d] outline-none placeholder:text-[#777269] disabled:cursor-not-allowed"
            />
          </div>
        </div>

      </div>

    </section>
  )
}