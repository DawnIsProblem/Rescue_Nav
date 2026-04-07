import TopBar from '../shared/TopBar'

interface SupportTopBarProps {
  compact?: boolean
}

export default function SupportTopBar({ compact = false }: SupportTopBarProps) {
  return (
    <TopBar
      className="border-b border-zinc-200 bg-white px-5 py-3"
      leftClassName="flex items-center gap-5"
      rightClassName="flex items-center gap-3 text-xs font-semibold text-zinc-500"
      left={
        <>
          <p className="text-[26px] font-bold leading-none tracking-tight text-red-600">Rescue_Nav</p>
          <nav className="hidden items-center gap-4 text-xs font-semibold text-zinc-500 sm:flex">
            <span>Dashboard</span>
            <span>Missions</span>
            <span className="border-b border-red-500 pb-0.5 text-red-600">Support</span>
          </nav>
        </>
      }
      right={
        <>
          <span className="hidden sm:inline">Back to Main</span>
          <span>!</span>
          <span>u</span>
          {!compact ? <span className="hidden sm:inline">[]</span> : null}
        </>
      }
    />
  )
}
