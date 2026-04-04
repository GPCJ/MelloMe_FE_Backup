import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';

export default function GuestRoute() {
  const { user } = useAuthStore();
  const pendingRedirect = useAuthStore((s) => s.pendingRedirect);
  const setPendingRedirect = useAuthStore((s) => s.setPendingRedirect);

  if (!user) return <Outlet />;

  // store에 pendingRedirect가 있으면 해당 경로로 이동 후 초기화.
  // 회원가입 후 환영페이지 이동 등, setUser로 인한 리렌더가
  // navigate보다 먼저 이 가드를 평가할 때 사용된다.
  if (pendingRedirect) {
    const to = pendingRedirect;
    setPendingRedirect(null);
    return <Navigate to={to} replace />;
  }

  if (user.role !== 'USER') return <Navigate to="/posts" replace />;
  return <Navigate to="/" replace />;
}
