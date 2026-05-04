import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { calculateRoute, type CalculatedRoute, type EmergencyRouteMetadata } from '../api'
import DashboardDestinationFinder from '../components/dashboard/DashboardDestinationFinder'
import DashboardSidebar from '../components/dashboard/DashboardSidebar'
import KakaoMap from '../components/map/KakaoMap'
import AppHeader from '../components/shared/AppHeader'
import CtaButton from '../components/shared/CtaButton'
import PageShell from '../components/shared/PageShell'
import SearchTopBar from '../components/shared/SearchTopBar'
import { VEHICLE_TYPE_OPTIONS, getVehicleTypeOption } from '../constants/vehicleTypes'
import useCurrentLocation from '../hooks/useCurrentLocation'
import { type AppLanguage, useAppLanguage } from '../lib/appLanguage'
import { createDispatchRecord, fetchDispatchHistory, finishDispatchRecord } from '../lib/dispatchTracking'
import {
  useRouteStore,
  type RouteDestination,
  type RouteMode,
  type RouteOrigin,
  type VehicleType,
} from '../store/useRouteStore'

type DashboardView = 'dashboard' | 'history'
type DispatchStatus = 'IDLE' | 'ACTIVE'
type DispatchMutationState = 'IDLE' | 'STARTING' | 'COMPLETING' | 'CANCELING'

interface HistoryRecord {
  id: string
  title: string
  vehicleType: VehicleType
  destinationAddress: string
  dispatchStatus: string
  createdAt: string
}

interface DashboardContentProps {
  language: AppLanguage
  origin: RouteOrigin | null
  destination: RouteDestination | null
  vehicleType: VehicleType
  standardRoute: CalculatedRoute | null
  emergencyRoute: CalculatedRoute | null
  emergencyRouteMetadata: EmergencyRouteMetadata | null
  activeRouteMode: RouteMode
  isCalculatingRoute: boolean
  routeError: string | null
  isRefreshingOrigin: boolean
  dispatchStatus: DispatchStatus
  isDispatchActionPending: boolean
  isInputsLocked: boolean
  onChangeVehicleType: (vehicleType: VehicleType) => void
  onChangeRouteMode: (mode: RouteMode) => void
  onRefreshOrigin: () => void
  onCalculateRoute: () => void
  onStartDispatch: () => void
  onCompleteDispatch: () => void
  onCancelDispatch: () => void
}

interface HistoryContentProps {
  language: AppLanguage
  records: HistoryRecord[]
  isLoading: boolean
  error: string | null
  searchQuery: string
  onSearchQueryChange: (value: string) => void
  onClearSearchQuery: () => void
  currentPage: number
  pageSize: number
  totalCount: number
  onChangePage: (page: number) => void
}

interface ViewToggleProps {
  currentView: DashboardView
  onChangeView: (view: DashboardView) => void
  className?: string
}

function parseView(value: string | null): DashboardView {
  return value === 'dashboard' ? 'dashboard' : 'history'
}

function getIsMobileViewport(): boolean {
  if (typeof window === 'undefined') {
    return false
  }

  return window.innerWidth < 768
}

const AUTO_COMPLETE_DISTANCE_METERS = 100
const HISTORY_PAGE_SIZE = 10

function toRadians(value: number): number {
  return (value * Math.PI) / 180
}

function getDistanceMeters(from: RouteOrigin, to: RouteOrigin): number {
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

function formatCoordinate(value?: number): string {
  return typeof value === 'number' ? value.toFixed(6) : '-'
}

function formatEta(etaSeconds: number): string {
  const minutes = Math.floor(etaSeconds / 60)
  const seconds = etaSeconds % 60

  if (minutes > 0 && seconds > 0) {
    return `${minutes}분 ${seconds}초`
  }

  if (minutes > 0) {
    return `${minutes}분`
  }

  return `${seconds}초`
}

function formatDistance(distanceMeters: number): string {
  return `${(distanceMeters / 1000).toFixed(2)} km`
}

function formatConfidence(confidence?: number): string {
  if (typeof confidence !== 'number') {
    return '-'
  }

  return `${Math.round(confidence * 100)}%`
}

function formatHistoryDate(value: string): string {
  const parsedDate = new Date(value)

  if (Number.isNaN(parsedDate.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(parsedDate)
}

function getDispatchStatusLabel(status: string, language: AppLanguage): string {
  switch (status) {
    case 'ONGOING':
      return language === 'ko' ? '출동 중' : 'Active'
    case 'ARRIVED':
    case 'COMPLETE':
    case 'COMPLETED':
    case 'DONE':
    case 'FINISHED':
      return language === 'ko' ? '출동 완료' : 'Completed'
    case 'CANCELLED':
    case 'CANCELED':
      return language === 'ko' ? '출동 취소' : 'Canceled'
    default:
      return status
  }
}

function getRouteLabel(mode: RouteMode, language: AppLanguage): string {
  if (language === 'ko') {
    return mode === 'EMERGENCY' ? '긴급 경로' : '일반 경로'
  }

  return mode === 'EMERGENCY' ? 'Emergency Route' : 'Standard Route'
}

function getComparisonRouteMode(activeRouteMode: RouteMode): RouteMode {
  return activeRouteMode === 'EMERGENCY' ? 'STANDARD' : 'EMERGENCY'
}

function getRouteByMode(
  mode: RouteMode,
  standardRoute: CalculatedRoute | null,
  emergencyRoute: CalculatedRoute | null,
): CalculatedRoute | null {
  return mode === 'EMERGENCY' ? emergencyRoute : standardRoute
}

function buildVisiblePageNumbers(currentPage: number, totalPages: number): number[] {
  const maxVisiblePages = 5
  const startPage = Math.max(1, currentPage - 2)
  const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)
  const adjustedStartPage = Math.max(1, endPage - maxVisiblePages + 1)
  const pageNumbers: number[] = []

  for (let page = adjustedStartPage; page <= endPage; page += 1) {
    pageNumbers.push(page)
  }

  return pageNumbers
}

function ViewToggle({ currentView, onChangeView, className, language }: ViewToggleProps & { language: AppLanguage }) {
  return (
    <div className={['inline-flex rounded-xl border border-zinc-200 bg-white p-1', className ?? ''].join(' ')}>
      <button
        onClick={() => onChangeView('dashboard')}
        className={[
          'rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-wide transition',
          currentView === 'dashboard' ? 'bg-red-600 text-white' : 'text-zinc-500 hover:bg-zinc-100',
        ].join(' ')}
      >
        {language === 'ko' ? '대시보드' : 'Dashboard'}
      </button>
      <button
        onClick={() => onChangeView('history')}
        className={[
          'rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-wide transition',
          currentView === 'history' ? 'bg-red-600 text-white' : 'text-zinc-500 hover:bg-zinc-100',
        ].join(' ')}
      >
        {language === 'ko' ? '이력' : 'History'}
      </button>
    </div>
  )
}

function RouteModeToggle({
  activeRouteMode,
  onChangeRouteMode,
  disabled,
  language,
}: {
  activeRouteMode: RouteMode
  onChangeRouteMode: (mode: RouteMode) => void
  disabled: boolean
  language: AppLanguage
}) {
  return (
    <div className="inline-flex rounded-xl border border-zinc-200 bg-zinc-100 p-1">
      {(['EMERGENCY', 'STANDARD'] as const).map((mode) => (
        <button
          key={mode}
          type="button"
          onClick={() => onChangeRouteMode(mode)}
          disabled={disabled}
          className={[
            'rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-wide transition',
            activeRouteMode === mode
              ? mode === 'EMERGENCY'
                ? 'bg-red-600 text-white shadow-sm'
                : 'bg-zinc-900 text-white shadow-sm'
              : 'text-zinc-500 hover:bg-white',
            disabled ? 'cursor-not-allowed opacity-60' : '',
          ].join(' ')}
        >
          {getRouteLabel(mode, language)}
        </button>
      ))}
    </div>
  )
}

function HistoryPagination({
  currentPage,
  pageSize,
  totalCount,
  onChangePage,
  language,
}: {
  currentPage: number
  pageSize: number
  totalCount: number
  onChangePage: (page: number) => void
  language: AppLanguage
}) {
  if (totalCount <= 0) {
    return null
  }

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))
  const rangeStart = (currentPage - 1) * pageSize + 1
  const rangeEnd = Math.min(totalCount, currentPage * pageSize)
  const visiblePageNumbers = buildVisiblePageNumbers(currentPage, totalPages)

  return (
    <div className="mt-6 flex flex-col gap-3 border-t border-zinc-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs font-semibold text-zinc-400">
        {language === 'ko'
          ? `총 ${totalCount}건 중 ${rangeStart}-${rangeEnd}건 표시`
          : `Showing ${rangeStart}-${rangeEnd} of ${totalCount}`}
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => onChangePage(currentPage - 1)}
          disabled={currentPage <= 1}
          className={[
            'rounded-md border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-600 transition',
            currentPage <= 1 ? 'cursor-not-allowed opacity-60' : 'hover:bg-zinc-50',
          ].join(' ')}
        >
          {language === 'ko' ? '이전' : 'Prev'}
        </button>

        {visiblePageNumbers.map((pageNumber) => (
          <button
            key={pageNumber}
            type="button"
            onClick={() => onChangePage(pageNumber)}
            className={[
              'h-9 min-w-9 rounded-md border px-3 text-xs font-bold transition',
              currentPage === pageNumber
                ? 'border-red-600 bg-red-600 text-white'
                : 'border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50',
            ].join(' ')}
          >
            {pageNumber}
          </button>
        ))}

        <button
          type="button"
          onClick={() => onChangePage(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className={[
            'rounded-md border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-600 transition',
            currentPage >= totalPages ? 'cursor-not-allowed opacity-60' : 'hover:bg-zinc-50',
          ].join(' ')}
        >
          {language === 'ko' ? '다음' : 'Next'}
        </button>
      </div>
    </div>
  )
}

function VehicleTypeToggle({
  language,
  vehicleType,
  onChangeVehicleType,
  disabled,
}: {
  language: AppLanguage
  vehicleType: VehicleType
  onChangeVehicleType: (vehicleType: VehicleType) => void
  disabled: boolean
}) {
  const selectedOption = getVehicleTypeOption(vehicleType)
  const getVehicleOptionLabel = (optionValue: VehicleType): string => {
    if (language === 'ko') {
      return optionValue === 'FIRE_TRUCK' ? '소방차' : '구급차'
    }

    return optionValue === 'FIRE_TRUCK' ? 'Fire Engine' : 'Ambulance'
  }
  const selectedDescription = language === 'ko'
    ? selectedOption.description
    : vehicleType === 'FIRE_TRUCK'
      ? 'Larger vehicle profile with turning and road constraints considered'
      : 'Smaller vehicle profile with faster access prioritized'

  return (
    <div className="space-y-3">
      <div className="inline-flex rounded-xl border border-zinc-200 bg-zinc-100 p-1">
        {VEHICLE_TYPE_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChangeVehicleType(option.value)}
            disabled={disabled}
            className={[
              'rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-wide transition',
              vehicleType === option.value ? 'bg-red-600 text-white shadow-sm' : 'text-zinc-500 hover:bg-white',
              disabled ? 'cursor-not-allowed opacity-60' : '',
            ].join(' ')}
          >
            {getVehicleOptionLabel(option.value)}
          </button>
        ))}
      </div>

      <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2">
        <p className="text-xs font-bold uppercase tracking-wide text-zinc-400">
          {language === 'ko' ? '선택 차량' : 'Selected Vehicle'}
        </p>
        <p className="mt-1 text-sm text-zinc-600">{selectedDescription}</p>
      </div>
    </div>
  )
}

function RouteSummarySection({
  title,
  language,
  routeMode,
  route,
  metadata,
}: {
  title: string
  language: AppLanguage
  routeMode: RouteMode
  route: CalculatedRoute | null
  metadata: EmergencyRouteMetadata | null
}) {
  const isEmergency = routeMode === 'EMERGENCY'

  return (
    <article
      className={[
        'rounded-lg border p-4',
        isEmergency ? 'border-red-200 bg-red-50' : 'border-zinc-200 bg-zinc-50',
      ].join(' ')}
    >
      <div className="flex items-center justify-between gap-3">
        <p className={['text-xs font-bold uppercase tracking-wide', isEmergency ? 'text-red-600' : 'text-zinc-500'].join(' ')}>
          {title}
        </p>
        <span
          className={[
            'rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide',
            isEmergency ? 'bg-white text-red-600' : 'bg-white text-zinc-600',
          ].join(' ')}
        >
          {getRouteLabel(routeMode, language)}
        </span>
      </div>

      {route ? (
        <div className="mt-2 space-y-2 text-sm text-zinc-800">
          <p>
            <span className="font-semibold">{language === 'ko' ? '예상 소요 시간 : ' : 'ETA: '}</span>
            {formatEta(route.etaSeconds)}
          </p>
          <p>
            <span className="font-semibold">{language === 'ko' ? '거리 : ' : 'Distance: '}</span>
            {formatDistance(route.distanceMeters)}
          </p>
          <p>
            <span className="font-semibold">{language === 'ko' ? '경로 포인트 수 : ' : 'Route points: '}</span>
            {route.path.length}
          </p>
          {isEmergency && metadata?.strategy ? (
            <p>
              <span className="font-semibold">{language === 'ko' ? '전략 : ' : 'Strategy: '}</span>
              {metadata.strategy}
            </p>
          ) : null}
          {isEmergency && metadata?.confidence !== undefined ? (
            <p>
              <span className="font-semibold">{language === 'ko' ? '신뢰도 : ' : 'Confidence: '}</span>
              {formatConfidence(metadata.confidence)}
            </p>
          ) : null}
          {isEmergency && metadata?.reason ? (
            <p>
              <span className="font-semibold">{language === 'ko' ? '선정 사유 : ' : 'Reason: '}</span>
              {metadata.reason}
            </p>
          ) : null}
          {isEmergency && metadata?.fallbackUsed ? (
            <div className="rounded-md border border-orange-200 bg-orange-50 px-3 py-2 text-xs text-orange-800">
              <p className="font-semibold">{language === 'ko' ? 'Fallback 사용' : 'Fallback Used'}</p>
              <p className="mt-1">
                {metadata.primaryStrategy ?? 'PRIMARY'} → {metadata.fallbackStrategy ?? metadata.strategy ?? 'FALLBACK'}
              </p>
              {metadata.fallbackReason ? <p className="mt-1">{language === 'ko' ? '사유' : 'Reason'} : {metadata.fallbackReason}</p> : null}
              {metadata.fallbackMessage ? <p className="mt-1">{metadata.fallbackMessage}</p> : null}
            </div>
          ) : null}
          {isEmergency && metadata?.warning ? (
            <p className="rounded-md border border-red-200 bg-white/80 px-3 py-2 text-xs font-medium text-red-700">
              {metadata.warning}
            </p>
          ) : null}
          {isEmergency && metadata?.legalWarning ? (
            <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">
              {metadata.legalWarning}
            </p>
          ) : null}
          {isEmergency && metadata?.assumptions?.length ? (
            <div className="rounded-md border border-zinc-200 bg-white/80 px-3 py-2 text-xs text-zinc-700">
              <p className="font-semibold text-zinc-800">{language === 'ko' ? '가정' : 'Assumptions'}</p>
              <ul className="mt-2 list-disc space-y-1 pl-4">
                {metadata.assumptions.map((assumption) => (
                  <li key={assumption}>{assumption}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="mt-2 text-sm text-zinc-500">
          {language === 'ko'
            ? `아직 ${getRouteLabel(routeMode, language)}가 계산되지 않았습니다. 목적지를 선택한 뒤 경로 탐색을 눌러주세요.`
            : `${getRouteLabel(routeMode, language)} has not been calculated yet. Select a destination and start route calculation.`}
        </div>
      )}

      {isEmergency ? (
        <div className="mt-3 rounded-md border border-red-200 bg-white/80 px-3 py-2 text-xs font-semibold text-red-700">
          {language === 'ko'
            ? '긴급 출동용 추천 경로입니다. 최종 판단은 현장 상황을 우선하세요.'
            : 'Recommended route for emergency dispatch. Final judgment should prioritize field conditions.'}
        </div>
      ) : null}
    </article>
  )
}

function DesktopTabletDashboardContent({
  language,
  origin,
  destination,
  vehicleType,
  standardRoute,
  emergencyRoute,
  emergencyRouteMetadata,
  activeRouteMode,
  isCalculatingRoute,
  routeError,
  isRefreshingOrigin,
  dispatchStatus,
  isDispatchActionPending,
  isInputsLocked,
  onChangeVehicleType,
  onChangeRouteMode,
  onRefreshOrigin,
  onCalculateRoute,
  onStartDispatch,
  onCompleteDispatch,
  onCancelDispatch,
}: DashboardContentProps) {
  const activeRoute = getRouteByMode(activeRouteMode, standardRoute, emergencyRoute)
  const comparisonRouteMode = getComparisonRouteMode(activeRouteMode)
  const comparisonRoute = getRouteByMode(comparisonRouteMode, standardRoute, emergencyRoute)
  const hasAnyRoute = Boolean(standardRoute || emergencyRoute)
  const isDispatchActive = dispatchStatus === 'ACTIVE'
  const copy = language === 'ko'
    ? {
        title: '대시보드',
        description: '여기에서 목적지 주소를 찾은 뒤 경로 계산을 요청하세요.',
        vehicleType: '차량 종류',
        vehicleTypeDescription: '경로 계산 전에 출동 차량을 선택하세요.',
        origin: '출발 위치',
        refreshOrigin: '현재 위치 찾기',
        refreshingOrigin: '위치 확인 중...',
        dispatchLocked: '출동 중 잠김',
        notSet: '설정되지 않음',
        destination: '목적지',
        roadAddress: '도로명주소 : ',
        jibunAddress: '지번주소 : ',
        destinationDetail: '목적지 상세',
        latitude: '위도 : ',
        longitude: '경도 : ',
        zonecode: '우편번호 : ',
        routeMode: '경로 모드',
        routeModeDescription: '경로 계산 후에는 긴급 경로가 기본 선택됩니다.',
        dispatchStatus: '출동 상태',
        activeDispatch: '출동이 진행 중입니다. 목적지 100m 이내에 진입하면 자동으로 완료됩니다.',
        routeReady: '경로가 준비되었습니다. 출동 시작을 누르면 출동 이력과 경로 결과가 저장됩니다.',
        needRoute: '경로 탐색을 먼저 완료한 뒤 출동을 시작할 수 있습니다.',
        currentRoute: '현재 선택 경로',
        comparisonRoute: '비교 경로',
        complete: '출동 완료',
        cancel: '출동 취소',
        processing: '처리 중...',
        calculate: '경로 탐색',
        calculating: '경로 계산 중...',
        startDispatch: '출동 시작',
        originHint: '현재 위치를 확인하면 출발 위치가 자동으로 저장됩니다.',
      }
    : {
        title: 'Dashboard',
        description: 'Find the destination address here and request route calculation.',
        vehicleType: 'Vehicle Type',
        vehicleTypeDescription: 'Choose the dispatch vehicle before calculating a route.',
        origin: 'Origin',
        refreshOrigin: 'Find Current Location',
        refreshingOrigin: 'Checking location...',
        dispatchLocked: 'Locked during dispatch',
        notSet: 'Not set',
        destination: 'Destination',
        roadAddress: 'Road address: ',
        jibunAddress: 'Parcel address: ',
        destinationDetail: 'Destination Details',
        latitude: 'Latitude: ',
        longitude: 'Longitude: ',
        zonecode: 'Postal code: ',
        routeMode: 'Route Mode',
        routeModeDescription: 'The emergency route is selected by default after route calculation.',
        dispatchStatus: 'Dispatch Status',
        activeDispatch: 'Dispatch is in progress. It will be completed automatically within 100 meters of the destination.',
        routeReady: 'Routes are ready. Starting dispatch saves the dispatch history and route results.',
        needRoute: 'Complete route calculation before starting dispatch.',
        currentRoute: 'Selected Route',
        comparisonRoute: 'Comparison Route',
        complete: 'Complete Dispatch',
        cancel: 'Cancel Dispatch',
        processing: 'Processing...',
        calculate: 'Calculate Route',
        calculating: 'Calculating...',
        startDispatch: 'Start Dispatch',
        originHint: 'Once current location is confirmed, it is saved automatically as the origin.',
      }

  return (
    <section className="flex-1 p-3 lg:p-4">
      <div className="grid gap-4 lg:h-[calc(100vh-126px)] lg:min-h-[560px] lg:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]">
        <article className="min-h-[360px] overflow-hidden rounded-xl border border-zinc-200 bg-white lg:min-h-0">
          <KakaoMap className="h-full w-full" />
        </article>

        <article className="overflow-y-auto rounded-xl border border-dashed border-zinc-300 bg-white p-6 lg:h-full">
          <h1 className="text-3xl font-bold text-zinc-900">{copy.title}</h1>
          <p className="mt-2 text-sm text-zinc-500">
            {copy.description}
          </p>

          <DashboardDestinationFinder className="mt-6" disabled={isInputsLocked} />

          <article className="mt-6 rounded-lg border border-zinc-200 bg-white p-4">
            <div className="flex flex-col gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-zinc-400">{copy.vehicleType}</p>
                <p className="mt-1 text-sm text-zinc-500">{copy.vehicleTypeDescription}</p>
              </div>
              <VehicleTypeToggle
                language={language}
                vehicleType={vehicleType}
                onChangeVehicleType={onChangeVehicleType}
                disabled={isInputsLocked}
              />
            </div>
          </article>

          {origin || destination ? (
            <div className="mt-6 grid gap-3">
              <article className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-xs font-bold uppercase tracking-wide text-zinc-400">{copy.origin}</p>
                  <button
                    type="button"
                    onClick={onRefreshOrigin}
                    disabled={isRefreshingOrigin || isInputsLocked}
                    className={[
                      'shrink-0 rounded-full border border-zinc-200 bg-white px-3 py-1 text-[11px] font-bold tracking-wide text-zinc-600 transition hover:border-zinc-300 hover:bg-zinc-100',
                      isRefreshingOrigin || isInputsLocked ? 'cursor-not-allowed opacity-70' : '',
                    ].join(' ')}
                  >
                    {isDispatchActive ? copy.dispatchLocked : isRefreshingOrigin ? copy.refreshingOrigin : copy.refreshOrigin}
                  </button>
                </div>
                <p className="mt-1 text-sm font-semibold text-zinc-800">
                  {origin ? `${origin.lat.toFixed(6)}, ${origin.lng.toFixed(6)}` : copy.notSet}
                </p>
              </article>

              <article className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-zinc-400">{copy.destination}</p>
                {destination ? (
                  <div className="mt-1 space-y-2 text-sm text-zinc-800">
                    <p>
                      <span className="font-semibold">{copy.roadAddress}</span>
                      {destination.roadAddress ?? destination.address}
                    </p>
                    <p>
                      <span className="font-semibold">{copy.jibunAddress}</span>
                      {destination.jibunAddress ?? (language === 'ko' ? '-' : '-')}
                    </p>
                  </div>
                ) : (
                  <p className="mt-1 text-sm font-semibold text-zinc-800">{copy.notSet}</p>
                )}
              </article>

              {destination ? (
                <article className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-zinc-400">{copy.destinationDetail}</p>
                  <div className="mt-1 space-y-2 text-sm text-zinc-800">
                    <p>
                      <span className="font-semibold">{copy.latitude}</span>
                      {formatCoordinate(destination.lat)}
                    </p>
                    <p>
                      <span className="font-semibold">{copy.longitude}</span>
                      {formatCoordinate(destination.lng)}
                    </p>
                    <p>
                      <span className="font-semibold">{copy.zonecode}</span>
                      {destination.zonecode ?? '-'}
                    </p>
                  </div>
                </article>
              ) : null}

              <article className="rounded-lg border border-zinc-200 bg-white p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-zinc-400">{copy.routeMode}</p>
                    <p className="mt-1 text-sm text-zinc-500">{copy.routeModeDescription}</p>
                  </div>
                  <RouteModeToggle
                    activeRouteMode={activeRouteMode}
                    onChangeRouteMode={onChangeRouteMode}
                    disabled={!hasAnyRoute || isInputsLocked}
                    language={language}
                  />
                </div>
              </article>

              <article
                className={[
                  'rounded-lg border p-4',
                  isDispatchActive ? 'border-emerald-200 bg-emerald-50' : 'border-zinc-200 bg-zinc-50',
                ].join(' ')}
              >
                <p
                  className={[
                    'text-xs font-bold uppercase tracking-wide',
                    isDispatchActive ? 'text-emerald-600' : 'text-zinc-400',
                  ].join(' ')}
                >
                  {copy.dispatchStatus}
                </p>
                <p className="mt-2 text-sm font-semibold text-zinc-800">
                  {isDispatchActive
                    ? copy.activeDispatch
                    : hasAnyRoute
                      ? copy.routeReady
                      : copy.needRoute}
                </p>
              </article>

              <RouteSummarySection
                title={copy.currentRoute}
                language={language}
                routeMode={activeRouteMode}
                route={activeRoute}
                metadata={activeRouteMode === 'EMERGENCY' ? emergencyRouteMetadata : null}
              />

              <RouteSummarySection
                title={copy.comparisonRoute}
                language={language}
                routeMode={comparisonRouteMode}
                route={comparisonRoute}
                metadata={comparisonRouteMode === 'EMERGENCY' ? emergencyRouteMetadata : null}
              />
            </div>
          ) : (
            <div className="mt-6 rounded-lg border border-zinc-200 bg-zinc-50 p-5 text-sm text-zinc-500">
              {copy.originHint}
            </div>
          )}

          {routeError ? (
            <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
              {routeError}
            </div>
          ) : null}

          {isDispatchActive ? (
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <CtaButton
                onClick={onCompleteDispatch}
                disabled={isDispatchActionPending}
                className={[
                  'w-full px-4 py-3 text-sm uppercase tracking-wide',
                  isDispatchActionPending ? 'cursor-not-allowed opacity-70' : '',
                ].join(' ')}
              >
                {isDispatchActionPending ? copy.processing : copy.complete}
              </CtaButton>
              <CtaButton
                onClick={onCancelDispatch}
                disabled={isDispatchActionPending}
                variant="neutral"
                className={[
                  'w-full px-4 py-3 text-sm uppercase tracking-wide',
                  isDispatchActionPending ? 'cursor-not-allowed opacity-70' : '',
                ].join(' ')}
              >
                {isDispatchActionPending ? copy.processing : copy.cancel}
              </CtaButton>
            </div>
          ) : (
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <CtaButton
                onClick={onCalculateRoute}
                disabled={!origin || !destination || isCalculatingRoute || isDispatchActionPending}
                className={[
                  'w-full px-4 py-3 text-sm uppercase tracking-wide',
                  !origin || !destination || isCalculatingRoute || isDispatchActionPending ? 'cursor-not-allowed opacity-70' : '',
                ].join(' ')}
              >
                {isCalculatingRoute ? copy.calculating : copy.calculate}
              </CtaButton>
              <CtaButton
                onClick={onStartDispatch}
                disabled={!hasAnyRoute || !origin || !destination || isDispatchActionPending}
                variant="light"
                className={[
                  'w-full border border-zinc-200 px-4 py-3 text-sm uppercase tracking-wide',
                  !hasAnyRoute || !origin || !destination || isDispatchActionPending ? 'cursor-not-allowed opacity-70' : '',
                ].join(' ')}
              >
                {isDispatchActionPending ? copy.processing : copy.startDispatch}
              </CtaButton>
            </div>
          )}
        </article>
      </div>
    </section>
  )
}

function MobileDashboardContent({
  language,
  origin,
  destination,
  vehicleType,
  standardRoute,
  emergencyRoute,
  emergencyRouteMetadata,
  activeRouteMode,
  isCalculatingRoute,
  routeError,
  isRefreshingOrigin,
  dispatchStatus,
  isDispatchActionPending,
  isInputsLocked,
  onChangeVehicleType,
  onChangeRouteMode,
  onRefreshOrigin,
  onCalculateRoute,
  onStartDispatch,
  onCompleteDispatch,
  onCancelDispatch,
}: DashboardContentProps) {
  const activeRoute = getRouteByMode(activeRouteMode, standardRoute, emergencyRoute)
  const comparisonRouteMode = getComparisonRouteMode(activeRouteMode)
  const comparisonRoute = getRouteByMode(comparisonRouteMode, standardRoute, emergencyRoute)
  const hasAnyRoute = Boolean(standardRoute || emergencyRoute)
  const isDispatchActive = dispatchStatus === 'ACTIVE'
  const currentRouteMetadata = activeRouteMode === 'EMERGENCY' ? emergencyRouteMetadata : null
  const comparisonRouteMetadata = comparisonRouteMode === 'EMERGENCY' ? emergencyRouteMetadata : null
  const [isDestinationDetailOpen, setIsDestinationDetailOpen] = useState(false)
  const [isComparisonRouteOpen, setIsComparisonRouteOpen] = useState(false)
  const [isFallbackDetailOpen, setIsFallbackDetailOpen] = useState(false)
  const copy = language === 'ko'
    ? {
        title: '대시보드',
        description: '경로 계산을 요청하기 전에 목적지 주소를 선택하세요.',
        vehicleType: '차량 종류',
        originHint: '현재 위치는 자동으로 출발 위치로 저장됩니다.',
        origin: '출발 위치',
        originDescription: '현재 위치 확인 버튼으로 출발 좌표를 다시 갱신할 수 있습니다.',
        refreshOrigin: '현재 위치 찾기',
        refreshingOrigin: '확인 중...',
        dispatchLocked: '출동 중 잠김',
        notSet: '설정되지 않음',
        destination: '목적지',
        destinationDescription: '검색된 목적지 주소를 먼저 확인하세요.',
        destinationNotSet: '목적지가 아직 선택되지 않았습니다.',
        roadAddress: '도로명주소 : ',
        jibunAddress: '지번주소 : ',
        destinationDetail: '목적지 상세',
        destinationDetailDescription: '좌표와 우편번호는 필요할 때만 확인합니다.',
        showDetail: '상세 열기',
        hideDetail: '상세 닫기',
        latitude: '위도 : ',
        longitude: '경도 : ',
        zonecode: '우편번호 : ',
        routeMode: '경로 모드',
        routeModeDescription: '경로 계산 후에는 긴급 경로가 기본 선택됩니다.',
        currentRoute: '현재 선택 경로',
        currentRouteDescription: '모바일에서는 핵심 정보만 먼저 표시합니다.',
        routePending: '아직 선택된 경로가 없습니다. 목적지 선택 후 경로 탐색을 진행하세요.',
        eta: '예상 소요 시간',
        distance: '거리',
        strategy: '전략',
        confidence: '신뢰도',
        recommendation: '긴급 출동용 추천 경로입니다. 최종 판단은 현장 상황을 우선하세요.',
        comparisonRoute: '비교 경로',
        comparisonRouteClosed: '보조 경로 정보는 접힌 상태로 제공합니다.',
        noComparison: '비교할 경로가 아직 없습니다.',
        fallbackDetail: 'Fallback 상세',
        fallbackDetailClosed: 'fallback 사유와 경고 문구를 접은 상태로 유지합니다.',
        fallbackUsed: 'Fallback 사용 중',
        fallbackReason: '사유',
        dispatchStatus: '출동 상태',
        activeDispatch: '출동 진행 중입니다. 목적지 반경 100m 안에 들어오면 자동으로 완료됩니다.',
        routeReady: '경로가 준비되었습니다. 출동을 시작하면 출동 이력과 경로 결과가 저장됩니다.',
        needRoute: '경로 탐색을 완료해야 출동을 시작할 수 있습니다.',
        actionArea: '출동 액션',
        actionDescription: '경로 확인 후 바로 출동을 시작하거나 상태를 종료할 수 있습니다.',
        processing: '처리 중...',
        complete: '출동 완료',
        cancel: '출동 취소',
        calculate: '경로 탐색',
        calculating: '경로 계산 중...',
        startDispatch: '출동 시작',
      }
    : {
        title: 'Dashboard',
        description: 'Select the destination address before requesting route calculation.',
        vehicleType: 'Vehicle Type',
        originHint: 'Current location is saved automatically as the origin.',
        origin: 'Origin',
        originDescription: 'You can refresh the origin coordinates with the current location button.',
        refreshOrigin: 'Find Current Location',
        refreshingOrigin: 'Checking...',
        dispatchLocked: 'Locked during dispatch',
        notSet: 'Not set',
        destination: 'Destination',
        destinationDescription: 'Review the searched destination before calculating a route.',
        destinationNotSet: 'No destination has been selected yet.',
        roadAddress: 'Road address: ',
        jibunAddress: 'Parcel address: ',
        destinationDetail: 'Destination Details',
        destinationDetailDescription: 'Coordinates and postal code stay collapsed by default.',
        showDetail: 'Show Details',
        hideDetail: 'Hide Details',
        latitude: 'Latitude: ',
        longitude: 'Longitude: ',
        zonecode: 'Postal code: ',
        routeMode: 'Route Mode',
        routeModeDescription: 'The emergency route is selected by default after route calculation.',
        currentRoute: 'Selected Route',
        currentRouteDescription: 'Only the most important route metrics are shown first on mobile.',
        routePending: 'No active route is selected yet. Choose a destination and calculate a route first.',
        eta: 'ETA',
        distance: 'Distance',
        strategy: 'Strategy',
        confidence: 'Confidence',
        recommendation: 'Recommended route for emergency dispatch. Final judgment should prioritize field conditions.',
        comparisonRoute: 'Comparison Route',
        comparisonRouteClosed: 'Secondary route information stays collapsed until needed.',
        noComparison: 'There is no comparison route yet.',
        fallbackDetail: 'Fallback Details',
        fallbackDetailClosed: 'Fallback reason and warnings stay folded by default.',
        fallbackUsed: 'Fallback Active',
        fallbackReason: 'Reason',
        dispatchStatus: 'Dispatch Status',
        activeDispatch: 'Dispatch is in progress. It will complete automatically within 100 meters of the destination.',
        routeReady: 'Routes are ready. Starting dispatch saves the history and route result.',
        needRoute: 'You must complete route calculation before starting dispatch.',
        actionArea: 'Dispatch Actions',
        actionDescription: 'Start dispatch or finish the current status after reviewing the route.',
        processing: 'Processing...',
        complete: 'Complete Dispatch',
        cancel: 'Cancel Dispatch',
        calculate: 'Calculate Route',
        calculating: 'Calculating...',
        startDispatch: 'Start Dispatch',
      }

  const currentRouteTagClass = activeRouteMode === 'EMERGENCY'
    ? 'bg-red-50 text-red-700'
    : 'bg-zinc-100 text-zinc-700'

  const comparisonRouteTagClass = comparisonRouteMode === 'EMERGENCY'
    ? 'bg-red-50 text-red-700'
    : 'bg-zinc-100 text-zinc-700'

  return (
    <section className="px-5 pb-8 pt-5">
      <h1 className="text-4xl font-bold tracking-tight text-zinc-900">{copy.title}</h1>
      <p className="mt-2 text-sm text-zinc-500">{copy.description}</p>

      <article className="mt-4 h-[46vh] min-h-[280px] overflow-hidden rounded-xl border border-zinc-200 bg-white">
        <KakaoMap className="h-full w-full" />
      </article>

      <div className="mt-4 space-y-4">
        <article className="rounded-xl border border-dashed border-zinc-300 bg-white p-4">
          <DashboardDestinationFinder compact disabled={isInputsLocked} />
        </article>

        <article className="rounded-xl border border-zinc-200 bg-white p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-zinc-400">{copy.vehicleType}</p>
          <div className="mt-3">
            <VehicleTypeToggle
              language={language}
              vehicleType={vehicleType}
              onChangeVehicleType={onChangeVehicleType}
              disabled={isInputsLocked}
            />
          </div>
        </article>

        <article className="rounded-xl border border-zinc-200 bg-white p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-zinc-400">{copy.origin}</p>
              <p className="mt-1 text-xs text-zinc-500">{copy.originDescription}</p>
            </div>
            <button
              type="button"
              onClick={onRefreshOrigin}
              disabled={isRefreshingOrigin || isInputsLocked}
              className={[
                'shrink-0 rounded-full border border-zinc-200 bg-white px-3 py-1 text-[11px] font-bold tracking-wide text-zinc-600 transition hover:border-zinc-300 hover:bg-zinc-100',
                isRefreshingOrigin || isInputsLocked ? 'cursor-not-allowed opacity-70' : '',
              ].join(' ')}
            >
              {isDispatchActive ? copy.dispatchLocked : isRefreshingOrigin ? copy.refreshingOrigin : copy.refreshOrigin}
            </button>
          </div>
          <p className="mt-3 text-sm font-semibold text-zinc-800">
            {origin ? `${origin.lat.toFixed(6)}, ${origin.lng.toFixed(6)}` : copy.originHint}
          </p>
        </article>

        <article className="rounded-xl border border-zinc-200 bg-white p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-zinc-400">{copy.destination}</p>
          <p className="mt-1 text-xs text-zinc-500">{copy.destinationDescription}</p>
          {destination ? (
            <div className="mt-3 space-y-2 text-sm text-zinc-800">
              <p>
                <span className="font-semibold">{copy.roadAddress}</span>
                {destination.roadAddress ?? destination.address}
              </p>
              <p>
                <span className="font-semibold">{copy.jibunAddress}</span>
                {destination.jibunAddress ?? '-'}
              </p>
            </div>
          ) : (
            <p className="mt-3 text-sm font-semibold text-zinc-700">{copy.destinationNotSet}</p>
          )}
        </article>

        <article className="rounded-xl border border-zinc-200 bg-white p-4">
          <button
            type="button"
            onClick={() => setIsDestinationDetailOpen((current) => !current)}
            className="flex w-full items-center justify-between gap-3 text-left"
          >
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-zinc-400">{copy.destinationDetail}</p>
              <p className="mt-1 text-xs text-zinc-500">{copy.destinationDetailDescription}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wide text-zinc-500">
                {isDestinationDetailOpen ? copy.hideDetail : copy.showDetail}
              </span>
              <svg
                aria-hidden="true"
                viewBox="0 0 20 20"
                className={['h-4 w-4 text-zinc-500 transition-transform', isDestinationDetailOpen ? 'rotate-180' : 'rotate-0'].join(' ')}
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path d="M5 7.5 10 12.5 15 7.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </button>
          {isDestinationDetailOpen ? (
            <div className="mt-3 space-y-2 text-sm text-zinc-800">
              <p>
                <span className="font-semibold">{copy.latitude}</span>
                {destination ? formatCoordinate(destination.lat) : copy.notSet}
              </p>
              <p>
                <span className="font-semibold">{copy.longitude}</span>
                {destination ? formatCoordinate(destination.lng) : copy.notSet}
              </p>
              <p>
                <span className="font-semibold">{copy.zonecode}</span>
                {destination?.zonecode ?? '-'}
              </p>
            </div>
          ) : null}
        </article>

        <article className="rounded-xl border border-zinc-200 bg-white p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-zinc-400">{copy.routeMode}</p>
          <p className="mt-1 text-xs text-zinc-500">{copy.routeModeDescription}</p>
          <div className="mt-3">
            <RouteModeToggle
              activeRouteMode={activeRouteMode}
              onChangeRouteMode={onChangeRouteMode}
              disabled={!hasAnyRoute || isInputsLocked}
              language={language}
            />
          </div>
        </article>

        {routeError ? (
          <article className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            {routeError}
          </article>
        ) : null}

        <article
          className={[
            'rounded-xl border p-4',
            activeRouteMode === 'EMERGENCY' ? 'border-red-200 bg-red-50' : 'border-zinc-200 bg-zinc-50',
          ].join(' ')}
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className={['text-xs font-bold uppercase tracking-wide', activeRouteMode === 'EMERGENCY' ? 'text-red-600' : 'text-zinc-500'].join(' ')}>
                {copy.currentRoute}
              </p>
              <p className="mt-1 text-xs text-zinc-500">{copy.currentRouteDescription}</p>
            </div>
            <span className={['rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide', currentRouteTagClass].join(' ')}>
              {getRouteLabel(activeRouteMode, language)}
            </span>
          </div>
          {activeRoute ? (
            <>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-white/70 bg-white/80 p-3">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-zinc-400">{copy.eta}</p>
                  <p className="mt-2 text-lg font-bold text-zinc-900">{formatEta(activeRoute.etaSeconds)}</p>
                </div>
                <div className="rounded-lg border border-white/70 bg-white/80 p-3">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-zinc-400">{copy.distance}</p>
                  <p className="mt-2 text-lg font-bold text-zinc-900">{formatDistance(activeRoute.distanceMeters)}</p>
                </div>
                <div className="rounded-lg border border-white/70 bg-white/80 p-3">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-zinc-400">{copy.strategy}</p>
                  <p className="mt-2 text-sm font-semibold text-zinc-800">
                    {activeRouteMode === 'EMERGENCY' ? currentRouteMetadata?.strategy ?? '-' : getRouteLabel(activeRouteMode, language)}
                  </p>
                </div>
                <div className="rounded-lg border border-white/70 bg-white/80 p-3">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-zinc-400">{copy.confidence}</p>
                  <p className="mt-2 text-sm font-semibold text-zinc-800">
                    {activeRouteMode === 'EMERGENCY' ? formatConfidence(currentRouteMetadata?.confidence) : '-'}
                  </p>
                </div>
              </div>
              {activeRouteMode === 'EMERGENCY' && currentRouteMetadata?.fallbackUsed ? (
                <div className="mt-3 rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-xs font-semibold text-orange-800">
                  {copy.fallbackUsed}
                </div>
              ) : null}
            </>
          ) : (
            <p className="mt-3 text-sm text-zinc-600">{copy.routePending}</p>
          )}
          {activeRouteMode === 'EMERGENCY' ? (
            <div className="mt-3 rounded-lg border border-red-200 bg-white/80 px-3 py-2 text-xs font-semibold text-red-700">
              {copy.recommendation}
            </div>
          ) : null}
        </article>

        <article
          className={[
            'rounded-xl border p-4',
            isDispatchActive ? 'border-emerald-200 bg-emerald-50' : 'border-zinc-200 bg-zinc-50',
          ].join(' ')}
        >
          <p
            className={[
              'text-xs font-bold uppercase tracking-wide',
              isDispatchActive ? 'text-emerald-600' : 'text-zinc-400',
            ].join(' ')}
          >
            {copy.dispatchStatus}
          </p>
          <p className="mt-2 text-sm font-semibold text-zinc-800">
            {isDispatchActive
              ? copy.activeDispatch
              : hasAnyRoute
                ? copy.routeReady
                : copy.needRoute}
          </p>
        </article>

        <article className="rounded-xl border border-zinc-200 bg-white p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-zinc-400">{copy.actionArea}</p>
          <p className="mt-2 text-sm text-zinc-500">{copy.actionDescription}</p>
          {isDispatchActive ? (
            <div className="mt-4 grid gap-3">
              <CtaButton
                onClick={onCompleteDispatch}
                disabled={isDispatchActionPending}
                className={[
                  'w-full px-4 py-3 text-sm uppercase tracking-wide',
                  isDispatchActionPending ? 'cursor-not-allowed opacity-70' : '',
                ].join(' ')}
              >
                {isDispatchActionPending ? copy.processing : copy.complete}
              </CtaButton>
              <CtaButton
                onClick={onCancelDispatch}
                disabled={isDispatchActionPending}
                variant="neutral"
                className={[
                  'w-full px-4 py-3 text-sm uppercase tracking-wide',
                  isDispatchActionPending ? 'cursor-not-allowed opacity-70' : '',
                ].join(' ')}
              >
                {isDispatchActionPending ? copy.processing : copy.cancel}
              </CtaButton>
            </div>
          ) : (
            <div className="mt-4 grid gap-3">
              <CtaButton
                onClick={onCalculateRoute}
                disabled={!origin || !destination || isCalculatingRoute || isDispatchActionPending}
                className={[
                  'w-full px-4 py-3 text-sm uppercase tracking-wide',
                  !origin || !destination || isCalculatingRoute || isDispatchActionPending ? 'cursor-not-allowed opacity-70' : '',
                ].join(' ')}
              >
                {isCalculatingRoute ? copy.calculating : copy.calculate}
              </CtaButton>
              <CtaButton
                onClick={onStartDispatch}
                disabled={!hasAnyRoute || !origin || !destination || isDispatchActionPending}
                variant="light"
                className={[
                  'w-full border border-zinc-200 px-4 py-3 text-sm uppercase tracking-wide',
                  !hasAnyRoute || !origin || !destination || isDispatchActionPending ? 'cursor-not-allowed opacity-70' : '',
                ].join(' ')}
              >
                {isDispatchActionPending ? copy.processing : copy.startDispatch}
              </CtaButton>
            </div>
          )}
        </article>

        <article className="rounded-xl border border-zinc-200 bg-white p-4">
          <button
            type="button"
            onClick={() => setIsComparisonRouteOpen((current) => !current)}
            className="flex w-full items-center justify-between gap-3 text-left"
          >
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-zinc-400">{copy.comparisonRoute}</p>
              <p className="mt-1 text-xs text-zinc-500">{copy.comparisonRouteClosed}</p>
            </div>
            <div className="flex items-center gap-2">
              {comparisonRoute ? (
                <span className={['rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide', comparisonRouteTagClass].join(' ')}>
                  {formatEta(comparisonRoute.etaSeconds)}
                </span>
              ) : null}
              <svg
                aria-hidden="true"
                viewBox="0 0 20 20"
                className={['h-4 w-4 text-zinc-500 transition-transform', isComparisonRouteOpen ? 'rotate-180' : 'rotate-0'].join(' ')}
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path d="M5 7.5 10 12.5 15 7.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </button>
          {isComparisonRouteOpen ? (
            comparisonRoute ? (
              <div className="mt-4 space-y-3 text-sm text-zinc-800">
                <p>
                  <span className="font-semibold">{copy.eta}: </span>
                  {formatEta(comparisonRoute.etaSeconds)}
                </p>
                <p>
                  <span className="font-semibold">{copy.distance}: </span>
                  {formatDistance(comparisonRoute.distanceMeters)}
                </p>
                {comparisonRouteMode === 'EMERGENCY' ? (
                  <>
                    <p>
                      <span className="font-semibold">{copy.strategy}: </span>
                      {comparisonRouteMetadata?.strategy ?? '-'}
                    </p>
                    <p>
                      <span className="font-semibold">{copy.confidence}: </span>
                      {formatConfidence(comparisonRouteMetadata?.confidence)}
                    </p>
                  </>
                ) : null}
              </div>
            ) : (
              <p className="mt-4 text-sm text-zinc-600">{copy.noComparison}</p>
            )
          ) : null}
        </article>

        {emergencyRouteMetadata?.fallbackUsed ? (
          <article className="rounded-xl border border-orange-200 bg-orange-50 p-4">
            <button
              type="button"
              onClick={() => setIsFallbackDetailOpen((current) => !current)}
              className="flex w-full items-center justify-between gap-3 text-left"
            >
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-orange-700">{copy.fallbackDetail}</p>
                <p className="mt-1 text-xs text-orange-700/80">{copy.fallbackDetailClosed}</p>
              </div>
              <svg
                aria-hidden="true"
                viewBox="0 0 20 20"
                className={['h-4 w-4 text-orange-700 transition-transform', isFallbackDetailOpen ? 'rotate-180' : 'rotate-0'].join(' ')}
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path d="M5 7.5 10 12.5 15 7.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {isFallbackDetailOpen ? (
              <div className="mt-4 space-y-2 text-sm text-orange-900">
                <p className="font-semibold">
                  {(emergencyRouteMetadata.primaryStrategy ?? 'PRIMARY')} → {emergencyRouteMetadata.fallbackStrategy ?? emergencyRouteMetadata.strategy ?? 'FALLBACK'}
                </p>
                {emergencyRouteMetadata.fallbackReason ? (
                  <p>
                    <span className="font-semibold">{copy.fallbackReason}: </span>
                    {emergencyRouteMetadata.fallbackReason}
                  </p>
                ) : null}
                {emergencyRouteMetadata.fallbackMessage ? <p>{emergencyRouteMetadata.fallbackMessage}</p> : null}
                {emergencyRouteMetadata.warning ? <p>{emergencyRouteMetadata.warning}</p> : null}
                {emergencyRouteMetadata.legalWarning ? <p>{emergencyRouteMetadata.legalWarning}</p> : null}
              </div>
            ) : null}
          </article>
        ) : null}
      </div>
    </section>
  )
}

function DesktopTabletHistoryContent({
  language,
  records,
  isLoading,
  error,
  searchQuery,
  onSearchQueryChange,
  onClearSearchQuery,
  currentPage,
  pageSize,
  totalCount,
  onChangePage,
}: HistoryContentProps) {
  const copy = language === 'ko'
    ? {
        placeholder: '출동 이력 또는 목적지 검색',
        sortLabel: '최신순',
        title: '출동 이력',
        description: '저장된 출동 이력을 최신순으로 표시하며, 검색어 기준으로 목적지와 제목을 찾을 수 있습니다.',
        loading: '출동 이력을 불러오는 중입니다...',
        emptySearch: '검색 조건에 맞는 이력이 없습니다.',
        emptyDefault: '불러온 이력 데이터가 없습니다.',
      }
    : {
        placeholder: 'Search dispatch history or destination',
        sortLabel: 'Latest',
        title: 'Dispatch History',
        description: 'Shows saved dispatch history in reverse chronological order and lets you search by destination or title.',
        loading: 'Loading dispatch history...',
        emptySearch: 'No records match the current search.',
        emptyDefault: 'No history records were found.',
      }

  return (
    <section className="flex-1 p-3 lg:p-4">
      <SearchTopBar
        placeholder={copy.placeholder}
        value={searchQuery}
        onChange={onSearchQueryChange}
        onClear={onClearSearchQuery}
        className="mb-3"
        right={<span className="text-xs font-semibold uppercase tracking-wide text-zinc-400">{copy.sortLabel}</span>}
      />

      <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-6">
        <h1 className="text-3xl font-bold text-zinc-900">{copy.title}</h1>
        <p className="mt-2 text-sm text-zinc-500">{copy.description}</p>

        {error ? (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-5 text-sm font-medium text-red-600">
            {error}
          </div>
        ) : isLoading ? (
          <div className="mt-6 rounded-lg border border-zinc-200 bg-zinc-50 p-5 text-sm text-zinc-500">
            {copy.loading}
          </div>
        ) : records.length > 0 ? (
          <>
            <ul className="mt-6 space-y-3">
              {records.map((record) => (
                <li key={record.id} className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-zinc-800">{record.title}</p>
                      <p className="mt-1 text-xs text-zinc-500">{record.destinationAddress}</p>
                      <p className="mt-1 text-xs text-zinc-500">{formatHistoryDate(record.createdAt)}</p>
                    </div>
                    <div className="text-right">
                      <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-zinc-600">
                        {record.vehicleType}
                      </span>
                      <p className="mt-2 text-xs font-semibold text-zinc-600">{getDispatchStatusLabel(record.dispatchStatus, language)}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <HistoryPagination
              currentPage={currentPage}
              pageSize={pageSize}
              totalCount={totalCount}
              onChangePage={onChangePage}
              language={language}
            />
          </>
        ) : (
          <div className="mt-6 rounded-lg border border-zinc-200 bg-zinc-50 p-5 text-sm text-zinc-500">
            {searchQuery ? copy.emptySearch : copy.emptyDefault}
          </div>
        )}
      </div>
    </section>
  )
}

function MobileHistoryContent({
  language,
  records,
  isLoading,
  error,
  searchQuery,
  onSearchQueryChange,
  onClearSearchQuery,
  currentPage,
  pageSize,
  totalCount,
  onChangePage,
}: HistoryContentProps) {
  const copy = language === 'ko'
    ? {
        title: '출동 이력',
        description: '저장된 출동 이력을 최신순으로 표시합니다.',
        placeholder: '출동 이력 또는 목적지 검색',
        loading: '출동 이력을 불러오는 중입니다...',
        sortLabel: '정렬 기준: 최신순',
        emptySearch: '검색 조건에 맞는 이력이 없습니다.',
        emptyDefault: '불러온 이력 데이터가 없습니다.',
      }
    : {
        title: 'Dispatch History',
        description: 'Displays saved dispatch history in reverse chronological order.',
        placeholder: 'Search dispatch history or destination',
        loading: 'Loading dispatch history...',
        sortLabel: 'Sort: Latest',
        emptySearch: 'No records match the current search.',
        emptyDefault: 'No history records were found.',
      }

  return (
    <section className="px-5 pb-8 pt-5">
      <h1 className="text-4xl font-bold tracking-tight text-zinc-900">{copy.title}</h1>
      <p className="mt-2 text-sm text-zinc-500">{copy.description}</p>

      <SearchTopBar
        placeholder={copy.placeholder}
        value={searchQuery}
        onChange={onSearchQueryChange}
        onClear={onClearSearchQuery}
        className="mt-4"
      />

      <div className="mt-4 rounded-xl border border-dashed border-zinc-300 bg-white p-4">
        {error ? (
          <p className="text-sm font-medium text-red-600">{error}</p>
        ) : isLoading ? (
          <p className="text-sm text-zinc-500">{copy.loading}</p>
        ) : records.length > 0 ? (
          <>
            <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-zinc-400">{copy.sortLabel}</p>
            <ul className="space-y-3">
              {records.map((record) => (
                <li key={record.id} className="rounded-lg border border-zinc-200 bg-zinc-50 p-3">
                  <p className="text-sm font-semibold text-zinc-800">{record.title}</p>
                  <p className="mt-1 text-xs text-zinc-500">{record.destinationAddress}</p>
                  <p className="mt-1 text-xs text-zinc-500">{formatHistoryDate(record.createdAt)}</p>
                  <p className="mt-2 text-xs font-semibold text-zinc-600">
                    {record.vehicleType} / {getDispatchStatusLabel(record.dispatchStatus, language)}
                  </p>
                </li>
              ))}
            </ul>

            <HistoryPagination
              currentPage={currentPage}
              pageSize={pageSize}
              totalCount={totalCount}
              onChangePage={onChangePage}
              language={language}
            />
          </>
        ) : (
          <p className="text-sm text-zinc-500">{searchQuery ? copy.emptySearch : copy.emptyDefault}</p>
        )}
      </div>
    </section>
  )
}

export default function DashboardPage() {
  const { language } = useAppLanguage()
  const [searchParams, setSearchParams] = useSearchParams()
  const [isMobileViewport, setIsMobileViewport] = useState(getIsMobileViewport)
  const [dispatchMutationState, setDispatchMutationState] = useState<DispatchMutationState>('IDLE')
  const [historyRecords, setHistoryRecords] = useState<HistoryRecord[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [historyError, setHistoryError] = useState<string | null>(null)
  const [historySearchQuery, setHistorySearchQuery] = useState('')
  const [historyCurrentPage, setHistoryCurrentPage] = useState(1)
  const [historyTotalCount, setHistoryTotalCount] = useState(0)
  const autoCompletingDispatchIdRef = useRef<string | null>(null)
  const deferredHistorySearchQuery = useDeferredValue(historySearchQuery)
  const currentView = parseView(searchParams.get('view'))
  const origin = useRouteStore((state) => state.origin)
  const liveVehiclePosition = useRouteStore((state) => state.liveVehiclePosition)
  const destination = useRouteStore((state) => state.destination)
  const vehicleType = useRouteStore((state) => state.vehicleType)
  const standardRoute = useRouteStore((state) => state.standardRoute)
  const emergencyRoute = useRouteStore((state) => state.emergencyRoute)
  const emergencyRouteMetadata = useRouteStore((state) => state.emergencyRouteMetadata)
  const activeRouteMode = useRouteStore((state) => state.activeRouteMode)
  const isCalculatingRoute = useRouteStore((state) => state.isCalculatingRoute)
  const routeError = useRouteStore((state) => state.routeError)
  const startRouteCalculation = useRouteStore((state) => state.startRouteCalculation)
  const setCalculatedRouteResult = useRouteStore((state) => state.setCalculatedRouteResult)
  const setOrigin = useRouteStore((state) => state.setOrigin)
  const setVehicleType = useRouteStore((state) => state.setVehicleType)
  const setActiveRouteMode = useRouteStore((state) => state.setActiveRouteMode)
  const activeDispatch = useRouteStore((state) => state.activeDispatch)
  const setActiveDispatch = useRouteStore((state) => state.setActiveDispatch)
  const setRouteError = useRouteStore((state) => state.setRouteError)
  const clearRouteResult = useRouteStore((state) => state.clearRouteResult)
  const { getCurrentLocation, loading: isRefreshingOrigin } = useCurrentLocation()

  const setView = (view: DashboardView) => {
    const nextParams = new URLSearchParams(searchParams)
    nextParams.set('view', view)
    setSearchParams(nextParams)
  }

  useEffect(() => {
    const handleResize = () => {
      setIsMobileViewport(getIsMobileViewport())
    }

    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  const hasCalculatedRoute = Boolean(standardRoute || emergencyRoute)
  const dispatchStatus: DispatchStatus = activeDispatch ? 'ACTIVE' : 'IDLE'
  const isDispatchActionPending = dispatchMutationState !== 'IDLE'
  const isInputsLocked = dispatchStatus === 'ACTIVE' || isDispatchActionPending

  useEffect(() => {
    setHistoryCurrentPage(1)
  }, [historySearchQuery])

  const loadHistoryRecords = useCallback(async () => {
    setHistoryLoading(true)
    setHistoryError(null)

    try {
      const historyPage = await fetchDispatchHistory({
        searchQuery: deferredHistorySearchQuery,
        page: historyCurrentPage,
        pageSize: HISTORY_PAGE_SIZE,
      })

      if (historyPage.totalCount > 0 && historyPage.items.length === 0 && historyCurrentPage > 1) {
        setHistoryCurrentPage((currentPage) => Math.max(1, currentPage - 1))
        return
      }

      setHistoryRecords(
        historyPage.items.map((record) => ({
          id: record.historyId,
          title: record.title,
          vehicleType: record.vehicleType,
          destinationAddress: record.destinationAddress,
          dispatchStatus: record.dispatchStatus,
          createdAt: record.createdAt,
        })),
      )
      setHistoryTotalCount(historyPage.totalCount)
    } catch (error: unknown) {
      setHistoryError(error instanceof Error ? error.message : '출동 이력을 불러오지 못했습니다.')
    } finally {
      setHistoryLoading(false)
    }
  }, [deferredHistorySearchQuery, historyCurrentPage])

  useEffect(() => {
    if (currentView !== 'history') {
      return
    }

    void loadHistoryRecords()
  }, [currentView, loadHistoryRecords])

  const handleRefreshOrigin = async () => {
    try {
      const nextOrigin = await getCurrentLocation()
      setOrigin(nextOrigin)
      clearRouteResult()
      setRouteError(null)
    } catch (error: unknown) {
      setRouteError(error instanceof Error ? error.message : '현재 위치를 가져오지 못했습니다.')
    }
  }

  const handleCalculateRoute = async () => {
    if (!origin) {
      setRouteError('현재 출발 위치를 아직 확인하지 못했습니다.')
      return
    }

    if (!destination) {
      setRouteError('경로를 계산하기 전에 목적지를 선택하세요.')
      return
    }

    startRouteCalculation()

    try {
      const result = await calculateRoute({
        origin,
        vehicleType,
        destination: {
          address: destination.address,
          zonecode: destination.zonecode ?? null,
          lat: destination.lat ?? null,
          lng: destination.lng ?? null,
        },
      })

      setCalculatedRouteResult(result)
    } catch (error: unknown) {
      setRouteError(error instanceof Error ? error.message : '경로 계산에 실패했습니다.')
    }
  }

  const finishDispatch = useCallback(async ({
    completionReason,
  }: {
    completionReason: 'MANUAL_COMPLETED' | 'DESTINATION_REACHED' | 'USER_CANCELED'
  }) => {
    if (!activeDispatch) {
      return
    }

    setDispatchMutationState(completionReason === 'USER_CANCELED' ? 'CANCELING' : 'COMPLETING')

    try {
      await finishDispatchRecord({
        dispatchId: activeDispatch.id,
        completionReason,
      })

      setActiveDispatch(null)
      autoCompletingDispatchIdRef.current = null
      clearRouteResult()
      void loadHistoryRecords()
      setRouteError(null)
    } catch (error: unknown) {
      if (completionReason === 'DESTINATION_REACHED') {
        autoCompletingDispatchIdRef.current = null
      }

      setRouteError(error instanceof Error ? error.message : '출동 상태를 업데이트하지 못했습니다.')
    } finally {
      setDispatchMutationState('IDLE')
    }
  }, [activeDispatch, clearRouteResult, loadHistoryRecords, setActiveDispatch, setRouteError])

  const handleStartDispatch = async () => {
    if (!origin) {
      setRouteError('현재 출발 위치를 아직 확인하지 못했습니다.')
      return
    }

    if (!destination || typeof destination.lat !== 'number' || typeof destination.lng !== 'number') {
      setRouteError('출동을 시작하기 전에 경로 탐색을 먼저 완료하세요.')
      return
    }

    if (!hasCalculatedRoute) {
      setRouteError('경로 탐색을 먼저 완료하세요.')
      return
    }

    setDispatchMutationState('STARTING')

    try {
      const startedAt = new Date().toISOString()
      const dispatchId = await createDispatchRecord({
        origin,
        destination: {
          ...destination,
          lat: destination.lat,
          lng: destination.lng,
        },
        vehicleType,
        activeRouteMode,
        standardRoute,
        emergencyRoute,
        emergencyRouteMetadata,
        startedAt,
      })

      setActiveDispatch({
        id: dispatchId,
        startedAt,
      })
      void loadHistoryRecords()
      setRouteError(null)
    } catch (error: unknown) {
      setRouteError(error instanceof Error ? error.message : '출동 시작 처리에 실패했습니다.')
    } finally {
      setDispatchMutationState('IDLE')
    }
  }

  const handleCompleteDispatch = async () => {
    if (!activeDispatch || isDispatchActionPending) {
      return
    }

    if (!window.confirm('출동 완료를 하시겠습니까?')) {
      return
    }

    await finishDispatch({
      completionReason: 'MANUAL_COMPLETED',
    })
  }

  const handleCancelDispatch = async () => {
    if (!activeDispatch || isDispatchActionPending) {
      return
    }

    if (!window.confirm('출동 취소를 하시겠습니까?')) {
      return
    }

    await finishDispatch({
      completionReason: 'USER_CANCELED',
    })
  }

  useEffect(() => {
    if (!activeDispatch || !liveVehiclePosition || !destination || typeof destination.lat !== 'number' || typeof destination.lng !== 'number') {
      return
    }

    if (autoCompletingDispatchIdRef.current === activeDispatch.id) {
      return
    }

    const distanceToDestination = getDistanceMeters(liveVehiclePosition, {
      lat: destination.lat,
      lng: destination.lng,
    })

    if (distanceToDestination > AUTO_COMPLETE_DISTANCE_METERS) {
      return
    }

    autoCompletingDispatchIdRef.current = activeDispatch.id
    void finishDispatch({
      completionReason: 'DESTINATION_REACHED',
    })
  }, [activeDispatch, destination, finishDispatch, liveVehiclePosition])

  const isDashboardView = useMemo(() => currentView === 'dashboard', [currentView])

  return (
    <PageShell outerClassName="min-h-screen w-full bg-[#eceff2]">
      <AppHeader active="dashboard" />

      <div className="md:flex">
        <DashboardSidebar currentView={currentView} onChangeView={setView} />

        <section className="min-h-screen flex-1">
          <div className="p-4 md:hidden">
            <ViewToggle currentView={currentView} onChangeView={setView} className="w-full justify-center" language={language} />
          </div>

          {isDashboardView ? (
            isMobileViewport ? (
              <MobileDashboardContent
                language={language}
                origin={origin}
                destination={destination}
                vehicleType={vehicleType}
                standardRoute={standardRoute}
                emergencyRoute={emergencyRoute}
                emergencyRouteMetadata={emergencyRouteMetadata}
                activeRouteMode={activeRouteMode}
                isCalculatingRoute={isCalculatingRoute}
                routeError={routeError}
                isRefreshingOrigin={isRefreshingOrigin}
                dispatchStatus={dispatchStatus}
                isDispatchActionPending={isDispatchActionPending}
                isInputsLocked={isInputsLocked}
                onChangeVehicleType={setVehicleType}
                onChangeRouteMode={setActiveRouteMode}
                onRefreshOrigin={handleRefreshOrigin}
                onCalculateRoute={handleCalculateRoute}
                onStartDispatch={handleStartDispatch}
                onCompleteDispatch={handleCompleteDispatch}
                onCancelDispatch={handleCancelDispatch}
              />
            ) : (
              <DesktopTabletDashboardContent
                language={language}
                origin={origin}
                destination={destination}
                vehicleType={vehicleType}
                standardRoute={standardRoute}
                emergencyRoute={emergencyRoute}
                emergencyRouteMetadata={emergencyRouteMetadata}
                activeRouteMode={activeRouteMode}
                isCalculatingRoute={isCalculatingRoute}
                routeError={routeError}
                isRefreshingOrigin={isRefreshingOrigin}
                dispatchStatus={dispatchStatus}
                isDispatchActionPending={isDispatchActionPending}
                isInputsLocked={isInputsLocked}
                onChangeVehicleType={setVehicleType}
                onChangeRouteMode={setActiveRouteMode}
                onRefreshOrigin={handleRefreshOrigin}
                onCalculateRoute={handleCalculateRoute}
                onStartDispatch={handleStartDispatch}
                onCompleteDispatch={handleCompleteDispatch}
                onCancelDispatch={handleCancelDispatch}
              />
            )
          ) : isMobileViewport ? (
            <MobileHistoryContent
              language={language}
              records={historyRecords}
              isLoading={historyLoading}
              error={historyError}
              searchQuery={historySearchQuery}
              onSearchQueryChange={setHistorySearchQuery}
              onClearSearchQuery={() => setHistorySearchQuery('')}
              currentPage={historyCurrentPage}
              pageSize={HISTORY_PAGE_SIZE}
              totalCount={historyTotalCount}
              onChangePage={setHistoryCurrentPage}
            />
          ) : (
            <DesktopTabletHistoryContent
              language={language}
              records={historyRecords}
              isLoading={historyLoading}
              error={historyError}
              searchQuery={historySearchQuery}
              onSearchQueryChange={setHistorySearchQuery}
              onClearSearchQuery={() => setHistorySearchQuery('')}
              currentPage={historyCurrentPage}
              pageSize={HISTORY_PAGE_SIZE}
              totalCount={historyTotalCount}
              onChangePage={setHistoryCurrentPage}
            />
          )}
        </section>
      </div>
    </PageShell>
  )
}
