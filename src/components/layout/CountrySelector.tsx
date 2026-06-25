import { useEffect, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { useAudit } from '../../context/AuditContext'
import { countries } from '../../data/countries'
import type { CountryCode } from '../../types/audit'
import { cn } from '../../lib/utils'

export function CountrySelector() {
  const { countryCode, setCountryCode } = useAudit()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const current = countries.find((c) => c.code === countryCode)!

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
          'flex items-center gap-1.5 rounded-md border border-border-soft bg-slate-50 px-2.5 py-1.5 text-[11px] font-medium',
          open && 'border-brand-500 ring-2 ring-brand-100',
        )}
      >
        <span>{current.flag}</span>
        {current.name}
        <ChevronDown className={cn('h-3.5 w-3.5 text-text-secondary', open && 'rotate-180')} />
      </button>
      {open && (
        <ul className="absolute right-0 z-50 mt-2 min-w-[160px] rounded-lg border border-border-soft bg-white py-1 shadow-lg">
          {countries.map((c) => (
            <li key={c.code}>
              <button
                type="button"
                onClick={() => {
                  setCountryCode(c.code as CountryCode)
                  setOpen(false)
                }}
                className={cn(
                  'flex w-full items-center gap-2 px-3 py-1.5 text-[11px] hover:bg-slate-50',
                  c.code === countryCode && 'bg-brand-50 font-medium text-brand-700',
                )}
              >
                <span>{c.flag}</span>
                {c.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
