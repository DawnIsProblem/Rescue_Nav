import CtaButton from '../shared/CtaButton'
import SidebarMenu from '../shared/SidebarMenu'
import SidebarShell from '../shared/SidebarShell'

interface SupportSidebarProps {
  mode: 'desktop' | 'tablet'
}

const menuItems = ['Home', 'Rescue Guide', 'Emergency FAQ', 'Settings']

export default function SupportSidebar({ mode }: SupportSidebarProps) {
  const isGuideActive = true

  return (
    <SidebarShell
      className={[
        'flex min-h-screen flex-col border-r border-zinc-200 bg-[#eceff1] px-4 py-5',
        mode === 'desktop' ? 'w-[210px]' : 'w-[170px]',
      ].join(' ')}
      header={
        <>
          <p className="text-[30px] font-bold leading-none tracking-tight text-red-600">Rescue_Nav</p>
          {mode === 'desktop' ? (
            <p className="mt-5 text-2xl font-bold tracking-tight text-zinc-800">Support Center</p>
          ) : null}
        </>
      }
      nav={
        <SidebarMenu
          className="mt-4 space-y-1.5"
          items={menuItems.map((label, index) => ({
            label,
            active: isGuideActive && index === 1,
            icon: isGuideActive && index === 1 ? 'o' : '+',
          }))}
          itemClassName="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-semibold transition"
          activeClassName="border border-red-200 bg-red-50 text-red-600"
          inactiveClassName="text-zinc-500 hover:bg-white hover:text-zinc-700"
        />
      }
      footer={
        <CtaButton className="w-full px-4 py-2.5 text-xs uppercase tracking-wide shadow-[0_10px_18px_rgba(220,38,38,0.28)]">
          Start Rescue
        </CtaButton>
      }
    />
  )
}
