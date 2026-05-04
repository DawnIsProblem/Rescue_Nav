import { Link } from 'react-router-dom'
import landingHeroImage from '../assets/images/landing_hero.webp'
import { useAppLanguage } from '../lib/appLanguage'
import AppHeader from '../components/shared/AppHeader'
import CtaButton from '../components/shared/CtaButton'
import PageShell from '../components/shared/PageShell'
import SiteFooter from '../components/shared/SiteFooter'

function DesktopIncidentCard({ language }: { language: 'ko' | 'en' }) {
  const copy = language === 'ko'
    ? {
        title: '현재 출동',
        badge: '지원 차량 운용 중',
        eta: '예상 도착',
        distance: '거리',
        route: '긴급 차량 전용 경로',
        routeStatus: '검증 완료',
        visual: '건물 외곽 시각화',
        realtime: '실시간',
      }
    : {
        title: 'Active Dispatch',
        badge: 'Support unit in operation',
        eta: 'ETA',
        distance: 'Distance',
        route: 'Emergency-only route',
        routeStatus: 'Verified',
        visual: 'Building outline view',
        realtime: 'Live',
      }

  return (
    <aside className="w-full max-w-[430px] rounded-md border border-zinc-200 bg-white p-5 shadow-[0_12px_30px_rgba(20,20,20,0.08)]">
      <div className="flex items-center justify-between">
        <p className="text-[22px] font-bold leading-none text-zinc-800">{copy.title}</p>
        <span className="rounded-full bg-cyan-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-cyan-700">
          {copy.badge}
        </span>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-4 rounded-sm bg-zinc-100 px-3 py-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{copy.eta}</p>
          <p className="mt-1 text-4xl font-bold leading-none text-zinc-900">04:12</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{copy.distance}</p>
          <p className="mt-1 text-2xl font-bold leading-none text-zinc-900">1.8 km</p>
        </div>
      </div>

      <div className="mt-3 space-y-2 border-t border-zinc-100 pt-3 text-[12px] font-semibold text-zinc-600">
        <div className="flex items-center justify-between">
          <span>{copy.route}</span>
          <span className="text-zinc-400">{copy.routeStatus}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>{copy.visual}</span>
          <span className="text-cyan-700">{copy.realtime}</span>
        </div>
      </div>
    </aside>
  )
}

function TabletIncidentCard({ language }: { language: 'ko' | 'en' }) {
  const copy = language === 'ko'
    ? {
        incident: '현재 사고',
        priority: '우선순위 1',
        eta: '예상 도착',
        distance: '거리',
        signal: '신호',
        weather: '날씨',
        weatherValue: '약한 비 (14°C)',
      }
    : {
        incident: 'Current incident',
        priority: 'Priority 1',
        eta: 'ETA',
        distance: 'Distance',
        signal: 'Signal',
        weather: 'Weather',
        weatherValue: 'Light rain (14°C)',
      }

  return (
    <aside className="w-full max-w-[460px] rounded-md border border-zinc-200 bg-white p-5 shadow-[0_10px_24px_rgba(10,10,10,0.08)]">
      <div className="mb-3 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-zinc-400">
        <span>{copy.incident}</span>
        <span className="rounded-full bg-red-50 px-2 py-1 text-[9px] text-red-500">{copy.priority}</span>
      </div>

      <p className="text-3xl font-bold leading-tight text-zinc-900">Sector 7 / Alpha-4</p>

      <div className="mt-4 grid grid-cols-2 gap-4 border-y border-zinc-100 py-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{copy.eta}</p>
          <p className="mt-1 text-5xl font-bold leading-none text-red-600">04:12</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{copy.distance}</p>
          <p className="mt-1 text-3xl font-bold leading-none text-zinc-900">2.4 km</p>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-[13px] font-semibold">
        <p className="text-zinc-400">{copy.signal}</p>
        <div className="flex gap-1">
          <span className="h-2 w-2 rounded-full bg-red-600" />
          <span className="h-2 w-2 rounded-full bg-red-600" />
          <span className="h-2 w-2 rounded-full bg-red-600" />
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between text-[13px] font-semibold">
        <p className="text-zinc-400">{copy.weather}</p>
        <p className="text-zinc-700">{copy.weatherValue}</p>
      </div>
    </aside>
  )
}

function UnifiedFeatureSection({ language }: { language: 'ko' | 'en' }) {
  const copy = language === 'ko'
    ? {
        title1: 'OSM 기반 긴급경로 엔진',
        body1: '일반 내비게이션 경로를 그대로 쓰지 않고, OSM 그래프와 A* 탐색으로 긴급차량 전용 경로를 계산합니다.',
        tag1: 'A* 경로 탐색',
        tag2: '긴급차량 규칙 반영',
        title2: '일반경로보다 더 빠른 판단',
        body2: '일반 경로와 긴급 경로를 함께 계산해 출동 상황에서 더 빠른 도착 가능 경로를 바로 비교할 수 있습니다.',
        accent2: 'ETA 비교',
        title3: 'Fallback 사유까지 설명',
        body3: '그래프 기반 계산이 어려운 경우에도 fallback 경로와 사유를 함께 제공해, 결과를 더 신뢰하고 해석할 수 있습니다.',
        title4: '1.4초대 그래프 준비',
        body4: 'snapshot preload 방식으로 대용량 도로 그래프를 빠르게 불러와, 출동 전 대기 시간을 크게 줄였습니다.',
      }
    : {
        title1: 'OSM-based emergency routing engine',
        body1: 'Instead of reusing a standard navigation path, the service computes an emergency-only route with an OSM graph and A* search.',
        tag1: 'A* route search',
        tag2: 'Emergency vehicle rules',
        title2: 'Faster judgment than a standard route',
        body2: 'Emergency and standard routes are calculated together so dispatch teams can compare faster arrival options immediately.',
        accent2: 'ETA comparison',
        title3: 'Fallback reasons included',
        body3: 'Even when graph-based routing is difficult, the service provides the fallback route with its reason for clearer interpretation.',
        title4: 'Graph ready in about 1.4 seconds',
        body4: 'Snapshot preload brings in the road graph quickly and reduces waiting time before dispatch.',
      }

  return (
    <section className="w-full px-4 py-8 md:px-6 md:py-10 xl:px-0 xl:py-12">
      <div className="mx-auto w-full max-w-[1280px] xl:px-6">
        <div className="grid gap-4">
          <div className="grid gap-4 lg:grid-cols-[1.7fr_0.85fr]">
            <article className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm md:p-6">
              <p className="text-[22px] font-bold tracking-tight text-zinc-900 md:text-4xl">{copy.title1}</p>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-500 md:text-lg">
                {copy.body1}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <span className="rounded-full bg-zinc-200 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-zinc-500">
                  {copy.tag1}
                </span>
                <span className="rounded-full bg-zinc-200 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-zinc-500">
                  {copy.tag2}
                </span>
              </div>
            </article>

            <article className="rounded-lg border border-red-600 bg-red-600 p-5 text-white shadow-sm md:p-6">
              <p className="text-[22px] font-bold leading-tight tracking-tight md:text-4xl">{copy.title2}</p>
              <p className="mt-3 text-sm leading-relaxed text-red-100 md:text-lg">
                {copy.body2}
              </p>
              <p className="mt-8 text-6xl font-bold leading-none md:mt-10 md:text-7xl">{copy.accent2}</p>
            </article>
          </div>

          <div className="grid gap-4 lg:grid-cols-[0.9fr_1.2fr]">
            <article className="rounded-lg border border-cyan-700 bg-cyan-700 p-5 text-cyan-50 shadow-sm md:p-6">
              <p className="text-[22px] font-bold tracking-tight md:text-4xl">{copy.title3}</p>
              <p className="mt-3 text-sm leading-relaxed text-cyan-100 md:text-lg">
                {copy.body3}
              </p>
            </article>

            <article className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm md:p-6">
              <p className="text-[22px] font-bold tracking-tight text-zinc-900 md:text-4xl">{copy.title4}</p>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-500 md:text-lg">
                {copy.body4}
              </p>
              <div className="mt-6 flex justify-end">
                <div className="h-12 w-24 rounded bg-gradient-to-r from-zinc-900 via-zinc-700 to-zinc-500 md:h-20 md:w-40" />
              </div>
            </article>
          </div>
        </div>
      </div>
    </section>
  )
}

function DesktopLandingView({ language }: { language: 'ko' | 'en' }) {
  const copy = language === 'ko'
    ? {
        badge: '시스템 가동 중',
        title1: '긴급 대응을 위한',
        title2: '정밀 내비게이션',
        body: '소방차와 구급차가 사고 지점에 더 빠르게 도착할 수 있도록 최적 경로와 건물 시각화를 제공합니다. 지연은 줄이고, 현장 판단에 필요한 정보를 더 정확하게 전달합니다.',
        primary: '경로 탐색 시작',
        secondary: '안내 문서 보기',
      }
    : {
        badge: 'System online',
        title1: 'Precision navigation',
        title2: 'for emergency response',
        body: 'Provides optimized routing and building visualization so fire engines and ambulances can reach incident sites faster with clearer operational context.',
        primary: 'Start Route Search',
        secondary: 'View Guide',
      }

  return (
    <>
      <section className="relative hidden h-[620px] w-full overflow-hidden border-b border-zinc-200 xl:block">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              `linear-gradient(90deg, rgba(245, 247, 250, 0.9) 0%, rgba(245, 247, 250, 0.72) 42%, rgba(245, 247, 250, 0.38) 68%, rgba(245, 247, 250, 0.16) 100%), linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.04) 100%), url(${landingHeroImage})`,
            backgroundPosition: 'center center',
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover',
          }}
        />

        <div className="relative mx-auto flex h-full w-full max-w-[1280px] px-6">
          <div className="grid w-full items-center gap-8 xl:grid-cols-[1.05fr_0.95fr]">
            <div>
              <span className="inline-flex rounded-full bg-red-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-red-600">
                {copy.badge}
              </span>
              <h1 className="mt-4 text-[76px] font-bold leading-[0.93] tracking-tight text-zinc-900">
                {copy.title1}
                <span className="block text-red-600">{copy.title2}</span>
              </h1>
              <p className="mt-5 max-w-2xl text-xl leading-relaxed text-zinc-600">
                {copy.body}
              </p>
              <div className="mt-8 flex items-center gap-4">
                <Link to="/dashboard?view=dashboard">
                  <CtaButton className="rounded-lg px-7 py-3 text-sm font-semibold shadow-[0_10px_20px_rgba(220,38,38,0.3)]">
                    {copy.primary}
                  </CtaButton>
                </Link>
                <Link to="/support">
                  <CtaButton variant="neutral" className="rounded-lg px-7 py-3 text-sm font-semibold text-zinc-700">
                    {copy.secondary}
                  </CtaButton>
                </Link>
              </div>
            </div>

            <div className="flex justify-end">
              <DesktopIncidentCard language={language} />
            </div>
          </div>
        </div>
      </section>

    </>
  )
}

function TabletLandingView({ language }: { language: 'ko' | 'en' }) {
  const copy = language === 'ko'
    ? {
        badge: '긴급 대응 시스템 작동 중',
        title1: '긴급 대응을 위한',
        title2: '정밀 내비게이션',
        body: '실시간 정보와 긴급 경로 최적화를 통해 소방차와 구급차가 현장에 더 빠르게 도착하도록 돕습니다.',
        primary: '경로 탐색 시작',
        secondary: '안내 문서 보기',
      }
    : {
        badge: 'Emergency response system active',
        title1: 'Precision navigation',
        title2: 'for emergency response',
        body: 'Helps fire engines and ambulances reach the scene faster through live updates and emergency route optimization.',
        primary: 'Start Route Search',
        secondary: 'View Guide',
      }

  return (
    <>
      <section className="relative hidden w-full overflow-hidden border-b border-zinc-200 md:block xl:hidden">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              `linear-gradient(90deg, rgba(240, 245, 241, 0.88) 0%, rgba(240, 245, 241, 0.7) 44%, rgba(240, 245, 241, 0.34) 70%, rgba(240, 245, 241, 0.16) 100%), linear-gradient(180deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.04) 100%), url(${landingHeroImage})`,
            backgroundPosition: 'center center',
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover',
          }}
        />

        <div className="relative mx-auto w-full max-w-[1280px] px-6 pb-10 pt-10">
          <div className="grid items-start gap-8 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <span className="inline-flex rounded-full bg-red-600 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white">
                {copy.badge}
              </span>
              <h1 className="mt-5 text-[66px] font-bold leading-[0.94] tracking-tight text-zinc-900">
                {copy.title1}
                <span className="block text-red-600">{copy.title2}</span>
              </h1>
              <p className="mt-5 max-w-2xl text-[30px] leading-[1.35] text-zinc-600">
                {copy.body}
              </p>
              <div className="mt-8 flex items-center gap-4">
                <Link to="/dashboard?view=dashboard">
                  <CtaButton className="rounded-lg px-8 py-4 text-xl font-semibold shadow-[0_10px_24px_rgba(220,38,38,0.32)]">
                    {copy.primary}
                  </CtaButton>
                </Link>
                <Link to="/support">
                  <CtaButton variant="neutral" className="rounded-lg px-8 py-4 text-xl font-semibold text-zinc-700">
                    {copy.secondary}
                  </CtaButton>
                </Link>
              </div>
            </div>

            <div className="pt-6 lg:pt-10">
              <TabletIncidentCard language={language} />
            </div>
          </div>
        </div>
      </section>

    </>
  )
}

function MobileLandingView({ language }: { language: 'ko' | 'en' }) {
  const copy = language === 'ko'
    ? {
        badge: '시스템 연결 정상',
        title1: '정밀',
        title2: '내비게이션',
        body: '소방차와 구급차의 출동 시간을 줄여주는 신뢰 가능한 경로 안내를 제공합니다.',
        primary: '경로 탐색 시작',
      }
    : {
        badge: 'System connected',
        title1: 'Precision',
        title2: 'Navigation',
        body: 'Provides trusted route guidance that helps reduce dispatch time for fire engines and ambulances.',
        primary: 'Start Route Search',
      }

  return (
    <>
      <section className="relative w-full overflow-hidden border-b border-zinc-200 md:hidden">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              `linear-gradient(180deg, rgba(14, 18, 24, 0.74) 0%, rgba(14, 18, 24, 0.64) 36%, rgba(14, 18, 24, 0.82) 100%), linear-gradient(120deg, rgba(13,16,21,0.76) 0%, rgba(13,16,21,0.32) 100%), url(${landingHeroImage})`,
            backgroundPosition: 'center center',
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover',
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
              {copy.badge}
            </span>
            <h1 className="mt-4 text-5xl font-bold leading-[1.02] tracking-tight text-zinc-900">
              {copy.title1} <span className="text-red-600">{copy.title2}</span>
            </h1>
            <p className="mt-3 text-base leading-relaxed text-zinc-600">
              {copy.body}
            </p>
            <Link to="/dashboard?view=dashboard" className="mt-6 block">
              <CtaButton className="w-full px-5 py-3 text-sm uppercase tracking-wide shadow-sm">
                {copy.primary}
              </CtaButton>
            </Link>
          </div>
        </div>
      </section>

    </>
  )
}

export default function LandingPage() {
  const { language } = useAppLanguage()

  return (
    <PageShell outerClassName="w-full bg-[#ffffff] text-zinc-900">
      <AppHeader active="main" showStartNavigation />
      <main className="w-full">
        <MobileLandingView language={language} />
        <TabletLandingView language={language} />
        <DesktopLandingView language={language} />
        <UnifiedFeatureSection language={language} />
      </main>
      <SiteFooter />
    </PageShell>
  )
}
