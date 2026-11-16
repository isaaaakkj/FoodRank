
import { useMemo, useState } from 'react'

import Header from '../components/Header'
import Hero from '../components/Hero'
import CategoryList from '../components/CategoryList'
import FeaturedRestaurants from '../components/FeaturedRestaurants'
import TimelineSection from '../components/TimelineSection'
import ReviewForm from '../components/ReviewForm'

const LOCATION_STORAGE_KEY = 'foodrank:last-location'

function readSavedLocation() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(LOCATION_STORAGE_KEY) || 'null')
    if (
      saved &&
      typeof saved.state === 'string' &&
      typeof saved.city === 'string' &&
      saved.state.trim() &&
      saved.city.trim() &&
      saved.city.length <= 100
    ) {
      return { state: saved.state.trim(), city: saved.city.trim() }
    }
  } catch {
    // Armazenamento indisponível ou valor inválido.
  }
  return { state: '', city: '' }
}

export default function Home() {
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Todos')

  const [location, setLocation] = useState(readSavedLocation)
  const [hasSearchedLocation, setHasSearchedLocation] = useState(
    () => Boolean(readSavedLocation().state && readSavedLocation().city)
  )

  function handleLocationSearch(newLocation) {
    try {
      window.localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(newLocation))
    } catch {
      // A busca continua funcionando mesmo quando o navegador bloqueia o armazenamento.
    }
    setLocation(newLocation)
    setSearch('')
    setHasSearchedLocation(true)
  }

  const filters = useMemo(() => ({
    search,
    category: selectedCategory,
    location,
    hasSearchedLocation,
  }), [search, selectedCategory, location, hasSearchedLocation])

  return (
    <div className="min-h-screen bg-[#f7f3eb]">
      <Header />

      <main id="main-content" tabIndex={-1} className="px-4 pb-16 lg:px-6">
        <Hero
          initialLocation={location}
          onLocationSearch={handleLocationSearch}
          onLocationChange={() => { setHasSearchedLocation(false); setSearch('') }}
          search={search}
          onSearchChange={setSearch}
          searchEnabled={hasSearchedLocation}
        />

        <CategoryList
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />

        <FeaturedRestaurants filters={filters} />

        <TimelineSection />

        <ReviewForm
          key={`${hasSearchedLocation}-${location.city}-${location.state}`}
          location={location}
          enabled={hasSearchedLocation}
        />

      </main>
    </div>
  )
}
