import type { CountryCode, ProcessType } from '../types/audit'

export type DashboardKpi = {
  label: string
  value: string
  delta: string
  deltaDirection: 'up' | 'down'
  deltaPositive?: boolean
}

export type DashboardCitySlice = {
  name: string
  value: number
  pct: number
  color: string
}

export type DashboardOperationalItem = {
  label: string
  count: number
  pct: number
  dotClass: string
}

export type DashboardFinding = {
  title: string
  description: string
  count: number
}

export type DashboardViewData = {
  updatedAt: string
  dateRange: string
  kpis: DashboardKpi[]
  frequentErrors: { name: string; count: number }[]
  cityBreakdown: DashboardCitySlice[]
  totalAudited: number
  operationalSummary: DashboardOperationalItem[]
  findings: DashboardFinding[]
}

const CO_VIEW: DashboardViewData = {
  updatedAt: 'Actualizado: hoy, 11:10 a. m.',
  dateRange: '28 may. – 29 may. 2026',
  kpis: [
    { label: 'NIDs auditados hoy', value: '412', delta: '12.4%', deltaDirection: 'up', deltaPositive: true },
    { label: 'Pendientes', value: '186', delta: '5.6%', deltaDirection: 'up', deltaPositive: false },
    { label: 'Aprobados automáticos', value: '152', delta: '8.1%', deltaDirection: 'up', deltaPositive: true },
    { label: 'Con alerta', value: '68', delta: '3.2%', deltaDirection: 'down', deltaPositive: true },
    { label: 'Georreferenciación OK', value: '91.3%', delta: '2.7 pp', deltaDirection: 'up', deltaPositive: true },
    { label: 'Comparables OK', value: '86.7%', delta: '1.9 pp', deltaDirection: 'up', deltaPositive: true },
  ],
  frequentErrors: [
    { name: 'Comparables duplicados', count: 128 },
    { name: 'Revisar Polynator', count: 94 },
    { name: 'Inmueble mal georreferenciado', count: 72 },
    { name: 'Revisar escalera', count: 41 },
  ],
  cityBreakdown: [
    { name: 'Bogotá', value: 173, pct: 42, color: '#7c3aed' },
    { name: 'Valle de Aburrá', value: 115, pct: 28, color: '#a78bfa' },
    { name: 'Cali', value: 74, pct: 18, color: '#c4b5fd' },
    { name: 'Barranquilla', value: 50, pct: 12, color: '#ddd6fe' },
  ],
  totalAudited: 412,
  operationalSummary: [
    { label: 'Aprobados', count: 232, pct: 56.3, dotClass: 'bg-status-ok' },
    { label: 'Rechazados', count: 48, pct: 11.7, dotClass: 'bg-status-error' },
    { label: 'En revisión', count: 82, pct: 19.9, dotClass: 'bg-amber-400' },
    { label: 'Escalados', count: 18, pct: 4.4, dotClass: 'bg-brand-500' },
  ],
  findings: [
    { title: 'Comparables duplicados', description: 'NID repetido en más de un comparable', count: 128 },
    { title: 'Revisar Polynator', description: 'Score fuera del umbral aceptable', count: 94 },
    { title: 'Georreferenciación', description: 'Coordenadas inconsistentes con la dirección', count: 72 },
    { title: 'Revisar escalera', description: 'Nivel de escalera no coincide con el modelo', count: 41 },
  ],
}

const MX_VIEW: DashboardViewData = {
  updatedAt: 'Actualizado: hoy, 11:10 a. m.',
  dateRange: '28 may. – 29 may. 2026',
  kpis: [
    { label: 'NIDs auditados hoy', value: '287', delta: '9.8%', deltaDirection: 'up', deltaPositive: true },
    { label: 'Pendientes', value: '124', delta: '4.2%', deltaDirection: 'up', deltaPositive: false },
    { label: 'Aprobados automáticos', value: '98', delta: '6.5%', deltaDirection: 'up', deltaPositive: true },
    { label: 'Con alerta', value: '54', delta: '2.1%', deltaDirection: 'down', deltaPositive: true },
    { label: 'Georreferenciación OK', value: '88.4%', delta: '1.8 pp', deltaDirection: 'up', deltaPositive: true },
    { label: 'Comparables OK', value: '83.2%', delta: '2.4 pp', deltaDirection: 'up', deltaPositive: true },
  ],
  frequentErrors: [
    { name: 'Revisión de zona', count: 86 },
    { name: 'Revisión de modelo', count: 61 },
    { name: 'Comparables duplicados', count: 47 },
    { name: 'Datos faltantes', count: 29 },
  ],
  cityBreakdown: [
    { name: 'CDMX', value: 120, pct: 42, color: '#7c3aed' },
    { name: 'Guadalajara', value: 69, pct: 24, color: '#a78bfa' },
    { name: 'Monterrey', value: 57, pct: 20, color: '#c4b5fd' },
    { name: 'Querétaro', value: 41, pct: 14, color: '#ddd6fe' },
  ],
  totalAudited: 287,
  operationalSummary: [
    { label: 'Aprobados', count: 158, pct: 55.1, dotClass: 'bg-status-ok' },
    { label: 'Rechazados', count: 36, pct: 12.5, dotClass: 'bg-status-error' },
    { label: 'En revisión', count: 61, pct: 21.3, dotClass: 'bg-amber-400' },
    { label: 'Escalados', count: 14, pct: 4.9, dotClass: 'bg-brand-500' },
  ],
  findings: [
    { title: 'Revisión de zona', description: 'Zona mediana no activa o fuera de cobertura', count: 86 },
    { title: 'Revisión de modelo', description: 'Desviación significativa del score Polynator', count: 61 },
    { title: 'Comparables duplicados', description: 'Comparable repetido en distintas fuentes', count: 47 },
    { title: 'Datos faltantes', description: 'Campos obligatorios incompletos en el NID', count: 29 },
  ],
}

export function getDashboardView(countryCode: CountryCode, _processType: ProcessType): DashboardViewData {
  return countryCode === 'MX' ? MX_VIEW : CO_VIEW
}
