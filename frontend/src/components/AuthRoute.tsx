import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';

export default function AuthRoute() {
  const { user } = useAuthStore();
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
}
