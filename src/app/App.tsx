import { RouterProvider } from 'react-router-dom'
import { AuditProvider } from '../context/AuditContext'
import { router } from './routes'

export default function App() {
  return (
    <AuditProvider>
      <RouterProvider router={router} />
    </AuditProvider>
  )
}
