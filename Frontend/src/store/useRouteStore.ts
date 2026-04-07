import { create } from 'zustand'

export interface RouteOrigin {
  lat: number
  lng: number
}

export interface RouteDestination {
  address?: string
  lat: number
  lng: number
}

interface RouteStoreState {
  origin: RouteOrigin | null
  destination: RouteDestination | null
  setOrigin: (origin: RouteOrigin | null) => void
  setDestination: (destination: RouteDestination) => void
  clearDestination: () => void
  resetRoute: () => void
}

export const useRouteStore = create<RouteStoreState>((set) => ({
  origin: null,
  destination: null,
  setOrigin: (origin) => set({ origin }),
  setDestination: (destination) => set({ destination }),
  clearDestination: () => set({ destination: null }),
  resetRoute: () => set({ origin: null, destination: null }),
}))

export type { RouteStoreState }
