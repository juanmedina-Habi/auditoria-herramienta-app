import { useNavigate } from 'react-router-dom'
import { Download, Clock } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { useAudit } from '../../context/AuditContext'
import { getProcessLabel } from '../../data/processes'
import { countries } from '../../data/countries'
import { Card } from '../../components/ui/Card'
import { MetricCard } from '../../components/ui/MetricCard'
import { DataTable } from '../../components/tables/DataTable'
import { StatusPill } from '../../components/ui/StatusPill'
import { Button } from '../../components/ui/Button'
import { PageHeader, pageShellClass } from '../../components/ui/PageHeader'
import type { AuditMetric } from '../../types/audit'

export function AuditorMetricsPage() {
  const { countryCode, processType, currentMetrics, currentAlerts } = useAudit()
  const navigate = useNavigate()
  const country = countries.find((c) => c.code === countryCode)!
  const processLabel = getProcessLabel(processType)

  const totals = currentMetrics.reduce(
    (acc, m) => ({
      cases: acc.cases + m.totalCases,
      approved: acc.approved + m.approved,
      rejected: acc.rejected + m.rejected,
      escalated: acc.escalated + m.escalated,
    }),
    { cases: 0, approved: 0, rejected: 0, escalated: 0 },
  )

  const chartData = currentMetrics.map((m) => ({
    name: m.auditorName.split(' ')[0],
    Aprobados: m.approved,
    Rechazados: m.rejected,
    Escalados: m.escalated,
    Pendientes: m.pending,
  }))

  const columns = [
    {
      key: 'auditor',
      header: 'Auditor',
      render: (r: AuditMetric) => r.auditorName,
    },
    { key: 'asignados', header: 'Casos asignados', render: (r: AuditMetric) => r.totalCases },
    { key: 'cerrados', header: 'Casos cerrados', render: (r: AuditMetric) => r.closedCases },
    { key: 'aprobados', header: 'Aprobados', render: (r: AuditMetric) => `${r.approved} (${Math.round((r.approved / r.totalCases) * 100)}%)` },
    { key: 'rechazados', header: 'Rechazados', render: (r: AuditMetric) => `${r.rejected} (${Math.round((r.rejected / r.totalCases) * 100)}%)` },
    { key: 'escalados', header: 'Escalados', render: (r: AuditMetric) => r.escalated },
    { key: 'tiempo', header: 'Tiempo prom.', render: (r: AuditMetric) => `${r.avgResolutionMinutes} min` },
    { key: 'sla', header: '% SLA', render: (r: AuditMetric) => `${r.slaCompliance}%` },
    {
      key: 'estado',
      header: 'Estado',
      render: (r: AuditMetric) => (
        <StatusPill status={r.slaCompliance >= 90 ? 'ok' : 'alerta'} />
      ),
    },
  ]

  return (
    <div className={pageShellClass}>
      <PageHeader
        title="Métricas por auditor"
        subtitle={`Desempeño de ${processLabel} — ${country.name}`}
        meta={<span className="text-[10px] text-text-secondary">Última actualización: 29 may. 2026, 1:10 p.m.</span>}
      />

      <div className="grid grid-cols-2 gap-2 lg:grid-cols-5">
        <MetricCard compact label="Casos auditados" value={totals.cases} />
        <MetricCard compact label="Aprobados" value={totals.approved} variant="ok" />
        <MetricCard compact label="Rechazados" value={totals.rejected} variant="error" />
        <MetricCard compact label="Escalados" value={totals.escalated} variant="alert" />
        <MetricCard compact label="Tiempo prom. revisión" value="12 min" icon={<Clock className="h-3.5 w-3.5" />} />
      </div>

      <div className="grid grid-cols-1 gap-2.5 lg:grid-cols-3">
        {currentMetrics.map((m) => (
          <Card key={m.auditorId} title={m.auditorName} compact>
            <p className="mb-2 text-[11px] text-text-secondary">Carga actual: {m.currentLoad}%</p>
            <div className="mb-3 h-1.5 rounded-full bg-slate-100">
              <div className="h-1.5 rounded-full bg-brand-600" style={{ width: `${m.currentLoad}%` }} />
            </div>
            <dl className="grid grid-cols-2 gap-2 text-[11px]">
              <div><dt className="text-text-secondary">Casos</dt><dd className="font-bold">{m.totalCases}</dd></div>
              <div><dt className="text-text-secondary">Aprobados</dt><dd className="font-bold text-status-ok">{m.approved}</dd></div>
              <div><dt className="text-text-secondary">Rechazados</dt><dd className="font-bold text-status-error">{m.rejected}</dd></div>
              <div><dt className="text-text-secondary">SLA</dt><dd className="font-bold">{m.slaCompliance}%</dd></div>
            </dl>
          </Card>
        ))}
        <Card title="Alertas activas" compact>
          <ul className="space-y-1.5 text-[11px]">
            {currentAlerts.slice(0, 4).map((a) => (
              <li key={a.motivo} className="flex justify-between">
                <span>{a.motivo}</span>
                <span className="font-medium text-status-alert">{a.count}</span>
              </li>
            ))}
          </ul>
          <button type="button" className="mt-2 text-[11px] text-brand-600 hover:underline" onClick={() => navigate('/tasks')}>
            Ver tareas con alerta
          </button>
        </Card>
      </div>

      <Card title="Casos auditados por auditor" compact>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="Aprobados" fill="#16a34a" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Rechazados" fill="#dc2626" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Escalados" fill="#ea580c" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Pendientes" fill="#94a3b8" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card
        title="Desempeño por auditor"
        compact
        action={
          <Button variant="secondary" size="sm"><Download className="h-3.5 w-3.5" /> Exportar</Button>
        }
      >
        <DataTable columns={columns} data={currentMetrics} keyExtractor={(r) => r.auditorId} compact />
      </Card>
    </div>
  )
}
