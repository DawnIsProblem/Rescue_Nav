import HistoryGridCard from '../components/history/HistoryGridCard'
import HistoryInsightCard from '../components/history/HistoryInsightCard'
import MobileHistoryItem from '../components/history/MobileHistoryItem'
import MobileHistoryTabs from '../components/history/MobileHistoryTabs'
import HistorySidebar from '../components/history/HistorySidebar'
import TabletHistoryCard from '../components/history/TabletHistoryCard'
import CtaButton from '../components/shared/CtaButton'
import PageShell from '../components/shared/PageShell'
import SearchTopBar from '../components/shared/SearchTopBar'

const desktopHistoryCards = [
  {
    badge: '긴급 1단계',
    badgeTone: 'red' as const,
    title: '221B Baker Street',
    location: 'NWI 6XE, London',
    eta: '04:20',
    unit: '구급차 44호',
    date: '2023년 10월 24일',
    thumbnailTone: 'aqua' as const,
  },
  {
    badge: '완료',
    badgeTone: 'blue' as const,
    title: 'Shibuya Crossing',
    location: 'Tokyo, JP',
    eta: '12:15',
    unit: '소방차 7호',
    date: '2023년 10월 23일',
    thumbnailTone: 'dark' as const,
  },
  {
    badge: '위험 3단계',
    badgeTone: 'red' as const,
    title: 'Ocean Drive, 1200',
    location: 'Miami Beach, FL',
    eta: '02:45',
    unit: '항공구조 1호',
    date: '2023년 10월 22일',
    thumbnailTone: 'coast' as const,
  },
  {
    badge: '조치 완료',
    badgeTone: 'teal' as const,
    title: '45th Ave NE',
    location: 'Seattle, WA',
    eta: '08:30',
    unit: '순찰 90호',
    date: '2023년 10월 21일',
    thumbnailTone: 'green' as const,
  },
  {
    badge: '일반 출동',
    badgeTone: 'teal' as const,
    title: 'Wall Street 11',
    location: 'Manhattan, NY',
    eta: '06:12',
    unit: '구급차 12호',
    date: '2023년 10월 20일',
    thumbnailTone: 'green' as const,
  },
]

const tabletHistoryCards = [
  {
    badge: '긴급 출동',
    badgeTone: 'red' as const,
    title: 'Mission St, Financial District',
    eta: '4분 12초',
    vehicle: '구급차 Alpha-7',
    timestamp: '10월 24일 오전 8:42',
  },
  {
    badge: '신속 배치',
    badgeTone: 'blue' as const,
    title: '1200 Broadway, Jack London Sq',
    eta: '7분 45초',
    vehicle: '소방 펌프차 12호',
    timestamp: '10월 24일 오전 7:15',
  },
  {
    badge: '의료 지원',
    badgeTone: 'blue' as const,
    title: 'S 4th St, Downtown SJ',
    eta: '2분 50초',
    vehicle: '신속 대응 차량-03',
    timestamp: '10월 23일 오후 11:59',
  },
  {
    badge: '다중 출동',
    badgeTone: 'red' as const,
    title: '101 Hillsdale Blvd, Station Park',
    eta: '11분 20초',
    vehicle: '구조 밴 Bravo',
    timestamp: '10월 23일 오후 4:30',
  },
]

const mobileHistoryCards = [
  {
    badge: '최우선 대응',
    badgeTone: 'red' as const,
    title: '건축물 화재 대응',
    subtitle: '2024년 5월 24일 · 오전 8:14',
    duration: '12:44',
    metaA: '4.2 km',
    metaB: '54 km/h',
    metaC: '88%',
    cta: '기록 보기 >',
  },
  {
    badge: '정기 지원',
    badgeTone: 'blue' as const,
    title: '장비 전달',
    subtitle: '2024년 5월 23일 · 오후 2:30',
    duration: '45:10',
    metaA: '12.8 km',
    metaB: 'L-882',
    metaC: '안정',
    cta: '보관 처리',
  },
  {
    badge: '상태 점검',
    badgeTone: 'gray' as const,
    title: '현장 주변 스캔',
    subtitle: '2024년 5월 22일 · 오후 11:00',
    duration: '08:22',
    metaA: '열화상 스캔',
    metaB: '이상 없음',
    metaC: '-',
    cta: '기록 보기 >',
  },
]

function DesktopHistoryView() {
  return (
    <PageShell outerClassName="hidden min-h-screen bg-[#eceff2] xl:flex">
      <HistorySidebar mode="desktop" />

      <main className="flex-1">
        <SearchTopBar
          placeholder="출동 이력 검색..."
          className="justify-end rounded-none border-0 border-b px-6 py-4 shadow-none"
          searchWrapClassName="w-[420px] flex-none rounded-full"
          right={
            <>
              <button className="grid h-8 w-8 place-items-center text-zinc-500">!</button>
              <button className="grid h-8 w-8 place-items-center text-zinc-500">u</button>
            </>
          }
        />

        <section className="px-6 pb-8 pt-6">
          <div className="mb-5 flex items-start justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-red-500">이력 개요</p>
              <h1 className="mt-2 text-5xl font-bold leading-none tracking-tight text-zinc-900">출동 이력</h1>
            </div>

            <div className="flex items-center gap-2">
              <CtaButton className="rounded-full px-4 py-2 text-xs">격자</CtaButton>
              <CtaButton variant="neutral" className="rounded-full px-4 py-2 text-xs text-zinc-500">목록</CtaButton>
              <CtaButton variant="neutral" className="rounded-full px-4 py-2 text-xs text-zinc-500">필터</CtaButton>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <HistoryGridCard {...desktopHistoryCards[0]} />
            <HistoryGridCard {...desktopHistoryCards[1]} />
            <HistoryGridCard {...desktopHistoryCards[2]} />
            <HistoryGridCard {...desktopHistoryCards[3]} />
            <HistoryInsightCard />
            <HistoryGridCard {...desktopHistoryCards[4]} />
          </div>

          <div className="mt-8 flex items-center justify-between border-t border-zinc-200 pt-6">
            <p className="text-xs font-semibold text-zinc-400">240건 중 1-6건 표시</p>
            <div className="flex items-center gap-2">
              <button className="h-8 w-8 rounded-md border border-zinc-200 bg-white text-zinc-400">&lt;</button>
              <button className="h-8 w-8 rounded-md bg-red-600 text-sm font-bold text-white">1</button>
              <button className="h-8 w-8 rounded-md border border-zinc-200 bg-white text-sm font-bold text-zinc-500">
                2
              </button>
              <button className="h-8 w-8 rounded-md border border-zinc-200 bg-white text-sm font-bold text-zinc-500">
                3
              </button>
              <button className="h-8 w-8 rounded-md border border-zinc-200 bg-white text-zinc-400">&gt;</button>
            </div>
          </div>
        </section>
      </main>
    </PageShell>
  )
}

function TabletHistoryView() {
  return (
    <PageShell outerClassName="hidden min-h-screen bg-zinc-100 md:block xl:hidden">
      <header className="flex items-center justify-between border-b border-zinc-200 bg-white px-5 py-4">
        <div className="flex items-center gap-5">
          <p className="text-4xl font-bold leading-none tracking-tight text-red-600">Rescue_Nav</p>
          <nav className="flex items-center gap-5 text-sm font-semibold text-zinc-500">
            <span>개요</span>
            <span>기능</span>
            <span>도입</span>
            <span>안내</span>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <button className="text-sm font-semibold text-zinc-500">{'<-'} 지도로 돌아가기</button>
          <CtaButton className="px-5 py-3 text-sm font-semibold">경로 탐색 시작</CtaButton>
        </div>
      </header>

      <div className="flex">
        <HistorySidebar mode="tablet" />

        <main className="flex-1 px-6 pb-8 pt-5">
          <div className="mb-5 flex items-start justify-between">
            <div>
              <h1 className="text-5xl font-bold leading-none tracking-tight text-zinc-900">출동 이력</h1>
              <p className="mt-2 text-xl text-zinc-500">과거 긴급 출동과 차량 배치 기록을 확인합니다.</p>
            </div>
            <div className="flex items-center gap-2">
              <CtaButton variant="neutral" className="rounded-full px-4 py-2 text-sm font-semibold text-zinc-600">
                날짜별 필터
              </CtaButton>
              <CtaButton variant="neutral" className="rounded-full px-4 py-2 text-sm font-semibold text-zinc-600">
                CSV 내보내기
              </CtaButton>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {tabletHistoryCards.map((card) => (
              <TabletHistoryCard key={`${card.title}-${card.timestamp}`} {...card} />
            ))}
          </div>

          <div className="mt-8 flex justify-center">
            <CtaButton variant="neutral" className="px-6 py-3 text-sm font-semibold text-zinc-700">
              전체 이력 보기
            </CtaButton>
          </div>
        </main>
      </div>

      <footer className="mt-6 flex items-center justify-between border-t border-zinc-200 px-6 py-5 text-xs font-semibold text-zinc-400">
        <p>Rescue_Nav. 긴급 출동을 위한 정밀 내비게이션.</p>
        <div className="flex items-center gap-6">
          <span>개인정보 처리방침</span>
          <span>이용 약관</span>
          <span>문의하기</span>
          <span>시스템 상태</span>
        </div>
      </footer>
    </PageShell>
  )
}

function MobileHistoryView() {
  return (
    <PageShell outerClassName="min-h-screen bg-[#efefef] pb-24 md:hidden">
      <header className="flex items-center justify-between border-b border-zinc-200 bg-white px-5 py-4">
        <p className="text-4xl font-bold leading-none tracking-tight text-red-600">Rescue_Nav</p>
        <div className="flex items-center gap-4 text-zinc-500">
          <span>!</span>
          <span>u</span>
        </div>
      </header>

      <main className="px-5 pt-5">
        <h1 className="text-6xl font-bold leading-none tracking-tight text-zinc-900">출동 이력</h1>
        <p className="mt-2 text-sm font-medium text-zinc-500">최근 30일간 14건의 운영 기록을 확인하고 있습니다.</p>

        <div className="mt-4 flex gap-2">
          <CtaButton className="rounded-full px-4 py-2 text-xs uppercase tracking-wide">
            전체
          </CtaButton>
          <CtaButton variant="neutral" className="rounded-full px-4 py-2 text-xs uppercase tracking-wide text-zinc-600">
            긴급
          </CtaButton>
          <CtaButton variant="neutral" className="rounded-full px-4 py-2 text-xs uppercase tracking-wide text-zinc-600">
            이송
          </CtaButton>
        </div>

        <div className="mt-5 space-y-3">
          {mobileHistoryCards.map((card, index) => (
            <div key={`${card.title}-${index}`} className={index === 0 ? 'border-l-4 border-red-500 pl-2' : ''}>
              <MobileHistoryItem {...card} />
            </div>
          ))}
        </div>
      </main>

      <MobileHistoryTabs />
    </PageShell>
  )
}

export default function HistoryPage() {
  return (
    <>
      <MobileHistoryView />
      <TabletHistoryView />
      <DesktopHistoryView />
    </>
  )
}
