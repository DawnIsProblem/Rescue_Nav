import type { ReactNode } from 'react'

interface DispatchPanelProps {
  className?: string
  children: ReactNode
}

export default function DispatchPanel({ className, children }: DispatchPanelProps) {
  return (
    <section className={['rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm', className ?? ''].join(' ')}>
      {children}
    </section>
  )
}
