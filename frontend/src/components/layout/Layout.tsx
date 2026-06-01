import { Outlet, Link, useLocation } from 'react-router-dom';
import { HomeIcon, SearchIcon, WriteIcon, BellIcon, ProfileIcon } from '@/components/icons';
import { useAuthStore } from '../../stores/useAuthStore';
import { useNotificationStore } from '../../stores/useNotificationStore';
import SideNav from './SideNav';
import PostWriteModal from '../post/PostWriteModal';
import MessageComposeModal from '../message/MessageComposeModal';

export default function Layout() {
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const isActive = (path: string) => location.pathname.startsWith(path);

  // 모바일 글쓰기 페이지(/posts/new)는 풀스크린 시안 — BottomNav가 하단 툴바를 가리지 않도록 숨김.
  const hideBottomNav = location.pathname === '/posts/new';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <SideNav />
      <main className="flex-1 md:mx-20">
        <Outlet />
      </main>

      {/* PC 게시글 작성 모달 — 진입점(SideNav, PostListPage 글쓰기 버튼)에서 store로 토글 */}
      <PostWriteModal />

      {/* PC 쪽지 작성 모달 — 진입점(작성자 프사 드롭다운)에서 messageComposeStore로 토글 */}
      <MessageComposeModal />

      {/* Bottom Navigation (Mobile) */}
      {!hideBottomNav && (
        <nav
          className={`md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-3`}
        >
          {/* 커뮤니티 */}
          <Link
            to="/posts"
            aria-label="홈"
            className={`flex items-center ${isActive('/posts') && !isActive('/posts/new') ? 'text-gray-900' : 'text-gray-500'}`}
          >
            <HomeIcon size={24} />
          </Link>
          {/* 검색 */}
          <Link
            to="/search"
            aria-label="검색"
            className={`flex items-center ${isActive('/search') ? 'text-gray-900' : 'text-gray-500'}`}
          >
            <SearchIcon size={24} />
          </Link>
          {/* 게시글 작성 */}
          <Link
            to="/posts/new"
            aria-label="글쓰기"
            className={`flex items-center ${isActive('/posts/new') ? 'text-gray-900' : 'text-gray-500'}`}
          >
            <WriteIcon size={24} />
          </Link>
          {/* 알림 */}
          <Link
            to="/notifications"
            aria-label="알림"
            className={`relative flex items-center ${isActive('/notifications') ? 'text-gray-900' : 'text-gray-500'}`}
          >
            <BellIcon size={24} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-2 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold leading-none px-1">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </Link>
          {/* 프로필 */}
          <Link
            to={user ? '/profile' : '/login'}
            aria-label={user ? '프로필' : '로그인'}
            className={`flex items-center ${
              isActive('/profile') || isActive('/login') ? 'text-gray-900' : 'text-gray-500'
            }`}
          >
            <ProfileIcon size={24} />
          </Link>
        </nav>
      )}
    </div>
  );
}
