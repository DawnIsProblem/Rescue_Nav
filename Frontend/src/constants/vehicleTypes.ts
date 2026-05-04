import type { VehicleType } from '../store/useRouteStore'

export interface VehicleTypeOption {
  value: VehicleType
  label: string
  description: string
}

export const VEHICLE_TYPE_OPTIONS: VehicleTypeOption[] = [
  {
    value: 'FIRE_TRUCK',
    label: '소방차',
    description: '큰 차체, 회전 및 도로 제약 고려',
  },
  {
    value: 'AMBULANCE',
    label: '구급차',
    description: '상대적으로 작은 차체, 빠른 접근 우선',
  },
]

export function getVehicleTypeOption(vehicleType: VehicleType): VehicleTypeOption {
  return VEHICLE_TYPE_OPTIONS.find((option) => option.value === vehicleType) ?? VEHICLE_TYPE_OPTIONS[0]
}
