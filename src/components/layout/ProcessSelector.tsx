import { useEffect, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { useAudit } from '../../context/AuditContext'
import { processOptions, isProcessAvailable } from '../../data/processes'
import { cn } from '../../lib/utils'

export function ProcessSelector() {
  const { processType, setProcessType } = useAudit()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const current = processOptions.find((p) => p.type === processType)!

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'flex items-center gap-1.5 rounded-md border border-border-soft bg-slate-50 px-2.5 py-1.5 text-[11px] font-medium text-text-primary',
          open && 'border-brand-500 ring-2 ring-brand-100',
        )}
      >
        {current.label}
        <ChevronDown className={cn('h-3.5 w-3.5 text-text-secondary', open && 'rotate-180')} />
      </button>
      {open && (
        <ul className="absolute right-0 z-50 mt-2 min-w-[220px] rounded-lg border border-border-soft bg-white py-1 shadow-lg">
          {processOptions.map((option) => {
            const enabled = isProcessAvailable(option.type)
            return (
              <li key={option.type}>
                <button
                  type="button"
                  disabled={!enabled}
                  onClick={() => {
                    if (!enabled) return
                    setProcessType(option.type)
                    setOpen(false)
                  }}
                  className={cn(
                    'flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-[11px]',
                    enabled && 'hover:bg-slate-50',
                    !enabled && 'cursor-not-allowed opacity-60',
                    enabled && option.type === processType && 'bg-brand-50 font-medium text-brand-700',
                  )}
                >
                  <span>{option.label}</span>
                  {!enabled && (
                    <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-text-secondary">
                      Próximamente
                    </span>
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
