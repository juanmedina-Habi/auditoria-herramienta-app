import { useParams, Link } from 'react-router-dom'
import { CheckCircle2, AlertTriangle, TrendingUp } from 'lucide-react'
import { useAudit } from '../../context/AuditContext'
import { getProcessLabel } from '../../data/processes'
import { getCaseByNid, getRules } from '../../services/auditService'
import { CaseHeaderBar } from '../../components/nid/CaseHeaderBar'
import { NidPageShell } from '../../components/nid/NidPageShell'
import { PropertyMap, resolveMapPosition } from '../../components/map/PropertyMap'
import { Card } from '../../components/ui/Card'
import { StatusPill } from '../../components/ui/StatusPill'
import { Button } from '../../components/ui/Button'
import { TextArea } from '../../components/ui/TextArea'

export function GeoreferencePage() {
  const { nid } = useParams<{ nid: string }>()
  const { scope, processType, countryCode } = useAudit()
  const auditCase = nid ? getCaseByNid(nid, scope) : undefined
  const rules = getRules(scope).slice(0, 5)

  if (!auditCase) {
    return (
      <div className="py-12 text-center">
        <p className="text-lg font-medium">NID no encontrado</p>
        <Link to="/tasks" className="mt-3 inline-block text-[11px] text-brand-600 hover:underline">Volver a tareas</Link>
      </div>
    )
  }

  const geo = auditCase.georreferenciacion
  const sidebar = (
    <>
      <Card compact title="Validación de georreferenciación">
        <ul className="space-y-1.5 text-[11px]">
          {['Dirección homologada', 'Zona mediana', 'Estado zona Habi', 'Activo zona mediana', 'Coordenadas'].map(
            (item) => (
              <li key={item} className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-status-ok" />
                {item}
              </li>
            ),
          )}
          {geo.lat != null && (
            <li className="pl-5 text-[10px] text-text-secondary">
              Lat: {geo.lat.toFixed(6)}, Long: {geo.lng?.toFixed(6)}
            </li>
          )}
        </ul>
      </Card>
      <Card compact title="Validaciones automáticas">
        <ul className="space-y-1.5">
          {rules.map((r) => (
            <li key={r.id} className="flex justify-between gap-2 text-[11px]">
              <span>{r.name}</span>
              <StatusPill status={r.severity} />
            </li>
          ))}
        </ul>
      </Card>
      <Card compact title="Comentario automático">
        <p className="text-[11px] text-text-secondary">
          {geo.status === 'ok'
            ? 'El inmueble se encuentra correctamente ubicado dentro de una zona Habi activa.'
            : geo.notes ?? 'Revisión geográfica requerida.'}
        </p>
      </Card>
      <TextArea label="Observación manual (opcional)" placeholder="0/250" rows={3} hint="0/250 caracteres" />
      <div className="space-y-1.5">
        <Button className="w-full" size="sm"><CheckCircle2 className="h-3.5 w-3.5" /> Aprobar georreferenciación</Button>
        <Button variant="secondary" className="w-full" size="sm"><TrendingUp className="h-3.5 w-3.5" /> Escalar</Button>
        <Button variant="danger" className="w-full" size="sm"><AlertTriangle className="h-3.5 w-3.5" /> Reportar inconsistencia</Button>
      </div>
    </>
  )

  return (
    <NidPageShell
      nid={auditCase.nid}
      title="Mapa / Georreferenciación"
      subtitle={`Validación geográfica del inmueble en ${getProcessLabel(processType)}`}
      breadcrumbs={['Bandeja de auditoría', 'Detalle NID', 'Mapa y georreferenciación']}
      backTo={`/nid/${nid}`}
      header={<CaseHeaderBar auditCase={auditCase} />}
      sidebar={sidebar}
    >
      <Card
        compact
        title="Mapa"
        description="OpenStreetMap — ubicación del inmueble"
        action={<StatusPill status={geo.status} />}
      >
        <div className="relative">
          <PropertyMap
            {...resolveMapPosition(geo.lat, geo.lng, countryCode)}
            label={geo.address ?? auditCase.ciudad}
            height="h-64"
            zoom={16}
            showZone
          />
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        {[
          { label: 'Dirección homologada', value: geo.address ?? '—' },
          { label: 'Zona mediana', value: geo.zonaMediana ?? auditCase.ciudad },
          { label: 'Estado zona Habi', value: 'OK' },
          { label: 'Activo zona mediana', value: geo.activoZonaMediana ? 'Sí' : 'No' },
        ].map((item) => (
          <Card key={item.label} compact>
            <p className="text-[10px] text-text-secondary">{item.label}</p>
            <p className="mt-0.5 text-[11px] font-medium">{item.value}</p>
          </Card>
        ))}
      </div>

      {geo.status === 'ok' ? (
        <div className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-[11px] text-green-800">
          Sin alertas geográficas. La ubicación coincide con la zona esperada.
        </div>
      ) : (
        <div className="rounded-md border border-orange-200 bg-orange-50 px-3 py-2 text-[11px] text-orange-800">
          {geo.notes ?? 'Alerta geográfica detectada. Revisión manual requerida.'}
        </div>
      )}
    </NidPageShell>
  )
}
