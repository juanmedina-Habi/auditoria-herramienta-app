import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AlertTriangle,
  Bell,
  Clock,
  Inbox,
  TrendingUp,
  BarChart3,
  CheckCheck,
} from 'lucide-react'
import type { AppNotification, NotificationType } from '../../types/audit'
import { cn } from '../../lib/utils'

type NotificationPanelProps = {
  notifications: AppNotification[]
}

const TYPE_STYLES: Record<
  NotificationType,
  { icon: typeof Bell; bg: string; text: string }
> = {
  alerta: { icon: AlertTriangle, bg: 'bg-orange-50', text: 'text-orange-600' },
  sla: { icon: Clock, bg: 'bg-red-50', text: 'text-red-600' },
  asignacion: { icon: Inbox, bg: 'bg-brand-50', text: 'text-brand-600' },
  escalado: { icon: TrendingUp, bg: 'bg-purple-50', text: 'text-purple-600' },
  resumen: { icon: BarChart3, bg: 'bg-slate-100', text: 'text-text-secondary' },
}

export function NotificationPanel({ notifications }: NotificationPanelProps) {
  const [open, setOpen] = useState(false)
  const [readIds, setReadIds] = useState<Set<string>>(new Set())
  const ref = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  const unread = notifications.filter((n) => !readIds.has(n.id))
  const count = unread.length

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  function handleSelect(n: AppNotification) {
    setReadIds((prev) => new Set(prev).add(n.id))
    if (n.nid) navigate(`/nid/${n.nid}`)
    setOpen(false)
  }

  function markAllRead() {
    setReadIds(new Set(notifications.map((n) => n.id)))
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'relative rounded-md p-1.5 text-text-secondary hover:bg-slate-100',
          open && 'bg-slate-100',
        )}
        aria-label="Notificaciones"
        aria-expanded={open}
      >
        <Bell className="h-4 w-4" />
        {count > 0 && (
          <span className="absolute right-0.5 top-0.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-status-alert px-0.5 text-[9px] font-bold text-white">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-1.5 w-80 overflow-hidden rounded-lg border border-border-soft bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-border-soft bg-slate-50 px-3 py-2">
            <div>
              <p className="text-[11px] font-semibold text-text-primary">Notificaciones</p>
              <p className="text-[10px] text-text-secondary">
                {count > 0 ? `${count} sin leer` : 'Todo al día'}
              </p>
            </div>
            {count > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="inline-flex items-center gap-1 text-[10px] font-medium text-brand-600 hover:underline"
              >
                <CheckCheck className="h-3 w-3" />
                Marcar leídas
              </button>
            )}
          </div>

          <ul className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <li className="px-3 py-6 text-center text-[11px] text-text-secondary">
                No hay notificaciones pendientes
              </li>
            ) : (
              notifications.map((n) => {
                const style = TYPE_STYLES[n.type]
                const Icon = style.icon
                const isRead = readIds.has(n.id)
                return (
                  <li key={n.id}>
                    <button
                      type="button"
                      onClick={() => handleSelect(n)}
                      className={cn(
                        'flex w-full gap-2.5 border-b border-border-soft px-3 py-2.5 text-left last:border-b-0 hover:bg-slate-50',
                        isRead && 'opacity-60',
                        n.priority === 'high' && !isRead && 'bg-orange-50/30',
                      )}
                    >
                      <div
                        className={cn(
                          'flex h-7 w-7 shrink-0 items-center justify-center rounded-full',
                          style.bg,
                          style.text,
                        )}
                      >
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-semibold text-text-primary">{n.title}</p>
                        <p className="mt-0.5 line-clamp-2 text-[10px] text-text-secondary">
                          {n.description}
                        </p>
                        {n.nid && (
                          <p className="mt-1 font-mono text-[10px] font-medium text-brand-600">
                            NID {n.nid}
                          </p>
                        )}
                      </div>
                    </button>
                  </li>
                )
              })
            )}
          </ul>

          <div className="border-t border-border-soft bg-slate-50 px-3 py-2">
            <button
              type="button"
              onClick={() => {
                navigate('/tasks')
                setOpen(false)
              }}
              className="text-[10px] font-medium text-brand-600 hover:underline"
            >
              Ver bandeja de tareas →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
