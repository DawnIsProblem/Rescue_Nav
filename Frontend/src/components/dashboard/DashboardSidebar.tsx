import logoImage from '../../assets/images/Logo_1.png'
import { useAppLanguage } from '../../lib/appLanguage'
import SidebarShell from '../shared/SidebarShell'

interface DashboardSidebarProps {
  currentView: 'dashboard' | 'history'
  onChangeView: (view: 'dashboard' | 'history') => void
}

export default function DashboardSidebar({ currentView, onChangeView }: DashboardSidebarProps) {
  const { language } = useAppLanguage()
  const copy = language === 'ko'
    ? {
        subtitle: '긴급 대응 내비게이션',
        dashboard: '대시보드',
        history: '이력',
      }
    : {
        subtitle: 'Emergency response navigation',
        dashboard: 'Dashboard',
        history: 'History',
      }

  return (
    <SidebarShell
      className="hidden min-h-screen w-[225px] flex-col border-r border-zinc-300 bg-[#e5e7eb] px-5 py-6 md:flex"
      header={
        <>
          <img
            src={logoImage}
            alt="Rescue_Nav"
            className="h-auto w-[50px]"
          />
          <p className="mt-2 text-[11px] font-semibold uppercase tracking-wide text-zinc-500">{copy.subtitle}</p>
        </>
      }
      nav={
        <nav className="mt-8 space-y-2">
          <button
            onClick={() => onChangeView('dashboard')}
            className={[
              'flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-semibold transition',
              currentView === 'dashboard'
                ? 'bg-red-50 text-red-600'
                : 'text-slate-500 hover:bg-zinc-100 hover:text-zinc-700',
            ].join(' ')}
          >
            <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4 shrink-0 fill-current">
              <path d="M3 3h6v6H3V3Zm8 0h6v4h-6V3ZM3 11h6v6H3v-6Zm8-2h6v8h-6V9Z" />
            </svg>
            {copy.dashboard}
          </button>
          <button
            onClick={() => onChangeView('history')}
            className={[
              'flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-semibold transition',
              currentView === 'history'
                ? 'bg-red-50 text-red-600'
                : 'text-slate-500 hover:bg-zinc-100 hover:text-zinc-700',
            ].join(' ')}
          >
            <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4 shrink-0 fill-none stroke-current" strokeWidth="1.8">
              <path d="M5 4.5h10" strokeLinecap="round" />
              <path d="M5 8.5h10" strokeLinecap="round" />
              <path d="M5 12.5h7" strokeLinecap="round" />
              <path d="M5 16.5h7" strokeLinecap="round" />
              <circle cx="14.5" cy="15.5" r="1.5" fill="currentColor" stroke="none" />
            </svg>
            {copy.history}
          </button>
        </nav>
      }
    />
  )
}
