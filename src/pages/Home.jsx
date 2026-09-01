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

  const filters = useMemo(() => {
    return {
      search,
      category: selectedCategory,
    }
  }, [search, selectedCategory])

  return (
    <div className="min-h-screen bg-[#f7f3eb]">

      <Header
        search={search}
        onSearchChange={setSearch}
      />

      <main className="px-4 pb-16 lg:px-6">

        <Hero />

        <CategoryList
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />

        <FeaturedRestaurants filters={filters} />

        <TimelineSection />

        <ReviewForm />

      </main>

    </div>
  )
}