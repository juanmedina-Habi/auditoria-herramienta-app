import { useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { CheckCircle2, AlertTriangle, TrendingUp } from 'lucide-react'
import { useAudit } from '../../context/AuditContext'
import { getProcessLabel } from '../../data/processes'
import { comparableRules } from '../../data/rules'
import { getCaseByNid, getComparablesByNid } from '../../services/auditService'
import { CaseHeaderBar } from '../../components/nid/CaseHeaderBar'
import { NidPageShell } from '../../components/nid/NidPageShell'
import { Card } from '../../components/ui/Card'
import { StatusPill } from '../../components/ui/StatusPill'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { TextArea } from '../../components/ui/TextArea'
import { DataTable } from '../../components/tables/DataTable'
import { cn } from '../../lib/utils'
import type { Comparable, ComparableEstado } from '../../types/audit'

const TAB_MAP: Record<string, ComparableEstado | 'all' | 'alert'> = {
  todos: 'all',
  validos: 'valido',
  alerta: 'alert',
  duplicados: 'duplicado_confirmado',
}

export function ComparablesPage() {
  const { nid } = useParams<{ nid: string }>()
  const { scope, processType } = useAudit()
  const [tab, setTab] = useState('todos')
  const auditCase = nid ? getCaseByNid(nid, scope) : undefined
  const allComps = nid ? getComparablesByNid(nid, scope) : []

  const comps = useMemo(() => {
    const filter = TAB_MAP[tab]
    if (filter === 'all') return allComps
    if (filter === 'alert')
      return allComps.filter((c) => c.estado !== 'valido')
    return allComps.filter((c) => c.estado === filter)
  }, [allComps, tab])

  if (!auditCase) {
    return (
      <div className="py-12 text-center">
        <p className="text-lg font-medium">NID no encontrado</p>
        <Link to="/tasks" className="mt-3 inline-block text-[11px] text-brand-600 hover:underline">Volver a tareas</Link>
      </div>
    )
  }

  const validos = allComps.filter((c) => c.estado === 'valido').length
  const duplicados = allComps.filter((c) => c.isDuplicate).length

  const columns = [
    { key: 'cnid', header: 'Comparable NID', render: (r: Comparable) => r.comparableNid },
    { key: 'source', header: 'Fuente', render: (r: Comparable) => r.source },
    { key: 'price', header: 'Precio', render: (r: Comparable) => r.price.toLocaleString() },
    { key: 'm2', header: 'Valor m²', render: (r: Comparable) => r.pricePerM2.toLocaleString() },
    { key: 'area', header: 'Área', render: (r: Comparable) => r.area },
    { key: 'anios', header: 'Años', render: (r: Comparable) => r.anios },
    { key: 'garajes', header: 'Garajes', render: (r: Comparable) => r.garajes },
    { key: 'banos', header: 'Baños', render: (r: Comparable) => r.banos },
    { key: 'piso', header: 'Piso', render: (r: Comparable) => r.piso },
    {
      key: 'estado',
      header: 'Estado',
      render: (r: Comparable) => (
        <Badge
          className={cn(
            r.estado === 'valido' && 'bg-green-100 text-green-700',
            r.estado === 'posible_duplicado' && 'bg-orange-100 text-orange-700',
            r.estado === 'duplicado_confirmado' && 'bg-red-100 text-red-700',
          )}
        >
          {r.estado === 'valido' ? 'Válido' : r.estado === 'posible_duplicado' ? 'Posible duplicado' : 'Duplicado confirmado'}
        </Badge>
      ),
    },
  ]

  const sidebar = (
    <>
      <Card compact title="Resumen de validación">
        <dl className="space-y-1.5 text-[11px]">
          <div className="flex justify-between"><dt>Encontrados</dt><dd className="font-medium">{allComps.length}</dd></div>
          <div className="flex justify-between"><dt>Válidos</dt><dd className="font-medium text-status-ok">{validos}</dd></div>
          <div className="flex justify-between"><dt>Duplicados</dt><dd className="font-medium text-status-alert">{duplicados}</dd></div>
          <div className="flex justify-between"><dt>Regla mínima</dt><dd>4 comparables</dd></div>
          <div className="flex justify-between"><dt>Estado final</dt><dd><StatusPill status={duplicados > 0 ? 'alerta' : 'ok'} /></dd></div>
        </dl>
      </Card>
      {duplicados > 0 && (
        <Card compact title="Detalle del duplicado" className="border-orange-200 bg-orange-50">
          <p className="text-[11px] text-orange-800">
            Coincidencia en precio, área, años, garajes y baños entre comparables detectados.
          </p>
        </Card>
      )}
      <Card compact title="Reglas automáticas">
        <ul className="space-y-1 text-[10px] text-text-secondary">
          {comparableRules.map((r) => (
            <li key={r}>• {r}</li>
          ))}
        </ul>
      </Card>
      <Card compact title="Comentario automático">
        <p className="text-[11px] text-text-secondary">{auditCase.comentarioAutomatico}</p>
      </Card>
      <TextArea label="Observación manual" rows={3} hint="0/250" />
      <Button className="w-full" size="sm"><CheckCircle2 className="h-3.5 w-3.5" /> Aprobar comparables</Button>
      <Button variant="secondary" className="w-full" size="sm"><TrendingUp className="h-3.5 w-3.5" /> Escalar</Button>
      <Button variant="danger" className="w-full" size="sm"><AlertTriangle className="h-3.5 w-3.5" /> Reportar inconsistencia</Button>
    </>
  )

  return (
    <NidPageShell
      nid={auditCase.nid}
      title="Comparables"
      subtitle={`Validación de comparables en ${getProcessLabel(processType)}`}
      breadcrumbs={['Bandeja de auditoría', 'Detalle NID', 'Comparables']}
      backTo={`/nid/${nid}`}
      header={<CaseHeaderBar auditCase={auditCase} />}
      sidebar={sidebar}
    >
      <div className="flex flex-wrap gap-1.5">
        {[
          { id: 'todos', label: `Todos (${allComps.length})` },
          { id: 'validos', label: `Válidos (${validos})` },
          { id: 'alerta', label: `Con alerta (${allComps.length - validos})` },
          { id: 'duplicados', label: `Duplicados (${duplicados})` },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              'rounded-md px-3 py-1.5 text-[11px] font-medium',
              tab === t.id ? 'bg-brand-600 text-white' : 'bg-slate-100 text-text-secondary',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
      <DataTable columns={columns} data={comps} keyExtractor={(r) => r.id} compact emptyMessage="Sin comparables" />
      {duplicados > 0 && (
        <div className="rounded-md border border-orange-200 bg-orange-50 px-3 py-2 text-[11px] text-orange-800">
          Se detectó {duplicados} posible duplicado. Revisa coincidencia de identidad antes de aprobar.
        </div>
      )}
    </NidPageShell>
  )
}
