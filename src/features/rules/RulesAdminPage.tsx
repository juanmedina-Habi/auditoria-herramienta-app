import { useMemo, useState } from 'react'
import { useAudit } from '../../context/AuditContext'
import { getProcessLabel } from '../../data/processes'
import { countries } from '../../data/countries'
import { Card } from '../../components/ui/Card'
import { DataTable } from '../../components/tables/DataTable'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Select } from '../../components/ui/Select'
import { PageHeader, pageShellClass } from '../../components/ui/PageHeader'
import { cn } from '../../lib/utils'
import type { AuditRule } from '../../types/audit'

export function RulesAdminPage() {
  const { countryCode, processType, currentRules } = useAudit()
  const [tab, setTab] = useState<'activas' | 'historial' | 'plantillas'>('activas')
  const [search, setSearch] = useState('')
  const [estadoFilter, setEstadoFilter] = useState('todos')
  const country = countries.find((c) => c.code === countryCode)!

  const rules = useMemo(() => {
    return currentRules.filter((r) => {
      if (search && !r.name.toLowerCase().includes(search.toLowerCase())) return false
      if (estadoFilter === 'activas' && !r.active) return false
      if (estadoFilter === 'inactivas' && r.active) return false
      return true
    })
  }, [currentRules, search, estadoFilter])

  const stats = {
    activas: currentRules.filter((r) => r.active).length,
    ok: currentRules.filter((r) => r.severity === 'ok').length,
    alerta: currentRules.filter((r) => r.severity === 'alerta').length,
    inactivas: currentRules.filter((r) => !r.active).length,
  }

  const columns = [
    { key: 'name', header: 'Nombre', render: (r: AuditRule) => r.name },
    { key: 'cat', header: 'Categoría', render: (r: AuditRule) => r.category },
    { key: 'tipo', header: 'Tipo', render: (r: AuditRule) => r.tipo },
    { key: 'param', header: 'Parámetro / Umbral', render: (r: AuditRule) => r.parametro ?? '—' },
    {
      key: 'estado',
      header: 'Estado',
      render: (r: AuditRule) => (
        <Badge variant={r.active ? 'brand' : 'outline'}>{r.active ? 'Activa' : 'Inactiva'}</Badge>
      ),
    },
    { key: 'updated', header: 'Última actualización', render: (r: AuditRule) => r.updatedAt },
    {
      key: 'acciones',
      header: 'Acciones',
      render: () => <Button variant="ghost" size="sm" disabled>Editar</Button>,
    },
  ]

  return (
    <div className={pageShellClass}>
      <PageHeader
        title="Administración de reglas"
        subtitle={`Reglas de ${getProcessLabel(processType)} — ${country.name}`}
      />

      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        {[
          { label: 'Reglas activas', value: stats.activas },
          { label: 'Reglas OK', value: stats.ok, ok: true },
          { label: 'Con alerta', value: stats.alerta, alert: true },
          { label: 'Inactivas', value: stats.inactivas },
        ].map((s) => (
          <Card key={s.label} compact>
            <p className="text-[10px] text-text-secondary">{s.label}</p>
            <p className={cn('mt-0.5 text-xl font-bold tabular-nums', s.ok && 'text-status-ok', s.alert && 'text-status-alert')}>
              {s.value}
            </p>
          </Card>
        ))}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {(['activas', 'historial', 'plantillas'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              'rounded-md px-3 py-1.5 text-[11px] font-medium capitalize',
              tab === t ? 'bg-brand-600 text-white' : 'bg-slate-100',
            )}
          >
            {t === 'activas' ? 'Reglas activas' : t === 'historial' ? 'Historial de versiones' : 'Plantillas'}
          </button>
        ))}
        <input
          type="search"
          placeholder="Buscar reglas..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="ml-auto rounded-md border border-border-soft px-2 py-1.5 text-[11px]"
        />
        <Select value={estadoFilter} onChange={(e) => setEstadoFilter(e.target.value)} className="!w-auto">
          <option value="todos">Estado: Todos</option>
          <option value="activas">Activas</option>
          <option value="inactivas">Inactivas</option>
        </Select>
      </div>

      {tab === 'activas' ? (
        <DataTable columns={columns} data={rules} keyExtractor={(r) => r.id} compact />
      ) : (
        <Card compact>
          <p className="text-[11px] text-text-secondary">
            {tab === 'historial' ? 'Historial de versiones — próximamente en backend.' : 'Plantillas de reglas — consulta mock.'}
          </p>
        </Card>
      )}
    </div>
  )
}
