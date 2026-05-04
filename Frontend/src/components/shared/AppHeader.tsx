import { Link, NavLink } from 'react-router-dom'
import { useAppLanguage } from '../../lib/appLanguage'

interface AppHeaderProps {
  active: 'main' | 'support' | 'dashboard'
  showStartNavigation?: boolean
}

const baseNavClass = 'pb-1 text-zinc-500 transition hover:text-zinc-800'

export default function AppHeader({ active, showStartNavigation = false }: AppHeaderProps) {
  const { language, setLanguage } = useAppLanguage()
  const copy = language === 'ko'
    ? {
        main: '메인',
        support: '안내',
        dashboard: '대시보드',
        start: '경로 탐색 시작',
      }
    : {
        main: 'Home',
        support: 'Guide',
        dashboard: 'Dashboard',
        start: 'Start Route Search',
      }

  return (
    <header className="w-full border-b border-zinc-200 bg-white/95">
      <nav className="mx-auto flex w-full max-w-[1280px] items-center px-4 py-3 md:px-6">
        <Link to="/" className="text-2xl font-bold leading-none tracking-tight text-red-600 md:text-4xl">
          Rescue_Nav
        </Link>

        <div className="ml-auto flex items-center gap-5 md:gap-8">
          <div className="flex items-center gap-4 text-xs font-semibold md:gap-8 md:text-sm">
            <NavLink
              to="/"
              end
              className={active === 'main' ? 'border-b-2 border-red-500 pb-1 text-zinc-900' : baseNavClass}
            >
              {copy.main}
            </NavLink>
            <NavLink
              to="/support"
              className={active === 'support' ? 'border-b-2 border-red-500 pb-1 text-zinc-900' : baseNavClass}
            >
              {copy.support}
            </NavLink>
            <Link
              to="/dashboard?view=dashboard"
              className={active === 'dashboard' ? 'border-b-2 border-red-500 pb-1 text-zinc-900' : baseNavClass}
            >
              {copy.dashboard}
            </Link>
          </div>

          <div className="inline-flex items-center rounded-lg border border-zinc-200 bg-zinc-100 p-1 text-[11px] font-bold uppercase tracking-wide text-zinc-500 md:text-xs">
            <button
              type="button"
              onClick={() => setLanguage('ko')}
              className={[
                'rounded-md px-2 py-1 transition',
                language === 'ko' ? 'bg-white text-zinc-900 shadow-sm' : 'hover:bg-white/70',
              ].join(' ')}
              aria-pressed={language === 'ko'}
            >
              KO
            </button>
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={[
                'rounded-md px-2 py-1 transition',
                language === 'en' ? 'bg-white text-zinc-900 shadow-sm' : 'hover:bg-white/70',
              ].join(' ')}
              aria-pressed={language === 'en'}
            >
              EN
            </button>
          </div>

          {showStartNavigation ? (
            <Link
              to="/dashboard?view=dashboard"
              className="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-red-700 md:px-5 md:py-2.5 md:text-sm"
            >
              {copy.start}
            </Link>
          ) : null}
        </div>
      </nav>
    </header>
  )
}
