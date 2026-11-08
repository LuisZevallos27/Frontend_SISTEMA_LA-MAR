import { Navigate, Outlet } from 'react-router'
import { INICIO } from '../auth/roles'
import { useAuth } from '../auth/useAuth'

export default function RutaProtegida({ roles }) {
  const { sesion } = useAuth()

  if (!sesion) return <Navigate to="/login" replace />
  if (roles && !roles.includes(sesion.cargo)) {
    return <Navigate to={INICIO[sesion.cargo] ?? '/mesas'} replace />
  }
  return <Outlet />
}