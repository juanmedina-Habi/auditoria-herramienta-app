import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'

export function AppShell() {
  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      <Sidebar />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <Topbar />
        <main className="min-h-0 flex-1 overflow-y-auto bg-gradient-to-b from-slate-50/80 to-surface p-4">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
