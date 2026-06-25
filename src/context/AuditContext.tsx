import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type {
  AuditCase,
  AuditHistoryItem,
  AuditMetric,
  AuditRule,
  Auditor,
  CountryCode,
  DashboardStats,
  ProcessType,
} from '../types/audit'
import { defaultCountryCode, documentTitleByCountry } from '../data/countries'
import { defaultProcessType, isProcessAvailable } from '../data/processes'
import {
  filterCases,
  getAlerts,
  getAuditorsByCountry,
  getDashboardStats,
  getHistory,
  getRules,
  getAuditMetrics,
  getTrend,
  type AuditScope,
} from '../services/auditService'

type AuditContextValue = {
  countryCode: CountryCode
  processType: ProcessType
  setCountryCode: (code: CountryCode) => void
  setProcessType: (type: ProcessType) => void
  scope: AuditScope
  currentAuditors: Auditor[]
  currentCases: AuditCase[]
  currentMetrics: AuditMetric[]
  currentRules: AuditRule[]
  currentHistory: AuditHistoryItem[]
  currentDashboardStats: DashboardStats
  currentTrend: ReturnType<typeof getTrend>
  currentAlerts: ReturnType<typeof getAlerts>
}

const AuditContext = createContext<AuditContextValue | null>(null)

export function AuditProvider({ children }: { children: ReactNode }) {
  const [countryCode, setCountryCode] = useState<CountryCode>(defaultCountryCode)
  const [processType, setProcessTypeState] = useState<ProcessType>(defaultProcessType)

  const setProcessType = (type: ProcessType) => {
    if (isProcessAvailable(type)) {
      setProcessTypeState(type)
    }
  }

  const scope = useMemo(
    (): AuditScope => ({ countryCode, processType }),
    [countryCode, processType],
  )

  const currentAuditors = useMemo(() => getAuditorsByCountry(countryCode), [countryCode])
  const currentCases = useMemo(() => filterCases(scope), [scope])
  const currentMetrics = useMemo(() => getAuditMetrics(scope), [scope])
  const currentRules = useMemo(() => getRules(scope), [scope])
  const currentHistory = useMemo(() => getHistory(scope), [scope])
  const currentDashboardStats = useMemo(() => getDashboardStats(scope), [scope])
  const currentTrend = useMemo(() => getTrend(scope), [scope])
  const currentAlerts = useMemo(() => getAlerts(scope), [scope])

  useEffect(() => {
    document.title = documentTitleByCountry[countryCode]
  }, [countryCode])

  return (
    <AuditContext.Provider
      value={{
        countryCode,
        processType,
        setCountryCode,
        setProcessType,
        scope,
        currentAuditors,
        currentCases,
        currentMetrics,
        currentRules,
        currentHistory,
        currentDashboardStats,
        currentTrend,
        currentAlerts,
      }}
    >
      {children}
    </AuditContext.Provider>
  )
}

export function useAudit() {
  const ctx = useContext(AuditContext)
  if (!ctx) throw new Error('useAudit must be used within AuditProvider')
  return ctx
}

/** @deprecated use useAudit */
export function useCountry() {
  const { countryCode, setCountryCode } = useAudit()
  return { countryCode, setCountryCode }
}
