export default function HistoryInsightCard() {
  return (
    <article className="rounded-xl border border-[#1a2540] bg-gradient-to-br from-[#121f37] via-[#0d2039] to-[#17233f] p-6 text-white shadow-sm">
      <p className="text-xs font-bold uppercase tracking-widest text-slate-300">Performance Insights</p>
      <p className="mt-4 text-6xl font-bold leading-none">
        98.4% <span className="text-xl text-emerald-400">+1.2%</span>
      </p>
      <p className="mt-3 text-lg text-slate-200">Rescue response success rate for the current quarter.</p>
      <div className="mt-6 h-1.5 rounded-full bg-white/20">
        <div className="h-full w-1/3 rounded-full bg-red-500" />
      </div>
      <p className="mt-2 text-sm font-semibold text-slate-300">1,240 Missions</p>
      <button className="mt-5 rounded-lg bg-white/12 px-4 py-2 text-sm font-semibold text-white">
        Download Analytics PDF
      </button>
    </article>
  )
}
