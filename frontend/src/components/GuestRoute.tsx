import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';

export default function GuestRoute() {
  const { user } = useAuthStore();
  if (user) return <Navigate to="/" replace />;
  // Outlet = 자식 Route 렌더링
  return <Outlet />;
}
