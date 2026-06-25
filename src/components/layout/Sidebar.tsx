import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  ListTodo,
  Search,
  History,
  BarChart3,
  ShieldCheck,
  Settings,
} from 'lucide-react'
import { cn } from '../../lib/utils'
import { HabiLogo } from '../ui/HabiLogo'

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/tasks', label: 'Mis tareas', icon: ListTodo },
  { to: '/search', label: 'Buscar NID', icon: Search },
  { to: '/history', label: 'Histórico', icon: History },
  { to: '/auditor-metrics', label: 'Métricas', icon: BarChart3 },
  { to: '/rules-admin', label: 'Reglas', icon: ShieldCheck },
  { to: '/settings', label: 'Configuración', icon: Settings },
]

export function Sidebar() {
  return (
    <aside className="flex h-screen w-56 shrink-0 flex-col overflow-hidden bg-gradient-to-b from-sidebar-from to-sidebar-to text-white">
      <div className="border-b border-white/10 px-4 py-4">
        <HabiLogo variant="on-dark" />
      </div>

      <nav className="flex-1 space-y-0.5 px-2 py-3">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[11px] font-medium transition-colors',
                isActive
                  ? 'bg-white/15 text-white'
                  : 'text-violet-200 hover:bg-white/10 hover:text-white',
              )
            }
          >
            <Icon className="h-3.5 w-3.5 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-white/10 px-4 py-3">
        <p className="text-xs text-violet-300">MVP — Pricing Inicial</p>
        <p className="mt-1 text-xs text-violet-400">CO · MX</p>
      </div>
    </aside>
  )
}
