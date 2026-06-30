import type { ReactNode } from 'react'
import { cn } from '../../lib/utils'

export type Column<T> = {
  key: string
  header: string
  render: (row: T) => ReactNode
  className?: string
  sticky?: 'left' | 'right'
}

type DataTableProps<T> = {
  columns: Column<T>[]
  data: T[]
  keyExtractor: (row: T) => string
  onRowClick?: (row: T) => void
  emptyMessage?: string
  compact?: boolean
  dense?: boolean
}

function stickyCellClass(sticky?: 'left' | 'right') {
  if (sticky === 'left') {
    return 'sticky left-0 z-10 bg-surface-card shadow-[2px_0_4px_-2px_rgba(0,0,0,0.08)] group-hover:bg-slate-50'
  }
  if (sticky === 'right') {
    return 'sticky right-0 z-10 bg-surface-card shadow-[-2px_0_4px_-2px_rgba(0,0,0,0.08)] group-hover:bg-slate-50'
  }
  return undefined
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  onRowClick,
  emptyMessage = 'No hay datos disponibles',
  compact = false,
  dense = false,
}: DataTableProps<T>) {
  const isDense = dense || compact

  if (data.length === 0) {
    return (
      <div className="rounded-lg border border-border-soft bg-surface-card p-4 text-center text-[11px] text-text-secondary">
        {emptyMessage}
      </div>
    )
  }

  return (
    <div className={cn('overflow-hidden rounded-lg border border-border-soft bg-surface-card shadow-sm', isDense && 'shadow-none')}>
      <div className={cn(compact ? 'overflow-x-visible' : 'overflow-x-auto')}>
        <table className={cn('w-full text-left', isDense ? 'text-xs' : 'text-sm', compact && 'table-fixed')}>
          <thead>
            <tr className="border-b border-border-soft bg-slate-50">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    'font-semibold uppercase tracking-wide text-text-secondary',
                    isDense ? 'px-2 py-1.5 text-[10px]' : 'px-3 py-3 text-xs',
                    stickyCellClass(col.sticky)?.replace('group-hover:bg-slate-50', 'bg-slate-50'),
                    col.className,
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr
                key={keyExtractor(row)}
                onClick={() => onRowClick?.(row)}
                className={cn(
                  'group border-b border-border-soft last:border-0 transition-colors',
                  rowIndex % 2 === 1 && 'bg-slate-50/40',
                  onRowClick && 'cursor-pointer hover:bg-brand-50/50',
                )}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn(
                      'align-middle',
                      isDense ? 'px-2 py-1.5' : 'px-3 py-3',
                      stickyCellClass(col.sticky),
                      col.className,
                    )}
                  >
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
