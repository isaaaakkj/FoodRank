import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import markerUrl from 'leaflet/dist/images/marker-icon.png'
import markerRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png'
import shadowUrl from 'leaflet/dist/images/marker-shadow.png'

const icon = L.icon({ iconUrl: markerUrl, iconRetinaUrl: markerRetinaUrl, shadowUrl, iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41] })

export default function RestaurantMap({ latitude, longitude, name }) {
  const container = useRef(null)
  const valid = latitude != null && longitude != null && Number.isFinite(Number(latitude)) && Number.isFinite(Number(longitude)) && Math.abs(Number(latitude)) <= 90 && Math.abs(Number(longitude)) <= 180
  useEffect(() => {
    if (!valid) return
    const map = L.map(container.current).setView([Number(latitude), Number(longitude)], 16)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map)
    const label = document.createElement('strong')
    label.textContent = name
    const marker = L.marker([Number(latitude), Number(longitude)], { icon, alt: name, title: name }).addTo(map)
    marker.bindPopup(label).openPopup()
    return () => map.remove()
  }, [latitude, longitude, name, valid])
  return valid ? <div ref={container} role="region" aria-label={`Mapa de ${name}`} className="h-[320px] w-full" /> : <p role="status" className="p-6">Localização não disponível.</p>
}
