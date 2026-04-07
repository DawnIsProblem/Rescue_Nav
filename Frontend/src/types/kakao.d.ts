type KakaoLatLng = object

interface KakaoMapOptions {
  center: KakaoLatLng
  level: number
}

interface KakaoMapInstance {
  relayout: () => void
  setCenter: (latLng: KakaoLatLng) => void
}

interface KakaoMarkerOptions {
  map?: KakaoMapInstance | null
  position: KakaoLatLng
}

interface KakaoMarkerInstance {
  setMap: (map: KakaoMapInstance | null) => void
  setPosition: (position: KakaoLatLng) => void
}

interface KakaoMapsNamespace {
  load: (callback: () => void) => void
  LatLng: new (lat: number, lng: number) => KakaoLatLng
  Map: new (container: HTMLElement, options: KakaoMapOptions) => KakaoMapInstance
  Marker: new (options: KakaoMarkerOptions) => KakaoMarkerInstance
}

interface KakaoNamespace {
  maps: KakaoMapsNamespace
}

declare global {
  interface Window {
    kakao?: KakaoNamespace
  }
}

export {}
