import type { Auditor, CountryCode } from '../types/audit'

export const auditors: Auditor[] = [
  {
    id: 'co-jpm',
    name: 'Juan Pablo Medina',
    countryCode: 'CO',
    role: 'Aprobólogo / Auditor',
  },
  {
    id: 'co-nq',
    name: 'Nicolás Quiroga',
    countryCode: 'CO',
    role: 'Aprobólogo / Auditor',
  },
  {
    id: 'mx-oa',
    name: 'Ocaltzin Arriaga Anaya',
    countryCode: 'MX',
    role: 'Aprobólogo / Auditor',
  },
  {
    id: 'mx-rgr',
    name: 'Raul Guillermo Rosales Farias',
    countryCode: 'MX',
    role: 'Aprobólogo / Auditor',
  },
]

export function getCurrentUser(countryCode: CountryCode = 'CO'): Auditor {
  return auditors.find((a) => a.countryCode === countryCode) ?? auditors[0]
}

/** @deprecated use getCurrentUser(countryCode) */
export const currentUser = auditors[0]
