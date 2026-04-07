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
    badge: 'Emergency Level 1',
    badgeTone: 'red' as const,
    title: '221B Baker Street',
    location: 'NWI 6XE, London',
    eta: '04:20',
    unit: 'Medic-44',
    date: 'Oct 24, 2023',
    thumbnailTone: 'aqua' as const,
  },
  {
    badge: 'Completed',
    badgeTone: 'blue' as const,
    title: 'Shibuya Crossing',
    location: 'Tokyo, JP',
    eta: '12:15',
    unit: 'Fire-7',
    date: 'Oct 23, 2023',
    thumbnailTone: 'dark' as const,
  },
  {
    badge: 'Critical Level 3',
    badgeTone: 'red' as const,
    title: 'Ocean Drive, 1200',
    location: 'Miami Beach, FL',
    eta: '02:45',
    unit: 'Air-Rescue 1',
    date: 'Oct 22, 2023',
    thumbnailTone: 'coast' as const,
  },
  {
    badge: 'Resolved',
    badgeTone: 'teal' as const,
    title: '45th Ave NE',
    location: 'Seattle, WA',
    eta: '08:30',
    unit: 'Patrol-90',
    date: 'Oct 21, 2023',
    thumbnailTone: 'green' as const,
  },
  {
    badge: 'Routine',
    badgeTone: 'teal' as const,
    title: 'Wall Street 11',
    location: 'Manhattan, NY',
    eta: '06:12',
    unit: 'Medic-12',
    date: 'Oct 20, 2023',
    thumbnailTone: 'green' as const,
  },
]

const tabletHistoryCards = [
  {
    badge: 'Urgent Response',
    badgeTone: 'red' as const,
    title: 'Mission St, Financial District',
    eta: '4m 12s',
    vehicle: 'Ambulance Alpha-7',
    timestamp: 'Oct 24, 08:42 AM',
  },
  {
    badge: 'Rapid Deployment',
    badgeTone: 'blue' as const,
    title: '1200 Broadway, Jack London Sq',
    eta: '7m 45s',
    vehicle: 'Engine Unit 12',
    timestamp: 'Oct 24, 07:15 AM',
  },
  {
    badge: 'Medical Support',
    badgeTone: 'blue' as const,
    title: 'S 4th St, Downtown SJ',
    eta: '2m 50s',
    vehicle: 'Rapid SUV-03',
    timestamp: 'Oct 23, 11:59 PM',
  },
  {
    badge: 'Multi-Unit Alert',
    badgeTone: 'red' as const,
    title: '101 Hillsdale Blvd, Station Park',
    eta: '11m 20s',
    vehicle: 'Rescue Van Bravo',
    timestamp: 'Oct 23, 04:30 PM',
  },
]

const mobileHistoryCards = [
  {
    badge: 'High Priority',
    badgeTone: 'red' as const,
    title: 'Structural Fire Resp.',
    subtitle: 'May 24, 2024 · 08:14 AM',
    duration: '12:44',
    metaA: '4.2 km',
    metaB: '54 km/h',
    metaC: '88%',
    cta: 'VIEW LOG >',
  },
  {
    badge: 'Routine Support',
    badgeTone: 'blue' as const,
    title: 'Equipment Delivery',
    subtitle: 'May 23, 2024 · 02:30 PM',
    duration: '45:10',
    metaA: '12.8 km',
    metaB: 'L-882',
    metaC: 'Stable',
    cta: 'ARCHIVE []',
  },
  {
    badge: 'Status Check',
    badgeTone: 'gray' as const,
    title: 'Area Perimeter Scan',
    subtitle: 'May 22, 2024 · 11:00 PM',
    duration: '08:22',
    metaA: 'IR Scan',
    metaB: 'Clear',
    metaC: '-',
    cta: 'VIEW LOG >',
  },
]

function DesktopHistoryView() {
  return (
    <PageShell outerClassName="hidden min-h-screen bg-[#eceff2] xl:flex">
      <HistorySidebar mode="desktop" />

      <main className="flex-1">
        <SearchTopBar
          placeholder="Search dispatches..."
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
              <p className="text-xs font-bold uppercase tracking-widest text-red-500">Archive Overview</p>
              <h1 className="mt-2 text-5xl font-bold leading-none tracking-tight text-zinc-900">Dispatch History</h1>
            </div>

            <div className="flex items-center gap-2">
              <CtaButton className="rounded-full px-4 py-2 text-xs">Grid</CtaButton>
              <CtaButton variant="neutral" className="rounded-full px-4 py-2 text-xs text-zinc-500">List</CtaButton>
              <CtaButton variant="neutral" className="rounded-full px-4 py-2 text-xs text-zinc-500">Filter</CtaButton>
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
            <p className="text-xs font-semibold text-zinc-400">Showing 1-6 of 240 records</p>
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
            <span>Problem</span>
            <span>Features</span>
            <span>Pricing</span>
            <span>Support</span>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <button className="text-sm font-semibold text-zinc-500">{'<-'} Back to Map</button>
          <CtaButton className="px-5 py-3 text-sm font-semibold">Start Navigation</CtaButton>
        </div>
      </header>

      <div className="flex">
        <HistorySidebar mode="tablet" />

        <main className="flex-1 px-6 pb-8 pt-5">
          <div className="mb-5 flex items-start justify-between">
            <div>
              <h1 className="text-5xl font-bold leading-none tracking-tight text-zinc-900">Dispatch History</h1>
              <p className="mt-2 text-xl text-zinc-500">Reviewing past emergency responses and unit deployments.</p>
            </div>
            <div className="flex items-center gap-2">
              <CtaButton variant="neutral" className="rounded-full px-4 py-2 text-sm font-semibold text-zinc-600">
                Filter by Date
              </CtaButton>
              <CtaButton variant="neutral" className="rounded-full px-4 py-2 text-sm font-semibold text-zinc-600">
                Export CSV
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
              View All Historic Records v
            </CtaButton>
          </div>
        </main>
      </div>

      <footer className="mt-6 flex items-center justify-between border-t border-zinc-200 px-6 py-5 text-xs font-semibold text-zinc-400">
        <p>Rescue_Nav. Precision in Emergency Navigation.</p>
        <div className="flex items-center gap-6">
          <span>Privacy Policy</span>
          <span>Terms of Service</span>
          <span>Contact Expert</span>
          <span>System Status</span>
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
        <h1 className="text-6xl font-bold leading-none tracking-tight text-zinc-900">Dispatch History</h1>
        <p className="mt-2 text-sm font-medium text-zinc-500">Reviewing 14 operations from the last 30 days</p>

        <div className="mt-4 flex gap-2">
          <CtaButton className="rounded-full px-4 py-2 text-xs uppercase tracking-wide">
            All Records
          </CtaButton>
          <CtaButton variant="neutral" className="rounded-full px-4 py-2 text-xs uppercase tracking-wide text-zinc-600">
            Emergency
          </CtaButton>
          <CtaButton variant="neutral" className="rounded-full px-4 py-2 text-xs uppercase tracking-wide text-zinc-600">
            Transport
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
