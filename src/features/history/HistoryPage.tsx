import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Download } from 'lucide-react'
import { useAudit } from '../../context/AuditContext'
import { getProcessLabel } from '../../data/processes'
import { countries } from '../../data/countries'
import { getHistory } from '../../services/auditService'
import { Card } from '../../components/ui/Card'
import { DataTable } from '../../components/tables/DataTable'
import { StatusPill } from '../../components/ui/StatusPill'
import { Button } from '../../components/ui/Button'
import { Select } from '../../components/ui/Select'
import { PageHeader, pageShellClass } from '../../components/ui/PageHeader'
import { cn } from '../../lib/utils'
import type { AuditHistoryItem } from '../../types/audit'

export function HistoryPage() {
  const { scope, countryCode, processType } = useAudit()
  const navigate = useNavigate()
  const [tab, setTab] = useState<'general' | 'decisiones' | 'cambios'>('general')
  const [auditorFilter, setAuditorFilter] = useState('todos')
  const [resultadoFilter, setResultadoFilter] = useState('todos')
  const [search, setSearch] = useState('')

  const allHistory = getHistory(scope)
  const country = countries.find((c) => c.code === countryCode)!

  const history = useMemo(() => {
    return allHistory.filter((h) => {
      if (auditorFilter !== 'todos' && h.auditor !== auditorFilter) return false
      if (resultadoFilter !== 'todos' && h.decisionFinal !== resultadoFilter) return false
      if (search && !h.nid.includes(search) && !h.motivoComentario.toLowerCase().includes(search.toLowerCase()))
        return false
      return true
    })
  }, [allHistory, auditorFilter, resultadoFilter, search])

  const stats = {
    total: history.length + 200,
    aprobadas: history.filter((h) => h.decisionFinal.includes('Aprob')).length + 120,
    rechazadas: history.filter((h) => h.decisionFinal.includes('Rechaz')).length + 40,
    escaladas: history.filter((h) => h.decisionFinal.includes('Escal')).length + 15,
  }

  const auditores = [...new Set(allHistory.map((h) => h.auditor))]

  const columns = [
    { key: 'fecha', header: 'Fecha', render: (r: AuditHistoryItem) => `${r.fecha} ${r.hora}` },
    { key: 'nid', header: 'NID', render: (r: AuditHistoryItem) => <span className="font-mono text-xs">{r.nid}</span> },
    { key: 'ciudad', header: 'Ciudad', render: (r: AuditHistoryItem) => r.ciudad },
    { key: 'auditor', header: 'Auditor', render: (r: AuditHistoryItem) => r.auditor },
    { key: 'auto', header: 'Resultado automático', render: (r: AuditHistoryItem) => <StatusPill status={r.resultadoAutomatico} /> },
    { key: 'decision', header: 'Decisión final', render: (r: AuditHistoryItem) => r.decisionFinal },
    { key: 'motivo', header: 'Motivo / comentario', render: (r: AuditHistoryItem) => <span className="max-w-xs truncate">{r.motivoComentario}</span> },
    { key: 'estado', header: 'Estado', render: (r: AuditHistoryItem) => <StatusPill status={r.estado === 'completada' ? 'aprobado' : 'en_revision'} /> },
    {
      key: 'accion',
      header: 'Acciones',
      render: () => (
        <span className="text-[11px] font-medium text-brand-600">Ver detalle →</span>
      ),
    },
  ]

  return (
    <div className={pageShellClass}>
      <PageHeader
        title="Auditoría histórica"
        subtitle={`Historial de ${getProcessLabel(processType)} — ${country.name}`}
      />

      <div className="grid grid-cols-2 gap-2 lg:grid-cols-5">
        {[
          { label: 'Auditorías registradas', value: stats.total },
          { label: 'Aprobadas', value: stats.aprobadas, ok: true },
          { label: 'Rechazadas', value: stats.rechazadas, err: true },
          { label: 'Escaladas', value: stats.escaladas, alert: true },
          { label: 'Última actualización', value: '29 may 2026' },
        ].map((s) => (
          <Card key={s.label} compact>
            <p className="text-[10px] text-text-secondary">{s.label}</p>
            <p className={cn('mt-0.5 text-lg font-bold tabular-nums', s.ok && 'text-status-ok', s.err && 'text-status-error', s.alert && 'text-status-alert')}>
              {s.value}
            </p>
          </Card>
        ))}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {(['general', 'decisiones', 'cambios'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              'rounded-md px-3 py-1.5 text-[11px] font-medium capitalize',
              tab === t ? 'bg-brand-600 text-white' : 'bg-slate-100',
            )}
          >
            {t === 'general' ? 'Historial general' : t === 'decisiones' ? 'Decisiones' : 'Cambios de estado'}
          </button>
        ))}
        <input
          type="search"
          placeholder="Buscar NID, auditor o comentario..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="ml-auto rounded-md border border-border-soft px-2 py-1.5 text-[11px]"
        />
        <Select value={auditorFilter} onChange={(e) => setAuditorFilter(e.target.value)} className="!w-auto">
          <option value="todos">Auditor: Todos</option>
          {auditores.map((a) => <option key={a} value={a}>{a}</option>)}
        </Select>
        <Select value={resultadoFilter} onChange={(e) => setResultadoFilter(e.target.value)} className="!w-auto">
          <option value="todos">Resultado: Todos</option>
          <option value="Aprobado">Aprobado</option>
          <option value="Rechazado">Rechazado</option>
          <option value="Escalado">Escalado</option>
        </Select>
        <Button variant="secondary" size="sm"><Download className="h-3.5 w-3.5" /> Exportar</Button>
      </div>

      <DataTable
        columns={columns.filter((c) => c.key !== 'accion')}
        data={history}
        keyExtractor={(r) => r.id}
        onRowClick={(r) => navigate(`/nid/${r.nid}`)}
        compact
        emptyMessage="No hay registros históricos para este país y proceso"
      />
      <p className="text-[11px] text-text-secondary">Mostrando 1 a {history.length} de {stats.total} registros · Clic en fila para abrir detalle</p>
    </div>
  )
}
