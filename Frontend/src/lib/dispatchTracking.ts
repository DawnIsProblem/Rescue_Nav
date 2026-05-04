import type { CalculatedRoute, EmergencyRouteMetadata } from '../api'
import type { RouteDestination, RouteMode, RouteOrigin, VehicleType } from '../store/useRouteStore'
import { supabase } from './supabase'

const DISPATCH_HISTORY_TABLE_NAME = import.meta.env.VITE_SUPABASE_DISPATCH_TABLE ?? 'dispatch_history'
const ROUTE_RESULT_TABLE_NAME = import.meta.env.VITE_SUPABASE_ROUTE_RESULT_TABLE ?? 'route_result'
const DISPATCH_STATUS_ONGOING = import.meta.env.VITE_SUPABASE_DISPATCH_STATUS_ONGOING ?? 'ONGOING'
const DISPATCH_STATUS_COMPLETED = import.meta.env.VITE_SUPABASE_DISPATCH_STATUS_COMPLETED ?? 'ARRIVED'
const DISPATCH_STATUS_CANCELED = import.meta.env.VITE_SUPABASE_DISPATCH_STATUS_CANCELED ?? 'CANCELLED'

export type DispatchCompletionReason = 'MANUAL_COMPLETED' | 'DESTINATION_REACHED' | 'USER_CANCELED'

export interface DispatchHistoryItem {
  historyId: string
  title: string
  vehicleType: VehicleType
  destinationAddress: string
  dispatchStatus: string
  createdAt: string
}

export interface DispatchHistoryPage {
  items: DispatchHistoryItem[]
  totalCount: number
  page: number
  pageSize: number
}

interface CreateDispatchRecordInput {
  origin: RouteOrigin
  destination: RouteDestination & { lat: number; lng: number }
  vehicleType: VehicleType
  activeRouteMode: RouteMode
  standardRoute: CalculatedRoute | null
  emergencyRoute: CalculatedRoute | null
  emergencyRouteMetadata: EmergencyRouteMetadata | null
  startedAt: string
}

interface FinishDispatchRecordInput {
  dispatchId: string
  completionReason: DispatchCompletionReason
}

interface SupabaseLikeError {
  message?: string
  details?: string
  hint?: string
  code?: string
}

function formatPersistError(message: string, error?: SupabaseLikeError | null): Error {
  const details = [error?.message, error?.details, error?.hint].filter(Boolean).join(' ')
  return new Error(details ? `${message} ${details}` : message)
}

function buildCompletionStatusCandidates(completionReason: DispatchCompletionReason): string[] {
  if (completionReason === 'USER_CANCELED') {
    return Array.from(new Set([DISPATCH_STATUS_CANCELED, 'CANCELLED', 'CANCELED']))
  }

  return Array.from(new Set([DISPATCH_STATUS_COMPLETED, 'ARRIVED', 'COMPLETE', 'COMPLETED', 'DONE', 'FINISHED']))
}

function normalizeDispatchId(dispatchId: string): string | number {
  const numericId = Number(dispatchId)
  return Number.isFinite(numericId) ? numericId : dispatchId
}

function formatDispatchTitle(destinationAddress: string, startedAt: string): string {
  const startedDate = new Date(startedAt)
  const titleDate = Number.isNaN(startedDate.getTime())
    ? startedAt.slice(0, 16)
    : new Intl.DateTimeFormat('ko-KR', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).format(startedDate)

  return `${titleDate} ${destinationAddress}`
}

function buildRoutePayload({
  routeType,
  route,
  origin,
  destination,
  activeRouteMode,
  emergencyRouteMetadata,
}: {
  routeType: 'STANDARD' | 'EMERGENCY'
  route: CalculatedRoute
  origin: RouteOrigin
  destination: RouteDestination & { lat: number; lng: number }
  activeRouteMode: RouteMode
  emergencyRouteMetadata: EmergencyRouteMetadata | null
}): Record<string, unknown> {
  return {
    routeType,
    selectedRouteMode: activeRouteMode,
    origin,
    destination: {
      address: destination.address,
      roadAddress: destination.roadAddress ?? null,
      jibunAddress: destination.jibunAddress ?? null,
      zonecode: destination.zonecode ?? null,
      lat: destination.lat,
      lng: destination.lng,
    },
    distanceMeters: route.distanceMeters,
    etaSeconds: route.etaSeconds,
    path: route.path,
    metadata: routeType === 'EMERGENCY' ? emergencyRouteMetadata : null,
  }
}

async function insertRouteResult({
  historyId,
  routeType,
  route,
  origin,
  destination,
  activeRouteMode,
  emergencyRouteMetadata,
}: {
  historyId: string
  routeType: 'STANDARD' | 'EMERGENCY'
  route: CalculatedRoute | null
  origin: RouteOrigin
  destination: RouteDestination & { lat: number; lng: number }
  activeRouteMode: RouteMode
  emergencyRouteMetadata: EmergencyRouteMetadata | null
}): Promise<void> {
  if (!route) {
    return
  }

  const { error } = await supabase.from(ROUTE_RESULT_TABLE_NAME).upsert(
    {
      history_id: historyId,
      route_type: routeType,
      distance_meters: Math.round(route.distanceMeters),
      eta_seconds: Math.round(route.etaSeconds),
      route_data: buildRoutePayload({
        routeType,
        route,
        origin,
        destination,
        activeRouteMode,
        emergencyRouteMetadata,
      }),
    },
    {
      onConflict: 'history_id,route_type',
    },
  )

  if (error) {
    throw formatPersistError('경로 결과 저장에 실패했습니다. Supabase route_result 설정을 확인하세요.', error)
  }
}

export async function createDispatchRecord({
  destination,
  vehicleType,
  activeRouteMode,
  origin,
  standardRoute,
  emergencyRoute,
  emergencyRouteMetadata,
  startedAt,
}: CreateDispatchRecordInput): Promise<string> {
  const { data, error } = await supabase
    .from(DISPATCH_HISTORY_TABLE_NAME)
    .insert({
      title: formatDispatchTitle(destination.address, startedAt),
      vehicle_type: vehicleType,
      destination_address: destination.address,
      destination_lat: destination.lat,
      destination_lng: destination.lng,
      dispatch_status: DISPATCH_STATUS_ONGOING,
    })
    .select('history_id')
    .single()

  if (error || !data?.history_id) {
    throw formatPersistError('출동 이력 저장에 실패했습니다. Supabase dispatch_history 설정을 확인하세요.', error)
  }

  const historyId = String(data.history_id)

  await insertRouteResult({
    historyId,
    routeType: 'STANDARD',
    route: standardRoute,
    origin,
    destination,
    activeRouteMode,
    emergencyRouteMetadata,
  })

  await insertRouteResult({
    historyId,
    routeType: 'EMERGENCY',
    route: emergencyRoute,
    origin,
    destination,
    activeRouteMode,
    emergencyRouteMetadata,
  })

  return historyId
}

export async function finishDispatchRecord({
  dispatchId,
  completionReason,
}: FinishDispatchRecordInput): Promise<void> {
  const statusCandidates = buildCompletionStatusCandidates(completionReason)
  const normalizedDispatchId = normalizeDispatchId(dispatchId)
  let lastError: SupabaseLikeError | null = null

  for (const nextStatus of statusCandidates) {
    const { error } = await supabase
      .from(DISPATCH_HISTORY_TABLE_NAME)
      .update({
        dispatch_status: nextStatus,
      })
      .eq('history_id', normalizedDispatchId)

    if (!error) {
      return
    }

    lastError = error

    if (error.code !== '22P02') {
      break
    }
  }

  if (lastError) {
    throw formatPersistError('출동 상태 업데이트에 실패했습니다. Supabase dispatch_history 설정을 확인하세요.', lastError)
  }
}

export async function fetchDispatchHistory({
  searchQuery = '',
  page = 1,
  pageSize = 10,
}: {
  searchQuery?: string
  page?: number
  pageSize?: number
} = {}): Promise<DispatchHistoryPage> {
  const normalizedPage = Number.isFinite(page) ? Math.max(1, Math.floor(page)) : 1
  const normalizedPageSize = Number.isFinite(pageSize) ? Math.max(1, Math.floor(pageSize)) : 10
  const rangeFrom = (normalizedPage - 1) * normalizedPageSize
  const rangeTo = rangeFrom + normalizedPageSize - 1
  const trimmedSearchQuery = searchQuery.trim()

  let query = supabase
    .from(DISPATCH_HISTORY_TABLE_NAME)
    .select('history_id,title,vehicle_type,destination_address,dispatch_status,created_at', {
      count: 'exact',
    })
    .order('created_at', { ascending: false })
    .range(rangeFrom, rangeTo)

  if (trimmedSearchQuery) {
    query = query.or(
      `title.ilike.%${trimmedSearchQuery}%,destination_address.ilike.%${trimmedSearchQuery}%`,
    )
  }

  const { data, error, count } = await query

  if (error) {
    throw formatPersistError('출동 이력을 불러오지 못했습니다. Supabase select 정책을 확인하세요.', error)
  }

  return {
    items: (data ?? []).map((item) => ({
      historyId: String(item.history_id),
      title: String(item.title),
      vehicleType: item.vehicle_type as VehicleType,
      destinationAddress: String(item.destination_address),
      dispatchStatus: String(item.dispatch_status),
      createdAt: String(item.created_at),
    })),
    totalCount: count ?? 0,
    page: normalizedPage,
    pageSize: normalizedPageSize,
  }
}
