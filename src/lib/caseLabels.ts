import type { AuditCase } from '../types/audit'

export function getCaseDecisionLabel(c: AuditCase): string {
  if (c.decisionFinal) return c.decisionFinal
  switch (c.estado) {
    case 'aprobado':
      return 'Aprobado'
    case 'rechazado':
      return 'Rechazado'
    case 'escalado':
      return 'Escalado a Pricing'
    case 'en_revision':
      return 'En revisión'
    case 'alerta':
      return 'Con alerta'
    case 'cerrado':
      return 'Cerrado'
    default:
      return 'Pendiente de auditoría'
  }
}

export function getCaseProcessStatusLine(c: AuditCase): string {
  return `${c.proceso} | ${getCaseDecisionLabel(c)}`
}

export function getCaseResultSummary(c: AuditCase): string {
  if (c.estado === 'aprobado') return 'Aprobado por auditoría'
  if (c.estado === 'rechazado') return 'Rechazado — requiere corrección'
  if (c.resultadoAutomatico === 'alerta') return `Alerta: ${c.motivoAlerta || 'Revisión manual'}`
  if (c.estado === 'en_revision') return 'En revisión por auditor'
  return 'Pendiente de validación'
}
