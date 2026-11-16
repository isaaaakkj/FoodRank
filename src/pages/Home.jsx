
import { useMemo, useState } from 'react'

import Header from '../components/Header'
import Hero from '../components/Hero'
import CategoryList from '../components/CategoryList'
import FeaturedRestaurants from '../components/FeaturedRestaurants'
import TimelineSection from '../components/TimelineSection'
import ReviewForm from '../components/ReviewForm'

export default function Home() {
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Todos')

  const [location, setLocation] = useState({
    state: '',
    city: '',
  })

  const [hasSearchedLocation, setHasSearchedLocation] = useState(false)

  function handleLocationSearch(newLocation) {
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
