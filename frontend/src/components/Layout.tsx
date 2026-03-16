import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, MessageSquare, User } from 'lucide-react';
import { useAuthStore } from '../stores/useAuthStore';
import { buttonVariants } from '@/components/ui/button';

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  function handleLogout() {
    clearAuth();
    navigate('/login');
  }

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-300 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-gray-900">
            멜로미
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link
              to="/"
              className={`text-base ${isActive('/') && location.pathname === '/' ? 'text-gray-900 font-semibold' : 'text-gray-600'}`}
            >
              홈
            </Link>
            <Link
              to="/posts"
              className={`text-base ${isActive('/posts') ? 'text-gray-900 font-semibold' : 'text-gray-600'}`}
            >
              임상 톡톡
            </Link>
            <span className="text-base text-gray-400">도서관 (예정)</span>
            <span className="text-base text-gray-400">놀이터 (예정)</span>
            {/* 로그인 상태에 따라 분기 */}
            {user ? (
              <>
                <Link
                  to="/my-page"
                  className={`text-base ${isActive('/my-page') ? 'text-gray-900 font-semibold' : 'text-gray-600'}`}
                >
                  마이페이지
                </Link>
                <button
                  className={buttonVariants({ variant: 'outline' })}
                  onClick={handleLogout}
                >
                  로그아웃
                </button>
              </>
            ) : (
              <Link to="/login" className={buttonVariants()}>
                로그인
              </Link>
            )}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Bottom Navigation (Mobile) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-300 flex justify-around py-3">
        <Link
          to="/"
          className={`flex flex-col items-center gap-1 ${isActive('/') && location.pathname === '/' ? 'text-gray-900' : 'text-gray-500'}`}
        >
          <Home size={24} />
          <span className="text-xs">홈</span>
        </Link>
        <Link
          to="/posts"
          className={`flex flex-col items-center gap-1 ${isActive('/posts') ? 'text-gray-900' : 'text-gray-500'}`}
        >
          <MessageSquare size={24} />
          <span className="text-xs">임상톡톡</span>
        </Link>
        <Link
          to={user ? '/my-page' : '/login'}
          className={`flex flex-col items-center gap-1 ${isActive('/my-page') || isActive('/login') ? 'text-gray-900' : 'text-gray-500'}`}
        >
          <User size={24} />
          <span className="text-xs">{user ? '마이' : '로그인'}</span>
        </Link>
      </nav>
    </div>
  );
}

interface LoginFormData {
  email: string;
  password: string;
}

function LoginForm() {
  const [form, setForm] = useState<LoginFormData | null>({
    email: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // input 값 업데이트
    setForm();
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    // 새로고침 방지 + console.log
    e.preventDefault();
    console.log(e);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="email" value={form.email} onChange={handleChange} />
      <input name="password" value={form.password} onChange={handleChange} />
      <button type="submit">로그인</button>
    </form>
  );
}
