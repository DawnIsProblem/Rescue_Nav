import { useEffect, useRef } from 'react'
import useCurrentLocation from '../../hooks/useCurrentLocation'
import useKakaoLoader from '../../hooks/useKakaoLoader'
import { useRouteStore } from '../../store/useRouteStore'

interface KakaoMapProps {
  className?: string
  appKey?: string
}

type MapInstanceRef = {
  relayout: () => void
  setCenter: (latLng: object) => void
}

type MarkerInstanceRef = {
  setMap: (map: MapInstanceRef | null) => void
  setPosition: (position: object) => void
}

const DEFAULT_LAT = 37.5665
const DEFAULT_LNG = 126.978
const DEFAULT_LEVEL = 3

export default function KakaoMap({ className, appKey }: KakaoMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<MapInstanceRef | null>(null)
  const markerRef = useRef<MarkerInstanceRef | null>(null)
  const kakaoKey = appKey ?? import.meta.env.VITE_KAKAO_MAP_KEY ?? ''
  const { isLoaded, status, error } = useKakaoLoader(kakaoKey)
  const origin = useRouteStore((state) => state.origin)
  const setOrigin = useRouteStore((state) => state.setOrigin)
  const { location, loading: locationLoading, error: locationError, getCurrentLocation } = useCurrentLocation()

  useEffect(() => {
    getCurrentLocation()
  }, [getCurrentLocation])

  useEffect(() => {
    if (!location) return
    setOrigin(location)
  }, [location, setOrigin])

  useEffect(() => {
    if (!isLoaded || !containerRef.current || !window.kakao?.maps) {
      return
    }

    const center = new window.kakao.maps.LatLng(DEFAULT_LAT, DEFAULT_LNG)
    mapRef.current = new window.kakao.maps.Map(containerRef.current, {
      center,
      level: DEFAULT_LEVEL,
    })

    return () => {
      markerRef.current?.setMap(null)
      markerRef.current = null
      mapRef.current = null
    }
  }, [isLoaded])

  useEffect(() => {
    if (!isLoaded || !origin || !mapRef.current || !window.kakao?.maps) {
      return
    }

    const currentPosition = new window.kakao.maps.LatLng(origin.lat, origin.lng)
    mapRef.current.setCenter(currentPosition)

    if (!markerRef.current) {
      markerRef.current = new window.kakao.maps.Marker({
        map: mapRef.current,
        position: currentPosition,
      })
      return
    }

    markerRef.current.setPosition(currentPosition)
    markerRef.current.setMap(mapRef.current)
  }, [isLoaded, origin])

  useEffect(() => {
    const handleResize = () => {
      mapRef.current?.relayout()
    }

    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <div className={['relative h-full w-full', className ?? ''].join(' ')}>
      <div ref={containerRef} className="h-full w-full" />

      {status === 'loading' ? (
        <div className="absolute inset-0 grid place-items-center bg-zinc-100/80 text-sm font-semibold text-zinc-500">
          Loading Kakao Map...
        </div>
      ) : null}

      {status === 'error' ? (
        <div className="absolute inset-0 grid place-items-center bg-zinc-100/90 px-4 text-center text-sm font-semibold text-red-600">
          {error?.message ?? 'Failed to load Kakao Map.'}
        </div>
      ) : null}

      {status === 'ready' && locationLoading ? (
        <div className="absolute left-3 top-3 rounded-md bg-white/95 px-3 py-1.5 text-xs font-semibold text-zinc-600 shadow-sm">
          Fetching current location...
        </div>
      ) : null}

      {status === 'ready' && locationError ? (
        <div className="absolute left-3 bottom-3 rounded-md bg-white/95 px-3 py-2 text-xs font-semibold text-red-600 shadow-sm">
          {locationError}
        </div>
      ) : null}
    </div>
  )
}
