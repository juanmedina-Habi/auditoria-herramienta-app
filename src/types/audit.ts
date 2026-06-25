export type CountryCode = 'CO' | 'MX'

export type ProcessType =
  | 'PRICING_INICIAL'
  | 'REVISION_DOCUMENTOS'
  | 'PRICING_COMITE'
  | 'APROBACION'

export type AuditStatus =
  | 'pendiente'
  | 'en_revision'
  | 'aprobado'
  | 'rechazado'
  | 'alerta'
  | 'escalado'
  | 'cerrado'

export type ValidationStatus = 'ok' | 'alerta' | 'error' | 'pendiente'

export type Country = {
  code: CountryCode
  name: string
  flag: string
}

export type OperationalProcess = {
  type: ProcessType
  label: string
  available?: boolean
}

export type Auditor = {
  id: string
  name: string
  countryCode: CountryCode
  role: string
}

export type GeoreferenceStatus = {
  status: ValidationStatus
  lat?: number
  lng?: number
  address?: string
  zonaMediana?: string
  estadoZonaHabi?: ValidationStatus
  activoZonaMediana?: boolean
  notes?: string
}

export type PolynatorStatus = {
  status: ValidationStatus
  score?: number
  notes?: string
}

export type EscaleraStatus = {
  status: ValidationStatus
  level?: string
  notes?: string
}

export type AuditCase = {
  id: string
  countryCode: CountryCode
  processType: ProcessType
  nid: string
  fecha: string
  hora: string
  ciudad: string
  zona?: string
  tipoInmueble: string
  lineaNegocio: string
  proceso: string
  agentePricing: string
  auditorAsignado: string
  estado: AuditStatus
  resultadoGeneral: ValidationStatus
  resultadoAutomatico: ValidationStatus
  motivoAlerta: string
  sla: string
  slaSegundos?: number
  georreferenciacion: GeoreferenceStatus
  polynator: PolynatorStatus
  escalera: EscaleraStatus
  comparables: number
  comentarioAutomatico: string
  scoreMotor?: number
  decisionFinal?: string
  motivoComentario?: string
}

export type AuditRule = {
  id: string
  countryCode: CountryCode
  processType: ProcessType
  name: string
  description: string
  category: string
  tipo: string
  parametro?: string
  active: boolean
  severity: ValidationStatus
  updatedAt: string
}

export type ComparableEstado = 'valido' | 'posible_duplicado' | 'duplicado_confirmado'

export type Comparable = {
  id: string
  countryCode: CountryCode
  processType: ProcessType
  nid: string
  comparableNid: string
  source: string
  address: string
  area: number
  price: number
  pricePerM2: number
  anios: number
  garajes: number
  banos: number
  piso: number
  inmobiliaria?: string
  telefono?: string
  isDuplicate: boolean
  isNatural: boolean
  estado: ComparableEstado
}

export type AuditMetric = {
  countryCode: CountryCode
  processType: ProcessType
  auditorId: string
  auditorName: string
  totalCases: number
  closedCases: number
  approved: number
  rejected: number
  escalated: number
  pending: number
  alerts: number
  avgResolutionMinutes: number
  slaCompliance: number
  currentLoad: number
}

export type DashboardStats = {
  countryCode: CountryCode
  processType: ProcessType
  totalCases: number
  pending: number
  inReview: number
  approved: number
  rejected: number
  alerts: number
  slaAtRisk: number
  escalated: number
}

export type AuditHistoryItem = {
  id: string
  countryCode: CountryCode
  processType: ProcessType
  fecha: string
  hora: string
  nid: string
  ciudad: string
  auditor: string
  resultadoAutomatico: ValidationStatus
  decisionFinal: string
  motivoComentario: string
  estado: 'completada' | 'en_revision'
}

export type AuditFilter = {
  countryCode: CountryCode
  processType: ProcessType
}
