import type { Country } from '../types/audit'

export const countries: Country[] = [
  { code: 'CO', name: 'Colombia', flag: '🇨🇴' },
  { code: 'MX', name: 'México', flag: '🇲🇽' },
]

export const defaultCountryCode = 'CO' as const

export const documentTitleByCountry: Record<
  import('../types/audit').CountryCode,
  string
> = {
  CO: 'Auditoria IDM',
  MX: 'IAudit IDM',
}
