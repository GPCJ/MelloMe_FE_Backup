import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, Search, PlusCircle, Bell, User } from 'lucide-react';
import { useAuthStore } from '../../stores/useAuthStore';
import SideNav from './SideNav';
import PostWriteModal from '../post/PostWriteModal';

export default function Layout() {
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Main Content */}
      <SideNav />
      <main className="flex-1 md:mx-20">
        <Outlet />
      </main>

      {/* PC 게시글 작성 모달 — 진입점(SideNav, PostListPage 글쓰기 버튼)에서 store로 토글 */}
      <PostWriteModal />

      {/* Bottom Navigation (Mobile) */}
      <nav
        className={`md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-3`}
      >
        {/* 커뮤니티 */}
        <Link
          to="/posts"
          className={`flex flex-col items-center gap-1 ${isActive('/posts') && !isActive('/posts/new') ? 'text-gray-900' : 'text-gray-500'}`}
        >
          <Home size={24} />
          <span className="text-xs">홈</span>
        </Link>
        {/* 검색 */}
        <Link
          to="/search"
          className={`flex flex-col items-center gap-1 ${isActive('/search') ? 'text-gray-900' : 'text-gray-500'}`}
        >
          <Search size={24} />
          <span className="text-xs">검색</span>
        </Link>
        {/* 게시글 작성 */}
        <Link
          to="/posts/new"
          className={`flex flex-col items-center gap-1 ${isActive('/posts/new') ? 'text-gray-900' : 'text-gray-500'}`}
        >
          <PlusCircle size={24} />
          <span className="text-xs">글쓰기</span>
        </Link>
        {/* 알림 */}
        <Link
          to="/notifications"
          className={`flex flex-col items-center gap-1 ${isActive('/notifications') ? 'text-gray-900' : 'text-gray-500'}`}
        >
          <Bell size={24} />
          <span className="text-xs">알림</span>
        </Link>
        {/* 프로필 */}
        <Link
          to={user ? '/profile' : '/login'}
          className={`flex flex-col items-center gap-1 ${
            isActive('/profile') || isActive('/login') ? 'text-gray-900' : 'text-gray-500'
          }`}
        >
          <User size={24} />
          <span className="text-xs">{user ? '프로필' : '로그인'}</span>
        </Link>
      </nav>
    </div>
  );
}
