import { HashRouter, Routes, Route, useLocation } from 'react-router-dom'
import ThemeToggle from '../components/ThemeToggle'

import NotFound from '../pages/NotFound'
import Favorites from '../pages/Favorites'
import Timeline from '../pages/Timeline'
import Home from '../pages/Home'
import Restaurant from '../pages/Restaurant'
import Profile from '../pages/Profile'

function RoutedPages() {
  const { pathname } = useLocation()
  return (
    <>
      <Routes>
        <Route path="/profile" element={<Profile />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/timeline" element={<Timeline />} />
        <Route path="*" element={<NotFound />} />
        <Route path="/" element={<Home />} />
        <Route path="/restaurant/:id" element={<Restaurant />} />
      </Routes>
      {pathname !== '/' && <ThemeToggle floating />}
    </>
  )
}

export default function AppRoutes() {
  return (
    <HashRouter>
      <RoutedPages />
    </HashRouter>
  )
}
