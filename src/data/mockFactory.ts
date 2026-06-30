import type {
  AuditCase,
  AuditHistoryItem,
  AuditMetric,
  AuditRule,
  AuditStatus,
  Comparable,
  CountryCode,
  DashboardStats,
  ProcessType,
  ValidationStatus,
} from '../types/audit'
import { daysAgoIso } from '../lib/dates'
import { getProcessLabel } from './processes'

const CO_CITIES = ['Bogotá', 'Valle de Aburrá', 'Cali', 'Barranquilla', 'Cartagena', 'Aledaños']
const MX_CITIES = ['CDMX', 'Guadalajara', 'Monterrey', 'Querétaro']
const CO_MOTIVOS = [
  'Comparables duplicados',
  'Revisar Polynator',
  'Georreferenciación',
  'Revisar escalera',
  'Menos de 4 comparables',
]
const MX_MOTIVOS = [
  'Comparables duplicados',
  'Revisión de zona',
  'Revisión de modelo',
  'Datos faltantes',
  'Revisar Polynator',
]
const DOC_MOTIVOS = ['Documento faltante', 'CTL inconsistente', 'Recibo admin vencido']
const COMITE_MOTIVOS = ['Reintento comité', 'Desviación de modelo', 'Ajuste manual requerido']
const APROB_MOTIVOS = ['Pendiente firma', 'Validación final', 'Excepción comercial']

const CO_AUDITORS = ['Juan Pablo Medina', 'Nicolás Quiroga']
const MX_AUDITORS = ['Ocaltzin Arriaga Anaya', 'Raul Guillermo Rosales Farias']

const PROCESS_MOTIVOS: Record<ProcessType, string[]> = {
  PRICING_INICIAL: [],
  REVISION_DOCUMENTOS: DOC_MOTIVOS,
  PRICING_COMITE: COMITE_MOTIVOS,
  APROBACION: APROB_MOTIVOS,
}

const STATUSES: AuditStatus[] = ['pendiente', 'en_revision', 'alerta', 'aprobado', 'rechazado']
const AUTO: ValidationStatus[] = ['ok', 'alerta', 'error', 'pendiente']

function pick<T>(arr: T[], i: number): T {
  return arr[i % arr.length]
}

function nidFor(country: CountryCode, i: number): string {
  const base = country === 'CO' ? `40${174933500 + i}` : `MX-2026-${String(4500 + i).padStart(5, '0')}`
  return base
}

function buildCase(
  country: CountryCode,
  process: ProcessType,
  i: number,
): AuditCase {
  const cities = country === 'CO' ? CO_CITIES : MX_CITIES
  const auditors = country === 'CO' ? CO_AUDITORS : MX_AUDITORS
  const pricingMotivos = country === 'CO' ? CO_MOTIVOS : MX_MOTIVOS
  const motivos =
    process === 'PRICING_INICIAL' ? pricingMotivos : PROCESS_MOTIVOS[process]
  const motivo = pick(motivos, i)
  const estado = pick(STATUSES, i)
  const auto = pick(AUTO, i)
  const slaHours = 4 - (i % 5)
  const label = getProcessLabel(process)

  return {
    id: `${country}-${process}-${i}`,
    countryCode: country,
    processType: process,
    nid: nidFor(country, i),
    fecha: daysAgoIso(i * 2 + (i % 11)),
    hora: `${String(9 + (i % 8)).padStart(2, '0')}:${String(i * 7 % 60).padStart(2, '0')}:00`,
    ciudad: pick(cities, i),
    zona: pick(cities, i + 1),
    tipoInmueble: i % 2 === 0 ? (country === 'CO' ? 'Apartamento' : 'Departamento') : 'Casa',
    lineaNegocio: i % 2 === 0 ? 'Buyers' : 'Sellers',
    proceso: label,
    agentePricing: country === 'CO' ? `agente${i}@habi.co` : `pricing${i}@habi.mx`,
    auditorAsignado: pick(auditors, i),
    estado,
    resultadoGeneral: auto,
    resultadoAutomatico: auto,
    motivoAlerta: auto === 'ok' ? '' : motivo,
    sla: slaHours > 0 ? `${slaHours}h restantes` : 'Vencido',
    slaSegundos: slaHours > 0 ? slaHours * 3600 : -1200,
    georreferenciacion: {
      status: i % 4 === 0 ? 'alerta' : 'ok',
      lat: country === 'CO' ? 4.65 + i * 0.01 : 19.43 + i * 0.01,
      lng: country === 'CO' ? -74.05 - i * 0.01 : -99.13 - i * 0.01,
      address: `Calle ${10 + i} # ${20 + i}-${30 + i}`,
      zonaMediana: pick(cities, i),
      estadoZonaHabi: 'ok' as ValidationStatus,
      activoZonaMediana: true,
    },
    polynator: {
      status: i % 3 === 0 ? 'alerta' : 'ok',
      score: 0.65 + (i % 5) * 0.06,
    },
    escalera: { status: i % 5 === 0 ? 'error' : 'ok', level: `Nivel ${(i % 4) + 1}` },
    comparables: 3 + (i % 3),
    comentarioAutomatico: `Validación automática de ${label}: ${auto === 'ok' ? 'sin alertas críticas' : motivo}.`,
    scoreMotor: 6.5 + (i % 4) * 0.4,
    decisionFinal:
      estado === 'aprobado'
        ? 'Aprobado'
        : estado === 'rechazado'
          ? 'Rechazado'
          : estado === 'escalado'
            ? 'Escalado'
            : 'Pendiente',
    motivoComentario:
      auto === 'ok' ? 'Parámetros dentro del umbral' : `Revisión requerida: ${motivo}`,
  }
}

function buildPricingInicialDemo(country: CountryCode): AuditCase[] {
  const label = getProcessLabel('PRICING_INICIAL')
  const seeds =
    country === 'CO'
      ? [
          {
            nid: '40174933500',
            fecha: '2026-05-24',
            hora: '09:15:00',
            ciudad: 'Cali',
            zona: 'Cali Sur',
            tipoInmueble: 'Apartamento',
            lineaNegocio: 'Buyers',
            agentePricing: 'maria.gomez@habi.co',
            auditorAsignado: 'Juan Pablo Medina',
            estado: 'pendiente' as AuditStatus,
            resultadoGeneral: 'ok' as ValidationStatus,
            resultadoAutomatico: 'ok' as ValidationStatus,
            motivoAlerta: '',
            sla: '4h restantes',
            slaSegundos: 14400,
            georreferenciacion: {
              status: 'ok' as ValidationStatus,
              lat: 3.4516,
              lng: -76.532,
              address: 'Calle 15 # 23-45, Cali',
              zonaMediana: 'Cali Sur',
              estadoZonaHabi: 'ok' as ValidationStatus,
              activoZonaMediana: true,
            },
            polynator: { status: 'ok' as ValidationStatus, score: 0.82 },
            escalera: { status: 'ok' as ValidationStatus, level: 'Nivel 2' },
            comparables: 5,
            comentarioAutomatico: 'Validación automática de Pricing Inicial: sin alertas críticas.',
            scoreMotor: 7.2,
            decisionFinal: 'Pendiente',
            motivoComentario: 'Parámetros dentro del umbral',
          },
          {
            nid: '40174933501',
            fecha: '2026-05-24',
            hora: '10:30:00',
            ciudad: 'Barranquilla',
            zona: 'Riomar',
            tipoInmueble: 'Apartamento',
            lineaNegocio: 'Buyers',
            agentePricing: 'carlos.vega@habi.co',
            auditorAsignado: 'Juan Pablo Medina',
            estado: 'alerta' as AuditStatus,
            resultadoGeneral: 'error' as ValidationStatus,
            resultadoAutomatico: 'error' as ValidationStatus,
            motivoAlerta: 'Georreferenciación',
            sla: '2h restantes',
            slaSegundos: 7200,
            georreferenciacion: {
              status: 'alerta' as ValidationStatus,
              lat: 11.0041,
              lng: -74.807,
              address: 'Carrera 50 # 84-120, Barranquilla',
              zonaMediana: 'Riomar',
              estadoZonaHabi: 'alerta' as ValidationStatus,
              activoZonaMediana: true,
            },
            polynator: { status: 'ok' as ValidationStatus, score: 0.71 },
            escalera: { status: 'ok' as ValidationStatus, level: 'Nivel 1' },
            comparables: 4,
            comentarioAutomatico: 'Validación automática de Pricing Inicial: Georreferenciación.',
            scoreMotor: 6.5,
            decisionFinal: 'Pendiente',
            motivoComentario: 'Revisión requerida: Georreferenciación',
          },
          {
            nid: '40174933502',
            fecha: '2026-05-23',
            hora: '14:45:00',
            ciudad: 'Valle de Aburrá',
            zona: 'Envigado',
            tipoInmueble: 'Apartamento',
            lineaNegocio: 'Sellers',
            agentePricing: 'laura.rincon@habi.co',
            auditorAsignado: 'Nicolás Quiroga',
            estado: 'en_revision' as AuditStatus,
            resultadoGeneral: 'alerta' as ValidationStatus,
            resultadoAutomatico: 'alerta' as ValidationStatus,
            motivoAlerta: 'Revisar Polynator',
            sla: '1h restantes',
            slaSegundos: 3600,
            georreferenciacion: {
              status: 'ok' as ValidationStatus,
              lat: 6.1706,
              lng: -75.5854,
              address: 'Carrera 43A # 1-50, Envigado',
              zonaMediana: 'Valle de Aburrá',
              estadoZonaHabi: 'ok' as ValidationStatus,
              activoZonaMediana: true,
            },
            polynator: { status: 'alerta' as ValidationStatus, score: 0.58 },
            escalera: { status: 'ok' as ValidationStatus, level: 'Nivel 3' },
            comparables: 3,
            comentarioAutomatico: 'Validación automática de Pricing Inicial: Revisar Polynator.',
            scoreMotor: 6.8,
            decisionFinal: 'Pendiente',
            motivoComentario: 'Revisión requerida: Revisar Polynator',
          },
          {
            nid: '40174933503',
            fecha: '2026-05-22',
            hora: '16:20:00',
            ciudad: 'Cartagena',
            zona: 'Bocagrande',
            tipoInmueble: 'Casa',
            lineaNegocio: 'Buyers',
            agentePricing: 'andres.mesa@habi.co',
            auditorAsignado: 'Nicolás Quiroga',
            estado: 'aprobado' as AuditStatus,
            resultadoGeneral: 'ok' as ValidationStatus,
            resultadoAutomatico: 'ok' as ValidationStatus,
            motivoAlerta: '',
            sla: 'Completado',
            slaSegundos: 0,
            georreferenciacion: {
              status: 'ok' as ValidationStatus,
              lat: 10.3997,
              lng: -75.555,
              address: 'Carrera 3 # 8-129, Bocagrande, Cartagena',
              zonaMediana: 'Bocagrande',
              estadoZonaHabi: 'ok' as ValidationStatus,
              activoZonaMediana: true,
            },
            polynator: { status: 'ok' as ValidationStatus, score: 0.88 },
            escalera: { status: 'ok' as ValidationStatus, level: 'Nivel 2' },
            comparables: 6,
            comentarioAutomatico: 'Validación automática de Pricing Inicial: sin alertas críticas.',
            scoreMotor: 8.1,
            decisionFinal: 'Aprobado',
            motivoComentario: 'Parámetros dentro del umbral',
          },
        ]
      : [
          {
            nid: 'MX-2026-07234',
            fecha: '2026-05-24',
            hora: '08:40:00',
            ciudad: 'CDMX',
            zona: 'Roma Norte',
            tipoInmueble: 'Departamento',
            lineaNegocio: 'Buyers',
            agentePricing: 'fernanda.lopez@habi.mx',
            auditorAsignado: 'Ocaltzin Arriaga Anaya',
            estado: 'pendiente' as AuditStatus,
            resultadoGeneral: 'alerta' as ValidationStatus,
            resultadoAutomatico: 'alerta' as ValidationStatus,
            motivoAlerta: 'Revisión de zona',
            sla: '5h restantes',
            slaSegundos: 18000,
            georreferenciacion: {
              status: 'alerta' as ValidationStatus,
              lat: 19.4167,
              lng: -99.1626,
              address: 'Av. Álvaro Obregón 180, Roma Norte',
              zonaMediana: 'Roma Norte',
              estadoZonaHabi: 'alerta' as ValidationStatus,
              activoZonaMediana: true,
            },
            polynator: { status: 'ok' as ValidationStatus, score: 0.74 },
            escalera: { status: 'ok' as ValidationStatus, level: 'Nivel 2' },
            comparables: 4,
            comentarioAutomatico: 'Validación automática de Pricing Inicial: Revisión de zona.',
            scoreMotor: 6.9,
            decisionFinal: 'Pendiente',
            motivoComentario: 'Revisión requerida: Revisión de zona',
          },
          {
            nid: 'MX-2026-07235',
            fecha: '2026-05-24',
            hora: '11:05:00',
            ciudad: 'Guadalajara',
            zona: 'Providencia',
            tipoInmueble: 'Casa',
            lineaNegocio: 'Sellers',
            agentePricing: 'ricardo.soto@habi.mx',
            auditorAsignado: 'Ocaltzin Arriaga Anaya',
            estado: 'en_revision' as AuditStatus,
            resultadoGeneral: 'ok' as ValidationStatus,
            resultadoAutomatico: 'ok' as ValidationStatus,
            motivoAlerta: '',
            sla: '3h restantes',
            slaSegundos: 10800,
            georreferenciacion: {
              status: 'ok' as ValidationStatus,
              lat: 20.6897,
              lng: -103.3848,
              address: 'Av. Américas 1250, Providencia',
              zonaMediana: 'Providencia',
              estadoZonaHabi: 'ok' as ValidationStatus,
              activoZonaMediana: true,
            },
            polynator: { status: 'ok' as ValidationStatus, score: 0.79 },
            escalera: { status: 'ok' as ValidationStatus, level: 'Nivel 1' },
            comparables: 5,
            comentarioAutomatico: 'Validación automática de Pricing Inicial: sin alertas críticas.',
            scoreMotor: 7.5,
            decisionFinal: 'Pendiente',
            motivoComentario: 'Parámetros dentro del umbral',
          },
          {
            nid: 'MX-2026-07236',
            fecha: '2026-05-23',
            hora: '15:20:00',
            ciudad: 'Monterrey',
            zona: 'San Pedro',
            tipoInmueble: 'Departamento',
            lineaNegocio: 'Buyers',
            agentePricing: 'diana.herrera@habi.mx',
            auditorAsignado: 'Raul Guillermo Rosales Farias',
            estado: 'alerta' as AuditStatus,
            resultadoGeneral: 'error' as ValidationStatus,
            resultadoAutomatico: 'error' as ValidationStatus,
            motivoAlerta: 'Revisión de modelo',
            sla: 'Vencido',
            slaSegundos: -900,
            georreferenciacion: {
              status: 'ok' as ValidationStatus,
              lat: 25.657,
              lng: -100.402,
              address: 'Calzada del Valle 400, San Pedro',
              zonaMediana: 'San Pedro',
              estadoZonaHabi: 'ok' as ValidationStatus,
              activoZonaMediana: true,
            },
            polynator: { status: 'error' as ValidationStatus, score: 0.42 },
            escalera: { status: 'alerta' as ValidationStatus, level: 'Nivel 4' },
            comparables: 2,
            comentarioAutomatico: 'Validación automática de Pricing Inicial: Revisión de modelo.',
            scoreMotor: 5.8,
            decisionFinal: 'Pendiente',
            motivoComentario: 'Revisión requerida: Revisión de modelo',
          },
          {
            nid: 'MX-2026-07237',
            fecha: '2026-05-21',
            hora: '17:50:00',
            ciudad: 'Querétaro',
            zona: 'Centro Sur',
            tipoInmueble: 'Casa',
            lineaNegocio: 'Buyers',
            agentePricing: 'jorge.campos@habi.mx',
            auditorAsignado: 'Raul Guillermo Rosales Farias',
            estado: 'aprobado' as AuditStatus,
            resultadoGeneral: 'ok' as ValidationStatus,
            resultadoAutomatico: 'ok' as ValidationStatus,
            motivoAlerta: '',
            sla: 'Completado',
            slaSegundos: 0,
            georreferenciacion: {
              status: 'ok' as ValidationStatus,
              lat: 20.5888,
              lng: -100.3899,
              address: 'Blvd. Bernardo Quintana 300, Querétaro',
              zonaMediana: 'Centro Sur',
              estadoZonaHabi: 'ok' as ValidationStatus,
              activoZonaMediana: true,
            },
            polynator: { status: 'ok' as ValidationStatus, score: 0.91 },
            escalera: { status: 'ok' as ValidationStatus, level: 'Nivel 2' },
            comparables: 6,
            comentarioAutomatico: 'Validación automática de Pricing Inicial: sin alertas críticas.',
            scoreMotor: 8.4,
            decisionFinal: 'Aprobado',
            motivoComentario: 'Parámetros dentro del umbral',
          },
        ]

  return [
    ...seeds.map((seed, i) => ({
      ...seed,
      fecha: daysAgoIso([0, 0, 1, 2, 3][i] ?? i),
      id: `${country}-PRICING_INICIAL-${i}`,
      countryCode: country,
      processType: 'PRICING_INICIAL' as const,
      proceso: label,
    })),
    ...Array.from({ length: 18 }, (_, i) => {
      const base = buildCase(country, 'PRICING_INICIAL', i + 20)
      return {
        ...base,
        id: `${country}-PRICING_INICIAL-extra-${i}`,
        nid: nidFor(country, 20 + i),
        fecha: daysAgoIso(4 + i * 5 + (i % 4)),
      }
    }),
  ]
}

export function generateAllCases(): AuditCase[] {
  const processes: ProcessType[] = [
    'REVISION_DOCUMENTOS',
    'PRICING_COMITE',
    'APROBACION',
  ]
  const countries: CountryCode[] = ['CO', 'MX']
  const cases: AuditCase[] = []
  for (const country of countries) {
    cases.push(...buildPricingInicialDemo(country))
    for (const process of processes) {
      for (let i = 0; i < 4; i++) {
        cases.push(buildCase(country, process, i + (country === 'MX' ? 10 : 0)))
      }
    }
  }
  return cases
}

export function generateComparables(cases: AuditCase[]): Comparable[] {
  const comps: Comparable[] = []
  for (const c of cases.filter((x) => x.processType === 'PRICING_INICIAL').slice(0, 8)) {
    for (let j = 0; j < 5; j++) {
      const dup = j === 3 || j === 4
      comps.push({
        id: `comp-${c.id}-${j}`,
        countryCode: c.countryCode,
        processType: c.processType,
        nid: c.nid,
        comparableNid: `${c.nid.slice(0, -1)}${j}`,
        source: j % 2 === 0 ? 'Portal Inmobiliario' : 'MLS Habi',
        address: `${c.ciudad} — Calle ${j + 1}`,
        area: 60 + j * 5,
        price: c.countryCode === 'CO' ? 380000000 + j * 15000000 : 4500000 + j * 200000,
        pricePerM2: c.countryCode === 'CO' ? 5800000 + j * 50000 : 55000 + j * 1000,
        anios: 5 + j * 3,
        garajes: j % 2,
        banos: 1 + (j % 3),
        piso: j + 2,
        inmobiliaria: `Inmo ${j + 1}`,
        telefono: `300${j}123456`,
        isDuplicate: dup,
        isNatural: true,
        estado: dup ? (j === 4 ? 'duplicado_confirmado' : 'posible_duplicado') : 'valido',
      })
    }
  }
  return comps
}

export function generateHistory(cases: AuditCase[]): AuditHistoryItem[] {
  return cases
    .filter((c) => ['aprobado', 'rechazado', 'escalado', 'cerrado'].includes(c.estado))
    .map((c) => ({
      id: `hist-${c.id}`,
      countryCode: c.countryCode,
      processType: c.processType,
      fecha: c.fecha,
      hora: c.hora,
      nid: c.nid,
      ciudad: c.ciudad,
      auditor: c.auditorAsignado,
      resultadoAutomatico: c.resultadoAutomatico,
      decisionFinal: c.decisionFinal ?? 'Pendiente',
      motivoComentario: c.motivoComentario ?? c.comentarioAutomatico,
      estado: c.estado === 'en_revision' ? 'en_revision' : 'completada',
    }))
}

export function generateMetrics(cases: AuditCase[]): AuditMetric[] {
  const processes: ProcessType[] = [
    'PRICING_INICIAL',
    'REVISION_DOCUMENTOS',
    'PRICING_COMITE',
    'APROBACION',
  ]
  const metrics: AuditMetric[] = []
  for (const country of ['CO', 'MX'] as CountryCode[]) {
    const auditors = country === 'CO' ? CO_AUDITORS : MX_AUDITORS
    for (const process of processes) {
      auditors.forEach((name, idx) => {
        const subset = cases.filter(
          (c) =>
            c.countryCode === country &&
            c.processType === process &&
            c.auditorAsignado === name,
        )
        metrics.push({
          countryCode: country,
          processType: process,
          auditorId: `${country}-${idx}`,
          auditorName: name,
          totalCases: subset.length + 12 + idx * 3,
          closedCases: subset.filter((c) =>
            ['aprobado', 'rechazado', 'cerrado'].includes(c.estado),
          ).length + 8,
          approved: subset.filter((c) => c.estado === 'aprobado').length + 5 + idx,
          rejected: subset.filter((c) => c.estado === 'rechazado').length + 2,
          escalated: subset.filter((c) => c.estado === 'escalado').length + 1,
          pending: subset.filter((c) => c.estado === 'pendiente').length + 3,
          alerts: subset.filter((c) => c.resultadoAutomatico === 'alerta').length + 2,
          avgResolutionMinutes: 10 + idx * 2,
          slaCompliance: 92 - idx * 4,
          currentLoad: idx === 0 ? 52 : 48,
        })
      })
    }
  }
  return metrics
}

export function generateDashboardStats(cases: AuditCase[]): DashboardStats[] {
  const countryBase: Record<
    CountryCode,
    { total: number; pending: number; inReview: number; approved: number; rejected: number; alerts: number; slaAtRisk: number; escalated: number }
  > = {
    CO: {
      total: 52,
      pending: 14,
      inReview: 10,
      approved: 24,
      rejected: 2,
      alerts: 8,
      slaAtRisk: 5,
      escalated: 3,
    },
    MX: {
      total: 38,
      pending: 9,
      inReview: 12,
      approved: 16,
      rejected: 4,
      alerts: 11,
      slaAtRisk: 7,
      escalated: 4,
    },
  }

  const keys = new Set<string>()
  const stats: DashboardStats[] = []
  for (const c of cases) {
    keys.add(`${c.countryCode}|${c.processType}`)
  }
  for (const key of keys) {
    const [countryCode, processType] = key.split('|') as [CountryCode, ProcessType]
    const subset = cases.filter(
      (c) => c.countryCode === countryCode && c.processType === processType,
    )
    const base = countryBase[countryCode]
    const processBoost =
      processType === 'PRICING_INICIAL'
        ? 0
        : processType === 'REVISION_DOCUMENTOS'
          ? 6
          : processType === 'PRICING_COMITE'
            ? 3
            : 2

    stats.push({
      countryCode,
      processType,
      totalCases: base.total + processBoost + subset.length,
      pending: base.pending + subset.filter((c) => c.estado === 'pendiente').length,
      inReview: base.inReview + subset.filter((c) => c.estado === 'en_revision').length,
      approved: base.approved + subset.filter((c) => c.estado === 'aprobado').length,
      rejected: base.rejected + subset.filter((c) => c.estado === 'rechazado').length,
      alerts: base.alerts + subset.filter((c) => c.resultadoAutomatico === 'alerta').length,
      slaAtRisk: base.slaAtRisk + (subset.length % 2),
      escalated: base.escalated + subset.filter((c) => c.estado === 'escalado').length,
    })
  }
  return stats
}

export function generateRules(): AuditRule[] {
  const processes: ProcessType[] = [
    'PRICING_INICIAL',
    'REVISION_DOCUMENTOS',
    'PRICING_COMITE',
    'APROBACION',
  ]
  const ruleNames: Record<ProcessType, string[]> = {
    PRICING_INICIAL: [
      'Georreferenciación',
      'Polynator',
      'Escalera',
      'Comparables',
      'Tipo inmueble',
      'Cobertura ciudad',
    ],
    REVISION_DOCUMENTOS: [
      'CTL vigente',
      'Escritura completa',
      'Recibo administración',
      'Documentos adicionales',
    ],
    PRICING_COMITE: [
      'Desviación modelo',
      'Aprobación comité previa',
      'Comparables comité',
      'Justificación manual',
    ],
    APROBACION: [
      'Checklist final',
      'Firma aprobador',
      'Consistencia pricing',
      'SLA cumplido',
    ],
  }
  const rules: AuditRule[] = []
  for (const country of ['CO', 'MX'] as CountryCode[]) {
    for (const process of processes) {
      ruleNames[process].forEach((name, i) => {
        rules.push({
          id: `rule-${country}-${process}-${i}`,
          countryCode: country,
          processType: process,
          name,
          description: `Regla automática de ${getProcessLabel(process)}: ${name}`,
          category: getProcessLabel(process),
          tipo: i % 2 === 0 ? 'Automática' : 'Manual asistida',
          parametro: i % 2 === 0 ? 'Umbral estándar' : 'Revisión auditor',
          active: true,
          severity: i % 3 === 0 ? 'alerta' : 'ok',
          updatedAt: '2026-05-29',
        })
      })
    }
  }
  return rules
}

export const monthlyTrendByKey: Record<string, { month: string; casos: number; aprobados: number }[]> =
  {}

;(['CO', 'MX'] as CountryCode[]).forEach((country) => {
  const countryTrend =
    country === 'CO'
      ? { casosBase: 32, casosStep: 4, aprobadosBase: 26, aprobadosStep: 3 }
      : { casosBase: 22, casosStep: 6, aprobadosBase: 16, aprobadosStep: 5 }

  ;(
    [
      'PRICING_INICIAL',
      'REVISION_DOCUMENTOS',
      'PRICING_COMITE',
      'APROBACION',
    ] as ProcessType[]
  ).forEach((process, pIdx) => {
    monthlyTrendByKey[`${country}-${process}`] = [
      'Ene',
      'Feb',
      'Mar',
      'Abr',
      'May',
      'Jun',
    ].map((month, i) => ({
      month,
      casos: countryTrend.casosBase + i * countryTrend.casosStep + pIdx * 2,
      aprobados: countryTrend.aprobadosBase + i * countryTrend.aprobadosStep + pIdx,
    }))
  })
})

export function alertSummary(cases: AuditCase[]) {
  const counts: Record<string, number> = {}
  for (const c of cases) {
    if (c.motivoAlerta) {
      counts[c.motivoAlerta] = (counts[c.motivoAlerta] ?? 0) + 1
    }
  }
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([motivo, count]) => ({ motivo, count }))
}
