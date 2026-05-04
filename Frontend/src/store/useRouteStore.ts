import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { CalculatedRoute, EmergencyRouteMetadata, RouteCalculationResult } from '../api/routes'

export interface RouteOrigin {
  lat: number
  lng: number
}

export interface RouteDestination {
  address: string
  roadAddress?: string
  jibunAddress?: string
  zonecode?: string
  lat?: number
  lng?: number
}

export type RouteMode = 'EMERGENCY' | 'STANDARD'
export type VehicleType = 'FIRE_TRUCK' | 'AMBULANCE'

export interface ActiveDispatchSession {
  id: string
  startedAt: string
}

interface RouteStoreState {
  origin: RouteOrigin | null
  liveVehiclePosition: RouteOrigin | null
  destination: RouteDestination | null
  vehicleType: VehicleType
  standardRoute: CalculatedRoute | null
  emergencyRoute: CalculatedRoute | null
  emergencyRouteMetadata: EmergencyRouteMetadata | null
  activeRouteMode: RouteMode
  activeDispatch: ActiveDispatchSession | null
  isCalculatingRoute: boolean
  routeError: string | null
  setOrigin: (origin: RouteOrigin | null) => void
  setLiveVehiclePosition: (position: RouteOrigin | null) => void
  setDestination: (destination: RouteDestination | null) => void
  setVehicleType: (vehicleType: VehicleType) => void
  setActiveRouteMode: (mode: RouteMode) => void
  setActiveDispatch: (dispatch: ActiveDispatchSession | null) => void
  startRouteCalculation: () => void
  setCalculatedRouteResult: (result: RouteCalculationResult) => void
  setRouteError: (error: string | null) => void
  clearRouteResult: () => void
  clearDestination: () => void
  resetRoute: () => void
}

export const useRouteStore = create<RouteStoreState>()(
  persist(
    (set) => ({
      origin: null,
      liveVehiclePosition: null,
      destination: null,
      vehicleType: 'FIRE_TRUCK',
      standardRoute: null,
      emergencyRoute: null,
      emergencyRouteMetadata: null,
      activeRouteMode: 'EMERGENCY',
      activeDispatch: null,
      isCalculatingRoute: false,
      routeError: null,
      setOrigin: (origin) => set({ origin }),
      setLiveVehiclePosition: (liveVehiclePosition) => set({ liveVehiclePosition }),
      setDestination: (destination) =>
        set({
          destination,
          standardRoute: null,
          emergencyRoute: null,
          emergencyRouteMetadata: null,
          activeRouteMode: 'EMERGENCY',
          routeError: null,
          isCalculatingRoute: false,
        }),
      setVehicleType: (vehicleType) =>
        set({
          vehicleType,
          standardRoute: null,
          emergencyRoute: null,
          emergencyRouteMetadata: null,
          activeRouteMode: 'EMERGENCY',
          routeError: null,
          isCalculatingRoute: false,
        }),
      setActiveRouteMode: (activeRouteMode) => set({ activeRouteMode }),
      setActiveDispatch: (activeDispatch) => set({ activeDispatch }),
      startRouteCalculation: () => set({ isCalculatingRoute: true, routeError: null }),
      setCalculatedRouteResult: (result) =>
        set((state) => ({
          destination: {
            ...state.destination,
            ...result.destination,
            roadAddress: state.destination?.roadAddress ?? result.destination.roadAddress,
            jibunAddress: state.destination?.jibunAddress ?? result.destination.jibunAddress,
          },
          standardRoute: result.standardRoute,
          emergencyRoute: result.emergencyRoute,
          emergencyRouteMetadata: result.emergencyMetadata ?? null,
          activeRouteMode: 'EMERGENCY',
          isCalculatingRoute: false,
          routeError: null,
        })),
      setRouteError: (routeError) => set({ routeError, isCalculatingRoute: false }),
      clearRouteResult: () =>
        set({
          standardRoute: null,
          emergencyRoute: null,
          emergencyRouteMetadata: null,
          activeRouteMode: 'EMERGENCY',
          routeError: null,
          isCalculatingRoute: false,
        }),
      clearDestination: () =>
        set({
          destination: null,
          standardRoute: null,
          emergencyRoute: null,
          emergencyRouteMetadata: null,
          activeRouteMode: 'EMERGENCY',
          routeError: null,
          isCalculatingRoute: false,
        }),
      resetRoute: () =>
        set({
          origin: null,
          liveVehiclePosition: null,
          destination: null,
          vehicleType: 'FIRE_TRUCK',
          standardRoute: null,
          emergencyRoute: null,
          emergencyRouteMetadata: null,
          activeRouteMode: 'EMERGENCY',
          activeDispatch: null,
          routeError: null,
          isCalculatingRoute: false,
        }),
    }),
    {
      name: 'rescue-nav-route-store',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        origin: state.origin,
        liveVehiclePosition: state.liveVehiclePosition,
        destination: state.destination,
        vehicleType: state.vehicleType,
        standardRoute: state.standardRoute,
        emergencyRoute: state.emergencyRoute,
        emergencyRouteMetadata: state.emergencyRouteMetadata,
        activeRouteMode: state.activeRouteMode,
        activeDispatch: state.activeDispatch,
      }),
    },
  ),
)

export type { RouteStoreState }
