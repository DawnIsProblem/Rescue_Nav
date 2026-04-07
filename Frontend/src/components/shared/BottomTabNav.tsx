interface BottomTabItem {
  label: string
  active?: boolean
  activeIcon?: string
  inactiveIcon?: string
}

interface BottomTabNavProps {
  items: BottomTabItem[]
  className?: string
  listClassName?: string
  activeItemClassName?: string
  inactiveItemClassName?: string
  labelClassName?: string
  iconClassName?: string
}

function gridColsClass(count: number): string {
  if (count === 4) return 'grid-cols-4'
  if (count === 5) return 'grid-cols-5'
  return 'grid-cols-3'
}

export default function BottomTabNav({
  items,
  className,
  listClassName = `grid ${gridColsClass(items.length)} items-end text-center`,
  activeItemClassName = 'text-red-600',
  inactiveItemClassName = 'text-zinc-400',
  labelClassName = 'text-xs font-bold uppercase tracking-wide',
  iconClassName = 'text-lg',
}: BottomTabNavProps) {
  return (
    <nav className={className}>
      <ul className={listClassName}>
        {items.map((item) => (
          <li key={item.label} className={item.active ? activeItemClassName : inactiveItemClassName}>
            <p className={iconClassName}>{item.active ? item.activeIcon ?? 'o' : item.inactiveIcon ?? '+'}</p>
            <p className={labelClassName}>{item.label}</p>
          </li>
        ))}
      </ul>
    </nav>
  )
}
