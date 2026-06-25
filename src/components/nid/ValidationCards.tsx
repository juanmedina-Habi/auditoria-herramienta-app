import { MapPin, Layers, TrendingUp, Building2 } from 'lucide-react'
import type { AuditCase } from '../../types/audit'
import { Card } from '../ui/Card'
import { StatusPill } from '../ui/StatusPill'

export function ValidationCards({ auditCase }: { auditCase: AuditCase }) {
  const items = [
    { label: 'Georreferenciación', icon: MapPin, status: auditCase.georreferenciacion.status },
    { label: 'Polynator', icon: Layers, status: auditCase.polynator.status },
    { label: 'Escalera', icon: TrendingUp, status: auditCase.escalera.status },
    {
      label: 'Comparables',
      icon: Building2,
      status: auditCase.resultadoAutomatico,
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
      {items.map(({ label, icon: Icon, status }) => (
        <Card key={label} compact>
          <div className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-1.5 text-[11px] font-medium">
              <Icon className="h-3.5 w-3.5 text-text-secondary" />
              {label}
            </span>
            <StatusPill status={status} />
          </div>
        </Card>
      ))}
    </div>
  )
}
