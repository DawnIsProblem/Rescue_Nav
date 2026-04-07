import CtaButton from '../shared/CtaButton'
import SidebarMenu from '../shared/SidebarMenu'
import SidebarShell from '../shared/SidebarShell'

interface HistorySidebarProps {
  mode: 'desktop' | 'tablet'
}

export default function HistorySidebar({ mode }: HistorySidebarProps) {
  if (mode === 'tablet') {
    return (
      <aside className="w-14 border-r border-zinc-200 bg-white/70 px-2 py-6">
        <SidebarMenu
          className="space-y-4"
          items={['o', '+', '*', '/'].map((icon, index) => ({
            label: icon,
            icon: undefined,
            active: index === 0,
            ariaLabel: `rail-${index}`,
          }))}
          itemClassName="grid h-9 w-9 place-items-center rounded-lg text-sm transition"
        />
      </aside>
    )
  }

  return (
    <SidebarShell
      className="flex min-h-screen w-[230px] flex-col border-r border-zinc-200 bg-[#e5e7eb] px-5 py-6"
      header={
        <>
          <p className="text-[40px] font-bold leading-none tracking-tight text-red-600">Rescue_Nav</p>
          <p className="mt-2 text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
            Emergency Response
          </p>
        </>
      }
      nav={
        <SidebarMenu
          className="mt-8 space-y-2"
          items={['Dispatch', 'History', 'Support'].map((label, index) => ({
            label,
            active: index === 1,
            icon: index === 1 ? 'o' : '+',
          }))}
          inactiveClassName="text-slate-500 hover:bg-zinc-100 hover:text-zinc-700"
        />
      }
      footer={
        <div className="space-y-4">
          <CtaButton className="w-full px-4 py-3 text-sm shadow-[0_10px_18px_rgba(220,38,38,0.28)]">
            START RESCUE
          </CtaButton>
          <button className="flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-700">
            <span className="text-base">*</span>
            Settings
          </button>
        </div>
      }
    />
  )
}
