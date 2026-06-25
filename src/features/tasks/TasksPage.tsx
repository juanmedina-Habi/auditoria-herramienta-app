import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, RefreshCw } from 'lucide-react'
import { useAudit } from '../../context/AuditContext'
import { getProcessLabel } from '../../data/processes'
import { countries } from '../../data/countries'
import {
  getAuditorLoad,
  getMyTasks,
  getTaskStats,
  filterCases,
  getCurrentUser,
} from '../../services/auditService'
import { DataTable } from '../../components/tables/DataTable'
import { StatusPill } from '../../components/ui/StatusPill'
import { Badge } from '../../components/ui/Badge'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Select } from '../../components/ui/Select'
import { PageHeader, pageShellClass } from '../../components/ui/PageHeader'
import { cn } from '../../lib/utils'
import type { AuditCase } from '../../types/audit'

export function TasksPage() {
  const { scope, countryCode, processType } = useAudit()
  const navigate = useNavigate()
  const [tab, setTab] = useState<'mine' | 'all'>('mine')
  const [estadoFilter, setEstadoFilter] = useState('todos')
  const [ciudadFilter, setCiudadFilter] = useState('todas')
  const [motivoFilter, setMotivoFilter] = useState('todos')
  const [auditorFilter, setAuditorFilter] = useState('todos')
  const [soloAlerta, setSoloAlerta] = useState(false)

  const currentUser = getCurrentUser(countryCode)
  const baseCases = tab === 'mine' ? getMyTasks(scope) : filterCases(scope)
  const ciudades = [...new Set(baseCases.map((c) => c.ciudad))]
  const motivos = [...new Set(baseCases.map((c) => c.motivoAlerta).filter(Boolean))]
  const auditores = [...new Set(baseCases.map((c) => c.auditorAsignado))]

  const cases = useMemo(() => {
    return baseCases.filter((c) => {
      if (estadoFilter !== 'todos' && c.estado !== estadoFilter) return false
      if (ciudadFilter !== 'todas' && c.ciudad !== ciudadFilter) return false
      if (motivoFilter !== 'todos' && c.motivoAlerta !== motivoFilter) return false
      if (auditorFilter !== 'todos' && c.auditorAsignado !== auditorFilter) return false
      if (soloAlerta && c.resultadoAutomatico !== 'alerta') return false
      return true
    })
  }, [baseCases, estadoFilter, ciudadFilter, motivoFilter, auditorFilter, soloAlerta])

  const stats = getTaskStats(scope)
  const auditorLoad = getAuditorLoad(scope)
  const country = countries.find((c) => c.code === countryCode)!
  const processLabel = getProcessLabel(processType)

  const columns = [
    {
      key: 'nid',
      header: 'NID',
      sticky: 'left' as const,
      className: 'w-[11%]',
      render: (r: AuditCase) => (
        <span className="flex items-center gap-1 font-mono text-xs font-semibold text-brand-600">
          <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-40 group-hover:opacity-100" />
          <span className="truncate">{r.nid}</span>
        </span>
      ),
    },
    {
      key: 'estado',
      header: 'Estado',
      className: 'w-[9%] whitespace-nowrap',
      render: (r: AuditCase) => <StatusPill status={r.estado} />,
    },
    {
      key: 'auto',
      header: 'Auto',
      className: 'w-[9%] whitespace-nowrap',
      render: (r: AuditCase) => <StatusPill status={r.resultadoAutomatico} />,
    },
    {
      key: 'ciudad',
      header: 'Ciudad / Zona',
      className: 'w-[12%] truncate',
      render: (r: AuditCase) => r.zona ?? r.ciudad,
    },
    {
      key: 'inmueble',
      header: 'Inmueble',
      className: 'w-[14%] truncate',
      render: (r: AuditCase) => `${r.tipoInmueble} · ${r.lineaNegocio}`,
    },
    {
      key: 'motivo',
      header: 'Motivo',
      className: 'w-[14%]',
      render: (r: AuditCase) =>
        r.motivoAlerta ? (
          <Badge variant="outline" className="max-w-full truncate">
            {r.motivoAlerta}
          </Badge>
        ) : (
          '—'
        ),
    },
    {
      key: 'auditor',
      header: 'Auditor',
      className: 'w-[14%] truncate',
      render: (r: AuditCase) => r.auditorAsignado,
    },
    {
      key: 'fecha',
      header: 'Fecha / SLA',
      className: 'w-[17%] whitespace-nowrap',
      render: (r: AuditCase) => (
        <div className="text-xs leading-snug">
          <div>{r.fecha} {r.hora}</div>
          <div className={r.sla.includes('Vencido') ? 'font-medium text-status-error' : 'text-text-secondary'}>
            {r.sla}
          </div>
        </div>
      ),
    },
  ]

  return (
    <div className={pageShellClass}>
      <PageHeader
        title="Bandeja de auditoría"
        subtitle={`Revisión y priorización de tareas de ${processLabel} — ${country.name}`}
        meta={<span className="text-[10px] text-text-secondary">Actualizado: hoy, 1:08 p.m.</span>}
      />

      <div className="grid grid-cols-2 gap-2 lg:grid-cols-5">
        {[
          { label: 'Pendientes', value: stats.pendientes, color: 'text-status-alert' },
          { label: 'En revisión', value: stats.enRevision, color: 'text-yellow-600' },
          { label: 'Con alerta', value: stats.conAlerta, color: 'text-status-error' },
          { label: 'Aprobadas', value: stats.aprobadas, color: 'text-status-ok' },
          { label: 'Rechazadas', value: stats.rechazadas, color: 'text-status-error' },
        ].map((s) => (
          <Card key={s.label} compact>
            <p className="text-[10px] text-text-secondary">{s.label}</p>
            <p className={cn('mt-0.5 text-xl font-bold tabular-nums', s.color)}>{s.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-2.5 xl:grid-cols-4">
        <div className="space-y-2.5 xl:col-span-3">
          <div className="flex flex-wrap items-center gap-2">
            {(['mine', 'all'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={cn(
                  'rounded-md px-3 py-1.5 text-[11px] font-medium',
                  tab === t ? 'bg-brand-600 text-white' : 'bg-slate-100 text-text-secondary',
                )}
              >
                {t === 'mine' ? 'Mis tareas' : 'Bandeja general'}
              </button>
            ))}
            <div className="ml-auto flex flex-wrap gap-1.5">
              <Select value={estadoFilter} onChange={(e) => setEstadoFilter(e.target.value)} className="!w-auto">
                <option value="todos">Estado: Todos</option>
                <option value="pendiente">Pendiente</option>
                <option value="en_revision">En revisión</option>
                <option value="alerta">Alerta</option>
                <option value="aprobado">Aprobado</option>
                <option value="rechazado">Rechazado</option>
              </Select>
              <Select value={ciudadFilter} onChange={(e) => setCiudadFilter(e.target.value)} className="!w-auto">
                <option value="todas">Ciudad: Todas</option>
                {ciudades.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </Select>
              <Select value={motivoFilter} onChange={(e) => setMotivoFilter(e.target.value)} className="!w-auto">
                <option value="todos">Motivo: Todos</option>
                {motivos.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </Select>
              <Select value={auditorFilter} onChange={(e) => setAuditorFilter(e.target.value)} className="!w-auto">
                <option value="todos">Auditor: Todos</option>
                {auditores.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </Select>
              <label className="flex items-center gap-1.5 text-[11px]">
                <input type="checkbox" checked={soloAlerta} onChange={(e) => setSoloAlerta(e.target.checked)} />
                Solo con alerta
              </label>
              <Button variant="secondary" size="sm">
                <RefreshCw className="h-3.5 w-3.5" />
                Actualizar
              </Button>
            </div>
          </div>

          <p className="text-[11px] text-text-secondary">
            Mostrando {cases.length} tareas
            {tab === 'mine' ? ` asignadas a ${currentUser.name}` : ''}
            {' · '}
            <span className="text-brand-600">Clic en una fila para abrir el detalle</span>
          </p>
          <DataTable
            columns={columns}
            data={cases}
            keyExtractor={(r) => r.id}
            onRowClick={(r) => navigate(`/nid/${r.nid}`)}
            compact
            emptyMessage="No hay tareas para los filtros seleccionados"
          />
        </div>

        <div className="space-y-2.5">
          <Card title="Prioridad por motivo" compact>
            <ul className="space-y-1.5 text-[11px]">
              {[...new Set(cases.map((c) => c.motivoAlerta).filter(Boolean))].slice(0, 5).map((m) => (
                <li key={m} className="flex justify-between">
                  <span className="text-text-secondary">{m}</span>
                  <span className="font-medium">{cases.filter((c) => c.motivoAlerta === m).length}</span>
                </li>
              ))}
            </ul>
          </Card>
          <Card title="Carga por auditor" compact>
            <ul className="space-y-2">
              {auditorLoad.map((a) => (
                <li key={a.name}>
                  <div className="mb-0.5 flex justify-between text-[11px]">
                    <span>{a.name.split(' ')[0]}</span>
                    <span>{a.pct}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-100">
                    <div className="h-1.5 rounded-full bg-brand-500" style={{ width: `${a.pct}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          </Card>
          {stats.conAlerta > 0 && (
            <Card compact className="border-orange-200 bg-orange-50">
              <p className="text-[11px] font-medium text-orange-800">
                {stats.conAlerta} tareas con alerta requieren revisión prioritaria
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
