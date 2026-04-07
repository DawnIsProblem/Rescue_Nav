interface MobileHistoryItemProps {
  badge: string
  badgeTone: 'red' | 'blue' | 'gray'
  title: string
  subtitle: string
  duration: string
  metaA: string
  metaB: string
  metaC: string
  cta: string
}

const toneClassMap: Record<MobileHistoryItemProps['badgeTone'], string> = {
  red: 'bg-red-100 text-red-600',
  blue: 'bg-cyan-100 text-cyan-700',
  gray: 'bg-zinc-100 text-zinc-500',
}

export default function MobileHistoryItem({
  badge,
  badgeTone,
  title,
  subtitle,
  duration,
  metaA,
  metaB,
  metaC,
  cta,
}: MobileHistoryItemProps) {
  return (
    <article className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <span
            className={[
              'inline-flex rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wide',
              toneClassMap[badgeTone],
            ].join(' ')}
          >
            {badge}
          </span>
          <p className="mt-2 text-4xl font-bold leading-none text-zinc-900">{title}</p>
          <p className="mt-1 text-sm text-zinc-500">{subtitle}</p>
        </div>
        <div className="text-right">
          <p className="text-5xl font-bold leading-none text-red-600">{duration}</p>
          <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-zinc-400">Duration</p>
        </div>
      </div>

      <div className="mt-3 flex gap-3">
        <div className="h-28 flex-1 rounded-lg bg-gradient-to-br from-zinc-300 to-zinc-200" />
        <div className="w-[95px] space-y-1 text-sm font-semibold text-zinc-600">
          <p>{metaA}</p>
          <p>{metaB}</p>
          <p>{metaC}</p>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <p className="text-xs font-semibold text-zinc-400">Unit ID: #9940-DELTA</p>
        <button className="text-sm font-bold text-red-600">{cta}</button>
      </div>
    </article>
  )
}
