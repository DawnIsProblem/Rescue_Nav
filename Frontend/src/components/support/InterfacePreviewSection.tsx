export default function InterfacePreviewSection() {
  return (
    <section>
      <div className="mb-3 flex items-center gap-3">
        <h2 className="text-3xl font-bold tracking-tight text-zinc-900">Interface Previews</h2>
        <div className="h-px flex-1 bg-zinc-200" />
      </div>

      <div className="grid gap-3 md:grid-cols-[2fr_1fr]">
        <article className="relative overflow-hidden rounded-lg border border-zinc-200 bg-gradient-to-br from-[#083b46] via-[#0d2f3f] to-[#0e2533] p-4">
          <div
            className="absolute inset-0 opacity-25"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,196,0,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(255,196,0,0.18) 1px, transparent 1px)',
              backgroundSize: '26px 26px',
            }}
          />
          <div className="relative h-[380px] rounded border border-cyan-900/40" />
        </article>

        <div className="space-y-3">
          <article className="rounded-lg border border-zinc-200 bg-white p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">Unit Classification</p>
            <div className="mt-3 space-y-2 text-sm font-semibold">
              <div className="rounded bg-zinc-100 px-3 py-2 text-red-500">Class-A Medic</div>
              <div className="rounded bg-zinc-100 px-3 py-2 text-zinc-600">Heavy Rescue</div>
            </div>
            <div className="mt-3 h-20 rounded bg-gradient-to-br from-zinc-300 to-zinc-200" />
          </article>

          <article className="rounded-lg border border-zinc-200 bg-[#1f2937] p-4 text-white">
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">Tactical Telemetry</p>
            <p className="mt-4 text-6xl font-bold leading-none">99.8%</p>
            <p className="mt-1 text-sm text-zinc-300">Route recovery index</p>
          </article>
        </div>
      </div>
    </section>
  )
}
