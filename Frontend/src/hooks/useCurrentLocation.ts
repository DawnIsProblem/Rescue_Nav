import { useCallback, useState } from 'react'

interface Coordinates {
  lat: number
  lng: number
}

interface UseCurrentLocationResult {
  location: Coordinates | null
  loading: boolean
  error: string | null
  getCurrentLocation: () => void
}

const GEO_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 0,
}

function mapGeolocationError(error: GeolocationPositionError): string {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return 'Location permission was denied.'
    case error.POSITION_UNAVAILABLE:
      return 'Location information is unavailable.'
    case error.TIMEOUT:
      return 'Location request timed out.'
    default:
      return 'Unable to fetch current location.'
  }
}

export default function useCurrentLocation(): UseCurrentLocationResult {
  const [location, setLocation] = useState<Coordinates | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser.')
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    navigator.geolocation.getCurrentPosition(
      (position: GeolocationPosition) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        })
        setLoading(false)
      },
      (geoError: GeolocationPositionError) => {
        setError(mapGeolocationError(geoError))
        setLoading(false)
      },
      GEO_OPTIONS,
    )
  }, [])

  return {
    location,
    loading,
    error,
    getCurrentLocation,
  }
}
