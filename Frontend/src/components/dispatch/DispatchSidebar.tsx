import CtaButton from '../shared/CtaButton'
import SidebarMenu from '../shared/SidebarMenu'
import SidebarShell from '../shared/SidebarShell'

interface DispatchSidebarProps {
  mode: 'desktop' | 'tablet'
}

const desktopItems = ['Dispatch', 'History', 'Support']
const tabletItems = ['Dispatch', 'Routes', 'Vehicles', 'Analytics']

export default function DispatchSidebar({ mode }: DispatchSidebarProps) {
  const isDesktop = mode === 'desktop'
  const items = (isDesktop ? desktopItems : tabletItems).map((label, index) => ({
    label,
    icon: index === 0 ? 'o' : '+',
    active: index === 0,
  }))

  return (
    <SidebarShell
      className="flex h-full w-[230px] flex-col border-r border-zinc-300 bg-[#e5e7eb] px-5 py-6"
      header={
        <>
          <p className="text-[40px] font-bold leading-none tracking-tight text-red-600">Rescue_Nav</p>
          <p className="mt-2 text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
            {isDesktop ? 'Emergency Response' : 'Command Center'}
          </p>
        </>
      }
      topContent={
        !isDesktop ? (
          <div className="mt-7 flex items-center gap-3 rounded-xl bg-zinc-100 p-3">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-amber-100 text-sm">c</span>
            <div>
              <p className="text-sm font-semibold text-zinc-900">Command Center</p>
              <p className="text-xs text-zinc-500">Active Units: 12</p>
            </div>
          </div>
        ) : null
      }
      nav={<SidebarMenu className="mt-8 space-y-2" items={items} inactiveClassName="text-slate-500 hover:bg-zinc-100 hover:text-zinc-700" />}
      footer={
        <div className="space-y-4">
          <CtaButton className="w-full px-4 py-3 text-sm shadow-[0_10px_18px_rgba(220,38,38,0.28)]">
            {isDesktop ? 'START RESCUE' : 'New Rescue'}
          </CtaButton>
          {isDesktop ? (
            <button className="flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-700">
              <span className="text-base">*</span>
              Settings
            </button>
          ) : null}
        </div>
      }
    />
  )
}
