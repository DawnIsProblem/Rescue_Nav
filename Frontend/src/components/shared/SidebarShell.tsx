import type { ReactNode } from 'react'

interface SidebarShellProps {
  className?: string
  header: ReactNode
  nav: ReactNode
  footer?: ReactNode
  topContent?: ReactNode
}

export default function SidebarShell({
  className,
  header,
  nav,
  footer,
  topContent,
}: SidebarShellProps) {
  return (
    <aside className={className}>
      <div>
        {header}
        {topContent}
      </div>
      {nav}
      {footer ? <div className="mt-auto">{footer}</div> : null}
    </aside>
  )
}
