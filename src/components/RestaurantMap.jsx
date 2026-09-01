import { useEffect } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

export default function RestaurantMap({ latitude, longitude, name }) {
  useEffect(() => {
    if (!latitude || !longitude) return

    const map = L.map('restaurant-map').setView(
      [latitude, longitude],
      16
    )

    L.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        attribution: '&copy; OpenStreetMap contributors',
      }
    ).addTo(map)

    L.marker([latitude, longitude])
      .addTo(map)
      .bindPopup(`<strong>${name}</strong>`)
      .openPopup()

    return () => {
      map.remove()
    }
  }, [latitude, longitude, name])

  return (
    <div
      id="restaurant-map"
      className="h-[320px] w-full rounded-2xl"
    />
  )
}