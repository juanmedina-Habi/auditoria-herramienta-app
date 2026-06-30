const MONTHS_ES = [
  'ene', 'feb', 'mar', 'abr', 'may', 'jun',
  'jul', 'ago', 'sep', 'oct', 'nov', 'dic',
]

const MONTHS_FULL_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

export function parseIsoDate(value: string): Date {
  const [y, m, d] = value.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function toIsoDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function isDateInRange(isoDate: string, start: string, end: string): boolean {
  return isoDate >= start && isoDate <= end
}

export function formatShortDate(isoDate: string): string {
  const date = parseIsoDate(isoDate)
  return `${date.getDate()} ${MONTHS_ES[date.getMonth()]}.`
}

export function formatLongDate(isoDate: string): string {
  const date = parseIsoDate(isoDate)
  return `${MONTHS_FULL_ES[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
}

export function formatDateRangeLabel(start: string, end: string): string {
  if (start === end) return formatShortDate(start) + ` ${parseIsoDate(start).getFullYear()}`
  const startDate = parseIsoDate(start)
  const endDate = parseIsoDate(end)
  const sameYear = startDate.getFullYear() === endDate.getFullYear()
  if (sameYear) {
    return `${formatShortDate(start)} – ${formatShortDate(end)} ${startDate.getFullYear()}`
  }
  return `${formatShortDate(start)} ${startDate.getFullYear()} – ${formatShortDate(end)} ${endDate.getFullYear()}`
}

export function getDateRangePreset(preset: 'today' | '7d' | '30d' | 'month' | 'ytd'): { start: string; end: string } {
  const today = new Date()
  const end = toIsoDate(today)
  const startDate = new Date(today)

  if (preset === '7d') startDate.setDate(today.getDate() - 6)
  else if (preset === '30d') startDate.setDate(today.getDate() - 29)
  else if (preset === 'month') startDate.setDate(1)
  else if (preset === 'ytd') startDate.setMonth(0, 1)

  return { start: toIsoDate(startDate), end }
}

/** 1 de enero del año en curso → hoy */
export function getYearToDateRange(reference = new Date()): { start: string; end: string } {
  const start = new Date(reference.getFullYear(), 0, 1)
  return { start: toIsoDate(start), end: toIsoDate(reference) }
}

/** Fecha ISO de hace N días (0 = hoy) */
export function daysAgoIso(daysAgo: number, reference = new Date()): string {
  const d = new Date(reference)
  d.setDate(d.getDate() - daysAgo)
  return toIsoDate(d)
}

export function formatUpdatedAtNow(reference = new Date()): string {
  const h = reference.getHours()
  const m = String(reference.getMinutes()).padStart(2, '0')
  const period = h >= 12 ? 'p. m.' : 'a. m.'
  const h12 = h % 12 || 12
  return `Actualizado: hoy, ${h12}:${m} ${period}`
}

export function getCasesDateBounds(dates: string[]): { start: string; end: string } {
  if (dates.length === 0) {
    const { start, end } = getDateRangePreset('30d')
    return { start, end }
  }
  const sorted = [...dates].sort()
  return { start: sorted[0], end: sorted[sorted.length - 1] }
}
