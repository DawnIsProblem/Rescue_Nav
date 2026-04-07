import type { ReactNode } from 'react'
import TopBar from './TopBar'

interface SearchTopBarProps {
  placeholder: string
  className?: string
  searchWrapClassName?: string
  searchClassName?: string
  right?: ReactNode
}

export default function SearchTopBar({
  placeholder,
  className,
  searchWrapClassName,
  searchClassName,
  right,
}: SearchTopBarProps) {
  return (
    <TopBar
      className={[
        'flex items-center rounded-xl border border-zinc-200 bg-white px-4 py-3 shadow-sm',
        className ?? '',
      ].join(' ')}
      leftClassName={[
        'flex flex-1 items-center gap-3 rounded-lg bg-zinc-100 px-3 py-2 text-sm font-medium text-zinc-400',
        searchWrapClassName ?? '',
      ].join(' ')}
      rightClassName={['ml-4 flex items-center gap-3 text-zinc-500', searchClassName ?? ''].join(' ')}
      left={
        <>
          <span className="text-base">o</span>
          {placeholder}
        </>
      }
      right={right}
    />
  )
}
