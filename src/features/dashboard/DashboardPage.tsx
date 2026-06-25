import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AlertTriangle,
  BarChart3,
  CalendarRange,
  CheckCircle2,
  ClipboardList,
  Clock,
  MapPin,
  RefreshCw,
  ShieldCheck,
  TrendingUp,
  XCircle,
  ChevronRight,
  FileWarning,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { useAudit } from '../../context/AuditContext'
import { getProcessLabel } from '../../data/processes'
import { getDashboardView } from '../../data/dashboardView'
import { getAuditorLoad, filterCases } from '../../services/auditService'
import { MetricCard } from '../../components/ui/MetricCard'
import { Card } from '../../components/ui/Card'
import { DataTable } from '../../components/tables/DataTable'
import { PageHeader, pageShellClass } from '../../components/ui/PageHeader'
import { cn } from '../../lib/utils'
import type { AuditCase } from '../../types/audit'

const KPI_ICONS = [ClipboardList, Clock, CheckCircle2, AlertTriangle, MapPin, ShieldCheck]

const OPERATIONAL_STYLES: Record<
  string,
  { icon: LucideIcon; bg: string; text: string }
> = {
  Aprobados: { icon: CheckCircle2, bg: 'bg-green-50', text: 'text-status-ok' },
  Rechazados: { icon: XCircle, bg: 'bg-red-50', text: 'text-status-error' },
  'En revisión': { icon: Clock, bg: 'bg-amber-50', text: 'text-amber-600' },
  Escalados: { icon: TrendingUp, bg: 'bg-brand-50', text: 'text-brand-600' },
}

function estadoLabel(estado: AuditCase['estado'], auto: AuditCase['resultadoAutomatico']) {
  if (auto === 'alerta' || auto === 'error' || estado === 'alerta') return 'Con alerta'
  if (estado === 'en_revision') return 'En revisión'
  if (estado === 'pendiente') return 'Pendiente'
  return 'OK'
}

function estadoStyle(estado: AuditCase['estado'], auto: AuditCase['resultadoAutomatico']) {
  if (auto === 'alerta' || auto === 'error' || estado === 'alerta') {
    return { dot: 'bg-status-error', text: 'text-status-error' }
  }
  if (estado === 'en_revision') {
    return { dot: 'bg-amber-400', text: 'text-amber-700' }
  }
  return { dot: 'bg-slate-400', text: 'text-text-secondary' }
}

function auditorInitials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
}

export function DashboardPage() {
  const { countryCode, processType, scope } = useAudit()
  const navigate = useNavigate()
  const view = getDashboardView(countryCode, processType)
  const processLabel = getProcessLabel(processType)
  const auditorLoad = getAuditorLoad(scope)

  const alertCases = useMemo(() => {
    return filterCases(scope)
      .filter(
        (c) =>
          c.estado !== 'aprobado' &&
          (c.resultadoAutomatico !== 'ok' ||
            c.estado === 'alerta' ||
            c.estado === 'en_revision' ||
            c.estado === 'pendiente'),
      )
      .slice(0, 6)
  }, [scope])

  const maxErrorCount = Math.max(...view.frequentErrors.map((e) => e.count), 1)

  const alertColumns = [
    {
      key: 'fecha',
      header: 'Fecha',
      className: 'w-[11%] whitespace-nowrap',
      render: (r: AuditCase) => <span className="text-[11px]">{r.fecha}</span>,
    },
    {
      key: 'nid',
      header: 'NID',
      sticky: 'left' as const,
      className: 'w-[18%]',
      render: (r: AuditCase) => (
        <span className="inline-flex items-center gap-0.5 font-mono text-[11px] font-semibold text-brand-600">
          <ChevronRight className="h-3 w-3 opacity-40 group-hover:opacity-100" />
          {r.nid}
        </span>
      ),
    },
    {
      key: 'ciudad',
      header: 'Ciudad',
      className: 'w-[12%] truncate',
      render: (r: AuditCase) => <span className="text-[11px]">{r.ciudad}</span>,
    },
    {
      key: 'estado',
      header: 'Estado',
      className: 'w-[14%]',
      render: (r: AuditCase) => {
        const style = estadoStyle(r.estado, r.resultadoAutomatico)
        const isAlert = estadoLabel(r.estado, r.resultadoAutomatico) === 'Con alerta'
        return (
          <span className={cn('inline-flex items-center gap-1 text-[11px] font-medium', style.text)}>
            {isAlert ? (
              <AlertTriangle className="h-3 w-3 shrink-0" />
            ) : (
              <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', style.dot)} />
            )}
            {estadoLabel(r.estado, r.resultadoAutomatico)}
          </span>
        )
      },
    },
    {
      key: 'motivo',
      header: 'Motivo',
      className: 'w-[24%] truncate text-text-secondary',
      render: (r: AuditCase) => <span className="text-[11px]">{r.motivoAlerta || '—'}</span>,
    },
    {
      key: 'auditor',
      header: 'Auditor',
      className: 'w-[21%] truncate',
      render: (r: AuditCase) => (
        <span className="text-[11px]">{r.auditorAsignado.split(' ').slice(0, 2).join(' ')}</span>
      ),
    },
  ]

  return (
    <div className={pageShellClass}>
      <PageHeader
        title="Dashboard general"
        subtitle={`Visión general de la auditoría de ${processLabel}`}
        meta={<span className="hidden text-[10px] text-text-secondary lg:inline">{view.updatedAt}</span>}
        actions={
          <>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-md border border-border-soft bg-white px-2 py-1 text-[10px] font-medium text-text-primary hover:bg-slate-50"
            >
              <CalendarRange className="h-3 w-3 text-text-secondary" />
              {view.dateRange}
            </button>
            <button
              type="button"
              className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border-soft bg-white text-text-secondary hover:bg-slate-50"
              aria-label="Actualizar"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          </>
        }
      />

      <div className="grid shrink-0 grid-cols-3 gap-2 lg:grid-cols-6">
        {view.kpis.map((kpi, i) => {
          const Icon = KPI_ICONS[i] ?? BarChart3
          return (
            <MetricCard
              key={kpi.label}
              compact
              label={kpi.label}
              value={kpi.value}
              delta={kpi.delta}
              deltaDirection={kpi.deltaDirection}
              deltaPositive={kpi.deltaPositive}
              icon={<Icon className="h-3.5 w-3.5" />}
              variant={i === 3 ? 'alert' : i === 2 ? 'ok' : 'default'}
            />
          )
        })}
      </div>

      {/* Fila media — carga por auditor más estrecha */}
      <div className="grid shrink-0 grid-cols-1 gap-2 lg:grid-cols-12">
        <Card title="Errores más frecuentes" compact className="lg:col-span-5">
          <div className="space-y-2">
            {view.frequentErrors.map((error) => (
              <div key={error.name}>
                <div className="mb-0.5 flex items-center justify-between gap-2 text-[11px]">
                  <span className="truncate text-text-secondary">{error.name}</span>
                  <span className="shrink-0 font-semibold tabular-nums text-text-primary">{error.count}</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-brand-600"
                    style={{ width: `${(error.count / maxErrorCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Resultado por ciudad" compact className="lg:col-span-5">
          <div className="flex items-center gap-3">
            <div className="relative h-[110px] w-[110px] shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={view.cityBreakdown}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={32}
                    outerRadius={46}
                    paddingAngle={2}
                    stroke="none"
                  >
                    {view.cityBreakdown.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [value ?? 0, 'NIDs']} />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-base font-bold leading-none tabular-nums">{view.totalAudited}</span>
                <span className="text-[9px] font-medium uppercase text-text-secondary">Total</span>
              </div>
            </div>
            <ul className="min-w-0 flex-1 space-y-1.5">
              {view.cityBreakdown.map((city) => (
                <li key={city.name} className="flex items-center justify-between gap-1 text-[11px]">
                  <span className="flex min-w-0 items-center gap-1.5">
                    <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: city.color }} />
                    <span className="truncate text-text-secondary">{city.name}</span>
                  </span>
                  <span className="shrink-0 tabular-nums font-medium">
                    {city.pct}% <span className="text-text-secondary">({city.value})</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </Card>

        <Card title="Carga por auditor" compact className="lg:col-span-2">
          <ul className="space-y-3">
            {auditorLoad.map((a) => (
              <li key={a.name}>
                <div className="mb-1.5 flex items-center gap-1.5">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-100 text-[9px] font-bold text-brand-700">
                    {auditorInitials(a.name)}
                  </div>
                  <span className="truncate text-[10px] font-medium leading-tight">
                    {a.name.split(' ').slice(0, 2).join(' ')}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-brand-600" style={{ width: `${a.pct}%` }} />
                  </div>
                  <span className="shrink-0 text-[10px] font-semibold tabular-nums text-brand-600">
                    {a.pct}%
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Fila inferior — tabla protagonista */}
      <div className="grid shrink-0 grid-cols-1 gap-2 lg:grid-cols-12">
        <Card title="Resumen operativo" compact className="lg:col-span-2">
          <ul className="space-y-2">
            {view.operationalSummary.map((item) => {
              const style = OPERATIONAL_STYLES[item.label] ?? OPERATIONAL_STYLES.Aprobados
              const Icon = style.icon
              return (
                <li key={item.label} className="flex items-center gap-2">
                  <div
                    className={cn(
                      'flex h-7 w-7 shrink-0 items-center justify-center rounded-full',
                      style.bg,
                      style.text,
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" strokeWidth={2.5} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[10px] font-medium text-text-primary">{item.label}</p>
                    <p className="text-[9px] tabular-nums text-text-secondary">{item.pct}%</p>
                  </div>
                  <span className="shrink-0 text-xs font-bold tabular-nums text-text-primary">
                    {item.count}
                  </span>
                </li>
              )
            })}
          </ul>
        </Card>

        <Card title="NIDs con alerta reciente" compact className="lg:col-span-7">
          <DataTable
            columns={alertColumns}
            data={alertCases}
            keyExtractor={(r) => r.id}
            onRowClick={(r) => navigate(`/nid/${r.nid}`)}
            compact
            dense
            emptyMessage="Sin alertas recientes"
          />
        </Card>

        <Card title="Hallazgos principales" compact className="lg:col-span-3">
          <ul className="space-y-2.5">
            {view.findings.slice(0, 4).map((finding) => (
              <li key={finding.title} className="flex gap-2">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                  <FileWarning className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-1">
                    <p className="text-[10px] font-semibold leading-tight text-text-primary">{finding.title}</p>
                    <span className="shrink-0 text-[10px] font-bold tabular-nums text-brand-700">
                      {finding.count}
                    </span>
                  </div>
                  <p className="mt-0.5 line-clamp-2 text-[9px] leading-snug text-text-secondary">
                    {finding.description}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  )
}
