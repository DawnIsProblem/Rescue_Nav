import type { RouteDestination, RouteOrigin, VehicleType } from '../store/useRouteStore'

export interface RoutePathPoint {
  lat: number
  lng: number
}

export interface CalculatedRoute {
  distanceMeters: number
  etaSeconds: number
  path: RoutePathPoint[]
}

export interface EmergencyRouteMetadata {
  strategy?: string
  warning?: string
  legalWarning?: string
  reason?: string
  assumptions?: string[]
  confidence?: number
  fallbackUsed?: boolean
  fallbackReason?: string
  fallbackMessage?: string
  primaryStrategy?: string
  fallbackStrategy?: string
}

export interface CalculatedDestination extends RouteDestination {
  lat: number
  lng: number
}

export interface RouteCalculationRequest {
  origin: RouteOrigin
  vehicleType: VehicleType
  destination: {
    address: string
    zonecode: string | null
    lat: number | null
    lng: number | null
  }
}

export interface RouteCalculationResult {
  origin: RouteOrigin
  destination: CalculatedDestination
  standardRoute: CalculatedRoute
  emergencyRoute: CalculatedRoute
  emergencyMetadata?: EmergencyRouteMetadata
}

interface RouteCalculationResponse {
  success: boolean
  code: string
  message: string
  data: RouteCalculationResult
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isOptionalString(value: unknown): value is string | undefined | null {
  return typeof value === 'string' || typeof value === 'undefined' || value === null
}

function isRouteOrigin(value: unknown): value is RouteOrigin {
  return isRecord(value) && typeof value.lat === 'number' && typeof value.lng === 'number'
}

function isRoutePathPoint(value: unknown): value is RoutePathPoint {
  return isRecord(value) && typeof value.lat === 'number' && typeof value.lng === 'number'
}

function isCalculatedRoute(value: unknown): value is CalculatedRoute {
  return (
    isRecord(value) &&
    typeof value.distanceMeters === 'number' &&
    typeof value.etaSeconds === 'number' &&
    Array.isArray(value.path) &&
    value.path.every(isRoutePathPoint)
  )
}

function isCalculatedDestination(value: unknown): value is CalculatedDestination {
  return (
    isRecord(value) &&
    typeof value.address === 'string' &&
    typeof value.lat === 'number' &&
    typeof value.lng === 'number' &&
    (typeof value.zonecode === 'string' || typeof value.zonecode === 'undefined' || value.zonecode === null) &&
    (typeof value.roadAddress === 'string' || typeof value.roadAddress === 'undefined') &&
    (typeof value.jibunAddress === 'string' || typeof value.jibunAddress === 'undefined')
  )
}

function isEmergencyRouteMetadata(value: unknown): value is EmergencyRouteMetadata {
  return (
    isRecord(value) &&
    isOptionalString(value.strategy) &&
    isOptionalString(value.warning) &&
    isOptionalString(value.legalWarning) &&
    isOptionalString(value.reason) &&
    (typeof value.confidence === 'number' || typeof value.confidence === 'undefined') &&
    (typeof value.fallbackUsed === 'boolean' || typeof value.fallbackUsed === 'undefined') &&
    isOptionalString(value.fallbackReason) &&
    isOptionalString(value.fallbackMessage) &&
    isOptionalString(value.primaryStrategy) &&
    isOptionalString(value.fallbackStrategy) &&
    (Array.isArray(value.assumptions)
      ? value.assumptions.every((item) => typeof item === 'string')
      : typeof value.assumptions === 'undefined' || value.assumptions === null)
  )
}

function normalizeEmergencyRouteMetadata(value: Record<string, unknown>): EmergencyRouteMetadata | undefined {
  if (isEmergencyRouteMetadata(value.emergencyMetadata)) {
    return value.emergencyMetadata
  }

  if (isRecord(value.emergencyRoute) && isEmergencyRouteMetadata(value.emergencyRoute.meta)) {
    return value.emergencyRoute.meta
  }

  const strategy = typeof value.emergencyStrategy === 'string' ? value.emergencyStrategy : undefined
  const warning = typeof value.emergencyWarning === 'string' ? value.emergencyWarning : undefined
  const legalWarning = typeof value.legalWarning === 'string' ? value.legalWarning : undefined
  const reason = typeof value.reason === 'string' ? value.reason : undefined
  const confidence = typeof value.confidence === 'number' ? value.confidence : undefined
  const fallbackUsed = typeof value.fallbackUsed === 'boolean' ? value.fallbackUsed : undefined
  const fallbackReason = typeof value.fallbackReason === 'string' ? value.fallbackReason : undefined
  const fallbackMessage = typeof value.fallbackMessage === 'string' ? value.fallbackMessage : undefined
  const primaryStrategy = typeof value.primaryStrategy === 'string' ? value.primaryStrategy : undefined
  const fallbackStrategy = typeof value.fallbackStrategy === 'string' ? value.fallbackStrategy : undefined
  const assumptions = Array.isArray(value.assumptions) && value.assumptions.every((item) => typeof item === 'string')
    ? value.assumptions
    : undefined

  if (
    !strategy &&
    !warning &&
    !legalWarning &&
    !reason &&
    !confidence &&
    fallbackUsed === undefined &&
    !fallbackReason &&
    !fallbackMessage &&
    !primaryStrategy &&
    !fallbackStrategy &&
    !assumptions?.length
  ) {
    return undefined
  }

  return {
    strategy,
    warning,
    legalWarning,
    reason,
    confidence,
    fallbackUsed,
    fallbackReason,
    fallbackMessage,
    primaryStrategy,
    fallbackStrategy,
    assumptions,
  }
}

function isRouteCalculationResultShape(value: unknown): value is Omit<RouteCalculationResult, 'emergencyMetadata'> & {
  emergencyMetadata?: unknown
  emergencyStrategy?: unknown
  emergencyWarning?: unknown
} {
  return (
    isRecord(value) &&
    isRouteOrigin(value.origin) &&
    isCalculatedDestination(value.destination) &&
    isCalculatedRoute(value.standardRoute) &&
    isCalculatedRoute(value.emergencyRoute)
  )
}

function normalizeRouteCalculationResult(value: unknown): RouteCalculationResult | null {
  if (!isRouteCalculationResultShape(value)) {
    return null
  }

  return {
    origin: value.origin,
    destination: value.destination,
    standardRoute: value.standardRoute,
    emergencyRoute: value.emergencyRoute,
    emergencyMetadata: normalizeEmergencyRouteMetadata(value),
  }
}

function isRouteCalculationResponse(value: unknown): value is RouteCalculationResponse {
  return (
    isRecord(value) &&
    typeof value.success === 'boolean' &&
    typeof value.code === 'string' &&
    typeof value.message === 'string' &&
    normalizeRouteCalculationResult(value.data) !== null
  )
}

export async function calculateRoute(
  request: RouteCalculationRequest,
): Promise<RouteCalculationResult> {
  const response = await fetch('/api/routes/calculate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(request),
  })

  const payload: unknown = await response.json().catch(() => null)

  if (!response.ok) {
    if (isRecord(payload) && typeof payload.message === 'string') {
      throw new Error(payload.message)
    }

    throw new Error('경로 계산에 실패했습니다.')
  }

  if (!isRouteCalculationResponse(payload)) {
    throw new Error('경로 계산 응답 형식이 올바르지 않습니다.')
  }

  if (!payload.success) {
    throw new Error(payload.message || '경로 계산에 실패했습니다.')
  }

  const normalizedResult = normalizeRouteCalculationResult(payload.data)

  if (!normalizedResult) {
    throw new Error('경로 계산 응답 형식이 올바르지 않습니다.')
  }

  return normalizedResult
}
