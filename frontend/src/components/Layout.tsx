import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Bell, Home, PlusCircle, Search, User } from 'lucide-react';
import { useAuthStore } from '../stores/useAuthStore';
import { logout } from '../api/auth';
import { buttonVariants } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const mockAnnouncements = [
  { id: 1, title: '멜로미 커뮤니티 오픈 안내', date: '2024.03.19' },
  { id: 2, title: '커뮤니티 이용 가이드', date: '2024.03.18' },
  { id: 3, title: '회원 인증 절차 안내', date: '2024.03.17' },
];

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  function handleLogout() {
    clearAuth();
    navigate('/login');
    logout().catch(() => {});
  }

  const roleLabel =
    user?.role === 'THERAPIST'
      ? '치료사'
      : user?.role === 'ADMIN'
        ? '관리자'
        : '';

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            {/* 데스크탑 로고 */}
            <Link to="/" className="hidden md:block text-2xl font-bold text-gray-900">
              멜로미
            </Link>
            {/* 모바일 타이틀 */}
            <span className="md:hidden text-lg font-bold text-gray-900">
              치료사 커뮤니티
            </span>
            {/* MSW ON/OFF 확인 UI — 데스크탑만 */}
            <span className="hidden md:inline-block">
              {import.meta.env.VITE_MSW_ENABLED === 'true' ? (
                <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-orange-100 text-orange-600">
                  MSW
                </span>
              ) : (
                <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-green-100 text-green-600">
                  LIVE
                </span>
              )}
            </span>
          </div>

          {/* Center Nav */}
          <nav className="hidden md:flex items-center">
            <Link
              to="/posts"
              className={`flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-md transition-colors ${
                isActive('/posts')
                  ? 'text-gray-900'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              커뮤니티
            </Link>
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-2">
            {/* 모바일 검색 아이콘 */}
            <button
              onClick={() => navigate('/search')}
              className="md:hidden p-2 text-gray-500 hover:text-gray-900 rounded-md transition-colors"
            >
              <Search size={20} />
            </button>
            {/* Notification Bell */}
            <DropdownMenu>
              <DropdownMenuTrigger className="relative p-2 text-gray-500 hover:text-gray-900 rounded-md transition-colors">
                <Bell size={20} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 p-0">
                <div className="px-4 py-3 border-b">
                  <span className="font-bold text-base">공지사항</span>
                </div>
                {mockAnnouncements.map((a) => (
                  <div
                    key={a.id}
                    className="px-4 py-3 border-b hover:bg-gray-50 cursor-pointer"
                  >
                    <p className="font-medium text-sm">{a.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{a.date}</p>
                  </div>
                ))}
                <div className="px-4 py-3 text-center text-sm text-gray-400">
                  준비 중입니다
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Profile */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-2 px-1 py-1 rounded-md hover:bg-gray-100 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-purple-300 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {user.nickname?.[0] ?? '?'}
                  </div>
                  <div className="hidden md:flex flex-col items-start">
                    <span className="text-sm font-medium leading-tight">
                      {user.nickname}
                    </span>
                    {roleLabel && (
                      <span className="text-xs text-gray-400">{roleLabel}</span>
                    )}
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    프로필
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    로그아웃
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/login" className={buttonVariants({ size: 'sm' })}>
                로그인
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Bottom Navigation (Mobile) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-3">
        <Link
          to="/posts"
          className={`flex flex-col items-center gap-1 ${isActive('/posts') && !isActive('/posts/new') ? 'text-gray-900' : 'text-gray-500'}`}
        >
          <Home size={24} />
          <span className="text-xs">홈</span>
        </Link>
        <Link
          to="/posts/new"
          className={`flex flex-col items-center gap-1 ${isActive('/posts/new') ? 'text-gray-900' : 'text-gray-500'}`}
        >
          <PlusCircle size={24} />
          <span className="text-xs">글쓰기</span>
        </Link>
        <Link
          to={user ? '/profile' : '/login'}
          className={`flex flex-col items-center gap-1 ${
            isActive('/profile') || isActive('/login')
              ? 'text-gray-900'
              : 'text-gray-500'
          }`}
        >
          <User size={24} />
          <span className="text-xs">{user ? '프로필' : '로그인'}</span>
        </Link>
      </nav>
    </div>
  );
}
