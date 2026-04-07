import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import DashboardSidebar from '../components/dashboard/DashboardSidebar'
import KakaoMap from '../components/map/KakaoMap'
import AppHeader from '../components/shared/AppHeader'
import CtaButton from '../components/shared/CtaButton'
import PageShell from '../components/shared/PageShell'
import SearchTopBar from '../components/shared/SearchTopBar'
import { useRouteStore } from '../store/useRouteStore'

type DashboardView = 'dashboard' | 'history'

interface HistoryRecord {
  id: string
  title: string
  createdAt: string
}

function parseView(value: string | null): DashboardView {
  return value === 'dashboard' ? 'dashboard' : 'history'
}

interface ViewToggleProps {
  currentView: DashboardView
  onChangeView: (view: DashboardView) => void
  className?: string
}

function ViewToggle({ currentView, onChangeView, className }: ViewToggleProps) {
  return (
    <div className={['inline-flex rounded-xl border border-zinc-200 bg-white p-1', className ?? ''].join(' ')}>
      <button
        onClick={() => onChangeView('dashboard')}
        className={[
          'rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-wide transition',
          currentView === 'dashboard' ? 'bg-red-600 text-white' : 'text-zinc-500 hover:bg-zinc-100',
        ].join(' ')}
      >
        Dashboard
      </button>
      <button
        onClick={() => onChangeView('history')}
        className={[
          'rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-wide transition',
          currentView === 'history' ? 'bg-red-600 text-white' : 'text-zinc-500 hover:bg-zinc-100',
        ].join(' ')}
      >
        History
      </button>
    </div>
  )
}

interface DashboardContentProps {
  origin: { lat: number; lng: number } | null
  destination: { address?: string; lat: number; lng: number } | null
}

function DesktopTabletDashboardContent({ origin, destination }: DashboardContentProps) {
  return (
    <section className="flex-1 p-3 lg:p-4">
      <SearchTopBar
        placeholder="Search address or coordinate..."
        className="mb-3"
        right={
          <>
            <span className="grid h-8 w-8 place-items-center rounded-full bg-zinc-100 text-sm">!</span>
            <span className="grid h-8 w-8 place-items-center rounded-full bg-zinc-100 text-sm">u</span>
          </>
        }
      />

      <div className="grid h-[calc(100vh-190px)] min-h-[560px] gap-4 lg:grid-cols-[1.25fr_0.75fr]">
        <article className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
          <KakaoMap className="h-full w-full" />
        </article>

        <article className="rounded-xl border border-dashed border-zinc-300 bg-white p-6">
          <h1 className="text-3xl font-bold text-zinc-900">Dashboard</h1>
          <p className="mt-2 text-sm text-zinc-500">Origin/Destination state is managed via global route store.</p>

          {origin || destination ? (
            <div className="mt-6 grid gap-3">
              <article className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-zinc-400">Origin</p>
                <p className="mt-1 text-sm font-semibold text-zinc-800">
                  {origin ? `${origin.lat.toFixed(6)}, ${origin.lng.toFixed(6)}` : 'Not set'}
                </p>
              </article>
              <article className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-zinc-400">Destination</p>
                <p className="mt-1 text-sm font-semibold text-zinc-800">
                  {destination ? `${destination.lat.toFixed(6)}, ${destination.lng.toFixed(6)}` : 'Not set'}
                </p>
              </article>
              {destination?.address ? (
                <article className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-zinc-400">Address</p>
                  <p className="mt-1 text-sm font-semibold text-zinc-800">{destination.address}</p>
                </article>
              ) : null}
            </div>
          ) : (
            <div className="mt-6 rounded-lg border border-zinc-200 bg-zinc-50 p-5 text-sm text-zinc-500">
              Current location will be saved as origin automatically after geolocation succeeds.
            </div>
          )}

          <CtaButton className="mt-6 w-full px-4 py-3 text-sm uppercase tracking-wide">Start Rescue</CtaButton>
        </article>
      </div>
    </section>
  )
}

function MobileDashboardContent({ origin, destination }: DashboardContentProps) {
  return (
    <section className="px-5 pb-8 pt-5">
      <h1 className="text-4xl font-bold tracking-tight text-zinc-900">Dashboard</h1>
      <p className="mt-2 text-sm text-zinc-500">Route state is shared globally through Zustand.</p>

      <article className="mt-4 h-[46vh] min-h-[280px] overflow-hidden rounded-xl border border-zinc-200 bg-white">
        <KakaoMap className="h-full w-full" />
      </article>

      <div className="mt-4 rounded-xl border border-dashed border-zinc-300 bg-white p-4">
        {origin || destination ? (
          <div className="space-y-2 text-sm text-zinc-700">
            <p>Origin: {origin ? `${origin.lat.toFixed(6)}, ${origin.lng.toFixed(6)}` : 'Not set'}</p>
            <p>
              Destination:{' '}
              {destination ? `${destination.lat.toFixed(6)}, ${destination.lng.toFixed(6)}` : 'Not set'}
            </p>
            {destination?.address ? <p>Address: {destination.address}</p> : null}
          </div>
        ) : (
          <p className="text-sm text-zinc-500">Current location will be stored as origin automatically.</p>
        )}

        <CtaButton className="mt-4 w-full px-4 py-3 text-sm uppercase tracking-wide">Start Rescue</CtaButton>
      </div>
    </section>
  )
}

interface HistoryContentProps {
  records: HistoryRecord[]
}

function DesktopTabletHistoryContent({ records }: HistoryContentProps) {
  return (
    <section className="flex-1 p-3 lg:p-4">
      <SearchTopBar
        placeholder="Search dispatch history..."
        className="mb-3"
        right={
          <>
            <span className="grid h-8 w-8 place-items-center text-zinc-500">!</span>
            <span className="grid h-8 w-8 place-items-center text-zinc-500">u</span>
          </>
        }
      />

      <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-6">
        <h1 className="text-3xl font-bold text-zinc-900">Dispatch History</h1>
        <p className="mt-2 text-sm text-zinc-500">History records will be shown here after API integration.</p>

        {records.length > 0 ? (
          <ul className="mt-6 space-y-3">
            {records.map((record) => (
              <li key={record.id} className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
                <p className="text-sm font-semibold text-zinc-800">{record.title}</p>
                <p className="mt-1 text-xs text-zinc-500">{record.createdAt}</p>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-6 rounded-lg border border-zinc-200 bg-zinc-50 p-5 text-sm text-zinc-500">
            No history records loaded.
          </div>
        )}
      </div>
    </section>
  )
}

function MobileHistoryContent({ records }: HistoryContentProps) {
  return (
    <section className="px-5 pb-8 pt-5">
      <h1 className="text-4xl font-bold tracking-tight text-zinc-900">Dispatch History</h1>
      <p className="mt-2 text-sm text-zinc-500">Connect API to load history records.</p>

      <div className="mt-4 rounded-xl border border-dashed border-zinc-300 bg-white p-4">
        {records.length > 0 ? (
          <ul className="space-y-3">
            {records.map((record) => (
              <li key={record.id} className="rounded-lg border border-zinc-200 bg-zinc-50 p-3">
                <p className="text-sm font-semibold text-zinc-800">{record.title}</p>
                <p className="mt-1 text-xs text-zinc-500">{record.createdAt}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-zinc-500">No history records loaded.</p>
        )}
      </div>
    </section>
  )
}

export default function DashboardPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const currentView = parseView(searchParams.get('view'))
  const origin = useRouteStore((state) => state.origin)
  const destination = useRouteStore((state) => state.destination)
  const historyRecords: HistoryRecord[] = []

  const setView = (view: DashboardView) => {
    const nextParams = new URLSearchParams(searchParams)
    nextParams.set('view', view)
    setSearchParams(nextParams)
  }

  const isDashboardView = useMemo(() => currentView === 'dashboard', [currentView])

  return (
    <PageShell outerClassName="min-h-screen w-full bg-[#eceff2]">
      <AppHeader active="dashboard" />

      <div className="md:flex">
        <DashboardSidebar currentView={currentView} onChangeView={setView} />

        <section className="min-h-screen flex-1">
          <div className="p-4 md:hidden">
            <ViewToggle currentView={currentView} onChangeView={setView} className="w-full justify-center" />
          </div>

          {isDashboardView ? (
            <>
              <div className="hidden md:block">
                <DesktopTabletDashboardContent origin={origin} destination={destination} />
              </div>
              <div className="md:hidden">
                <MobileDashboardContent origin={origin} destination={destination} />
              </div>
            </>
          ) : (
            <>
              <div className="hidden md:block">
                <DesktopTabletHistoryContent records={historyRecords} />
              </div>
              <div className="md:hidden">
                <MobileHistoryContent records={historyRecords} />
              </div>
            </>
          )}
        </section>
      </div>
    </PageShell>
  )
}
