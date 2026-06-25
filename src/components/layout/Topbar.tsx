import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, Search, ChevronDown } from 'lucide-react'
import { useAudit } from '../../context/AuditContext'
import { getCurrentUser, searchCasesByNid } from '../../services/auditService'
import { CountrySelector } from './CountrySelector'
import { ProcessSelector } from './ProcessSelector'

export function Topbar() {
  const { scope, countryCode } = useAudit()
  const currentUser = getCurrentUser(countryCode)
  const initials = currentUser.name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()

  function handleSearch(e: FormEvent) {
    e.preventDefault()
    const results = searchCasesByNid(searchQuery, scope)
    if (results.length === 1) {
      navigate(`/nid/${results[0].nid}`)
    } else {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border-soft bg-white px-4">
      <form onSubmit={handleSearch} className="relative w-full max-w-sm">
        <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-secondary" />
        <input
          type="search"
          placeholder="Buscar por NID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-md border border-border-soft bg-slate-50 py-1.5 pl-8 pr-3 text-[11px] outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
        />
      </form>

      <div className="ml-auto flex items-center gap-2">
        <CountrySelector />
        <ProcessSelector />

        <button
          type="button"
          className="relative rounded-md p-1.5 text-text-secondary hover:bg-slate-100"
          aria-label="Notificaciones"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute right-1 top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-status-alert text-[9px] font-bold text-white">
            8
          </span>
        </button>

        <div className="flex items-center gap-2 border-l border-border-soft pl-2">
          <div className="hidden text-right sm:block">
            <p className="text-[11px] font-medium leading-tight text-text-primary">{currentUser.name}</p>
            <p className="text-[10px] text-text-secondary">{currentUser.role}</p>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-[11px] font-semibold text-white">
            {initials}
          </div>
          <ChevronDown className="hidden h-3.5 w-3.5 text-text-secondary sm:block" />
        </div>
      </div>
    </header>
  )
}
