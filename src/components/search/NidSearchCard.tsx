import type { ReactNode } from 'react'
import { Calendar, Info, MapPin, RefreshCw, User, Zap, ChevronRight } from 'lucide-react'
import type { AuditCase } from '../../types/audit'
import { formatLongDate } from '../../lib/dates'
import { getCaseDecisionLabel, getCaseProcessStatusLine, getCaseResultSummary } from '../../lib/caseLabels'
import { StatusPill } from '../ui/StatusPill'
import { cn } from '../../lib/utils'

type NidSearchCardProps = {
  cases: AuditCase[]
  onSelect: (c: AuditCase) => void
  className?: string
}

function RowIcon({ children }: { children: ReactNode }) {
  return (
    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-slate-100 text-text-secondary">
      {children}
    </span>
  )
}

export function NidSearchCard({ cases, onSelect, className }: NidSearchCardProps) {
  if (cases.length === 0) return null

  return (
    <div
      className={cn(
        'absolute left-0 top-full z-50 mt-1.5 w-[min(100vw-2rem,24rem)] overflow-hidden rounded-xl border border-border-soft bg-white shadow-2xl ring-1 ring-black/5',
        className,
      )}
    >
      <div className="border-b border-border-soft bg-gradient-to-r from-brand-50 to-white px-3 py-2">
        <p className="text-[11px] font-bold text-text-primary">
          {cases.length === 1 ? '1 Resultado' : `${cases.length} Resultados`}
        </p>
      </div>

      <ul className="max-h-[22rem] overflow-y-auto">
        {cases.map((c) => (
          <li key={c.id}>
            <button
              type="button"
              onClick={() => onSelect(c)}
              className="group w-full border-b border-border-soft px-3 py-3 text-left last:border-b-0 hover:bg-brand-50/60"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <span className="font-mono text-base font-bold tracking-tight text-brand-600">
                    {c.nid}
                  </span>
                  <p className="mt-0.5 text-[10px] text-text-secondary">
                    {c.ciudad} · {c.tipoInmueble} · {c.lineaNegocio}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  {c.resultadoAutomatico === 'alerta' && (
                    <Zap className="h-4 w-4 text-amber-500" aria-label="Con alerta" />
                  )}
                  <StatusPill status={c.estado} />
                </div>
              </div>

              <ul className="mt-2.5 space-y-1.5">
                <li className="flex items-center gap-2 text-[11px] text-text-secondary">
                  <RowIcon><Calendar className="h-3 w-3" /></RowIcon>
                  <span>{formatLongDate(c.fecha)} · {c.hora}</span>
                </li>
                <li className="flex items-center gap-2 text-[11px] text-text-secondary">
                  <RowIcon><Info className="h-3 w-3" /></RowIcon>
                  <span className="truncate font-medium text-text-primary">{getCaseProcessStatusLine(c)}</span>
                </li>
                <li className="flex items-center gap-2 text-[11px] text-text-secondary">
                  <RowIcon><RefreshCw className="h-3 w-3" /></RowIcon>
                  <span className="truncate">{getCaseResultSummary(c)}</span>
                </li>
                <li className="flex items-center gap-2 text-[11px] text-text-secondary">
                  <RowIcon><User className="h-3 w-3" /></RowIcon>
                  <span className="truncate">{c.auditorAsignado}</span>
                </li>
                <li className="flex items-center gap-2 text-[11px] text-text-secondary">
                  <RowIcon><MapPin className="h-3 w-3" /></RowIcon>
                  <span className="truncate">SLA {c.sla} · Score {c.scoreMotor?.toFixed(1) ?? '—'}</span>
                </li>
              </ul>

              <div
                className={cn(
                  'mt-2.5 flex items-center justify-between rounded-lg px-2.5 py-2',
                  c.estado === 'aprobado' && 'bg-green-50',
                  c.estado === 'rechazado' && 'bg-red-50',
                  c.estado !== 'aprobado' && c.estado !== 'rechazado' && 'bg-slate-50',
                )}
              >
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-text-primary">{getCaseDecisionLabel(c)}</p>
                  {c.motivoAlerta && (
                    <p className="mt-0.5 line-clamp-1 text-[10px] text-text-secondary">{c.motivoAlerta}</p>
                  )}
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-brand-500 opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
