import { useSyncExternalStore } from 'react'

interface LiveVehiclePosition {
  lat: number
  lng: number
}

interface LiveVehicleSnapshot {
  position: LiveVehiclePosition | null
  loading: boolean
  error: string | null
}

const LIVE_POSITION_SYNC_INTERVAL_MS = 1000
const GPS_JITTER_THRESHOLD_METERS = 5
const GEO_WATCH_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 0,
}

type SnapshotListener = () => void

let geolocationWatchId: number | null = null
let latestAcceptedPosition: LiveVehiclePosition | null = null
let latestAcceptedTimestamp = 0
let latestTrackingError: string | null = null
let isTrackingLoading = true
let currentSnapshot: LiveVehicleSnapshot = {
  position: null,
  loading: true,
  error: null,
}
const listeners = new Set<SnapshotListener>()

function mapGeolocationError(error: GeolocationPositionError): string {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return '위치 권한이 거부되었습니다.'
    case error.POSITION_UNAVAILABLE:
      return '위치 정보를 확인할 수 없습니다.'
    case error.TIMEOUT:
      return '위치 요청 시간이 초과되었습니다.'
    default:
      return '실시간 차량 위치를 추적할 수 없습니다.'
  }
}

function getSnapshot(): LiveVehicleSnapshot {
  return currentSnapshot
}

function updateSnapshot(): void {
  currentSnapshot = {
    position: latestAcceptedPosition,
    loading: isTrackingLoading,
    error: latestTrackingError,
  }
}

function emitSnapshot(): void {
  listeners.forEach((listener) => {
    listener()
  })
}

function toRadians(value: number): number {
  return (value * Math.PI) / 180
}

function getDistanceMeters(from: LiveVehiclePosition, to: LiveVehiclePosition): number {
  const earthRadiusMeters = 6_371_000
  const deltaLat = toRadians(to.lat - from.lat)
  const deltaLng = toRadians(to.lng - from.lng)
  const fromLat = toRadians(from.lat)
  const toLat = toRadians(to.lat)

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(fromLat) * Math.cos(toLat) * Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return earthRadiusMeters * c
}

function acceptPosition(position: LiveVehiclePosition, acceptedAt: number): void {
  latestAcceptedPosition = position
  latestAcceptedTimestamp = acceptedAt
  latestTrackingError = null
  isTrackingLoading = false
  updateSnapshot()
  emitSnapshot()
}

function ensureGeolocationWatch(): void {
  if (geolocationWatchId !== null || typeof window === 'undefined') {
    return
  }

  if (!navigator.geolocation) {
    latestTrackingError = '이 브라우저에서는 위치 추적을 지원하지 않습니다.'
    isTrackingLoading = false
    updateSnapshot()
    emitSnapshot()
    return
  }

  geolocationWatchId = navigator.geolocation.watchPosition(
    (position) => {
      const nextPosition = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      }
      const acceptedAt = Date.now()

      if (!latestAcceptedPosition) {
        acceptPosition(nextPosition, acceptedAt)
        return
      }

      const movedDistanceMeters = getDistanceMeters(latestAcceptedPosition, nextPosition)

      if (movedDistanceMeters < GPS_JITTER_THRESHOLD_METERS) {
        return
      }

      if (acceptedAt - latestAcceptedTimestamp < LIVE_POSITION_SYNC_INTERVAL_MS) {
        return
      }

      acceptPosition(nextPosition, acceptedAt)
    },
    (error) => {
      latestTrackingError = mapGeolocationError(error)
      isTrackingLoading = false
      updateSnapshot()
      emitSnapshot()
    },
    GEO_WATCH_OPTIONS,
  )
}

function releaseGeolocationWatchIfIdle(): void {
  if (listeners.size > 0 || geolocationWatchId === null) {
    return
  }

  navigator.geolocation.clearWatch(geolocationWatchId)
  geolocationWatchId = null
}

export default function useLiveVehiclePosition(): LiveVehicleSnapshot {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener)
      ensureGeolocationWatch()

      return () => {
        listeners.delete(listener)
        releaseGeolocationWatchIfIdle()
      }
    },
    getSnapshot,
    getSnapshot,
  )
}
