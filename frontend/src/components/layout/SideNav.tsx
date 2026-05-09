import { Link, useLocation } from 'react-router-dom';
import { Home, Search, SquarePen, Bell, User, MoreHorizontal } from 'lucide-react';
import { useAuthStore } from '../../stores/useAuthStore';
import UserMenu from './UserMenu';

const NAV_ITEMS = [
  { to: '/posts', icon: Home, label: '홈' },
  { to: '/search', icon: Search, label: '검색' },
  { to: '/posts/new', icon: SquarePen, label: '글쓰기' },
  { to: '/notifications', icon: Bell, label: '알림' },
  { to: '/profile', icon: User, label: '프로필' },
];

export default function SideNav() {
  const location = useLocation();
  const user = useAuthStore((s) => s.user);

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
            className={`p-2 rounded-xl transition-colors ${
              active ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'
            }`}
            aria-label={label}
            title={label}
          >
            <Icon size={24} strokeWidth={active ? 2.2 : 1.5} />
          </Link>
        );
      })}
      <UserMenu
        side="right"
        align="start"
        sideOffset={16}
        className="p-2 rounded-xl text-gray-400 hover:text-gray-600 transition-colors"
      >
        <MoreHorizontal size={24} strokeWidth={1.5} />
      </UserMenu>
    </nav>
  );
}
