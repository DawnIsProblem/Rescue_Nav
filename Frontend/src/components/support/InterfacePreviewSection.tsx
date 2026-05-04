import interfacePreviewImage from '../../assets/images/Interface_Previews.png'
import { useAppLanguage } from '../../lib/appLanguage'

export default function InterfacePreviewSection() {
  const { language } = useAppLanguage()
  const copy = language === 'ko'
    ? {
        title: '화면 미리보기',
        routeSummary: '경로 계산 요약',
        routeSummaryEta: '긴급 경로 ETA: 11분 37초',
        routeSummaryDistance: '거리: 6.06 km',
        routeSummaryStrategy: '전략: OSM_GRAPH_ASTAR',
        routeReason: '경로 판단 근거',
        routeReasonValue: '신뢰도 64%',
        routeReasonDescription: '일반 경로 대비 ETA가 더 짧아 긴급 경로를 우선 추천한 예시입니다.',
        example: '해당 정보는 예시 문구입니다.',
        imageAlt: 'Rescue_Nav 인터페이스 미리보기',
      }
    : {
        title: 'Screen Preview',
        routeSummary: 'Route Calculation Summary',
        routeSummaryEta: 'Emergency route ETA: 11m 37s',
        routeSummaryDistance: 'Distance: 6.06 km',
        routeSummaryStrategy: 'Strategy: OSM_GRAPH_ASTAR',
        routeReason: 'Route Selection Basis',
        routeReasonValue: 'Confidence 64%',
        routeReasonDescription: 'This example prioritizes the emergency route because its ETA is shorter than the standard route.',
        example: 'This information is sample text.',
        imageAlt: 'Rescue_Nav interface preview',
      }

  return (
    <section>
      <div className="mb-3 flex items-center gap-3">
        <h2 className="text-3xl font-bold tracking-tight text-zinc-900">{copy.title}</h2>
        <div className="h-px flex-1 bg-zinc-200" />
      </div>

      <div className="grid gap-3 md:grid-cols-[2fr_1fr]">
        <article className="relative overflow-hidden rounded-lg border border-zinc-200 bg-white p-3 shadow-sm md:p-4">
          <div className="overflow-hidden rounded border border-zinc-200 bg-zinc-50">
            <img
              src={interfacePreviewImage}
              alt={copy.imageAlt}
              className="h-[220px] w-full object-cover object-center md:h-[320px] xl:h-[380px]"
            />
          </div>
        </article>

        <div className="space-y-3">
          <article className="rounded-lg border border-zinc-200 bg-white p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">{copy.routeSummary}</p>
            <div className="mt-3 space-y-2 text-sm font-semibold text-zinc-700">
              <div className="rounded bg-zinc-100 px-3 py-2">{copy.routeSummaryEta}</div>
              <div className="rounded bg-zinc-100 px-3 py-2">{copy.routeSummaryDistance}</div>
              <div className="rounded bg-zinc-100 px-3 py-2">{copy.routeSummaryStrategy}</div>
            </div>
            <p className="mt-3 text-[11px] leading-relaxed text-zinc-400">{copy.example}</p>
          </article>

          <article className="rounded-lg border border-zinc-200 bg-[#1f2937] p-4 text-white">
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">{copy.routeReason}</p>
            <p className="mt-4 text-5xl font-bold leading-none md:text-6xl">{copy.routeReasonValue}</p>
            <p className="mt-3 text-sm leading-relaxed text-zinc-300">
              {copy.routeReasonDescription}
            </p>
            <p className="mt-2 text-[11px] leading-relaxed text-zinc-400">{copy.example}</p>
          </article>
        </div>
      </div>
    </section>
  )
}
