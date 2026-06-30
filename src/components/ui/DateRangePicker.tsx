import { useEffect, useRef, useState } from 'react'
import { CalendarRange, ChevronDown } from 'lucide-react'
import { cn } from '../../lib/utils'
import { formatDateRangeLabel, getDateRangePreset } from '../../lib/dates'

type DateRange = { start: string; end: string }

type DateRangePickerProps = {
  value: DateRange
  onChange: (range: DateRange) => void
  className?: string
}

const PRESETS: { id: 'ytd' | 'today' | '7d' | '30d' | 'month'; label: string }[] = [
  { id: 'ytd', label: 'Año actual' },
  { id: 'today', label: 'Hoy' },
  { id: '7d', label: '7 días' },
  { id: '30d', label: '30 días' },
  { id: 'month', label: 'Este mes' },
]

export function DateRangePicker({ value, onChange, className }: DateRangePickerProps) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState(value)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setDraft(value)
  }, [value])

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  function apply() {
    if (draft.start <= draft.end) {
      onChange(draft)
      setOpen(false)
    }
  }

  return (
    <div ref={ref} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-md border border-border-soft bg-white px-2 py-1 text-[10px] font-medium text-text-primary hover:bg-slate-50',
          open && 'border-brand-500 ring-2 ring-brand-100',
        )}
      >
        <CalendarRange className="h-3 w-3 text-text-secondary" />
        {formatDateRangeLabel(value.start, value.end)}
        <ChevronDown className={cn('h-3 w-3 text-text-secondary', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-1.5 w-64 rounded-lg border border-border-soft bg-white p-3 shadow-lg">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-text-secondary">
            Periodo
          </p>
          <div className="mb-3 flex flex-wrap gap-1">
            {PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setDraft(getDateRangePreset(p.id))}
                className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-text-secondary hover:bg-brand-50 hover:text-brand-700"
              >
                {p.label}
              </button>
            ))}
          </div>
          <div className="space-y-2">
            <label className="block text-[10px] text-text-secondary">
              Desde
              <input
                type="date"
                value={draft.start}
                onChange={(e) => setDraft((d) => ({ ...d, start: e.target.value }))}
                className="mt-0.5 w-full rounded-md border border-border-soft px-2 py-1 text-[11px] outline-none focus:border-brand-500"
              />
            </label>
            <label className="block text-[10px] text-text-secondary">
              Hasta
              <input
                type="date"
                value={draft.end}
                onChange={(e) => setDraft((d) => ({ ...d, end: e.target.value }))}
                className="mt-0.5 w-full rounded-md border border-border-soft px-2 py-1 text-[11px] outline-none focus:border-brand-500"
              />
            </label>
          </div>
          <div className="mt-3 flex justify-end gap-1.5">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-md px-2 py-1 text-[10px] text-text-secondary hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={apply}
              disabled={draft.start > draft.end}
              className="rounded-md bg-brand-600 px-2.5 py-1 text-[10px] font-medium text-white hover:bg-brand-700 disabled:opacity-50"
            >
              Aplicar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export type { DateRange }
