import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import PostCard from '../components/PostCard';
import { fetchMyPosts, fetchMyComments, fetchMyScraps } from '../api/mypage';
import { deleteAccount } from '../api/auth';
import { useAuthStore } from '../stores/useAuthStore';
import type { PaginatedComments, PaginatedScraps } from '../types/mypage';
import type { PaginatedPosts } from '../types/post';

type Tab = 'posts' | 'commented' | 'scrapped';

const TABS: { key: Tab; label: string }[] = [
  { key: 'posts', label: '내가 쓴 글' },
  { key: 'commented', label: '답글 단 글' },
  { key: 'scrapped', label: '스크랩' },
];

export default function ProfilePage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  async function handleDeleteAccount() {
    if (!window.confirm('정말 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) return;
    try {
      await deleteAccount();
      clearAuth();
      navigate('/login');
    } catch {
      alert('회원 탈퇴에 실패했습니다. 다시 시도해주세요.(네트워크 탭 참조)');
    }
  }

  const [activeTab, setActiveTab] = useState<Tab>('posts');

  const [postsData, setPostsData] = useState<PaginatedPosts | null>(null);
  const [postsPage, setPostsPage] = useState(1);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [errorPosts, setErrorPosts] = useState(false);

  const [commentsData, setCommentsData] = useState<PaginatedComments | null>(null);
  const [commentsPage, setCommentsPage] = useState(1);
  const [loadingComments, setLoadingComments] = useState(false);
  const [errorComments, setErrorComments] = useState(false);

  const [scrapsData, setScrapsData] = useState<PaginatedScraps | null>(null);
  const [scrapsPage, setScrapsPage] = useState(1);
  const [loadingScraps, setLoadingScraps] = useState(false);
  const [errorScraps, setErrorScraps] = useState(false);

  function loadPosts(page = postsPage) {
    setErrorPosts(false);
    setLoadingPosts(true);
    fetchMyPosts(page - 1)
      .then(setPostsData)
      .catch(() => setErrorPosts(true))
      .finally(() => setLoadingPosts(false));
  }

  function loadComments(page = commentsPage) {
    setErrorComments(false);
    setLoadingComments(true);
    fetchMyComments(page - 1)
      .then(setCommentsData)
      .catch(() => setErrorComments(true))
      .finally(() => setLoadingComments(false));
  }

  function loadScraps(page = scrapsPage) {
    setErrorScraps(false);
    setLoadingScraps(true);
    fetchMyScraps(page - 1)
      .then(setScrapsData)
      .catch(() => setErrorScraps(true))
      .finally(() => setLoadingScraps(false));
  }

  useEffect(() => {
    if (activeTab === 'posts') loadPosts(postsPage);
  }, [activeTab, postsPage]);

  useEffect(() => {
    if (activeTab === 'commented') loadComments(commentsPage);
  }, [activeTab, commentsPage]);

  useEffect(() => {
    if (activeTab === 'scrapped') loadScraps(scrapsPage);
  }, [activeTab, scrapsPage]);

  const isVerified =
    user?.role === 'THERAPIST' || user?.role === 'ADMIN';

  return (
    <div className="pb-20 md:pb-8">
      {/* 프로필 헤더 */}
      <div className="px-6 py-6 bg-white border-b border-gray-200">
        <div className="flex items-center gap-4">
          {/* 아바타 */}
          {user?.profileImageUrl ? (
            <img
              src={user.profileImageUrl}
              alt={user.nickname}
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-purple-300 flex items-center justify-center text-white text-2xl font-bold shrink-0">
              {user?.nickname?.[0] ?? '?'}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg font-bold text-gray-900">
                {user?.nickname}
              </span>
              {isVerified ? (
                <span className="px-2 py-0.5 rounded-full bg-green-50 text-green-700 text-xs font-medium">
                  인증됨
                </span>
              ) : (
                <button
                  onClick={() => navigate('/therapist-verifications')}
                  className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 text-xs font-medium hover:bg-gray-200 transition-colors"
                >
                  인증하기
                </button>
              )}
            </div>
            {/* 팔로워/팔로잉 — 백엔드 대기, 0 표시 */}
            <div className="flex gap-4 text-sm text-gray-500">
              <span>
                팔로워 <span className="font-medium text-gray-900">0</span>
              </span>
              <span>
                팔로잉 <span className="font-medium text-gray-900">0</span>
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={handleDeleteAccount}
          className="mt-4 text-sm text-gray-400 hover:text-red-500 transition-colors"
        >
          회원 탈퇴
        </button>
      </div>

      {/* 탭 */}
      <div className="sticky top-14 z-40 bg-white border-b border-gray-200">
        <div className="flex">
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex-1 py-2.5 text-xs font-medium text-center transition-colors ${
                activeTab === key
                  ? 'text-neutral-950 border-b-2 border-black'
                  : 'text-gray-400'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* 탭 콘텐츠 */}
      <div className="bg-white">
        {/* 내가 쓴 글 */}
        {activeTab === 'posts' && (
          <>
            {loadingPosts && <TabSkeleton />}
            {errorPosts && <TabError onRetry={() => loadPosts(postsPage)} />}
            {!loadingPosts && !errorPosts && postsData?.posts.length === 0 && (
              <TabEmpty message="작성한 글이 없어요." />
            )}
            {!loadingPosts &&
              postsData?.posts.map((post) => <PostCard key={post.id} post={post} />)}
            {!loadingPosts && postsData && postsData.totalPages > 1 && (
              <div className="flex items-center justify-center gap-1 py-6">
                <button
                  onClick={() => setPostsPage(postsPage - 1)}
                  disabled={postsPage === 1}
                  className="p-2 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: postsData.totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => setPostsPage(page)}
                      className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                        postsPage === page
                          ? 'bg-gray-900 text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {page}
                    </button>
                  ),
                )}
                <button
                  onClick={() => setPostsPage(postsPage + 1)}
                  disabled={postsPage === postsData.totalPages}
                  className="p-2 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}

        {/* 답글 단 글 */}
        {activeTab === 'commented' && (
          <>
            {loadingComments && <TabSkeleton />}
            {errorComments && <TabError onRetry={() => loadComments(commentsPage)} />}
            {!loadingComments && !errorComments && commentsData?.comments.length === 0 && (
              <TabEmpty message="답글 단 글이 없어요." />
            )}
            {!loadingComments &&
              commentsData?.comments.map(({ post }) => (
                <PostCard key={post.id} post={post} />
              ))}
            {!loadingComments && commentsData && commentsData.totalPages > 1 && (
              <div className="flex items-center justify-center gap-1 py-6">
                <button
                  onClick={() => setCommentsPage(commentsPage - 1)}
                  disabled={commentsPage === 1}
                  className="p-2 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: commentsData.totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => setCommentsPage(page)}
                      className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                        commentsPage === page
                          ? 'bg-gray-900 text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {page}
                    </button>
                  ),
                )}
                <button
                  onClick={() => setCommentsPage(commentsPage + 1)}
                  disabled={commentsPage === commentsData.totalPages}
                  className="p-2 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}

        {/* 스크랩 */}
        {activeTab === 'scrapped' && (
          <>
            {loadingScraps && <TabSkeleton />}
            {errorScraps && <TabError onRetry={() => loadScraps(scrapsPage)} />}
            {!loadingScraps && !errorScraps && scrapsData?.scraps.length === 0 && (
              <TabEmpty message="스크랩한 글이 없어요." />
            )}
            {!loadingScraps &&
              scrapsData?.scraps.map(({ post }) => (
                <PostCard key={post.id} post={post} />
              ))}
            {!loadingScraps && scrapsData && scrapsData.totalPages > 1 && (
              <div className="flex items-center justify-center gap-1 py-6">
                <button
                  onClick={() => setScrapsPage(scrapsPage - 1)}
                  disabled={scrapsPage === 1}
                  className="p-2 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: scrapsData.totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => setScrapsPage(page)}
                      className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                        scrapsPage === page
                          ? 'bg-gray-900 text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {page}
                    </button>
                  ),
                )}
                <button
                  onClick={() => setScrapsPage(scrapsPage + 1)}
                  disabled={scrapsPage === scrapsData.totalPages}
                  className="p-2 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function TabSkeleton() {
  return (
    <div className="flex flex-col">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="px-6 py-5 border-b border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <Skeleton className="w-5 h-5 rounded-full" />
            <Skeleton className="h-4 w-16" />
          </div>
          <Skeleton className="h-4 w-full mb-1.5" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      ))}
    </div>
  );
}

function TabError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="py-8 text-center">
      <p className="text-sm text-destructive mb-2">
        데이터를 불러오는 데 실패했습니다.
      </p>
      <button
        onClick={onRetry}
        className="text-sm text-gray-500 underline hover:text-gray-700"
      >
        다시 시도
      </button>
    </div>
  );
}

function TabEmpty({ message }: { message: string }) {
  return (
    <p className="text-sm text-gray-400 text-center py-12">{message}</p>
  );
}
