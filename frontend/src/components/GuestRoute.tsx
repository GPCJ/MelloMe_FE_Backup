import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';

export default function GuestRoute() {
  const { user } = useAuthStore();
  if (user?.canAccessCommunity) return <Navigate to="/posts" replace />;
  if (user) return <Navigate to="/" replace />;
  return <Outlet />;
}
