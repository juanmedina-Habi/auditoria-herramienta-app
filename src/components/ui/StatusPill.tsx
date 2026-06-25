import type { AuditStatus, ValidationStatus } from '../../types/audit'
import { cn } from '../../lib/utils'

type StatusPillProps = {
  status: AuditStatus | ValidationStatus
  className?: string
}

const labels: Record<AuditStatus | ValidationStatus, string> = {
  pendiente: 'Pendiente',
  en_revision: 'En revisión',
  aprobado: 'Aprobado',
  rechazado: 'Rechazado',
  alerta: 'Alerta',
  escalado: 'Escalado',
  cerrado: 'Cerrado',
  ok: 'OK',
  error: 'Error',
}

const styles: Record<AuditStatus | ValidationStatus, string> = {
  pendiente: 'bg-slate-100 text-slate-600',
  en_revision: 'bg-brand-100 text-brand-800',
  aprobado: 'bg-green-100 text-green-700',
  rechazado: 'bg-red-100 text-red-700',
  alerta: 'bg-orange-100 text-orange-700',
  escalado: 'bg-purple-100 text-purple-700',
  cerrado: 'bg-slate-100 text-slate-600',
  ok: 'bg-green-100 text-green-700',
  error: 'bg-red-100 text-red-700',
}

export function StatusPill({ status, className }: StatusPillProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-px text-[10px] font-medium',
        styles[status],
        className,
      )}
    >
      {labels[status]}
    </span>
  )
}
