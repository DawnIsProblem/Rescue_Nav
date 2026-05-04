interface HistoryGridCardProps {
  badge: string
  badgeTone: 'red' | 'blue' | 'teal'
  title: string
  location: string
  eta: string
  unit: string
  date: string
  thumbnailTone: 'aqua' | 'dark' | 'coast' | 'green'
}

const badgeToneClassMap: Record<HistoryGridCardProps['badgeTone'], string> = {
  red: 'bg-red-600 text-white',
  blue: 'bg-cyan-700 text-white',
  teal: 'bg-teal-700 text-white',
}

const thumbnailToneClassMap: Record<HistoryGridCardProps['thumbnailTone'], string> = {
  aqua: 'from-[#6ba8a5] to-[#aed8d0]',
  dark: 'from-[#0f172a] to-[#334155]',
  coast: 'from-[#f0e9cf] to-[#7dd3fc]',
  green: 'from-[#d7e1cd] to-[#bfd7b0]',
}

export default function HistoryGridCard({
  badge,
  badgeTone,
  title,
  location,
  eta,
  unit,
  date,
  thumbnailTone,
}: HistoryGridCardProps) {
  return (
    <article className="rounded-xl border border-zinc-200 bg-white p-3 shadow-sm">
      <div
        className={[
          'relative h-44 overflow-hidden rounded-lg bg-gradient-to-br',
          thumbnailToneClassMap[thumbnailTone],
        ].join(' ')}
      >
        <div
          className="absolute inset-0 opacity-35"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.25) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.25) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        />
        <span
          className={[
            'absolute left-3 top-3 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wide',
            badgeToneClassMap[badgeTone],
          ].join(' ')}
        >
          {badge}
        </span>
      </div>

      <div className="mt-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-[31px] font-bold leading-none tracking-tight text-zinc-900">{title}</p>
          <p className="mt-1 text-sm font-medium text-zinc-500">{location}</p>
        </div>
        <div className="text-right">
          <p className="text-4xl font-bold leading-none text-red-600">{eta}</p>
          <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-zinc-400">총 소요 시간</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-zinc-100 px-3 py-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">차량</p>
          <p className="mt-1 text-sm font-semibold text-zinc-700">{unit}</p>
        </div>
        <div className="rounded-lg bg-zinc-100 px-3 py-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">일시</p>
          <p className="mt-1 text-sm font-semibold text-zinc-700">{date}</p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <span className="h-5 w-5 rounded-full bg-teal-500" />
          <span className="h-5 w-5 rounded-full bg-amber-400" />
        </div>
        <button className="text-sm font-bold text-red-600 transition hover:text-red-700">보고서 보기 {'->'}</button>
      </div>
    </article>
  )
}
