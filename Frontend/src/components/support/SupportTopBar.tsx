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
            <span>대시보드</span>
            <span>출동</span>
            <span className="border-b border-red-500 pb-0.5 text-red-600">안내</span>
          </nav>
        </>
      }
      right={
        <>
          <span className="hidden sm:inline">메인으로 돌아가기</span>
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-zinc-100 text-zinc-500">
            <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4 fill-none stroke-current" strokeWidth="1.8">
              <path d="M10 5.5v5" strokeLinecap="round" />
              <circle cx="10" cy="13.5" r="0.8" fill="currentColor" stroke="none" />
              <circle cx="10" cy="10" r="7" />
            </svg>
          </span>
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-zinc-100 text-zinc-500">
            <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4 fill-none stroke-current" strokeWidth="1.8">
              <circle cx="10" cy="7" r="3" />
              <path d="M4.5 16c1.2-2.2 3.2-3.3 5.5-3.3S14.3 13.8 15.5 16" strokeLinecap="round" />
            </svg>
          </span>
          {!compact ? (
            <span className="hidden h-7 w-7 items-center justify-center rounded-full bg-zinc-100 text-zinc-500 sm:inline-flex">
              <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4 fill-none stroke-current" strokeWidth="1.8">
                <path d="M4.5 7.5 10 4l5.5 3.5v5L10 16l-5.5-3.5v-5Z" />
              </svg>
            </span>
          ) : null}
        </>
      }
    />
  )
}
