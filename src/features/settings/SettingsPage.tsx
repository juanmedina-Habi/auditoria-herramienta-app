import { useAudit } from '../../context/AuditContext'
import { countries } from '../../data/countries'
import { getProcessLabel, processOptions, isProcessAvailable } from '../../data/processes'
import { Card } from '../../components/ui/Card'
import { PageHeader, pageShellClass } from '../../components/ui/PageHeader'

export function SettingsPage() {
  const { countryCode, processType, currentAuditors } = useAudit()
  const country = countries.find((c) => c.code === countryCode)!

  return (
    <div className={pageShellClass}>
      <PageHeader
        title="Configuración"
        subtitle="Ajustes generales de AuditorIA Pricing"
      />
      <Card title="Contexto activo" compact>
        <p className="text-[11px]">{country.flag} {country.name} · {getProcessLabel(processType)}</p>
        <p className="mt-1 text-[10px] text-text-secondary">Usa los selectores del topbar para cambiar país y proceso.</p>
      </Card>
      <Card title="Auditores disponibles" compact>
        <ul className="space-y-1.5">
          {currentAuditors.map((a) => (
            <li key={a.id} className="flex justify-between text-[11px]">
              <span className="font-medium">{a.name}</span>
              <span className="text-text-secondary">{a.role}</span>
            </li>
          ))}
        </ul>
      </Card>
      <Card title="Procesos operativos" compact>
        <ul className="space-y-1.5 text-[11px]">
          {processOptions.map((p) => (
            <li key={p.type} className="flex items-center gap-2">
              <span
                className={`h-2 w-2 rounded-full ${
                  p.type === processType && isProcessAvailable(p.type)
                    ? 'bg-status-ok'
                    : isProcessAvailable(p.type)
                      ? 'bg-slate-300'
                      : 'bg-slate-200'
                }`}
              />
              {p.label}
              {p.type === processType && isProcessAvailable(p.type) && (
                <span className="text-[10px] text-brand-600">(activo)</span>
              )}
              {!isProcessAvailable(p.type) && (
                <span className="text-[10px] text-text-secondary">(próximamente)</span>
              )}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  )
}
