import { Link, useLocation } from 'react-router-dom';
import { Home, Search, SquarePen, Bell, User, Settings } from 'lucide-react';
import { useAuthStore } from '../../stores/useAuthStore';
import { useNotificationStore } from '../../stores/useNotificationStore';

const NAV_ITEMS = [
  { to: '/posts', icon: Home, label: '홈' },
  { to: '/search', icon: Search, label: '검색' },
  { to: '/posts/new', icon: SquarePen, label: '글쓰기' },
  // TODO: 디자이너가 데스크탑 네비바 형식 확정 시 네비바 또는 사이드바에 편입 예정
  { to: '/notifications', icon: Bell, label: '알림' },
  { to: '/profile', icon: User, label: '프로필' },
  { to: '/settings', icon: Settings, label: '설정' },
];

export default function SideNav() {
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const unreadCount = useNotificationStore((s) => s.unreadCount);

  const isActive = (path: string) => {
    if (path === '/posts') {
      return location.pathname === '/posts' || location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="hidden md:flex flex-col items-center gap-6 py-8 px-3 bg-white border-r border-gray-200 rounded-r-2xl fixed left-0 top-1/2 -translate-y-1/2">
      {NAV_ITEMS.map(({ to, icon: Icon, label }) => {
        const active = isActive(to);
        const href = to === '/profile' && !user ? '/login' : to;

        return (
          <Link
            key={to}
            to={href}
            className={`relative p-2 rounded-xl transition-colors ${
              active ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'
            }`}
            aria-label={label}
            title={label}
          >
            <Icon size={24} strokeWidth={active ? 2.2 : 1.5} />
            {to === '/notifications' && unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold leading-none px-1">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
