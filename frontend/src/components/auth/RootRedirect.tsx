import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/useAuthStore';

export default function RootRedirect() {
  const user = useAuthStore((s) => s.user);

  return <Navigate to={user ? '/posts' : '/signup'} replace />;
}
