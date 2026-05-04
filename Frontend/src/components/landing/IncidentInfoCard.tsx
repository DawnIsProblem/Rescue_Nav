interface IncidentInfoCardProps {
  compact?: boolean
}

export default function IncidentInfoCard({ compact = false }: IncidentInfoCardProps) {
  return (
    <aside
      className={[
        'rounded-xl border border-zinc-200 bg-white/95 p-5 shadow-[0_10px_30px_rgba(10,10,10,0.08)] backdrop-blur',
        compact ? 'max-w-[320px]' : 'w-full max-w-[430px]',
      ].join(' ')}
    >
      <div className="mb-4 flex items-center justify-between gap-2">
        <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500">현재 사고</p>
        <span className="rounded-full bg-red-50 px-2 py-1 text-[10px] font-bold text-red-600">우선순위 1</span>
      </div>

      <p className="text-2xl font-bold leading-tight text-zinc-900">Sector 7 / Alpha-4</p>

      <div className="mt-5 grid grid-cols-2 gap-4 border-t border-zinc-100 pt-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">예상 도착</p>
          <p className="mt-1 text-4xl font-bold leading-none text-red-600">04:12</p>
        </div>
        <div className="text-right">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">거리</p>
          <p className="mt-1 text-2xl font-bold leading-none text-zinc-900">2.4 km</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 border-t border-zinc-100 pt-4 text-sm">
        <p className="font-semibold text-zinc-600">신호</p>
        <p className="text-right font-semibold text-zinc-900">양호</p>
        <p className="font-semibold text-zinc-600">날씨</p>
        <p className="text-right font-semibold text-zinc-900">약한 비 (14°C)</p>
      </div>
    </aside>
  )
}
