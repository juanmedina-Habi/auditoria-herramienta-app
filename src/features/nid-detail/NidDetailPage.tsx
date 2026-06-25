import { Link, useNavigate, useParams } from 'react-router-dom'
import { ExternalLink } from 'lucide-react'
import { useAudit } from '../../context/AuditContext'
import { getProcessLabel } from '../../data/processes'
import {
  getCaseByNid,
  getComparablesByNid,
  getRules,
} from '../../services/auditService'
import { CaseHeaderBar } from '../../components/nid/CaseHeaderBar'
import { ValidationCards } from '../../components/nid/ValidationCards'
import { NidSubNav } from '../../components/layout/NidSubNav'
import { PropertyMap, resolveMapPosition } from '../../components/map/PropertyMap'
import { Card } from '../../components/ui/Card'
import { StatusPill } from '../../components/ui/StatusPill'
import { Button } from '../../components/ui/Button'
import { TextArea } from '../../components/ui/TextArea'
import { DataTable } from '../../components/tables/DataTable'
import { PageHeader, pageShellClass } from '../../components/ui/PageHeader'
import type { Comparable } from '../../types/audit'

export function NidDetailPage() {
  const { nid } = useParams<{ nid: string }>()
  const { scope, processType, countryCode } = useAudit()
  const navigate = useNavigate()
  const auditCase = nid ? getCaseByNid(nid, scope) : undefined
  const comps = nid ? getComparablesByNid(nid, scope).slice(0, 4) : []
  const rules = getRules(scope)

  if (!auditCase) {
    return (
      <div className="py-12 text-center">
        <p className="text-lg font-medium">NID no encontrado</p>
        <p className="mt-1.5 text-[11px] text-text-secondary">
          No hay caso {nid} para el país y proceso seleccionados.
        </p>
        <Link to="/tasks" className="mt-3 inline-block text-[11px] text-brand-600 hover:underline">
          Volver a tareas
        </Link>
      </div>
    )
  }

  const compColumns = [
    { key: 'nid', header: 'Comparable NID', render: (r: Comparable) => r.comparableNid },
    { key: 'source', header: 'Fuente', render: (r: Comparable) => r.source },
    { key: 'price', header: 'Precio', render: (r: Comparable) => r.price.toLocaleString() },
    { key: 'estado', header: 'Estado', render: (r: Comparable) => <StatusPill status={r.estado === 'valido' ? 'ok' : 'alerta'} /> },
  ]

  return (
    <div className={pageShellClass}>
      <PageHeader
        title="Vista detalle del NID"
        subtitle={`Revisión integral de ${getProcessLabel(processType)}`}
        breadcrumbs={['Bandeja de auditoría', 'Detalle NID']}
        actions={
          <div className="flex flex-wrap gap-1.5">
            <Button variant="secondary" size="sm" onClick={() => navigate('/tasks')}>
              Volver a tareas
            </Button>
            <Button variant="secondary" size="sm" onClick={() => navigate(`/nid/${nid}/decision`)}>
              Escalar
            </Button>
            <Button variant="danger" size="sm">Rechazar</Button>
            <Button size="sm">Aprobar</Button>
          </div>
        }
      />

      <CaseHeaderBar auditCase={auditCase} />
      <ValidationCards auditCase={auditCase} />
      <NidSubNav nid={auditCase.nid} />

      <div className="grid grid-cols-1 gap-2.5 xl:grid-cols-3">
        <div className="space-y-2.5 xl:col-span-2">
          <Card
            compact
            title="Mapa y georreferenciación"
            action={<StatusPill status={auditCase.georreferenciacion.status} />}
          >
            <div className="relative">
              <PropertyMap
                {...resolveMapPosition(
                  auditCase.georreferenciacion.lat,
                  auditCase.georreferenciacion.lng,
                  countryCode,
                )}
                label={auditCase.georreferenciacion.address ?? auditCase.ciudad}
                height="h-44"
                zoom={16}
              />
              <Link
                to={`/nid/${nid}/georeference`}
                className="absolute bottom-2 right-2 z-10 inline-flex items-center gap-1 rounded-md bg-white/90 px-2 py-0.5 text-[11px] text-brand-600 shadow-sm hover:underline"
              >
                Ver mapa completo <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
            <p className="mt-1.5 text-[11px] text-text-secondary">
              {auditCase.georreferenciacion.address ?? auditCase.ciudad}
            </p>
          </Card>

          <Card
            compact
            title="Comparables"
            action={
              <Link to={`/nid/${nid}/comparables`} className="text-[11px] text-brand-600 hover:underline">
                Ver todos
              </Link>
            }
          >
            {comps.length > 0 ? (
              <DataTable columns={compColumns} data={comps} keyExtractor={(r) => r.id} compact />
            ) : (
              <p className="text-[11px] text-text-secondary">Sin comparables para este proceso</p>
            )}
          </Card>

          <Card compact title="Comentario automático">
            <p className="text-[11px] text-text-secondary">{auditCase.comentarioAutomatico}</p>
          </Card>
        </div>

        <div className="space-y-2.5">
          <Card compact title="Resultado general">
            <p className="text-lg font-bold tabular-nums text-text-primary">{auditCase.scoreMotor?.toFixed(1) ?? '—'}</p>
            <div className="mt-1.5">
              <StatusPill status={auditCase.resultadoGeneral} />
            </div>
          </Card>

          <Card compact title="Reglas automáticas">
            <ul className="space-y-1.5">
              {rules.slice(0, 6).map((rule) => (
                <li key={rule.id} className="flex justify-between text-[11px]">
                  <span>{rule.name}</span>
                  <StatusPill status={rule.severity} />
                </li>
              ))}
            </ul>
            <Link to={`/nid/${nid}/rules`} className="mt-2 block text-[11px] text-brand-600 hover:underline">
              Ver detalle de validaciones
            </Link>
          </Card>

          <Card compact title="Decisión del auditor">
            <TextArea placeholder="Observaciones del auditor..." rows={3} />
            <div className="mt-2 flex flex-wrap gap-1.5">
              <Button size="sm">Aprobar</Button>
              <Button size="sm" variant="danger">Rechazar</Button>
              <Button size="sm" variant="secondary" onClick={() => navigate(`/nid/${nid}/decision`)}>
                Tomar decisión
              </Button>
            </div>
          </Card>

          <Card compact title="Historial del caso">
            <ul className="space-y-2 text-[11px]">
              <li className="border-l-2 border-brand-200 pl-2.5">
                <p className="font-medium">Caso asignado a {auditCase.auditorAsignado}</p>
                <p className="text-[10px] text-text-secondary">{auditCase.fecha}</p>
              </li>
              <li className="border-l-2 border-brand-200 pl-2.5">
                <p className="font-medium">Validación automática ejecutada</p>
                <p className="text-[10px] text-text-secondary">{auditCase.hora}</p>
              </li>
              {auditCase.motivoAlerta && (
                <li className="border-l-2 border-orange-300 pl-2.5">
                  <p className="font-medium">Alerta: {auditCase.motivoAlerta}</p>
                  <p className="text-[10px] text-text-secondary">{auditCase.fecha}</p>
                </li>
              )}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  )
}
