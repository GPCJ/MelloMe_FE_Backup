import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';

export default function GuestRoute() {
  const { user } = useAuthStore();
  const location = useLocation();

  if (!user) return <Outlet />;

  const redirectTo = (location.state as { redirectTo?: string })?.redirectTo;
  if (redirectTo) return <Navigate to={redirectTo} replace />;

  if (user.role !== 'USER') return <Navigate to="/posts" replace />;
  return <Navigate to="/" replace />;
}
