import type { AuditCase } from '../types/audit'
import { daysAgoIso, formatUpdatedAtNow } from '../lib/dates'

const CITY_COLORS = ['#7c3aed', '#a78bfa', '#c4b5fd', '#ddd6fe', '#8b5cf6', '#6d28d9']

const FINDING_DESCRIPTIONS: Record<string, string> = {
  'Comparables duplicados': 'NID repetido en más de un comparable',
  'Revisar Polynator': 'Score fuera del umbral aceptable',
  Georreferenciación: 'Coordenadas inconsistentes con la dirección',
  'Revisar escalera': 'Nivel de escalera no coincide con el modelo',
  'Menos de 4 comparables': 'No cumple regla mínima de comparables',
  'Revisión de zona': 'Zona mediana no activa o fuera de cobertura',
  'Revisión de modelo': 'Desviación significativa del score Polynator',
  'Datos faltantes': 'Campos obligatorios incompletos en el NID',
  'Inmueble mal georreferenciado': 'Ubicación fuera de zona Habi activa',
}

export type DashboardKpi = {
  label: string
  value: string
  delta?: string
  deltaDirection?: 'up' | 'down'
  deltaPositive?: boolean
  deltaLabel?: string
  trend?: string
}

export type DashboardAnalytics = {
  updatedAt: string
  kpis: DashboardKpi[]
  frequentErrors: { name: string; count: number }[]
  cityBreakdown: { name: string; value: number; pct: number; color: string }[]
  totalAudited: number
  operationalSummary: { label: string; count: number; pct: number }[]
  findings: { title: string; description: string; count: number }[]
}

function pct(part: number, total: number) {
  return total > 0 ? Math.round((part / total) * 1000) / 10 : 0
}

function deltaPair(today: number, yesterday: number, higherIsGood: boolean) {
  if (today === 0 && yesterday === 0) return undefined
  const diff = today - yesterday
  if (diff === 0) return { delta: '0', deltaDirection: 'up' as const, deltaPositive: higherIsGood, deltaLabel: 'vs ayer' }
  const sign = diff > 0 ? '+' : ''
  return {
    delta: `${sign}${diff}`,
    deltaDirection: (diff > 0 ? 'up' : 'down') as 'up' | 'down',
    deltaPositive: diff > 0 ? higherIsGood : !higherIsGood,
    deltaLabel: 'vs ayer',
  }
}

export function getDashboardAnalytics(cases: AuditCase[]): DashboardAnalytics {
  const total = cases.length
  const today = daysAgoIso(0)
  const yesterday = daysAgoIso(1)
  const todayCases = cases.filter((c) => c.fecha === today)
  const yesterdayCases = cases.filter((c) => c.fecha === yesterday)

  const pending = cases.filter((c) => c.estado === 'pendiente').length
  const approvedAuto = cases.filter((c) => c.resultadoAutomatico === 'ok' && c.estado === 'aprobado').length
  const alerts = cases.filter((c) => c.resultadoAutomatico === 'alerta' || c.resultadoAutomatico === 'error').length
  const geoOk = cases.filter((c) => c.georreferenciacion.status === 'ok').length
  const compOk = cases.filter((c) => c.comparables >= 4 && c.resultadoAutomatico !== 'error').length

  const kpis: DashboardKpi[] = [
    {
      label: 'NIDs auditados hoy',
      value: String(todayCases.length),
      ...deltaPair(todayCases.length, yesterdayCases.length, true),
    },
    {
      label: 'Pendientes',
      value: String(pending),
      ...deltaPair(
        todayCases.filter((c) => c.estado === 'pendiente').length,
        yesterdayCases.filter((c) => c.estado === 'pendiente').length,
        false,
      ),
    },
    {
      label: 'Aprobados automáticos',
      value: String(approvedAuto),
      ...deltaPair(
        todayCases.filter((c) => c.estado === 'aprobado' && c.resultadoAutomatico === 'ok').length,
        yesterdayCases.filter((c) => c.estado === 'aprobado' && c.resultadoAutomatico === 'ok').length,
        true,
      ),
    },
    {
      label: 'Con alerta',
      value: String(alerts),
      ...deltaPair(
        todayCases.filter((c) => c.resultadoAutomatico !== 'ok').length,
        yesterdayCases.filter((c) => c.resultadoAutomatico !== 'ok').length,
        false,
      ),
    },
    {
      label: 'Georreferenciación OK',
      value: `${pct(geoOk, total)}%`,
      trend: 'del periodo seleccionado',
    },
    {
      label: 'Comparables OK',
      value: `${pct(compOk, total)}%`,
      trend: 'del periodo seleccionado',
    },
  ]

  const errorCounts: Record<string, number> = {}
  for (const c of cases) {
    if (c.motivoAlerta) errorCounts[c.motivoAlerta] = (errorCounts[c.motivoAlerta] ?? 0) + 1
  }
  const frequentErrors = Object.entries(errorCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }))

  const cityCounts: Record<string, number> = {}
  for (const c of cases) {
    cityCounts[c.ciudad] = (cityCounts[c.ciudad] ?? 0) + 1
  }
  const cityBreakdown = Object.entries(cityCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, value], i) => ({
      name,
      value,
      pct: total ? Math.round((value / total) * 100) : 0,
      color: CITY_COLORS[i % CITY_COLORS.length],
    }))

  const approved = cases.filter((c) => c.estado === 'aprobado').length
  const rejected = cases.filter((c) => c.estado === 'rechazado').length
  const inReview = cases.filter((c) => c.estado === 'en_revision' || c.estado === 'pendiente').length
  const escalated = cases.filter((c) => c.estado === 'escalado').length

  const operationalSummary = [
    { label: 'Aprobados', count: approved, pct: pct(approved, total) },
    { label: 'Rechazados', count: rejected, pct: pct(rejected, total) },
    { label: 'En revisión', count: inReview, pct: pct(inReview, total) },
    { label: 'Escalados', count: escalated, pct: pct(escalated, total) },
  ]

  const findings = frequentErrors.map(({ name, count }) => ({
    title: name,
    description: FINDING_DESCRIPTIONS[name] ?? 'Revisión manual requerida',
    count,
  }))

  return {
    updatedAt: formatUpdatedAtNow(),
    kpis,
    frequentErrors,
    cityBreakdown,
    totalAudited: total,
    operationalSummary,
    findings,
  }
}
