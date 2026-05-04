import type { ChangeEvent, ReactNode } from 'react'
import TopBar from './TopBar'

interface SearchTopBarProps {
  placeholder: string
  value?: string
  onChange?: (value: string) => void
  onClear?: () => void
  disabled?: boolean
  ariaLabel?: string
  className?: string
  searchWrapClassName?: string
  inputClassName?: string
  searchClassName?: string
  right?: ReactNode
}

export default function SearchTopBar({
  placeholder,
  value = '',
  onChange,
  onClear,
  disabled = false,
  ariaLabel,
  className,
  searchWrapClassName,
  inputClassName,
  searchClassName,
  right,
}: SearchTopBarProps) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange?.(event.target.value)
  }

  return (
    <TopBar
      className={[
        'flex items-center rounded-xl border border-zinc-200 bg-white px-4 py-3 shadow-sm',
        className ?? '',
      ].join(' ')}
      leftClassName={[
        'flex flex-1 items-center gap-3 rounded-lg bg-zinc-100 px-3 py-2',
        searchWrapClassName ?? '',
      ].join(' ')}
      rightClassName={[
        right ? 'ml-4 flex items-center gap-3 text-zinc-500' : 'hidden',
        searchClassName ?? '',
      ].join(' ')}
      left={
        <label className="flex w-full items-center gap-3">
          <svg
            aria-hidden="true"
            viewBox="0 0 20 20"
            className="h-4 w-4 shrink-0 text-zinc-400"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <circle cx="8.5" cy="8.5" r="5.5" />
            <path d="M12.5 12.5 17 17" strokeLinecap="round" />
          </svg>
          <input
            type="search"
            value={value}
            onChange={handleChange}
            disabled={disabled}
            readOnly={!onChange}
            aria-label={ariaLabel ?? placeholder}
            placeholder={placeholder}
            className={[
              'w-full bg-transparent text-sm font-medium text-zinc-700 outline-none placeholder:text-zinc-400 disabled:cursor-not-allowed disabled:text-zinc-400',
              inputClassName ?? '',
            ].join(' ')}
          />
          {value && onClear ? (
            <button
              type="button"
              onClick={onClear}
              className="inline-flex h-6 w-6 items-center justify-center rounded-full text-zinc-400 transition hover:bg-zinc-200 hover:text-zinc-600"
              aria-label="검색어 지우기"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 20 20"
                className="h-3.5 w-3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path d="M5 5 15 15" strokeLinecap="round" />
                <path d="M15 5 5 15" strokeLinecap="round" />
              </svg>
            </button>
          ) : null}
        </label>
      }
      right={right}
    />
  )
}
