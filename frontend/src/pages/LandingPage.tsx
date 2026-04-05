import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { useAuthStore } from '../stores/useAuthStore';
import { getMe, logout } from '../api/auth';
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

export default function LandingPage() {
  const navigate = useNavigate();
  const { user, tokens, setUser, clearAuth } = useAuthStore();
  const isVerified = !!user && user.role !== 'USER';

  function handleLogout() {
    clearAuth();
    navigate('/login');
    logout().catch(() => {});
  }

  useEffect(() => {
    if (tokens) {
      getMe().then(setUser).catch(() => {});
    }
  }, []);
  const isNotVerified = !!user && user.role === 'USER';

  const mswEnabled = import.meta.env.VITE_MSW_ENABLED === 'true';
  const mswBadge = mswEnabled
    ? { text: 'MSW', color: 'bg-orange-100 text-orange-600' }
    : { text: 'LIVE', color: 'bg-green-100 text-green-600' };

  const heroCta = isVerified
    ? { to: '/posts', label: '커뮤니티 바로가기 →' }
    : isNotVerified
      ? { to: '/therapist-verifications', label: '치료사 인증하기 →' }
      : { to: '/login', label: '시작하기 →' };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Navbar */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 h-14 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold text-gray-900">멜로미</h1>
            <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${mswBadge.color}`}>
              {mswBadge.text}
            </span>
          </div>

          {/* Center Nav */}
          <nav className="flex items-center">
            <Link
              to="/posts"
              className="text-sm font-medium px-3 py-2 rounded-md text-gray-500 hover:text-gray-900 transition-colors"
            >
              커뮤니티
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            {isNotVerified ? (
              <Link
                to="/therapist-verifications"
                className="px-4 py-1.5 text-sm font-medium text-white bg-gray-800 rounded-lg"
              >
                치료사 인증
              </Link>
            ) : null}

            {user ? (
              <>
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
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center gap-2 px-1 py-1 rounded-md hover:bg-gray-100 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-purple-300 flex items-center justify-center text-white text-sm font-bold">
                      {user.nickname?.[0] ?? '?'}
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
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-md text-gray-600 hover:text-gray-900"
                >
                  로그인
                </Link>
                <Link
                  to="/signup"
                  className="text-md text-gray-600 hover:text-gray-900"
                >
                  회원가입
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex items-center justify-center pt-14">
        <div className="max-w-xl mx-auto px-6 py-20 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            치료사를 위한 커뮤니티
          </h1>
          <p className="text-lg text-gray-500 mb-8">
            익명으로 케이스를 나누고, 동료들과 함께 성장하세요.
          </p>
          <Link
            to={heroCta.to}
            className="inline-block px-6 py-2.5 text-white bg-gray-900 rounded-lg font-medium hover:bg-gray-800"
          >
            {heroCta.label}
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-6">
        <div className="max-w-5xl mx-auto px-6 text-center text-sm text-gray-400">
          © 2026 멜로미
        </div>
      </footer>
    </div>
  );
}
