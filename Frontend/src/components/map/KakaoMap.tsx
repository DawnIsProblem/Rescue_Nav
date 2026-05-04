import { useEffect, useRef } from 'react'
import useKakaoLoader from '../../hooks/useKakaoLoader'
import useLiveVehiclePosition from '../../hooks/useLiveVehiclePosition'
import { useRouteStore, type RouteMode } from '../../store/useRouteStore'

interface KakaoMapProps {
  className?: string
  appKey?: string
}

interface KakaoPolylineStyleOptions {
  strokeWeight: number
  strokeColor: string
  strokeOpacity: number
  strokeStyle: NonNullable<KakaoPolylineOptions['strokeStyle']>
}

const DEFAULT_LAT = 37.5665
const DEFAULT_LNG = 126.978
const DEFAULT_LEVEL = 3
const ACTIVE_STANDARD_ROUTE_STROKE_WEIGHT = 7
const ACTIVE_STANDARD_ROUTE_STROKE_COLOR = '#0f172a'
const ACTIVE_STANDARD_ROUTE_STROKE_OPACITY = 0.9
const INACTIVE_STANDARD_ROUTE_STROKE_WEIGHT = 4
const INACTIVE_STANDARD_ROUTE_STROKE_COLOR = '#94a3b8'
const INACTIVE_STANDARD_ROUTE_STROKE_OPACITY = 0.45
const ACTIVE_EMERGENCY_ROUTE_STROKE_WEIGHT = 8
const ACTIVE_EMERGENCY_ROUTE_STROKE_COLOR = '#dc2626'
const ACTIVE_EMERGENCY_ROUTE_STROKE_OPACITY = 0.96
const INACTIVE_EMERGENCY_ROUTE_STROKE_WEIGHT = 5
const INACTIVE_EMERGENCY_ROUTE_STROKE_COLOR = '#f87171'
const INACTIVE_EMERGENCY_ROUTE_STROKE_OPACITY = 0.48
const INCIDENT_ZONE_STROKE_WEIGHT = 3
const INCIDENT_ZONE_STROKE_COLOR = '#b91c1c'
const INCIDENT_ZONE_STROKE_OPACITY = 0.95
const INCIDENT_ZONE_FILL_COLOR = '#ef4444'
const INCIDENT_ZONE_FILL_OPACITY = 0.22
const INCIDENT_ZONE_HALF_HEIGHT_METERS = 36
const INCIDENT_ZONE_HALF_WIDTH_METERS = 28

function metersToLatitudeDegrees(meters: number): number {
  return meters / 111_320
}

function metersToLongitudeDegrees(latitude: number, meters: number): number {
  const latitudeRadians = (latitude * Math.PI) / 180
  const metersPerDegree = 111_320 * Math.cos(latitudeRadians)

  if (metersPerDegree === 0) {
    return 0
  }

  return meters / metersPerDegree
}

function hasRoutePath(path: { lat: number; lng: number }[] | undefined): path is { lat: number; lng: number }[] {
  return Array.isArray(path) && path.length >= 2
}

function hasCoordinates(point: { lat?: number; lng?: number } | null): point is { lat: number; lng: number } {
  return point !== null && typeof point.lat === 'number' && typeof point.lng === 'number'
}

function createIncidentZonePath(latitude: number, longitude: number, maps: KakaoMapsNamespace): KakaoLatLng[] {
  const latOffset = metersToLatitudeDegrees(INCIDENT_ZONE_HALF_HEIGHT_METERS)
  const lngOffset = metersToLongitudeDegrees(latitude, INCIDENT_ZONE_HALF_WIDTH_METERS)

  return [
    new maps.LatLng(latitude + latOffset, longitude),
    new maps.LatLng(latitude, longitude + lngOffset),
    new maps.LatLng(latitude - latOffset, longitude),
    new maps.LatLng(latitude, longitude - lngOffset),
  ]
}

function createIncidentOverlayContent(): HTMLDivElement {
  const wrapper = document.createElement('div')
  wrapper.style.position = 'relative'
  wrapper.style.width = '34px'
  wrapper.style.height = '34px'
  wrapper.style.display = 'grid'
  wrapper.style.placeItems = 'center'
  wrapper.style.borderRadius = '9999px'
  wrapper.style.background = 'rgba(185, 28, 28, 0.92)'
  wrapper.style.border = '3px solid rgba(255, 245, 245, 0.98)'
  wrapper.style.boxShadow = '0 10px 20px rgba(185, 28, 28, 0.28)'
  wrapper.style.color = '#ffffff'
  wrapper.style.fontSize = '15px'
  wrapper.style.fontWeight = '800'
  wrapper.style.lineHeight = '1'
  wrapper.textContent = '!'

  const pulse = document.createElement('div')
  pulse.style.position = 'absolute'
  pulse.style.inset = '-7px'
  pulse.style.borderRadius = '9999px'
  pulse.style.border = '2px solid rgba(220, 38, 38, 0.38)'
  pulse.style.pointerEvents = 'none'
  wrapper.appendChild(pulse)

  return wrapper
}

function createLiveVehicleOverlayContent(): HTMLDivElement {
  const wrapper = document.createElement('div')
  wrapper.style.position = 'relative'
  wrapper.style.width = '30px'
  wrapper.style.height = '30px'
  wrapper.style.display = 'grid'
  wrapper.style.placeItems = 'center'
  wrapper.style.borderRadius = '9999px'
  wrapper.style.background = 'rgba(30, 64, 175, 0.94)'
  wrapper.style.border = '3px solid rgba(239, 246, 255, 0.98)'
  wrapper.style.boxShadow = '0 10px 22px rgba(30, 64, 175, 0.26)'
  wrapper.style.color = '#ffffff'
  wrapper.style.fontSize = '13px'
  wrapper.style.fontWeight = '800'
  wrapper.style.lineHeight = '1'
  wrapper.textContent = 'V'

  const halo = document.createElement('div')
  halo.style.position = 'absolute'
  halo.style.inset = '-6px'
  halo.style.borderRadius = '9999px'
  halo.style.border = '2px solid rgba(96, 165, 250, 0.32)'
  halo.style.pointerEvents = 'none'
  wrapper.appendChild(halo)

  return wrapper
}

function getStandardRouteStyle(activeRouteMode: RouteMode): KakaoPolylineStyleOptions {
  return {
    strokeWeight:
      activeRouteMode === 'STANDARD' ? ACTIVE_STANDARD_ROUTE_STROKE_WEIGHT : INACTIVE_STANDARD_ROUTE_STROKE_WEIGHT,
    strokeColor: activeRouteMode === 'STANDARD' ? ACTIVE_STANDARD_ROUTE_STROKE_COLOR : INACTIVE_STANDARD_ROUTE_STROKE_COLOR,
    strokeOpacity:
      activeRouteMode === 'STANDARD' ? ACTIVE_STANDARD_ROUTE_STROKE_OPACITY : INACTIVE_STANDARD_ROUTE_STROKE_OPACITY,
    strokeStyle: 'shortdash',
  }
}

function getEmergencyRouteStyle(activeRouteMode: RouteMode): KakaoPolylineStyleOptions {
  return {
    strokeWeight:
      activeRouteMode === 'EMERGENCY' ? ACTIVE_EMERGENCY_ROUTE_STROKE_WEIGHT : INACTIVE_EMERGENCY_ROUTE_STROKE_WEIGHT,
    strokeColor:
      activeRouteMode === 'EMERGENCY' ? ACTIVE_EMERGENCY_ROUTE_STROKE_COLOR : INACTIVE_EMERGENCY_ROUTE_STROKE_COLOR,
    strokeOpacity:
      activeRouteMode === 'EMERGENCY' ? ACTIVE_EMERGENCY_ROUTE_STROKE_OPACITY : INACTIVE_EMERGENCY_ROUTE_STROKE_OPACITY,
    strokeStyle: 'solid',
  }
}

export default function KakaoMap({ className, appKey }: KakaoMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<KakaoMapInstance | null>(null)
  const originMarkerRef = useRef<KakaoMarkerInstance | null>(null)
  const liveVehicleOverlayRef = useRef<KakaoCustomOverlayInstance | null>(null)
  const destinationMarkerRef = useRef<KakaoMarkerInstance | null>(null)
  const standardRoutePolylineRef = useRef<KakaoPolylineInstance | null>(null)
  const emergencyRoutePolylineRef = useRef<KakaoPolylineInstance | null>(null)
  const incidentZonePolygonRef = useRef<KakaoPolygonInstance | null>(null)
  const incidentOverlayRef = useRef<KakaoCustomOverlayInstance | null>(null)
  const kakaoKey = appKey ?? import.meta.env.VITE_KAKAO_MAP_KEY ?? ''
  const { isLoaded, status, error } = useKakaoLoader(kakaoKey)
  const origin = useRouteStore((state) => state.origin)
  const liveVehiclePosition = useRouteStore((state) => state.liveVehiclePosition)
  const destination = useRouteStore((state) => state.destination)
  const standardRoute = useRouteStore((state) => state.standardRoute)
  const emergencyRoute = useRouteStore((state) => state.emergencyRoute)
  const activeRouteMode = useRouteStore((state) => state.activeRouteMode)
  const activeDispatch = useRouteStore((state) => state.activeDispatch)
  const setOrigin = useRouteStore((state) => state.setOrigin)
  const setLiveVehiclePosition = useRouteStore((state) => state.setLiveVehiclePosition)
  const {
    position: trackedVehiclePosition,
    loading: liveTrackingLoading,
    error: liveTrackingError,
  } = useLiveVehiclePosition()
  const canFocusCurrentLocation = Boolean(liveVehiclePosition ?? origin)

  useEffect(() => {
    if (!trackedVehiclePosition) {
      return
    }

    setLiveVehiclePosition(trackedVehiclePosition)

    const shouldSyncOriginToLivePosition = !activeDispatch && !standardRoute && !emergencyRoute

    if (!origin || shouldSyncOriginToLivePosition) {
      setOrigin(trackedVehiclePosition)
    }
  }, [activeDispatch, emergencyRoute, origin, setLiveVehiclePosition, setOrigin, standardRoute, trackedVehiclePosition])

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
      originMarkerRef.current?.setMap(null)
      liveVehicleOverlayRef.current?.setMap(null)
      destinationMarkerRef.current?.setMap(null)
      standardRoutePolylineRef.current?.setMap(null)
      emergencyRoutePolylineRef.current?.setMap(null)
      incidentZonePolygonRef.current?.setMap(null)
      incidentOverlayRef.current?.setMap(null)
      originMarkerRef.current = null
      liveVehicleOverlayRef.current = null
      destinationMarkerRef.current = null
      standardRoutePolylineRef.current = null
      emergencyRoutePolylineRef.current = null
      incidentZonePolygonRef.current = null
      incidentOverlayRef.current = null
      mapRef.current = null
    }
  }, [isLoaded])

  useEffect(() => {
    if (!isLoaded || !origin || !mapRef.current || !window.kakao?.maps) {
      return
    }

    const currentPosition = new window.kakao.maps.LatLng(origin.lat, origin.lng)
    if (!originMarkerRef.current) {
      originMarkerRef.current = new window.kakao.maps.Marker({
        map: mapRef.current,
        position: currentPosition,
      })
    } else {
      originMarkerRef.current.setPosition(currentPosition)
      originMarkerRef.current.setMap(mapRef.current)
    }
  }, [isLoaded, origin])

  useEffect(() => {
    if (!isLoaded || !mapRef.current || !window.kakao?.maps) {
      return
    }

    const { maps } = window.kakao

    if (!liveVehiclePosition) {
      liveVehicleOverlayRef.current?.setMap(null)
      liveVehicleOverlayRef.current = null
      return
    }

    const liveVehicleLatLng = new maps.LatLng(liveVehiclePosition.lat, liveVehiclePosition.lng)

    if (!liveVehicleOverlayRef.current) {
      liveVehicleOverlayRef.current = new maps.CustomOverlay({
        map: mapRef.current,
        position: liveVehicleLatLng,
        content: createLiveVehicleOverlayContent(),
        yAnchor: 1.6,
        xAnchor: 0.5,
        zIndex: 5,
      })
    } else {
      liveVehicleOverlayRef.current.setPosition(liveVehicleLatLng)
      liveVehicleOverlayRef.current.setMap(mapRef.current)
    }
  }, [isLoaded, liveVehiclePosition])

  useEffect(() => {
    if (!isLoaded || !mapRef.current || !window.kakao?.maps) {
      return
    }

    if (!hasCoordinates(destination)) {
      destinationMarkerRef.current?.setMap(null)
      destinationMarkerRef.current = null
      return
    }

    const destinationPosition = new window.kakao.maps.LatLng(destination.lat, destination.lng)

    if (!destinationMarkerRef.current) {
      destinationMarkerRef.current = new window.kakao.maps.Marker({
        map: mapRef.current,
        position: destinationPosition,
      })
    } else {
      destinationMarkerRef.current.setPosition(destinationPosition)
      destinationMarkerRef.current.setMap(mapRef.current)
    }
  }, [destination, isLoaded])

  useEffect(() => {
    if (!isLoaded || !mapRef.current || !window.kakao?.maps) {
      return
    }

    const { maps } = window.kakao

    if (!hasCoordinates(destination)) {
      incidentZonePolygonRef.current?.setMap(null)
      incidentOverlayRef.current?.setMap(null)
      incidentZonePolygonRef.current = null
      incidentOverlayRef.current = null
      return
    }

    const incidentPath = createIncidentZonePath(destination.lat, destination.lng, maps)
    const destinationPosition = new maps.LatLng(destination.lat, destination.lng)

    if (!incidentZonePolygonRef.current) {
      incidentZonePolygonRef.current = new maps.Polygon({
        map: mapRef.current,
        path: incidentPath,
        strokeWeight: INCIDENT_ZONE_STROKE_WEIGHT,
        strokeColor: INCIDENT_ZONE_STROKE_COLOR,
        strokeOpacity: INCIDENT_ZONE_STROKE_OPACITY,
        strokeStyle: 'solid',
        fillColor: INCIDENT_ZONE_FILL_COLOR,
        fillOpacity: INCIDENT_ZONE_FILL_OPACITY,
      })
    } else {
      incidentZonePolygonRef.current.setPath(incidentPath)
      incidentZonePolygonRef.current.setMap(mapRef.current)
    }

    if (!incidentOverlayRef.current) {
      incidentOverlayRef.current = new maps.CustomOverlay({
        map: mapRef.current,
        position: destinationPosition,
        content: createIncidentOverlayContent(),
        yAnchor: 1.8,
        xAnchor: 0.5,
        zIndex: 4,
      })
    } else {
      incidentOverlayRef.current.setPosition(destinationPosition)
      incidentOverlayRef.current.setMap(mapRef.current)
    }
  }, [destination, isLoaded])

  useEffect(() => {
    if (!isLoaded || !mapRef.current || !window.kakao?.maps) {
      return
    }

    const { maps } = window.kakao
    const path = standardRoute?.path

    if (!hasRoutePath(path)) {
      standardRoutePolylineRef.current?.setMap(null)
      standardRoutePolylineRef.current = null
    } else {
      const kakaoPath = path.map((point) => new maps.LatLng(point.lat, point.lng))
      const standardRouteStyle = getStandardRouteStyle(activeRouteMode)

      standardRoutePolylineRef.current?.setMap(null)
      standardRoutePolylineRef.current = null

      standardRoutePolylineRef.current = new maps.Polyline({
        map: mapRef.current,
        path: kakaoPath,
        ...standardRouteStyle,
      })
    }
  }, [activeRouteMode, isLoaded, standardRoute])

  useEffect(() => {
    if (!isLoaded || !mapRef.current || !window.kakao?.maps) {
      return
    }

    const { maps } = window.kakao
    const path = emergencyRoute?.path

    if (!hasRoutePath(path)) {
      emergencyRoutePolylineRef.current?.setMap(null)
      emergencyRoutePolylineRef.current = null
      return
    }

    const kakaoPath = path.map((point) => new maps.LatLng(point.lat, point.lng))
    const emergencyRouteStyle = getEmergencyRouteStyle(activeRouteMode)

    emergencyRoutePolylineRef.current?.setMap(null)
    emergencyRoutePolylineRef.current = null

    emergencyRoutePolylineRef.current = new maps.Polyline({
      map: mapRef.current,
      path: kakaoPath,
      ...emergencyRouteStyle,
    })
  }, [activeRouteMode, emergencyRoute, isLoaded])

  useEffect(() => {
    if (!isLoaded || !mapRef.current || !window.kakao?.maps) {
      return
    }

    const { maps } = window.kakao
    const bounds = new maps.LatLngBounds()

    const standardPath = standardRoute?.path
    const emergencyPath = emergencyRoute?.path

    if (hasRoutePath(standardPath)) {
      standardPath.forEach((point) => {
        bounds.extend(new maps.LatLng(point.lat, point.lng))
      })
    }

    if (hasRoutePath(emergencyPath)) {
      emergencyPath.forEach((point) => {
        bounds.extend(new maps.LatLng(point.lat, point.lng))
      })
    }

    if (origin) {
      bounds.extend(new maps.LatLng(origin.lat, origin.lng))
    }

    if (liveVehiclePosition) {
      bounds.extend(new maps.LatLng(liveVehiclePosition.lat, liveVehiclePosition.lng))
    }

    if (hasCoordinates(destination)) {
      bounds.extend(new maps.LatLng(destination.lat, destination.lng))
    }

    if (hasRoutePath(standardPath) || hasRoutePath(emergencyPath)) {
      mapRef.current.setBounds(bounds)
    }
  }, [destination, emergencyRoute, isLoaded, liveVehiclePosition, origin, standardRoute])

  useEffect(() => {
    if (!isLoaded || !mapRef.current || !window.kakao?.maps) {
      return
    }

    if (hasRoutePath(standardRoute?.path) || hasRoutePath(emergencyRoute?.path)) {
      return
    }

    const focusPoint = hasCoordinates(destination) ? destination : liveVehiclePosition ?? origin

    if (!focusPoint) {
      return
    }

    mapRef.current.setCenter(new window.kakao.maps.LatLng(focusPoint.lat, focusPoint.lng))
  }, [destination, emergencyRoute, isLoaded, liveVehiclePosition, origin, standardRoute])

  useEffect(() => {
    if (!isLoaded || !containerRef.current || !mapRef.current || !window.kakao?.maps) {
      return
    }

    const { maps } = window.kakao
    let frameId: number | null = null

    const syncViewport = () => {
      frameId = null

      if (!mapRef.current) {
        return
      }

      mapRef.current.relayout()

      const bounds = new maps.LatLngBounds()
      const standardPath = standardRoute?.path
      const emergencyPath = emergencyRoute?.path

      if (hasRoutePath(standardPath)) {
        standardPath.forEach((point) => {
          bounds.extend(new maps.LatLng(point.lat, point.lng))
        })
      }

      if (hasRoutePath(emergencyPath)) {
        emergencyPath.forEach((point) => {
          bounds.extend(new maps.LatLng(point.lat, point.lng))
        })
      }

      if (origin) {
        bounds.extend(new maps.LatLng(origin.lat, origin.lng))
      }

      if (liveVehiclePosition) {
        bounds.extend(new maps.LatLng(liveVehiclePosition.lat, liveVehiclePosition.lng))
      }

      if (hasCoordinates(destination)) {
        bounds.extend(new maps.LatLng(destination.lat, destination.lng))
      }

      if (hasRoutePath(standardPath) || hasRoutePath(emergencyPath)) {
        mapRef.current.setBounds(bounds)
        return
      }

      const focusPoint = hasCoordinates(destination) ? destination : liveVehiclePosition ?? origin

      if (!focusPoint) {
        return
      }

      mapRef.current.setCenter(new maps.LatLng(focusPoint.lat, focusPoint.lng))
    }

    const scheduleSyncViewport = () => {
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId)
      }

      frameId = window.requestAnimationFrame(syncViewport)
    }

    const resizeObserver = new ResizeObserver(() => {
      scheduleSyncViewport()
    })

    resizeObserver.observe(containerRef.current)
    scheduleSyncViewport()

    return () => {
      resizeObserver.disconnect()

      if (frameId !== null) {
        window.cancelAnimationFrame(frameId)
      }
    }
  }, [destination, emergencyRoute, isLoaded, liveVehiclePosition, origin, standardRoute])

  const handleFocusCurrentLocation = () => {
    if (!isLoaded || !mapRef.current || !window.kakao?.maps) {
      return
    }

    const focusPoint = liveVehiclePosition ?? origin

    if (!focusPoint) {
      return
    }

    mapRef.current.setCenter(new window.kakao.maps.LatLng(focusPoint.lat, focusPoint.lng))
  }

  return (
    <div className={['relative isolate h-full w-full', className ?? ''].join(' ')}>
      <div ref={containerRef} className="h-full w-full" />

      {status === 'ready' ? (
        <button
          type="button"
          onClick={handleFocusCurrentLocation}
          disabled={!canFocusCurrentLocation}
          className={[
            'absolute right-4 top-4 z-20 inline-flex items-center gap-2 rounded-2xl border border-white/80 bg-white/92 px-3.5 py-2.5 text-sm font-bold text-zinc-700 shadow-[0_14px_32px_rgba(15,23,42,0.18)] backdrop-blur transition',
            canFocusCurrentLocation
              ? 'hover:-translate-y-0.5 hover:bg-white'
              : 'cursor-not-allowed opacity-60',
          ].join(' ')}
          aria-label="현재 위치를 지도 중심으로 이동"
        >
          <span className="relative inline-flex h-8 w-8 items-center justify-center rounded-full bg-red-50">
            <span className="absolute h-4 w-4 rounded-full border-2 border-red-500" />
            <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
          </span>
          <span className="text-left leading-tight">
            <span className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400">Map</span>
            <span className="block text-sm font-bold text-zinc-800">내 위치</span>
          </span>
        </button>
      ) : null}

      {status === 'loading' ? (
        <div className="absolute inset-0 grid place-items-center bg-zinc-100/80 text-sm font-semibold text-zinc-500">
          카카오 지도를 불러오는 중입니다...
        </div>
      ) : null}

      {status === 'error' ? (
        <div className="absolute inset-0 grid place-items-center bg-zinc-100/90 px-4 text-center text-sm font-semibold text-red-600">
          {error?.message ?? '카카오 지도를 불러오지 못했습니다.'}
        </div>
      ) : null}

      {status === 'ready' && liveTrackingLoading ? (
        <div className="absolute left-3 top-3 rounded-md bg-white/95 px-3 py-1.5 text-xs font-semibold text-zinc-600 shadow-sm">
          실시간 차량 위치를 추적하는 중입니다...
        </div>
      ) : null}

      {status === 'ready' && liveTrackingError ? (
        <div className="absolute left-3 bottom-3 rounded-md bg-white/95 px-3 py-2 text-xs font-semibold text-red-600 shadow-sm">
          {liveTrackingError}
        </div>
      ) : null}
    </div>
  )
}
