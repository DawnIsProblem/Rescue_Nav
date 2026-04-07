import type { ReactNode } from 'react'

interface FeatureCardProps {
  icon?: ReactNode
  title: string
  description?: string
  className?: string
  titleClassName?: string
  descriptionClassName?: string
  children?: ReactNode
}

export default function FeatureCard({
  icon,
  title,
  description,
  className,
  titleClassName,
  descriptionClassName,
  children,
}: FeatureCardProps) {
  return (
    <article className={['rounded-lg border border-zinc-200 p-6', className ?? 'bg-white'].join(' ')}>
      {icon ? <div className="mb-5 text-xl text-red-600">{icon}</div> : null}
      <h3 className={['text-3xl font-bold tracking-tight text-zinc-900', titleClassName ?? ''].join(' ')}>{title}</h3>
      {description ? (
        <p className={['mt-3 text-sm leading-relaxed text-zinc-600', descriptionClassName ?? ''].join(' ')}>
          {description}
        </p>
      ) : null}
      {children ? <div className="mt-5">{children}</div> : null}
    </article>
  )
}
