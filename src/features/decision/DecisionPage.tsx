import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAudit } from '../../context/AuditContext'
import { getProcessLabel } from '../../data/processes'
import { getCaseByNid, filterCases } from '../../services/auditService'
import { CaseHeaderBar } from '../../components/nid/CaseHeaderBar'
import { ValidationCards } from '../../components/nid/ValidationCards'
import { NidSubNav } from '../../components/layout/NidSubNav'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Select } from '../../components/ui/Select'
import { TextArea } from '../../components/ui/TextArea'
import { PageHeader, pageShellClass } from '../../components/ui/PageHeader'
import { cn } from '../../lib/utils'

const DECISIONS = [
  { id: 'aprobar', label: 'Aprobar auditoría', color: 'border-green-500' },
  { id: 'observacion', label: 'Aprobar con observación', color: 'border-blue-500' },
  { id: 'escalar', label: 'Escalar a Pricing', color: 'border-brand-500' },
  { id: 'rechazar', label: 'Rechazar / Reportar inconsistencia', color: 'border-red-500' },
]

export function DecisionPage() {
  const { nid } = useParams<{ nid: string }>()
  const { scope, processType } = useAudit()
  const navigate = useNavigate()
  const auditCase = nid ? getCaseByNid(nid, scope) : undefined
  const [decision, setDecision] = useState('observacion')
  const [checks, setChecks] = useState([true, true, true, false])

  if (!auditCase) {
    return (
      <div className="py-12 text-center">
        <p className="text-lg font-medium">NID no encontrado</p>
        <Link to="/tasks" className="mt-3 inline-block text-[11px] text-brand-600 hover:underline">Volver a tareas</Link>
      </div>
    )
  }

  const nextCase = filterCases(scope).find((c) => c.nid !== nid && c.estado === 'pendiente')

  function handleSave(next = false) {
    if (next && nextCase) navigate(`/nid/${nextCase.nid}/decision`)
    else navigate('/tasks')
  }

  return (
    <div className={pageShellClass}>
      <PageHeader
        title="Decisión de auditoría"
        subtitle={`Cierre operativo del caso para ${getProcessLabel(processType)}`}
        breadcrumbs={['Bandeja de auditoría', 'Detalle NID', 'Decisión de auditoría']}
        actions={
          <Button variant="secondary" size="sm" onClick={() => navigate(`/nid/${nid}`)}>
            Volver al detalle
          </Button>
        }
      />
      <CaseHeaderBar auditCase={auditCase} />
      <ValidationCards auditCase={auditCase} />
      <NidSubNav nid={auditCase.nid} />

      <div className="grid grid-cols-1 gap-2.5 xl:grid-cols-3">
        <div className="space-y-2.5 xl:col-span-2">
          <Card compact title="Hallazgos que impactan la decisión">
            <ul className="space-y-1.5 text-[11px]">
              {auditCase.motivoAlerta && (
                <li className="rounded-md bg-orange-50 px-2.5 py-1.5 text-orange-800">{auditCase.motivoAlerta}</li>
              )}
              <li className="rounded-md bg-slate-50 px-2.5 py-1.5">{auditCase.comentarioAutomatico}</li>
            </ul>
          </Card>
          <Card compact title="Evidencia rápida">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {['Mapa validado', 'Comparables', 'Datos inmueble', 'Fuentes'].map((e, i) => (
                <div key={e} className="rounded-md border border-border-soft px-2 py-2 text-center">
                  <p className="text-[11px] font-medium">{e}</p>
                  <p className="text-lg font-bold tabular-nums text-brand-600">{i + 1}</p>
                </div>
              ))}
            </div>
          </Card>
          <Card compact title="Historial / trazabilidad">
            <ul className="space-y-2 text-[11px]">
              <li className="border-l-2 border-brand-300 pl-2.5">Caso asignado — {auditCase.fecha}</li>
              <li className="border-l-2 border-brand-300 pl-2.5">Motor ejecutado — {auditCase.hora}</li>
              <li className="border-l-2 border-brand-300 pl-2.5">Auditor abrió caso — hoy</li>
            </ul>
          </Card>
        </div>

        <div className="space-y-2.5">
          <Card compact title="Tomar decisión">
            <div className="space-y-1.5">
              {DECISIONS.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setDecision(d.id)}
                  className={cn(
                    'w-full rounded-md border-2 px-2.5 py-2 text-left text-[11px] font-medium transition-colors',
                    d.color,
                    decision === d.id ? 'bg-slate-50' : 'border-border-soft',
                  )}
                >
                  {d.label}
                </button>
              ))}
            </div>
            <div className="mt-3 space-y-2.5">
              <Select label="Motivo de decisión">
                <option>Regla no concluyente</option>
                <option>Comparables duplicados</option>
                <option>Revisión Polynator</option>
                <option>Excepción comercial</option>
              </Select>
              <TextArea label="Comentario obligatorio" rows={4} hint="0/500" />
            </div>
          </Card>
          <Card compact title="Checklist antes de cerrar">
            {[
              'Revisé alertas automáticas',
              'Validé comparables relevantes',
              'Confirmé contexto operativo',
              'Comentario diligenciado',
            ].map((label, i) => (
              <label key={label} className="flex items-center gap-2 py-0.5 text-[11px]">
                <input
                  type="checkbox"
                  className="h-3.5 w-3.5 rounded border-border-soft"
                  checked={checks[i]}
                  onChange={() => {
                    const n = [...checks]
                    n[i] = !n[i]
                    setChecks(n)
                  }}
                />
                {label}
              </label>
            ))}
          </Card>
          <Card compact title="Resultado final (vista previa)" className="border-brand-200 bg-brand-50">
            <p className="text-[11px] font-medium text-brand-800">
              {DECISIONS.find((d) => d.id === decision)?.label}
            </p>
          </Card>
          <div className="flex flex-wrap gap-1.5">
            <Button variant="secondary" size="sm" onClick={() => navigate(`/nid/${nid}`)}>Cancelar</Button>
            <Button variant="secondary" size="sm" onClick={() => handleSave(true)}>Guardar y siguiente</Button>
            <Button size="sm" onClick={() => handleSave()}>Guardar decisión</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
