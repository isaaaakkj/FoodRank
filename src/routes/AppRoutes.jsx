import { HashRouter, Routes, Route } from 'react-router-dom'

import NotFound from '../pages/NotFound'
import Favorites from '../pages/Favorites'
import Timeline from '../pages/Timeline'
import Home from '../pages/Home'
import Restaurant from '../pages/Restaurant'

export default function AppRoutes() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/timeline" element={<Timeline />} />
        <Route path="*" element={<NotFound />} />
        <Route path="/" element={<Home />} />
        <Route path="/restaurant/:id" element={<Restaurant />} />
      </Routes>
    </HashRouter>
  )
}