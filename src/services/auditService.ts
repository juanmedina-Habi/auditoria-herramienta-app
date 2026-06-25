import type {
  AuditCase,
  AuditFilter,
  AuditHistoryItem,
  AuditMetric,
  AuditRule,
  Comparable,
  CountryCode,
  DashboardStats,
} from '../types/audit'
import { auditCases } from '../data/auditCases'
import { comparables } from '../data/comparables'
import { historyItems } from '../data/history'
import { rules } from '../data/rules'
import { dashboardStats, auditMetrics, getMonthlyTrend } from '../data/metrics'
import { auditors, getCurrentUser } from '../data/auditors'
import { alertSummary } from '../data/mockFactory'

export type AuditScope = AuditFilter

export function filterCases(scope: AuditScope): AuditCase[] {
  return auditCases.filter(
    (c) => c.countryCode === scope.countryCode && c.processType === scope.processType,
  )
}

export function getCaseByNid(nid: string, scope: AuditScope): AuditCase | undefined {
  return auditCases.find(
    (c) =>
      c.nid === nid &&
      c.countryCode === scope.countryCode &&
      c.processType === scope.processType,
  )
}

export function getComparablesByNid(nid: string, scope: AuditScope): Comparable[] {
  return comparables.filter(
    (c) =>
      c.nid === nid &&
      c.countryCode === scope.countryCode &&
      c.processType === scope.processType,
  )
}

export function getRules(scope: AuditScope): AuditRule[] {
  return rules.filter(
    (r) => r.countryCode === scope.countryCode && r.processType === scope.processType,
  )
}

export function getDashboardStats(scope: AuditScope): DashboardStats {
  return (
    dashboardStats.find(
      (s) => s.countryCode === scope.countryCode && s.processType === scope.processType,
    ) ?? {
      countryCode: scope.countryCode,
      processType: scope.processType,
      totalCases: 0,
      pending: 0,
      inReview: 0,
      approved: 0,
      rejected: 0,
      alerts: 0,
      slaAtRisk: 0,
      escalated: 0,
    }
  )
}

export function getAuditMetrics(scope: AuditScope): AuditMetric[] {
  return auditMetrics.filter(
    (m) => m.countryCode === scope.countryCode && m.processType === scope.processType,
  )
}

export function getAuditorsByCountry(countryCode: CountryCode) {
  return auditors.filter((a) => a.countryCode === countryCode)
}

export function getMyTasks(scope: AuditScope, auditorName?: string) {
  const name = auditorName ?? getCurrentUser(scope.countryCode).name
  return filterCases(scope).filter((c) => c.auditorAsignado === name)
}

export function searchCasesByNid(query: string, scope: AuditScope) {
  const q = query.toLowerCase().trim()
  if (!q) return []
  return filterCases(scope).filter((c) => c.nid.toLowerCase().includes(q))
}

export function getHistory(scope: AuditScope): AuditHistoryItem[] {
  return historyItems.filter(
    (h) => h.countryCode === scope.countryCode && h.processType === scope.processType,
  )
}

export function getTrend(scope: AuditScope) {
  return getMonthlyTrend(scope.countryCode, scope.processType)
}

export function getAlerts(scope: AuditScope) {
  return alertSummary(filterCases(scope))
}

export function getTaskStats(scope: AuditScope) {
  const cases = filterCases(scope)
  return {
    pendientes: cases.filter((c) => c.estado === 'pendiente').length,
    enRevision: cases.filter((c) => c.estado === 'en_revision').length,
    conAlerta: cases.filter((c) => c.resultadoAutomatico === 'alerta').length,
    aprobadas: cases.filter((c) => c.estado === 'aprobado').length,
    rechazadas: cases.filter((c) => c.estado === 'rechazado').length,
  }
}

export function getAuditorLoad(scope: AuditScope) {
  const cases = filterCases(scope)
  const loads: Record<string, number> = {}
  for (const c of cases) {
    loads[c.auditorAsignado] = (loads[c.auditorAsignado] ?? 0) + 1
  }
  const total = Object.values(loads).reduce((a, b) => a + b, 0) || 1
  return Object.entries(loads).map(([name, count]) => ({
    name,
    count,
    pct: Math.round((count / total) * 100),
  }))
}

export { getCurrentUser }
