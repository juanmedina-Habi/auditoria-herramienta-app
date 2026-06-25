import type { ReactNode } from 'react'
import { cn } from '../../lib/utils'

type PageHeaderProps = {
  title: string
  subtitle?: string
  meta?: ReactNode
  actions?: ReactNode
  breadcrumbs?: string[]
  className?: string
}

export function PageHeader({
  title,
  subtitle,
  meta,
  actions,
  breadcrumbs,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn('shrink-0 space-y-1', className)}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="text-[10px] text-text-secondary">
          {breadcrumbs.map((b, i) => (
            <span key={`${b}-${i}`}>
              {i > 0 && ' / '}
              {b}
            </span>
          ))}
        </nav>
      )}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-lg font-bold leading-tight text-text-primary">{title}</h1>
          {subtitle && <p className="text-[11px] text-text-secondary">{subtitle}</p>}
        </div>
        {(meta || actions) && (
          <div className="flex shrink-0 items-center gap-2">
            {meta}
            {actions}
          </div>
        )}
      </div>
    </div>
  )
}

export const pageShellClass = 'flex flex-col gap-2.5'
