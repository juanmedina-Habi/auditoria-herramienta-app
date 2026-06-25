import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { cn } from '../../lib/utils'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

/** Centro de Bogotá — punto de referencia por defecto */
export const BOGOTA_CENTER = { lat: 4.6533, lng: -74.0836 }

const defaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

type PropertyMapProps = {
  lat?: number
  lng?: number
  label?: string
  className?: string
  height?: string
  zoom?: number
  showZone?: boolean
}

export function PropertyMap({
  lat,
  lng,
  label = 'Inmueble',
  className,
  height = 'h-48',
  zoom = 15,
  showZone = false,
}: PropertyMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)

  const position = {
    lat: lat ?? BOGOTA_CENTER.lat,
    lng: lng ?? BOGOTA_CENTER.lng,
  }

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    if (mapRef.current) {
      mapRef.current.remove()
      mapRef.current = null
    }

    const map = L.map(el, {
      scrollWheelZoom: false,
      attributionControl: true,
      zoomControl: false,
    }).setView([position.lat, position.lng], zoom)

    L.control.zoom({ position: 'topright' }).addTo(map)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map)

    L.marker([position.lat, position.lng], { icon: defaultIcon })
      .addTo(map)
      .bindPopup(label)

    if (showZone) {
      L.circle([position.lat, position.lng], {
        radius: 400,
        color: '#7c3aed',
        fillColor: '#7c3aed',
        fillOpacity: 0.12,
        weight: 2,
        dashArray: '6 4',
      }).addTo(map)
    }

    mapRef.current = map

    const timer = setTimeout(() => map.invalidateSize(), 100)

    return () => {
      clearTimeout(timer)
      map.remove()
      mapRef.current = null
    }
  }, [position.lat, position.lng, label, zoom, showZone])

  return (
    <div
      ref={containerRef}
      className={cn('z-0 w-full overflow-hidden rounded-lg', height, className)}
    />
  )
}

export function resolveMapPosition(
  lat?: number,
  lng?: number,
  countryCode?: string,
): { lat: number; lng: number } {
  if (lat != null && lng != null) {
    return { lat, lng }
  }
  if (countryCode === 'MX') {
    return { lat: 19.4326, lng: -99.1332 }
  }
  return BOGOTA_CENTER
}
