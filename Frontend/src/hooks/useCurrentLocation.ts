import { useCallback, useState } from 'react'

interface Coordinates {
  lat: number
  lng: number
}

interface UseCurrentLocationResult {
  location: Coordinates | null
  loading: boolean
  error: string | null
  getCurrentLocation: () => Promise<Coordinates>
}

const GEO_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 0,
}

function mapGeolocationError(error: GeolocationPositionError): string {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return '위치 권한이 거부되었습니다.'
    case error.POSITION_UNAVAILABLE:
      return '위치 정보를 확인할 수 없습니다.'
    case error.TIMEOUT:
      return '위치 요청 시간이 초과되었습니다.'
    default:
      return '현재 위치를 가져올 수 없습니다.'
  }
}

export default function useCurrentLocation(): UseCurrentLocationResult {
  const [location, setLocation] = useState<Coordinates | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      const nextError = '이 브라우저에서는 위치 정보를 지원하지 않습니다.'
      setError(nextError)
      setLoading(false)
      return Promise.reject(new Error(nextError))
    }

    setLoading(true)
    setError(null)

    return new Promise<Coordinates>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position: GeolocationPosition) => {
          const nextLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }

          setLocation(nextLocation)
          setLoading(false)
          resolve(nextLocation)
        },
        (geoError: GeolocationPositionError) => {
          const nextError = mapGeolocationError(geoError)
          setError(nextError)
          setLoading(false)
          reject(new Error(nextError))
        },
        GEO_OPTIONS,
      )
    })
  }, [])

  return {
    location,
    loading,
    error,
    getCurrentLocation,
  }
}
