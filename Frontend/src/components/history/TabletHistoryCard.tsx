interface TabletHistoryCardProps {
  badge: string
  badgeTone: 'red' | 'blue'
  title: string
  eta: string
  vehicle: string
  timestamp: string
}

const toneClassMap: Record<TabletHistoryCardProps['badgeTone'], string> = {
  red: 'bg-red-100 text-red-600',
  blue: 'bg-cyan-100 text-cyan-700',
}

export default function TabletHistoryCard({
  badge,
  badgeTone,
  title,
  eta,
  vehicle,
  timestamp,
}: TabletHistoryCardProps) {
  return (
    <article className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm">
      <div className="relative h-44 bg-gradient-to-br from-zinc-200 to-zinc-300">
        <div
          className="absolute inset-0 opacity-35"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.35) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />
        <span
          className={[
            'absolute left-3 top-3 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wide',
            toneClassMap[badgeTone],
          ].join(' ')}
        >
          {badge}
        </span>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">사고 위치</p>
            <p className="mt-1 text-3xl font-bold leading-tight text-zinc-900">{title}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">예상 도착</p>
            <p className="mt-1 text-4xl font-bold text-red-600">{eta}</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-md bg-zinc-100 p-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">차량 종류</p>
            <p className="mt-1 text-sm font-semibold text-zinc-700">{vehicle}</p>
          </div>
          <div className="rounded-md bg-zinc-100 p-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">출동 시각</p>
            <p className="mt-1 text-sm font-semibold text-zinc-700">{timestamp}</p>
          </div>
        </div>
      </div>
    </article>
  )
}
