import type { ReactNode } from 'react'

interface StatusCardProps {
  label: string
  value: string
  icon?: string
  layout?: 'row' | 'stack'
  className?: string
  labelClassName?: string
  valueClassName?: string
  children?: ReactNode
}

export default function StatusCard({
  label,
  value,
  icon,
  layout = 'row',
  className,
  labelClassName,
  valueClassName,
  children,
}: StatusCardProps) {
  if (layout === 'stack') {
    return (
      <section className={className}>
        <p className={labelClassName}>{label}</p>
        <p className={valueClassName}>{value}</p>
        {children}
      </section>
    )
  }

  return (
    <section className={className}>
      <p className={labelClassName}>
        {icon ? <span className="mr-2 inline-block">{icon}</span> : null}
        {label}
      </p>
      <p className={valueClassName}>{value}</p>
      {children}
    </section>
  )
}
