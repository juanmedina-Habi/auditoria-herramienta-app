import type { ReactNode } from 'react'
import { TrendingDown, TrendingUp } from 'lucide-react'
import { cn } from '../../lib/utils'

type MetricCardProps = {
  label: string
  value: string | number
  icon?: ReactNode
  trend?: string
  delta?: string
  deltaDirection?: 'up' | 'down'
  deltaPositive?: boolean
  deltaLabel?: string
  variant?: 'default' | 'ok' | 'alert' | 'error' | 'pending'
  compact?: boolean
  className?: string
}

const variantStyles = {
  default: 'text-brand-600 bg-brand-50',
  ok: 'text-status-ok bg-green-50',
  alert: 'text-status-alert bg-orange-50',
  error: 'text-status-error bg-red-50',
  pending: 'text-status-pending bg-slate-100',
}

export function MetricCard({
  label,
  value,
  icon,
  trend,
  delta,
  deltaDirection,
  deltaPositive,
  deltaLabel = 'vs ayer',
  variant = 'default',
  compact = false,
  className,
}: MetricCardProps) {
  const showDelta = delta && deltaDirection
  const deltaIsGood = deltaPositive ?? deltaDirection === 'up'

  return (
    <div
      className={cn(
        'relative rounded-lg border border-border-soft bg-surface-card shadow-sm',
        compact ? 'p-2.5' : 'rounded-xl p-4 shadow-sm transition-shadow hover:shadow-md',
        className,
      )}
    >
      {icon && (
        <div
          className={cn(
            'absolute right-2 top-2 flex items-center justify-center rounded-md',
            compact ? 'h-7 w-7' : 'h-9 w-9 rounded-lg',
            variantStyles[variant],
          )}
        >
          {icon}
        </div>
      )}

      <div className={cn('min-w-0', icon ? 'pr-8' : undefined)}>
        <p
          className={cn(
            'whitespace-nowrap font-bold tabular-nums tracking-tight text-text-primary',
            compact ? 'text-xl leading-none' : 'text-2xl',
          )}
        >
          {value}
        </p>
        <p
          className={cn(
            'mt-1 font-medium leading-tight text-text-secondary',
            compact ? 'text-[10px] whitespace-nowrap' : 'text-xs',
          )}
          title={label}
        >
          {label}
        </p>
        {showDelta && (
          <div className={cn('flex items-center gap-1', compact ? 'mt-1 text-[10px]' : 'mt-2 text-xs')}>
            <span
              className={cn(
                'inline-flex items-center gap-0.5 font-semibold',
                deltaIsGood ? 'text-status-ok' : 'text-status-error',
              )}
            >
              {deltaDirection === 'up' ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {deltaDirection === 'down' && deltaPositive ? `-${delta}` : delta}
            </span>
            <span className="text-text-secondary">{deltaLabel}</span>
          </div>
        )}
        {trend && !showDelta && (
          <p className={cn('text-text-secondary', compact ? 'mt-1 text-[10px]' : 'mt-1 text-xs')}>{trend}</p>
        )}
      </div>
    </div>
  )
}
