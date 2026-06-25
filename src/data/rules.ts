import { generateRules } from './mockFactory'

export const rules = generateRules()

export const comparableRules = [
  '4 comparables naturales sin duplicados = OK',
  'Menos de 4 comparables = alerta',
  'Si hay duplicados reales = alerta',
  'Si hay 5 comparables pero 1 duplicado = alerta',
]
