import { useSearchParams, useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import { useAudit } from '../../context/AuditContext'
import { getProcessLabel } from '../../data/processes'
import { searchCasesByNid } from '../../services/auditService'
import { Card } from '../../components/ui/Card'
import { DataTable } from '../../components/tables/DataTable'
import { StatusPill } from '../../components/ui/StatusPill'
import { PageHeader, pageShellClass } from '../../components/ui/PageHeader'
import type { AuditCase } from '../../types/audit'

export function SearchPage() {
  const [params, setParams] = useSearchParams()
  const query = params.get('q') ?? ''
  const { scope, processType } = useAudit()
  const navigate = useNavigate()
  const results = searchCasesByNid(query, scope)

  const columns = [
    { key: 'nid', header: 'NID', render: (r: AuditCase) => <span className="font-mono text-[11px] font-semibold text-brand-600">{r.nid}</span> },
    { key: 'ciudad', header: 'Ciudad', render: (r: AuditCase) => <span className="text-[11px]">{r.ciudad}</span> },
    { key: 'proceso', header: 'Proceso', render: (r: AuditCase) => <span className="text-[11px]">{r.proceso}</span> },
    { key: 'estado', header: 'Estado', render: (r: AuditCase) => <StatusPill status={r.estado} /> },
    { key: 'auditor', header: 'Auditor', render: (r: AuditCase) => <span className="text-[11px]">{r.auditorAsignado}</span> },
  ]

  return (
    <div className={pageShellClass}>
      <PageHeader
        title="Buscar NID"
        subtitle={`Búsqueda en ${getProcessLabel(processType)} para el país seleccionado`}
      />
      <Card compact>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-secondary" />
          <input
            type="search"
            placeholder="Ingresa un NID..."
            value={query}
            onChange={(e) => setParams({ q: e.target.value })}
            className="w-full rounded-md border border-border-soft bg-slate-50 py-1.5 pl-8 pr-3 text-[11px] outline-none focus:border-brand-500"
            autoFocus
          />
        </div>
      </Card>
      {query && (
        <DataTable
          columns={columns}
          data={results}
          keyExtractor={(r) => r.id}
          onRowClick={(r) => navigate(`/nid/${r.nid}`)}
          compact
          emptyMessage={`No se encontraron casos para "${query}" en este país y proceso`}
        />
      )}
    </div>
  )
}
