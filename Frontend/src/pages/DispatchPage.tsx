import { useEffect, useState } from 'react'
import DestinationSearchSection from '../components/dispatch/DestinationSearchSection'
import DispatchPanel from '../components/dispatch/DispatchPanel'
import DispatchSidebar from '../components/dispatch/DispatchSidebar'
import MobileBottomTabs from '../components/dispatch/MobileBottomTabs'
import KakaoMap from '../components/map/KakaoMap'
import CtaButton from '../components/shared/CtaButton'
import PageShell from '../components/shared/PageShell'
import SearchTopBar from '../components/shared/SearchTopBar'
import StatusCard from '../components/shared/StatusCard'

type DispatchViewport = 'desktop' | 'tablet' | 'mobile'

function getDispatchViewport(): DispatchViewport {
  if (typeof window === 'undefined') {
    return 'desktop'
  }

  if (window.innerWidth >= 1024) {
    return 'desktop'
  }

  if (window.innerWidth >= 768) {
    return 'tablet'
  }

  return 'mobile'
}

function DesktopDispatchView() {
  return (
    <PageShell outerClassName="flex h-screen bg-[#eceff2]">
      <DispatchSidebar mode="desktop" />

      <section className="flex-1 p-3">
        <SearchTopBar
          placeholder="Search address or coordinate..."
          className="mb-3"
          right={
            <>
              <span className="grid h-8 w-8 place-items-center rounded-full bg-zinc-100 text-sm">!</span>
              <span className="grid h-8 w-8 place-items-center rounded-full bg-amber-50 text-sm">i</span>
              <span className="grid h-8 w-8 place-items-center rounded-full bg-zinc-100 text-sm">u</span>
            </>
          }
        />

        <div className="relative h-[calc(100vh-102px)] min-h-[700px] overflow-hidden rounded-xl border-[6px] border-zinc-500/70 bg-[#e8ebe7]">
          <KakaoMap className="h-full w-full" />

          <div className="absolute left-4 top-4 w-[380px] space-y-3">
            <DispatchPanel>
              <div className="mb-3 flex items-center justify-between text-xs font-bold uppercase tracking-wide text-zinc-400">
                <span>Active Incident</span>
                <span className="rounded-full bg-red-50 px-2 py-1 text-[10px] text-red-500">Priority 1</span>
              </div>
              <p className="text-4xl font-bold leading-none text-zinc-900">St. Jude Medical</p>
              <p className="mt-2 text-sm text-zinc-500">441 S 10th St, Metropolitan Area</p>
              <div className="mt-5 flex items-center justify-between rounded-lg bg-zinc-100 px-3 py-2 text-xs font-bold text-zinc-500">
                <span>Incident Code</span>
                <span className="text-sm text-zinc-800">MED-882</span>
              </div>
            </DispatchPanel>

            <DispatchPanel className="bg-zinc-100">
              <DestinationSearchSection />
            </DispatchPanel>

            <DispatchPanel className="bg-zinc-100">
              <p className="text-2xl font-bold text-zinc-900">Assign Units</p>

              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between rounded-xl border border-red-200 bg-white px-3 py-3">
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-lg bg-red-50 text-red-600">+</span>
                    <div>
                      <p className="text-lg font-semibold text-zinc-900">Unit R-22</p>
                      <p className="text-xs text-zinc-500">0.8 miles away</p>
                    </div>
                  </div>
                  <span className="grid h-5 w-5 place-items-center rounded-full border-2 border-red-500 text-[10px] text-red-500">
                    o
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-3 py-3">
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-lg bg-slate-100 text-slate-500">
                      +
                    </span>
                    <div>
                      <p className="text-lg font-semibold text-slate-600">Unit F-104</p>
                      <p className="text-xs text-zinc-400">Available (HQ)</p>
                    </div>
                  </div>
                  <span className="grid h-5 w-5 place-items-center rounded-full border-2 border-zinc-300 text-[10px] text-zinc-300">
                    o
                  </span>
                </div>
              </div>

              <CtaButton variant="neutral" className="mt-4 w-full rounded-xl px-4 py-3 text-sm uppercase tracking-wide">
                Generate Route
              </CtaButton>
            </DispatchPanel>
          </div>

          <div className="absolute right-4 top-4 w-[340px] space-y-3">
            <DispatchPanel className="border-l-8 border-l-red-700">
              <p className="text-xs font-bold uppercase tracking-wide text-zinc-400">Estimated Arrival</p>
              <p className="mt-2 text-6xl font-bold leading-none text-zinc-900">
                4:20 <span className="text-4xl text-red-600">MIN</span>
              </p>
              <div className="mt-4 h-2 rounded-full bg-zinc-200">
                <div className="h-full w-[70%] rounded-full bg-red-700" />
              </div>
              <p className="mt-1 text-right text-xs font-bold text-zinc-400">70%</p>
            </DispatchPanel>

            {[
              ['Signal', 'Strong (98%)', 'text-cyan-600'],
              ['Unit Batt', '94%', 'text-emerald-600'],
              ['Conditions', 'Clear - 72F', 'text-zinc-500'],
            ].map(([label, value, accent]) => (
              <StatusCard
                key={label}
                label={label}
                value={value}
                icon="+"
                className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-4 py-3"
                labelClassName={['text-xs font-bold uppercase tracking-wide text-zinc-400', accent].join(' ')}
                valueClassName="text-sm font-bold text-zinc-700"
              />
            ))}
          </div>

          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-2">
            <button className="h-14 w-14 rounded-xl border border-zinc-300 bg-white text-3xl font-semibold text-slate-500">
              +
            </button>
            <button className="h-14 w-14 rounded-xl border border-zinc-300 bg-white text-3xl font-semibold text-slate-500">
              -
            </button>
            <button className="rounded-xl border border-zinc-300 bg-white px-6 py-4 text-sm font-bold uppercase tracking-wide text-red-600">
              Re-Center
            </button>
          </div>

          <CtaButton className="absolute bottom-3 right-4 rounded-2xl px-12 py-5 text-lg uppercase tracking-wide shadow-[0_14px_28px_rgba(220,38,38,0.35)]">
            Dispatch Now
          </CtaButton>
        </div>
      </section>
    </PageShell>
  )
}

function TabletDispatchView() {
  return (
    <PageShell outerClassName="flex h-screen bg-[#eceff2]">
      <DispatchSidebar mode="tablet" />

      <section className="relative flex-1 overflow-hidden">
        <KakaoMap className="h-full w-full" />

        <div className="absolute right-5 top-5 flex items-center gap-3">
          <span className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-xs font-bold uppercase tracking-wide text-zinc-500">
            LTE Stable
          </span>
          <span className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-xs font-bold uppercase tracking-wide text-zinc-500">
            98% Units
          </span>
          <button className="grid h-12 w-12 place-items-center rounded-xl border border-zinc-200 bg-white text-zinc-500">
            o
          </button>
        </div>

        <div className="absolute right-5 top-24 w-[430px] space-y-4">
          <DispatchPanel>
            <p className="text-4xl font-bold leading-none text-zinc-900">Emergency Setup</p>
            <p className="mt-2 text-2xl text-zinc-400">Define destination before route generation</p>

            <div className="mt-6">
              <DestinationSearchSection />
            </div>

            <p className="mt-5 text-xs font-bold uppercase tracking-widest text-zinc-400">Unit Assignment</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <button className="rounded-lg border-2 border-red-200 bg-red-50 px-3 py-3 text-sm font-bold text-red-600">
                Ambulance
              </button>
              <button className="rounded-lg bg-zinc-100 px-3 py-3 text-sm font-bold text-zinc-500">Engine 04</button>
            </div>

            <CtaButton className="mt-5 w-full px-4 py-3 text-2xl font-semibold shadow-sm">
              Generate Tactical Route
            </CtaButton>
          </DispatchPanel>

          <DispatchPanel className="border-l-4 border-l-red-600">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">Tactical ETA</p>
              <span className="rounded-full bg-red-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-red-500">
                Fastest
              </span>
            </div>
            <p className="mt-3 text-6xl font-bold leading-none text-zinc-900">
              04:12 <span className="text-3xl text-red-600">MIN</span>
            </p>

            <div className="mt-5 space-y-4">
              <div>
                <p className="text-2xl font-semibold text-zinc-800">Route Conditions</p>
                <p className="text-xl text-zinc-500">Minimal congestion on Wilshire Blvd</p>
              </div>
              <div>
                <p className="text-2xl font-semibold text-zinc-800">Remaining Distance</p>
                <p className="text-xl text-zinc-500">2.4 Miles to Extraction Point</p>
              </div>
            </div>
          </DispatchPanel>
        </div>

        <div className="absolute bottom-16 left-5 space-y-3">
          <button className="grid h-14 w-14 place-items-center rounded-xl border border-zinc-200 bg-white text-red-600 shadow-sm">
            o
          </button>
          <button className="grid h-14 w-14 place-items-center rounded-xl bg-red-600 text-white shadow-sm">+</button>
        </div>

        <div className="absolute bottom-0 left-0 right-0 flex h-10 items-center justify-between bg-[#20272c] px-4 text-[10px] font-semibold uppercase tracking-wide text-zinc-400">
          <p>
            <span className="mr-2 text-red-500">*</span>System Live
          </p>
          <p>2026 Rescue_Nav. Precision in Emergency Navigation.</p>
          <p>Lat: 34.0522 Lon: -118.2437</p>
        </div>
      </section>
    </PageShell>
  )
}

function MobileDispatchView() {
  return (
    <PageShell outerClassName="relative h-screen overflow-hidden bg-[#0f141b] text-white">
      <KakaoMap className="absolute inset-0" />
      <div
        className="pointer-events-none absolute inset-0 opacity-35"
        style={{
          background:
            'radial-gradient(circle at 40% 30%, rgba(45,55,70,0.8) 0%, rgba(20,25,33,0.65) 40%, rgba(12,15,22,0.85) 100%)',
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.09) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)',
          backgroundSize: '22px 22px',
        }}
      />

      <header className="relative z-10 flex items-center justify-between border-b border-zinc-600/50 bg-white px-4 py-3 text-zinc-800">
        <p className="text-[40px] font-bold leading-none tracking-tight text-red-600">Rescue_Nav</p>
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-zinc-100 px-3 py-2 text-xs font-bold uppercase tracking-wide text-zinc-500">
            Live
          </span>
          <span className="text-lg">!</span>
          <span className="text-lg">u</span>
        </div>
      </header>

      <section className="relative z-10 flex items-start justify-between px-4 pt-4">
        <StatusCard
          label="Status"
          value="Awaiting Dispatch"
          layout="stack"
          className="w-[170px] rounded-2xl border border-zinc-300 bg-white/95 p-3 text-zinc-900 shadow-sm"
          labelClassName="text-xs font-bold uppercase tracking-wide text-zinc-500"
          valueClassName="mt-2 text-4xl font-bold leading-none"
        />

        <StatusCard
          label="Signal"
          value="Strong (98%)"
          layout="stack"
          className="w-[160px] rounded-2xl border border-zinc-300 bg-white/95 p-3 text-zinc-900 shadow-sm"
          labelClassName="text-xs font-bold uppercase tracking-wide text-zinc-500"
          valueClassName="mt-2 text-2xl font-bold"
        />
      </section>

      <section className="absolute bottom-20 left-4 right-4 z-20 max-h-[calc(100vh-180px)] overflow-y-auto rounded-[34px] border border-zinc-200 bg-white px-6 pb-8 pt-5 text-zinc-900 shadow-[0_-18px_32px_rgba(0,0,0,0.3)]">
        <div className="mx-auto mb-6 h-1.5 w-16 rounded-full bg-slate-200" />

        <div className="space-y-5">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">Pick-Up Location</p>
            <p className="mt-1 text-4xl font-bold leading-tight">St. Jude Medical Center, Area 4</p>
          </div>

          <DestinationSearchSection compact />

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-zinc-100 p-3">
              <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">Vehicle</p>
              <p className="mt-2 text-4xl font-bold leading-tight">Unit 04 (Medic)</p>
            </div>
            <div className="rounded-lg bg-zinc-100 p-3">
              <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">Route</p>
              <p className="mt-2 text-4xl font-bold leading-tight">Priority-1</p>
            </div>
          </div>

          <CtaButton className="w-full rounded-xl px-5 py-4 text-3xl uppercase tracking-wide shadow-[0_12px_24px_rgba(220,38,38,0.35)]">
            Start Rescue
          </CtaButton>
        </div>
      </section>

      <MobileBottomTabs />
    </PageShell>
  )
}

export default function DispatchPage() {
  const [viewport, setViewport] = useState<DispatchViewport>(() => getDispatchViewport())

  useEffect(() => {
    const handleResize = () => {
      setViewport(getDispatchViewport())
    }

    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  if (viewport === 'mobile') {
    return <MobileDispatchView />
  }

  if (viewport === 'tablet') {
    return <TabletDispatchView />
  }

  return <DesktopDispatchView />
}
