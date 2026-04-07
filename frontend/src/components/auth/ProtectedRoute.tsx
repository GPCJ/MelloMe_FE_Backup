import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../../stores/useAuthStore'

export default function ProtectedRoute() {
  const { user } = useAuthStore()
  if (!user) return <Navigate to="/login" replace />
  if (user.role === 'USER') return <Navigate to="/" replace />
  return <Outlet />
}
