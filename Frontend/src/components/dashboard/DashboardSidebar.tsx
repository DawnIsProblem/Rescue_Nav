import CtaButton from '../shared/CtaButton'
import SidebarShell from '../shared/SidebarShell'

interface DashboardSidebarProps {
  currentView: 'dashboard' | 'history'
  onChangeView: (view: 'dashboard' | 'history') => void
}

export default function DashboardSidebar({ currentView, onChangeView }: DashboardSidebarProps) {
  return (
    <SidebarShell
      className="hidden min-h-screen w-[220px] flex-col border-r border-zinc-300 bg-[#e5e7eb] px-5 py-6 md:flex"
      header={
        <>
          <p className="text-[36px] font-bold leading-none tracking-tight text-red-600">Rescue_Nav</p>
          <p className="mt-2 text-[11px] font-semibold uppercase tracking-wide text-zinc-500">Emergency Response</p>
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
            <span className="text-base">o</span>
            Dashboard
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
            <span className="text-base">+</span>
            History
          </button>
        </nav>
      }
      footer={
        <CtaButton
          onClick={() => onChangeView('dashboard')}
          className="w-full px-4 py-3 text-sm shadow-[0_10px_18px_rgba(220,38,38,0.28)]"
        >
          START RESCUE
        </CtaButton>
      }
    />
  )
}
