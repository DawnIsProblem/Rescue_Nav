declare global {
  type KakaoLatLng = object

  interface KakaoMapOptions {
    center: KakaoLatLng
    level: number
  }

  interface KakaoMapInstance {
    relayout: () => void
    setCenter: (latLng: KakaoLatLng) => void
    setBounds: (bounds: KakaoLatLngBounds) => void
  }

  interface KakaoLatLngBounds {
    extend: (latLng: KakaoLatLng) => void
  }

  interface KakaoMarkerOptions {
    map?: KakaoMapInstance | null
    position: KakaoLatLng
  }

  interface KakaoMarkerInstance {
    setMap: (map: KakaoMapInstance | null) => void
    setPosition: (position: KakaoLatLng) => void
  }

  interface KakaoPolygonOptions {
    map?: KakaoMapInstance | null
    path: KakaoLatLng[] | KakaoLatLng[][]
    strokeWeight?: number
    strokeColor?: string
    strokeOpacity?: number
    strokeStyle?: 'solid' | 'shortdash' | 'shortdot' | 'shortdashdot' | 'shortdashdotdot' | 'dot' | 'dash'
    fillColor?: string
    fillOpacity?: number
  }

  interface KakaoPolygonInstance {
    setMap: (map: KakaoMapInstance | null) => void
    setPath: (path: KakaoLatLng[] | KakaoLatLng[][]) => void
  }

  interface KakaoPolylineOptions {
    map?: KakaoMapInstance | null
    path: KakaoLatLng[]
    strokeWeight?: number
    strokeColor?: string
    strokeOpacity?: number
    strokeStyle?: 'solid' | 'shortdash' | 'shortdot' | 'shortdashdot' | 'shortdashdotdot' | 'dot' | 'dash'
  }

  interface KakaoPolylineInstance {
    setMap: (map: KakaoMapInstance | null) => void
    setPath: (path: KakaoLatLng[]) => void
  }

  interface KakaoCustomOverlayOptions {
    map?: KakaoMapInstance | null
    position: KakaoLatLng
    content: string | HTMLElement
    yAnchor?: number
    xAnchor?: number
    zIndex?: number
  }

  interface KakaoCustomOverlayInstance {
    setMap: (map: KakaoMapInstance | null) => void
    setPosition: (position: KakaoLatLng) => void
  }

  interface KakaoMapsNamespace {
    load: (callback: () => void) => void
    LatLng: new (lat: number, lng: number) => KakaoLatLng
    LatLngBounds: new () => KakaoLatLngBounds
    Map: new (container: HTMLElement, options: KakaoMapOptions) => KakaoMapInstance
    Marker: new (options: KakaoMarkerOptions) => KakaoMarkerInstance
    Polygon: new (options: KakaoPolygonOptions) => KakaoPolygonInstance
    Polyline: new (options: KakaoPolylineOptions) => KakaoPolylineInstance
    CustomOverlay: new (options: KakaoCustomOverlayOptions) => KakaoCustomOverlayInstance
  }

  interface KakaoNamespace {
    maps: KakaoMapsNamespace
  }

  interface Window {
    kakao?: KakaoNamespace
  }
}

export {}
