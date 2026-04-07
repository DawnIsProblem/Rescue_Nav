import { Link, NavLink } from 'react-router-dom'

interface AppHeaderProps {
  active: 'main' | 'support' | 'dashboard'
  showStartNavigation?: boolean
}

const baseNavClass = 'pb-1 text-zinc-500 transition hover:text-zinc-800'

export default function AppHeader({ active, showStartNavigation = false }: AppHeaderProps) {
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
              Main
            </NavLink>
            <NavLink
              to="/support"
              className={active === 'support' ? 'border-b-2 border-red-500 pb-1 text-zinc-900' : baseNavClass}
            >
              Support
            </NavLink>
            <Link
              to="/dashboard?view=history"
              className={active === 'dashboard' ? 'border-b-2 border-red-500 pb-1 text-zinc-900' : baseNavClass}
            >
              Dashboard
            </Link>
          </div>

          {showStartNavigation ? (
            <Link
              to="/dashboard?view=dashboard"
              className="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-red-700 md:px-5 md:py-2.5 md:text-sm"
            >
              Start Navigation
            </Link>
          ) : null}
        </div>
      </nav>
    </header>
  )
}
