import type { ReactNode } from 'react'
import { cn } from '../../lib/utils'

type CardProps = {
  children: ReactNode
  className?: string
  title?: string
  description?: string
  action?: ReactNode
  compact?: boolean
}

export function Card({ children, className, title, description, action, compact = false }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-border-soft bg-surface-card shadow-sm transition-shadow hover:shadow-md',
        compact ? 'p-3' : 'rounded-xl p-5 shadow-sm',
        className,
      )}
    >
      {(title || action) && (
        <div className={cn('flex items-start justify-between gap-3', compact ? 'mb-2' : 'mb-4')}>
          <div className="min-w-0">
            {title && (
              <h3 className={cn('font-semibold text-text-primary', compact ? 'text-xs' : 'text-sm')}>
                <span className="mr-1.5 inline-block h-3 w-0.5 rounded-full bg-brand-500 align-middle" aria-hidden />
                {title}
              </h3>
            )}
            {description && (
              <p className={cn('text-text-secondary', compact ? 'mt-0.5 text-[10px]' : 'mt-1 text-sm')}>
                {description}
              </p>
            )}
          </div>
          {action}
        </div>
      )}
      {children}
    </div>
  )
}
