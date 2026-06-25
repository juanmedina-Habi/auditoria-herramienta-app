import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { NidSubNav } from '../layout/NidSubNav'
import { PageHeader, pageShellClass } from '../ui/PageHeader'
import { cn } from '../../lib/utils'

type NidPageShellProps = {
  nid: string
  title: string
  subtitle: string
  breadcrumbs: string[]
  backTo?: string
  backLabel?: string
  header?: ReactNode
  children: ReactNode
  sidebar?: ReactNode
}

export function NidPageShell({
  nid,
  title,
  subtitle,
  breadcrumbs,
  backTo,
  backLabel,
  header,
  children,
  sidebar,
}: NidPageShellProps) {
  return (
    <div className={pageShellClass}>
      <PageHeader
        title={title}
        subtitle={subtitle}
        breadcrumbs={breadcrumbs}
        actions={
          backTo ? (
            <Link
              to={backTo}
              className="rounded-md border border-border-soft px-3 py-1.5 text-[11px] font-medium hover:bg-slate-50"
            >
              {backLabel ?? 'Volver al detalle'}
            </Link>
          ) : undefined
        }
      />
      {header}
      <NidSubNav nid={nid} />
      <div className={cn(sidebar ? 'grid grid-cols-1 gap-2.5 xl:grid-cols-3' : undefined)}>
        <div className={cn(sidebar ? 'space-y-2.5 xl:col-span-2' : 'space-y-2.5')}>{children}</div>
        {sidebar && <div className="space-y-2.5">{sidebar}</div>}
      </div>
    </div>
  )
}
