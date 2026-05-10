import { Link, useLocation } from 'react-router-dom';
import { Home, Search, SquarePen, Bell, User, MoreHorizontal } from 'lucide-react';
import { useAuthStore } from '../../stores/useAuthStore';
import { usePostWriteModalStore } from '../../stores/postWriteModalStore';
import UserMenu from './UserMenu';

const NAV_ITEMS: { to: string; icon: typeof Home; label: string }[] = [
  { to: '/posts', icon: Home, label: '홈' },
  { to: '/search', icon: Search, label: '검색' },
  // 글쓰기는 라우트 이동 대신 모달 토글 — NAV_ITEMS와 별도 처리(아래 버튼).
  { to: '/notifications', icon: Bell, label: '알림' },
  { to: '/profile', icon: User, label: '프로필' },
];

export default function SideNav() {
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const openWriteModal = usePostWriteModalStore((s) => s.openModal);

  const isActive = (path: string) => {
    if (path === '/posts') {
      return location.pathname === '/posts' || location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="hidden md:flex flex-col items-center gap-6 py-8 px-3 bg-white border-r border-gray-200 rounded-r-2xl fixed left-0 top-1/2 -translate-y-1/2">
      {/* 홈/검색 */}
      {NAV_ITEMS.slice(0, 2).map(({ to, icon: Icon, label }) => {
        const active = isActive(to);
        return (
          <Link
            key={to}
            to={to}
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

      {/* 글쓰기 — 모달 토글 (PC 전용 진입점) */}
      <button
        type="button"
        onClick={openWriteModal}
        aria-label="글쓰기"
        title="글쓰기"
        className="p-2 rounded-xl text-gray-400 hover:text-gray-600 transition-colors"
      >
        <SquarePen size={24} strokeWidth={1.5} />
      </button>

      {/* 알림/프로필 */}
      {NAV_ITEMS.slice(2).map(({ to, icon: Icon, label }) => {
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

      {/* 케밥 → UserMenu (chrome 통일 정책) */}
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
