interface GuideWorkflowCardProps {
  step: string
  title: string
  description: string
  icon?: string
  accent?: 'red' | 'blue'
  previewTone?: 'dark' | 'light'
}

const accentClassMap: Record<NonNullable<GuideWorkflowCardProps['accent']>, string> = {
  red: 'bg-red-50 text-red-600',
  blue: 'bg-cyan-50 text-cyan-700',
}

const previewToneClassMap: Record<NonNullable<GuideWorkflowCardProps['previewTone']>, string> = {
  dark: 'from-slate-900 to-slate-700',
  light: 'from-zinc-300 to-zinc-200',
}

export default function GuideWorkflowCard({
  step,
  title,
  description,
  icon = 'o',
  accent = 'red',
  previewTone = 'light',
}: GuideWorkflowCardProps) {
  return (
    <article className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <span
          className={[
            'inline-flex h-7 min-w-7 items-center justify-center rounded-md px-2 text-xs font-bold',
            accentClassMap[accent],
          ].join(' ')}
        >
          {step}
        </span>
        <span className="text-xs text-zinc-400">{icon}</span>
      </div>

      <p className="text-xl font-bold tracking-tight text-zinc-900">{title}</p>
      <p className="mt-2 text-sm leading-relaxed text-zinc-500">{description}</p>

      <div
        className={[
          'mt-4 h-20 rounded-md bg-gradient-to-br',
          previewToneClassMap[previewTone],
        ].join(' ')}
      />
    </article>
  )
}
