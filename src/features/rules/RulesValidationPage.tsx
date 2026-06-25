import { useParams, Link } from 'react-router-dom'
import { AlertTriangle, TrendingUp } from 'lucide-react'
import { useAudit } from '../../context/AuditContext'
import { getProcessLabel } from '../../data/processes'
import { getCaseByNid, getRules } from '../../services/auditService'
import { CaseHeaderBar } from '../../components/nid/CaseHeaderBar'
import { NidPageShell } from '../../components/nid/NidPageShell'
import { Card } from '../../components/ui/Card'
import { StatusPill } from '../../components/ui/StatusPill'
import { Button } from '../../components/ui/Button'
import { TextArea } from '../../components/ui/TextArea'
import type { AuditCase } from '../../types/audit'

function ruleResult(c: AuditCase, name: string) {
  if (name.includes('Georreferenci')) return c.georreferenciacion.status
  if (name.includes('Polynator')) return c.polynator.status
  if (name.includes('Escalera')) return c.escalera.status
  if (name.includes('Comparable')) return c.resultadoAutomatico
  return 'ok' as const
}

export function RulesValidationPage() {
  const { nid } = useParams<{ nid: string }>()
  const { scope, processType } = useAudit()
  const auditCase = nid ? getCaseByNid(nid, scope) : undefined
  const rules = getRules(scope)

  if (!auditCase) {
    return (
      <div className="py-12 text-center">
        <p className="text-lg font-medium">NID no encontrado</p>
        <Link to="/tasks" className="mt-3 inline-block text-[11px] text-brand-600 hover:underline">Volver a tareas</Link>
      </div>
    )
  }

  const ok = rules.filter((r) => ruleResult(auditCase, r.name) === 'ok').length
  const alerta = rules.filter((r) => ruleResult(auditCase, r.name) === 'alerta').length

  const sidebar = (
    <>
      <Card compact title="Panel de decisión automática">
        <dl className="space-y-1.5 text-[11px]">
          <div className="flex justify-between"><dt>Score del motor</dt><dd className="text-lg font-bold tabular-nums">{auditCase.scoreMotor?.toFixed(1)} / 10</dd></div>
          <div className="flex justify-between"><dt>Estado sugerido</dt><dd><StatusPill status={auditCase.resultadoAutomatico} /></dd></div>
          <div className="flex justify-between"><dt>Última ejecución</dt><dd>{auditCase.fecha} {auditCase.hora}</dd></div>
          <div className="flex justify-between"><dt>SLA restante</dt><dd className="text-brand-600">{auditCase.sla}</dd></div>
        </dl>
      </Card>
      <Card compact title="Fuentes utilizadas">
        <ul className="space-y-1 text-[11px] text-text-secondary">
          <li>• BigQuery</li>
          <li>• Portal Zonas</li>
          <li>• Pricing Hub</li>
          <li>• HubSpot Deal</li>
        </ul>
      </Card>
      <Card compact title="Comentario automático">
        <p className="text-[11px] text-text-secondary">{auditCase.comentarioAutomatico}</p>
      </Card>
      <TextArea label="Observación manual" rows={3} />
      <Button className="w-full" size="sm">Aprobar auditoría</Button>
      <Button variant="secondary" className="w-full" size="sm"><TrendingUp className="h-3.5 w-3.5" /> Escalar</Button>
      <Button variant="danger" className="w-full" size="sm"><AlertTriangle className="h-3.5 w-3.5" /> Reportar inconsistencia</Button>
    </>
  )

  return (
    <NidPageShell
      nid={auditCase.nid}
      title="Reglas / Validaciones automáticas"
      subtitle={`Motor automático de validación para ${getProcessLabel(processType)}`}
      breadcrumbs={['Bandeja de auditoría', 'Detalle NID', 'Reglas automáticas']}
      backTo={`/nid/${nid}`}
      header={<CaseHeaderBar auditCase={auditCase} />}
      sidebar={sidebar}
    >
      <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-5">
        {[
          { label: 'Reglas evaluadas', value: rules.length },
          { label: 'Aprobadas', value: ok, ok: true },
          { label: 'Con alerta', value: alerta, alert: true },
          { label: 'Rechazadas', value: 0 },
          { label: 'Estado final', value: auditCase.resultadoAutomatico, pill: true },
        ].map((s) => (
          <Card key={s.label} compact>
            <p className="text-[10px] text-text-secondary">{s.label}</p>
            {'pill' in s && s.pill ? (
              <div className="mt-1"><StatusPill status={auditCase.resultadoAutomatico} /></div>
            ) : (
              <p className={`mt-0.5 text-lg font-bold tabular-nums ${s.ok ? 'text-status-ok' : s.alert ? 'text-status-alert' : ''}`}>
                {s.value}
              </p>
            )}
          </Card>
        ))}
      </div>

      <div className="space-y-2.5">
        {rules.map((rule) => {
          const result = ruleResult(auditCase, rule.name)
          return (
            <Card key={rule.id} compact>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-xs font-semibold">{rule.name}</h3>
                  <p className="mt-0.5 text-[11px] text-text-secondary">{rule.description}</p>
                  {result === 'alerta' && rule.name.includes('Comparable') && (
                    <div className="mt-1.5 rounded-md bg-orange-50 px-2.5 py-1.5 text-[11px] text-orange-800">
                      Posible duplicado detectado en comparables.
                    </div>
                  )}
                </div>
                <StatusPill status={result} />
              </div>
            </Card>
          )
        })}
      </div>

      {alerta > 0 && (
        <div className="rounded-md border border-orange-200 bg-orange-50 px-3 py-2 text-[11px] text-orange-800">
          El motor automático encontró alertas que requieren validación manual antes de aprobar el caso.
        </div>
      )}
    </NidPageShell>
  )
}
