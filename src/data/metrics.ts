import {
  generateDashboardStats,
  generateMetrics,
  monthlyTrendByKey,
} from './mockFactory'
import { auditCases } from './auditCases'

export const dashboardStats = generateDashboardStats(auditCases)
export const auditMetrics = generateMetrics(auditCases)
export const monthlyTrend = monthlyTrendByKey

export function getMonthlyTrend(countryCode: string, processType: string) {
  return monthlyTrend[`${countryCode}-${processType}`] ?? []
}
