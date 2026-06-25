import type { SelectHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string
}

export function Select({ label, className, children, ...props }: SelectProps) {
  return (
    <label className="block">
      {label && <span className="mb-1 block text-[11px] font-medium text-text-secondary">{label}</span>}
      <select
        className={cn(
          'w-full rounded-md border border-border-soft bg-white px-2.5 py-1.5 text-[11px] outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100',
          className,
        )}
        {...props}
      >
        {children}
      </select>
    </label>
  )
}
