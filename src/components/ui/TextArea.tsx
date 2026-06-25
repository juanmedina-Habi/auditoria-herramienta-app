import type { TextareaHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

type TextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string
  hint?: string
}

export function TextArea({ label, hint, className, ...props }: TextAreaProps) {
  return (
    <label className="block">
      {label && <span className="mb-1 block text-[11px] font-medium text-text-primary">{label}</span>}
      <textarea
        className={cn(
          'w-full rounded-md border border-border-soft bg-slate-50 px-2.5 py-1.5 text-[11px] outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100',
          className,
        )}
        {...props}
      />
      {hint && <span className="mt-1 block text-[10px] text-text-secondary">{hint}</span>}
    </label>
  )
}
