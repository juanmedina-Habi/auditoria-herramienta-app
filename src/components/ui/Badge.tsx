import type { ReactNode } from 'react'
import { cn } from '../../lib/utils'

type BadgeProps = {
  children: ReactNode
  variant?: 'default' | 'brand' | 'outline'
  className?: string
}

const variants = {
  default: 'bg-slate-100 text-slate-700',
  brand: 'bg-brand-100 text-brand-800',
  outline: 'border border-border-soft text-text-secondary bg-white',
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium',
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  )
}
