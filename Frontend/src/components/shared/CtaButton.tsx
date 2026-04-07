import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface CtaButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'primary' | 'neutral' | 'light'
}

const variantClassMap: Record<NonNullable<CtaButtonProps['variant']>, string> = {
  primary: 'bg-red-600 text-white hover:bg-red-700',
  neutral: 'bg-zinc-200 text-zinc-700 hover:bg-zinc-300',
  light: 'bg-white text-zinc-900 hover:bg-zinc-100',
}

export default function CtaButton({
  children,
  variant = 'primary',
  className,
  type = 'button',
  ...rest
}: CtaButtonProps) {
  return (
    <button
      type={type}
      className={[
        'inline-flex items-center justify-center rounded-lg font-bold transition',
        variantClassMap[variant],
        className ?? '',
      ].join(' ')}
      {...rest}
    >
      {children}
    </button>
  )
}
