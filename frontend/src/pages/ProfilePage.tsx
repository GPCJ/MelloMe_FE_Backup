import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import PostCard from '../components/PostCard';
import { fetchMyPosts, fetchMyActivity } from '../api/mypage';
import { useAuthStore } from '../stores/useAuthStore';
import type { MyActivity } from '../types/mypage';
import type { PostSummary } from '../types/post';

type Tab = 'posts' | 'commented' | 'scrapped';

const TABS: { key: Tab; label: string }[] = [
  { key: 'posts', label: '내가 쓴 글' },
  { key: 'commented', label: '답글 단 글' },
  { key: 'scrapped', label: '스크랩' },
];

export default function ProfilePage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const [activeTab, setActiveTab] = useState<Tab>('posts');
  const [myPosts, setMyPosts] = useState<PostSummary[] | null>(null);
  const [activity, setActivity] = useState<MyActivity | null>(null);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [loadingActivity, setLoadingActivity] = useState(false);
  const [errorPosts, setErrorPosts] = useState(false);
  const [errorActivity, setErrorActivity] = useState(false);

  function loadPosts() {
    setErrorPosts(false);
    setLoadingPosts(true);
    fetchMyPosts()
      .then(setMyPosts)
      .catch(() => setErrorPosts(true))
      .finally(() => setLoadingPosts(false));
  }

  function loadActivity() {
    setErrorActivity(false);
    setLoadingActivity(true);
    fetchMyActivity()
      .then(setActivity)
      .catch(() => setErrorActivity(true))
      .finally(() => setLoadingActivity(false));
  }

  useEffect(() => {
    if (activeTab === 'posts' && !myPosts) loadPosts();
    if ((activeTab === 'commented' || activeTab === 'scrapped') && !activity)
      loadActivity();
  }, [activeTab]);

  const isVerified =
    user?.therapistVerification?.status === 'APPROVED';

  const commentedPosts = activity?.commentedPosts ?? [];
  const scrappedPosts = activity?.scrappedPosts ?? [];

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
            {errorPosts && <TabError onRetry={loadPosts} />}
            {!loadingPosts && !errorPosts && myPosts?.length === 0 && (
              <TabEmpty message="작성한 글이 없어요." />
            )}
            {!loadingPosts &&
              myPosts?.map((post) => <PostCard key={post.id} post={post} />)}
          </>
        )}

        {/* 답글 단 글 */}
        {activeTab === 'commented' && (
          <>
            {loadingActivity && <TabSkeleton />}
            {errorActivity && <TabError onRetry={loadActivity} />}
            {!loadingActivity && !errorActivity && commentedPosts.length === 0 && (
              <TabEmpty message="답글 단 글이 없어요." />
            )}
            {!loadingActivity &&
              commentedPosts.map(({ post }) => (
                <PostCard key={post.id} post={post} />
              ))}
          </>
        )}

        {/* 스크랩 */}
        {activeTab === 'scrapped' && (
          <>
            {loadingActivity && <TabSkeleton />}
            {errorActivity && <TabError onRetry={loadActivity} />}
            {!loadingActivity && !errorActivity && scrappedPosts.length === 0 && (
              <TabEmpty message="스크랩한 글이 없어요." />
            )}
            {!loadingActivity &&
              scrappedPosts.map(({ post }) => (
                <PostCard key={post.id} post={post} />
              ))}
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
