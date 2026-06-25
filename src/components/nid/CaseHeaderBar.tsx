import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import type { AuditCase } from '../../types/audit'
import { StatusPill } from '../ui/StatusPill'
import { Badge } from '../ui/Badge'

type CaseHeaderBarProps = {
  auditCase: AuditCase
  backTo?: string
  backLabel?: string
  extra?: React.ReactNode
}

export function CaseHeaderBar({
  auditCase,
  backTo,
  backLabel = 'Volver al detalle',
  extra,
}: CaseHeaderBarProps) {
  const fields = [
    { label: 'NID', value: auditCase.nid, mono: true },
    { label: 'Ciudad', value: auditCase.ciudad },
    { label: 'Tipo inmueble', value: auditCase.tipoInmueble },
    { label: 'Agente pricing', value: auditCase.agentePricing },
    { label: 'Auditor asignado', value: auditCase.auditorAsignado },
    { label: 'Estado', value: <StatusPill status={auditCase.estado} /> },
    {
      label: 'Resultado',
      value: <StatusPill status={auditCase.resultadoGeneral} />,
    },
    { label: 'SLA', value: auditCase.sla, alert: auditCase.sla.includes('Vencido') },
  ]

  return (
    <div className="space-y-2">
      {backTo && (
        <Link
          to={backTo}
          className="inline-flex items-center gap-1 text-[11px] text-brand-600 hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {backLabel}
        </Link>
      )}
      <div className="rounded-lg border border-border-soft bg-white p-3 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <dl className="grid flex-1 grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-4 lg:grid-cols-8">
            {fields.map((f) => (
              <div key={f.label}>
                <dt className="text-[10px] text-text-secondary">{f.label}</dt>
                <dd
                  className={`mt-0.5 text-[11px] font-medium ${f.mono ? 'font-mono' : ''} ${f.alert ? 'text-status-error' : 'text-text-primary'}`}
                >
                  {f.value}
                </dd>
              </div>
            ))}
          </dl>
          {extra}
        </div>
        {auditCase.motivoAlerta && (
          <div className="mt-2 border-t border-border-soft pt-2">
            <Badge variant="outline" className="text-[10px]">
              {auditCase.motivoAlerta}
            </Badge>
          </div>
        )}
      </div>
    </div>
  )
}
