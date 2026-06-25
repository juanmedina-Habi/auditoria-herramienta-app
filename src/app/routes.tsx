import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import { DashboardPage } from '../features/dashboard/DashboardPage'
import { TasksPage } from '../features/tasks/TasksPage'
import { NidDetailPage } from '../features/nid-detail/NidDetailPage'
import { GeoreferencePage } from '../features/georeference/GeoreferencePage'
import { ComparablesPage } from '../features/comparables/ComparablesPage'
import { RulesValidationPage } from '../features/rules/RulesValidationPage'
import { RulesAdminPage } from '../features/rules/RulesAdminPage'
import { DecisionPage } from '../features/decision/DecisionPage'
import { HistoryPage } from '../features/history/HistoryPage'
import { AuditorMetricsPage } from '../features/auditor-metrics/AuditorMetricsPage'
import { SearchPage } from '../features/search/SearchPage'
import { SettingsPage } from '../features/settings/SettingsPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'tasks', element: <TasksPage /> },
      { path: 'inbox', element: <Navigate to="/tasks" replace /> },
      { path: 'search', element: <SearchPage /> },
      { path: 'nid/:nid', element: <NidDetailPage /> },
      { path: 'nid/:nid/georeference', element: <GeoreferencePage /> },
      { path: 'nid/:nid/comparables', element: <ComparablesPage /> },
      { path: 'nid/:nid/rules', element: <RulesValidationPage /> },
      { path: 'nid/:nid/decision', element: <DecisionPage /> },
      { path: 'rules-admin', element: <RulesAdminPage /> },
      { path: 'history', element: <HistoryPage /> },
      { path: 'auditor-metrics', element: <AuditorMetricsPage /> },
      { path: 'settings', element: <SettingsPage /> },
    ],
  },
])
