import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, ChevronDown } from 'lucide-react'
import { useAudit } from '../../context/AuditContext'
import { getCurrentUser, getNotifications, searchCasesByNid } from '../../services/auditService'
import { CountrySelector } from './CountrySelector'
import { ProcessSelector } from './ProcessSelector'
import { NotificationPanel } from './NotificationPanel'
import { NidSearchCard } from '../search/NidSearchCard'
import type { AuditCase } from '../../types/audit'

export function Topbar() {
  const { scope, countryCode } = useAudit()
  const currentUser = getCurrentUser(countryCode)
  const initials = currentUser.name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  const notifications = useMemo(
    () => getNotifications(scope, currentUser.name),
    [scope, currentUser.name],
  )

  const searchResults = useMemo(() => {
    if (searchQuery.trim().length < 2) return []
    return searchCasesByNid(searchQuery, scope).slice(0, 5)
  }, [searchQuery, scope])

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  function handleSearch(e: FormEvent) {
    e.preventDefault()
    if (searchResults.length === 1) {
      navigate(`/nid/${searchResults[0].nid}`)
      setSearchOpen(false)
    } else if (searchResults.length > 1) {
      setSearchOpen(true)
    } else if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`)
      setSearchOpen(false)
    }
  }

  function handleSelectCase(c: AuditCase) {
    navigate(`/nid/${c.nid}`)
    setSearchQuery('')
    setSearchOpen(false)
  }

  return (
    <header className="relative z-20 flex h-14 shrink-0 items-center gap-3 border-b border-border-soft bg-white/95 px-4 shadow-sm backdrop-blur-sm">
      <div ref={searchRef} className="relative w-full max-w-sm">
        <form onSubmit={handleSearch}>
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-secondary" />
          <input
            type="search"
            placeholder="Buscar por NID..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setSearchOpen(e.target.value.trim().length >= 2)
            }}
            onFocus={() => searchQuery.trim().length >= 2 && setSearchOpen(true)}
            className="w-full rounded-md border border-border-soft bg-white py-1.5 pl-8 pr-3 text-[11px] shadow-sm outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          />
        </form>
        {searchOpen && searchResults.length > 0 && (
          <NidSearchCard cases={searchResults} onSelect={handleSelectCase} />
        )}
        {searchOpen && searchQuery.trim().length >= 2 && searchResults.length === 0 && (
          <div className="absolute left-0 top-full z-50 mt-1 w-full rounded-lg border border-border-soft bg-white px-3 py-4 text-center text-[11px] text-text-secondary shadow-lg">
            Sin resultados para &quot;{searchQuery}&quot;
          </div>
        )}
      </div>

      <div className="ml-auto flex items-center gap-2">
        <CountrySelector />
        <ProcessSelector />
        <NotificationPanel notifications={notifications} />

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
