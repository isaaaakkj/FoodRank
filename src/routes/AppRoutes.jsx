import { BrowserRouter, Routes, Route } from 'react-router-dom'

import Home from '../pages/Home'
import Restaurant from '../pages/Restaurant'

export default function AppRoutes() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/restaurant/:id" element={<Restaurant />} />
      </Routes>
    </BrowserRouter>
  )
}