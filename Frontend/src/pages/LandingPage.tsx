import { Link } from 'react-router-dom'
import AppHeader from '../components/shared/AppHeader'
import CtaButton from '../components/shared/CtaButton'
import PageShell from '../components/shared/PageShell'

const masteryItems = [
  {
    title: 'Dynamic Clearance Zones',
    description:
      'Advance algorithms identify wide-lane paths suitable for heavy emergency apparatus avoiding narrow residential bottlenecks.',
  },
  {
    title: 'Haptic Dispatching',
    description:
      'Integrated tactile feedback ensures drivers stay focused on the road while receiving turn-by-turn instruction cues.',
  },
]

function DesktopIncidentCard() {
  return (
    <aside className="w-full max-w-[430px] rounded-md border border-zinc-200 bg-white p-5 shadow-[0_12px_30px_rgba(20,20,20,0.08)]">
      <div className="flex items-center justify-between">
        <p className="text-[22px] font-bold leading-none text-zinc-800">Active Dispatch</p>
        <span className="rounded-full bg-cyan-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-cyan-700">
          Asst Unit Active
        </span>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-4 rounded-sm bg-zinc-100 px-3 py-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">ETA</p>
          <p className="mt-1 text-4xl font-bold leading-none text-zinc-900">04:12</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Distance</p>
          <p className="mt-1 text-2xl font-bold leading-none text-zinc-900">1.8 km</p>
        </div>
      </div>

      <div className="mt-3 space-y-2 border-t border-zinc-100 pt-3 text-[12px] font-semibold text-zinc-600">
        <div className="flex items-center justify-between">
          <span>Emergency-Only Route</span>
          <span className="text-zinc-400">Validated</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Visual Building Polygon</span>
          <span className="text-cyan-700">Live</span>
        </div>
      </div>
    </aside>
  )
}

function TabletIncidentCard() {
  return (
    <aside className="w-full max-w-[460px] rounded-md border border-zinc-200 bg-white p-5 shadow-[0_10px_24px_rgba(10,10,10,0.08)]">
      <div className="mb-3 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-zinc-400">
        <span>Active Incident</span>
        <span className="rounded-full bg-red-50 px-2 py-1 text-[9px] text-red-500">Priority 1</span>
      </div>

      <p className="text-3xl font-bold leading-tight text-zinc-900">Sector 7 / Alpha-4</p>

      <div className="mt-4 grid grid-cols-2 gap-4 border-y border-zinc-100 py-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">ETA</p>
          <p className="mt-1 text-5xl font-bold leading-none text-red-600">04:12</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Distance</p>
          <p className="mt-1 text-3xl font-bold leading-none text-zinc-900">2.4 km</p>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-[13px] font-semibold">
        <p className="text-zinc-400">Signal</p>
        <div className="flex gap-1">
          <span className="h-2 w-2 rounded-full bg-red-600" />
          <span className="h-2 w-2 rounded-full bg-red-600" />
          <span className="h-2 w-2 rounded-full bg-red-600" />
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between text-[13px] font-semibold">
        <p className="text-zinc-400">Weather</p>
        <p className="text-zinc-700">Light Rain (14°C)</p>
      </div>
    </aside>
  )
}

function LandingFooter() {
  return (
    <footer className="w-full border-t border-zinc-200 px-5 py-5 md:px-8 md:py-7">
      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-4 text-[11px] font-semibold uppercase tracking-wide text-zinc-400 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm normal-case tracking-normal text-zinc-700">Rescue_Nav</p>
          <p className="mt-1 text-[10px]">© 2026 Rescue_Nav. Authoritative Guardian Systems.</p>
        </div>
        <div className="flex flex-wrap gap-4 text-[10px]">
          <span>Privacy Policy</span>
          <span>Terms of Service</span>
          <span>Contact Dispatch</span>
        </div>
      </div>
    </footer>
  )
}

function DesktopLandingView() {
  return (
    <>
      <section className="relative hidden w-full overflow-hidden border-b border-zinc-200 xl:block">
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: '#f0f1f2',
            backgroundImage:
              'linear-gradient(rgba(15,23,42,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.05) 1px, transparent 1px), radial-gradient(circle at 76% 42%, rgba(221,224,228,0.8), rgba(242,243,244,0.95) 62%)',
            backgroundSize: '56px 56px, 56px 56px, cover',
          }}
        />

        <div className="relative mx-auto w-full max-w-[1280px] px-6 pb-14 pt-10">
          <div className="grid items-center gap-8 xl:grid-cols-[1.05fr_0.95fr]">
            <div>
              <span className="inline-flex rounded-full bg-red-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-red-600">
                Protocol Active
              </span>
              <h1 className="mt-4 text-[76px] font-bold leading-[0.93] tracking-tight text-zinc-900">
                Precision Navigation for
                <span className="block text-red-600">Emergency Responders</span>
              </h1>
              <p className="mt-5 max-w-2xl text-xl leading-relaxed text-zinc-600">
                Helping firefighters and ambulance drivers reach incident locations faster with optimized routing and
                visual building highlighting. Reduced latency, authoritative data.
              </p>
              <div className="mt-8 flex items-center gap-4">
                <Link to="/dashboard?view=dashboard">
                  <CtaButton className="rounded-lg px-7 py-3 text-sm font-semibold shadow-[0_10px_20px_rgba(220,38,38,0.3)]">
                    Start Navigation
                  </CtaButton>
                </Link>
                <CtaButton variant="neutral" className="rounded-lg px-7 py-3 text-sm font-semibold text-zinc-700">
                  View Documentation
                </CtaButton>
              </div>
            </div>

            <div className="flex justify-end">
              <DesktopIncidentCard />
            </div>
          </div>
        </div>
      </section>

      <section className="hidden w-full px-0 py-12 xl:block">
        <div className="mx-auto w-full max-w-[1280px] px-6">
          <div>
            <h2 className="text-5xl font-bold tracking-tight text-zinc-900">Core Technology Stack</h2>
            <p className="mt-2 max-w-3xl text-lg text-zinc-500">
              Design specifically for the unique constraints of first responders, where consumer-grade mapping falls
              short.
            </p>
          </div>

          <div className="mt-7 grid gap-4">
            <div className="grid gap-4 xl:grid-cols-[1.7fr_0.8fr]">
              <article className="rounded-lg border border-zinc-200 bg-white p-6">
                <p className="text-lg font-bold text-zinc-900">Visual Building Polygons</p>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-zinc-500">
                  High-fidelity 3D structural layers identify specific building entrances and access points before arrival.
                </p>
                <div className="mt-6 h-36 rounded bg-gradient-to-r from-zinc-400 via-zinc-300 to-zinc-500" />
              </article>

              <article className="rounded-lg border border-red-600 bg-red-600 p-6 text-white">
                <p className="text-lg font-bold">Emergency-Only Intelligence</p>
                <p className="mt-2 text-sm leading-relaxed text-red-100">
                  Bypass standard traffic constraints. Our routing engine prioritizes specialized emergency lanes and one-way bypasses.
                </p>
                <p className="mt-10 text-red-100">o</p>
              </article>
            </div>

            <div className="grid gap-4 xl:grid-cols-[0.95fr_1.3fr]">
              <article className="rounded-lg border border-zinc-200 bg-white p-6">
                <p className="text-lg font-bold text-zinc-900">Real-Time Sync</p>
                <p className="mt-2 text-sm leading-relaxed text-zinc-500">
                  Sub-second updates on traffic density and municipal dispatch overlays.
                </p>
                <div className="mt-5 h-2 rounded-full bg-zinc-200">
                  <div className="h-full w-[92%] rounded-full bg-cyan-600" />
                </div>
                <div className="mt-2 flex items-center justify-between text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
                  <span>Latency</span>
                  <span>42ms</span>
                </div>
              </article>

              <article className="rounded-lg border border-zinc-200 bg-zinc-100 p-6">
                <p className="text-lg font-bold text-zinc-900">Authoritative Reliability</p>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-500">
                  Built for command-level use, Rescue_Nav prioritizes no-failure uptime under risk constraints, ensuring no gaps.
                </p>
                <div className="mt-6 grid grid-cols-2 gap-3">
                  <div className="rounded bg-white px-4 py-3">
                    <p className="text-3xl font-bold text-red-500">0%</p>
                    <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-zinc-400">Data Loss</p>
                  </div>
                  <div className="rounded bg-white px-4 py-3">
                    <p className="text-3xl font-bold text-cyan-700">24/7</p>
                    <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-zinc-400">Uptime Sync</p>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section className="relative hidden w-full overflow-hidden border-t border-zinc-200 px-0 pb-16 pt-12 text-center xl:block">
        <div className="pointer-events-none absolute left-1/2 top-5 h-[360px] w-[360px] -translate-x-1/2 rounded-full border-[36px] border-zinc-200/70" />
        <div className="relative z-10 mx-auto w-full max-w-[1280px] px-6">
          <h2 className="text-[56px] font-bold leading-none tracking-tight text-zinc-900">Ready for deployment testing?</h2>
          <p className="mx-auto mt-4 max-w-4xl text-xl text-zinc-500">
            Join the regional pilot program and experience the difference between standard navigation and authoritative responder intelligence.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <CtaButton className="rounded-lg px-7 py-3 text-sm font-semibold shadow-[0_12px_24px_rgba(220,38,38,0.35)]">
              Launch Prototype
            </CtaButton>
            <CtaButton variant="neutral" className="rounded-lg px-7 py-3 text-sm font-semibold text-zinc-700">
              Contact Dispatch Support {'->'}
            </CtaButton>
          </div>
        </div>
      </section>
    </>
  )
}

function TabletLandingView() {
  return (
    <>
      <section className="relative hidden w-full overflow-hidden border-b border-zinc-200 md:block xl:hidden">
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: '#d8e1d9',
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.45) 2px, transparent 2px), linear-gradient(90deg, rgba(255,255,255,0.35) 2px, transparent 2px), radial-gradient(circle at 65% 45%, rgba(185,209,191,0.45), rgba(226,234,225,0.7) 55%, rgba(226,234,225,0.95) 80%)',
            backgroundSize: '72px 72px, 72px 72px, cover',
          }}
        />

        <div className="relative mx-auto w-full max-w-[1280px] px-6 pb-10 pt-10">
          <div className="grid items-start gap-8 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <span className="inline-flex rounded-full bg-red-600 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white">
                Active Response System
              </span>
              <h1 className="mt-5 text-[66px] font-bold leading-[0.94] tracking-tight text-zinc-900">
                Precision Navigation for
                <span className="block text-red-600">Emergency Responders</span>
              </h1>
              <p className="mt-5 max-w-2xl text-[30px] leading-[1.35] text-zinc-600">
                Helping firefighters and ambulance drivers reach incident locations faster with real-time authoritative data and high-stakes route optimization.
              </p>
              <div className="mt-8 flex items-center gap-4">
                <Link to="/dashboard?view=dashboard">
                  <CtaButton className="rounded-lg px-8 py-4 text-xl font-semibold shadow-[0_10px_24px_rgba(220,38,38,0.32)]">
                    Start Navigation {'->'}
                  </CtaButton>
                </Link>
                <CtaButton variant="neutral" className="rounded-lg px-8 py-4 text-xl font-semibold text-zinc-700">
                  View Case Studies
                </CtaButton>
              </div>
            </div>

            <div className="pt-6 lg:pt-10">
              <TabletIncidentCard />
            </div>
          </div>
        </div>
      </section>

      <section className="hidden w-full px-0 py-10 md:block xl:hidden">
        <div className="mx-auto w-full max-w-[1280px] px-6">
          <div className="grid gap-4">
            <div className="grid gap-4 lg:grid-cols-[1.7fr_0.85fr]">
              <article className="rounded-lg border border-zinc-200 bg-zinc-100 p-6">
                <p className="text-4xl font-bold tracking-tight text-zinc-900">Authoritative GIS Integration</p>
                <p className="mt-3 max-w-2xl text-lg leading-relaxed text-zinc-500">
                  Direct pipeline to municipal traffic systems and emergency service infrastructure, bypassing consumer-grade navigation lag.
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <span className="rounded-full bg-zinc-200 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-zinc-500">
                    Live Hydrant Data
                  </span>
                  <span className="rounded-full bg-zinc-200 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-zinc-500">
                    Road Closure Feeds
                  </span>
                </div>
              </article>

              <article className="rounded-lg border border-red-600 bg-red-600 p-6 text-white">
                <p className="text-4xl font-bold leading-tight tracking-tight">Seconds Saved, Lives Protected</p>
                <p className="mt-3 text-lg leading-relaxed text-red-100">
                  Our predictive routing reduces mobilization response time by an average of 14% in urban density environments.
                </p>
                <p className="mt-10 text-6xl font-bold">-2.4m</p>
              </article>
            </div>

            <div className="grid gap-4 lg:grid-cols-[0.9fr_1.2fr]">
              <article className="rounded-lg border border-cyan-700 bg-cyan-700 p-6 text-cyan-50">
                <p className="text-4xl font-bold tracking-tight">Mission Metadata</p>
                <p className="mt-3 text-lg leading-relaxed text-cyan-100">
                  Patient vitals and building floor plans integrated directly into the navigation overlay for seamless mission transition.
                </p>
              </article>

              <article className="rounded-lg border border-zinc-200 bg-zinc-100 p-6">
                <p className="text-4xl font-bold tracking-tight text-zinc-900">Guardian Display Protocol</p>
                <p className="mt-3 max-w-2xl text-lg leading-relaxed text-zinc-500">
                  Optimized for high-contrast viewing in direct sunlight or smoke-filled cockpits. We prioritize legibility when every millisecond counts.
                </p>
                <div className="mt-5 flex justify-end">
                  <div className="h-20 w-40 rounded bg-gradient-to-r from-zinc-900 via-zinc-700 to-zinc-500" />
                </div>
              </article>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

function MobileLandingView() {
  return (
    <>
      <section className="relative w-full overflow-hidden border-b border-zinc-200 md:hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(circle at 30% 15%, rgba(33,43,58,0.9), rgba(16,20,27,0.98) 42%, rgba(13,16,21,1) 100%)',
          }}
        />

        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              'linear-gradient(120deg, transparent 0%, transparent 48%, rgba(255,255,255,0.2) 49%, transparent 51%), linear-gradient(30deg, transparent 0%, transparent 62%, rgba(255,255,255,0.14) 63%, transparent 65%)',
          }}
        />

        <div className="relative mx-auto w-full max-w-[1280px] px-4 pb-10 pt-8 md:px-6">
          <div className="mx-auto max-w-[320px] rounded-2xl border border-zinc-200 bg-white p-5 shadow-[0_16px_32px_rgba(0,0,0,0.25)]">
            <span className="inline-flex rounded-full bg-red-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-red-600">
              Active Signal Pulse
            </span>
            <h1 className="mt-4 text-5xl font-bold leading-[1.02] tracking-tight text-zinc-900">
              Precision <span className="text-red-600">Navigation</span>
            </h1>
            <p className="mt-3 text-base leading-relaxed text-zinc-600">
              Faster response times for firefighters and ambulance drivers. Reliable routing when every second counts.
            </p>
            <CtaButton className="mt-6 w-full px-5 py-3 text-sm uppercase tracking-wide shadow-sm">
              Start Navigation
            </CtaButton>
          </div>
        </div>
      </section>

      <section className="w-full px-4 py-8 md:hidden">
        <div className="mx-auto w-full max-w-[1280px]">
          <article className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
            <p className="border-l-4 border-red-500 pl-3 text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
              Average Response Reduction
            </p>
            <p className="mt-4 text-7xl font-bold leading-none text-zinc-900">18%</p>
            <p className="mt-1 text-xs font-semibold text-red-500">YoY</p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-md bg-cyan-700 p-3 text-white">
                <p className="text-2xl font-bold">99.9%</p>
                <p className="mt-1 text-[10px] uppercase tracking-wide text-cyan-100">Uptime Window</p>
              </div>
              <div className="rounded-md bg-zinc-100 p-3 text-zinc-900">
                <p className="text-2xl font-bold">Real-time</p>
                <p className="mt-1 text-[10px] uppercase tracking-wide text-zinc-500">Traffic Sync</p>
              </div>
            </div>
          </article>

          <div className="mt-8">
            <h2 className="border-l-4 border-red-500 pl-3 text-4xl font-bold tracking-tight text-zinc-900">
              Operational Mastery
            </h2>
            <div className="mt-4 space-y-3">
              {masteryItems.map((item) => (
                <article key={item.title} className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
                  <p className="text-[22px] font-bold leading-tight text-zinc-900">{item.title}</p>
                  <p className="mt-2 text-[12px] leading-relaxed text-zinc-600">{item.description}</p>
                </article>
              ))}
            </div>
          </div>

          <section className="mt-7 rounded-xl border border-zinc-700 bg-zinc-900 p-5 text-white">
            <h2 className="text-5xl font-bold leading-none tracking-tight">Ready for Dispatch?</h2>
            <p className="mt-3 text-sm leading-relaxed text-zinc-300">
              Equip your fleet with the most authoritative navigation system ever built for first responders.
            </p>
            <CtaButton variant="light" className="mt-5 px-4 py-2.5 text-xs uppercase tracking-wide">
              Contact Dispatch
            </CtaButton>
          </section>
        </div>
      </section>
    </>
  )
}

export default function LandingPage() {
  return (
    <PageShell outerClassName="w-full bg-[#ececec] text-zinc-900">
      <AppHeader active="main" showStartNavigation />
      <main className="w-full">
        <MobileLandingView />
        <TabletLandingView />
        <DesktopLandingView />
      </main>
      <LandingFooter />
    </PageShell>
  )
}
