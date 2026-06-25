import type { OperationalProcess, ProcessType } from '../types/audit'

export const processOptions: OperationalProcess[] = [
  { type: 'PRICING_INICIAL', label: 'Pricing Inicial', available: true },
  { type: 'REVISION_DOCUMENTOS', label: 'Revisión de documentos', available: false },
  { type: 'PRICING_COMITE', label: 'Pricing Comité', available: false },
  { type: 'APROBACION', label: 'Aprobación', available: false },
]

export const availableProcessOptions = processOptions.filter((p) => p.available)

export function isProcessAvailable(type: ProcessType): boolean {
  return processOptions.find((p) => p.type === type)?.available ?? false
}

export const defaultProcessType: ProcessType = 'PRICING_INICIAL'

export function getProcessLabel(type: ProcessType): string {
  return processOptions.find((p) => p.type === type)?.label ?? type
}
