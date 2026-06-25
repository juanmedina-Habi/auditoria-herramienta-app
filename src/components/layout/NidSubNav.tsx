import { NavLink } from 'react-router-dom'
import { cn } from '../../lib/utils'

type NidSubNavProps = {
  nid: string
}

const tabs = [
  { suffix: '', label: 'Detalle' },
  { suffix: '/georeference', label: 'Georreferenciación' },
  { suffix: '/comparables', label: 'Comparables' },
  { suffix: '/rules', label: 'Validaciones' },
  { suffix: '/decision', label: 'Decisión' },
]

export function NidSubNav({ nid }: NidSubNavProps) {
  const base = `/nid/${nid}`

  return (
    <div className="flex gap-0.5 border-b border-border-soft">
      {tabs.map((tab) => (
        <NavLink
          key={tab.suffix}
          to={`${base}${tab.suffix}`}
          end={tab.suffix === ''}
          className={({ isActive }) =>
            cn(
              'px-3 py-2 text-[11px] font-medium transition-colors',
              isActive
                ? 'border-b-2 border-brand-600 text-brand-700'
                : 'text-text-secondary hover:text-text-primary',
            )
          }
        >
          {tab.label}
        </NavLink>
      ))}
    </div>
  )
}
