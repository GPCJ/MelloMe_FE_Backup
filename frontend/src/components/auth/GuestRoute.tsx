import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../stores/useAuthStore';

export default function GuestRoute() {
  const { user } = useAuthStore();

  if (!user) return <Outlet />;

  if (user.role !== 'USER') return <Navigate to="/posts" replace />;
  return <Navigate to="/" replace />;
}
