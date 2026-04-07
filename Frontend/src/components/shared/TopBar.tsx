import type { ReactNode } from 'react'

interface TopBarProps {
  left?: ReactNode
  right?: ReactNode
  className?: string
  leftClassName?: string
  rightClassName?: string
}

export default function TopBar({
  left,
  right,
  className,
  leftClassName,
  rightClassName,
}: TopBarProps) {
  return (
    <header className={['flex items-center justify-between', className ?? ''].join(' ')}>
      <div className={leftClassName}>{left}</div>
      <div className={rightClassName}>{right}</div>
    </header>
  )
}
