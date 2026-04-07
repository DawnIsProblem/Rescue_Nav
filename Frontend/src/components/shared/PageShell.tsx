import type { ReactNode } from 'react'

interface PageShellProps {
  outerClassName: string
  innerClassName?: string
  children: ReactNode
}

export default function PageShell({ outerClassName, innerClassName, children }: PageShellProps) {
  return (
    <div className={outerClassName}>
      {innerClassName ? <div className={innerClassName}>{children}</div> : children}
    </div>
  )
}
