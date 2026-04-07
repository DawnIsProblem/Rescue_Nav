interface SidebarMenuItem {
  label: string
  active?: boolean
  icon?: string
  ariaLabel?: string
}

interface SidebarMenuProps {
  items: SidebarMenuItem[]
  className?: string
  itemClassName?: string
  activeClassName?: string
  inactiveClassName?: string
}

export default function SidebarMenu({
  items,
  className,
  itemClassName = 'flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-semibold transition',
  activeClassName = 'bg-red-50 text-red-600',
  inactiveClassName = 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700',
}: SidebarMenuProps) {
  return (
    <nav className={className}>
      {items.map((item) => (
        <button
          key={item.label}
          aria-label={item.ariaLabel}
          className={[itemClassName, item.active ? activeClassName : inactiveClassName].join(' ')}
        >
          {item.icon ? <span className="grid h-4 w-4 place-items-center text-xs">{item.icon}</span> : null}
          {item.label}
        </button>
      ))}
    </nav>
  )
}
