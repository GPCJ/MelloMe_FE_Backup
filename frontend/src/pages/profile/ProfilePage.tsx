import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Camera, Pencil, Settings } from 'lucide-react';
import { Skeleton } from '@/components/shadcn-ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/shadcn-ui/dropdown-menu';
import MobilePageHeader from '@/components/common/MobilePageHeader';
import PostCard from '../../components/post/PostCard';
import { fetchMyPosts, fetchMyComments, fetchMyScraps } from '../../api/mypage';
import { deleteAccount, logout, uploadProfileImage, updateMyProfile } from '../../api/auth';
import { useAuthStore } from '../../stores/useAuthStore';
import type { MyComment } from '../../types/mypage';
import type { PostSummary } from '../../types/post';
import UserAvatar from '../../components/common/UserAvatar';
import { toast } from 'sonner';
import { getAxiosErrorMessage } from '@/utils/getAxiosErrorMessage';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { trackEvent } from '../../lib/analytics';
import { useScreenExit } from '../../hooks/useScreenExit';

type Tab = 'posts' | 'commented' | 'scrapped';

const TABS: { key: Tab; label: string }[] = [
  { key: 'posts', label: '내가 쓴 글' },
  { key: 'commented', label: '답글 단 글' },
  { key: 'scrapped', label: '스크랩' },
];

export default function ProfilePage() {
  // 체류 시간 측정 — 마이페이지 이탈 시 duration 발송.
  useScreenExit('my_page');

  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  function handleLogout() {
    clearAuth();
    navigate('/login');
    logout().catch(() => {});
  }
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [editingNickname, setEditingNickname] = useState(false);
  const [nicknameInput, setNicknameInput] = useState('');
  const [savingNickname, setSavingNickname] = useState(false);
  // 프론트 선검사 — 불필요한 업로드 방지 (서버에서도 검증하지만 UX 개선 목적)
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
  const MAX_SIZE = 5 * 1024 * 1024; // 5MB

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error('jpg, png, webp 파일만 업로드할 수 있습니다.');
      return;
    }
    if (file.size > MAX_SIZE) {
      toast.error('5MB 이하의 파일만 업로드할 수 있습니다.');
      return;
    }

    setUploadingImage(true);
    try {
      const { profileImageUrl } = await uploadProfileImage(file);
      // 응답 URL로 스토어 직접 갱신 — getMe() 재호출 대비 API 1회 절약
      if (user) setUser({ ...user, profileImageUrl });
      // PM 정식 스펙(2026-04-27): 프사 수정 성공 시 profile_edited 발송.
      // 자기소개 필드는 PATCH /me에 미존재 — 백엔드 API 추가 시 후속 삽입.
      trackEvent('profile_edited');
    } catch (err) {
      console.error(err);
      toast.error(getAxiosErrorMessage(err, 'image'));
    } finally {
      setUploadingImage(false);
      // 같은 파일 재선택 가능하도록 초기화
      e.target.value = '';
    }
  }

  function startEditNickname() {
    setNicknameInput(user?.nickname ?? '');
    setEditingNickname(true);
  }

  async function handleSaveNickname() {
    const trimmed = nicknameInput.trim();
    if (!trimmed || trimmed === user?.nickname) {
      setEditingNickname(false);
      return;
    }

    setSavingNickname(true);
    try {
      const updated = await updateMyProfile(trimmed);
      setUser({ ...user!, ...updated });
      setEditingNickname(false);
      // PM 정식 스펙(2026-04-27): 닉네임 수정 성공 시 profile_edited 발송.
      trackEvent('profile_edited');
    } catch (err) {
      console.error(err);
      toast.error(getAxiosErrorMessage(err, 'nickname'));
    } finally {
      setSavingNickname(false);
    }
  }

  async function handleDeleteAccount() {
    if (!window.confirm('정말 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) return;
    try {
      await deleteAccount();
      clearAuth();
      navigate('/login');
    } catch (err) {
      console.error(err);
      toast.error(getAxiosErrorMessage(err, 'delete'));
    }
  }

  const [activeTab, setActiveTab] = useState<Tab>('posts');

  const [postsPage, setPostsPage] = useState(1);
  const postsQuery = useQuery({
    queryKey: ['myPosts', postsPage - 1],
    queryFn: () => fetchMyPosts(postsPage - 1),
    enabled: activeTab === 'posts',
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  });

  const postsData = postsQuery.data;
  const loadingPosts = postsQuery.isLoading;
  const errorPosts = postsQuery.isError;

  const [commentsPage, setCommentsPage] = useState(1);
  const commentsQuery = useQuery({
    queryKey: ['myComments', commentsPage - 1],
    queryFn: () => fetchMyComments(commentsPage - 1),
    enabled: activeTab === 'commented',
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  });

  const commentsData = commentsQuery.data;
  const loadingComments = commentsQuery.isLoading;
  const errorComments = commentsQuery.isError;

  const [scrapsPage, setScrapsPage] = useState(1);
  const scrapsQuery = useQuery({
    queryKey: ['myScraps', scrapsPage - 1],
    queryFn: () => fetchMyScraps(scrapsPage - 1),
    enabled: activeTab === 'scrapped',
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  });

  const scrapsData = scrapsQuery.data;
  const loadingScraps = scrapsQuery.isLoading;
  const errorScraps = scrapsQuery.isError;

  const isVerified = user?.role === 'THERAPIST' || user?.role === 'ADMIN';

  return (
    <div className="pb-20 md:pb-8">
      <MobilePageHeader
        title="내 프로필"
        backTo="/posts"
        rightAction={
          <DropdownMenu>
            <DropdownMenuTrigger
              aria-label="설정"
              className="p-2 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Settings size={20} />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleLogout}>로그아웃</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        }
      />

      {/* 프로필 헤더 */}
      <div className="px-6 py-6 bg-white border-b border-gray-200">
        <div className="flex items-center gap-4">
          {/* 아바타 — 클릭 시 이미지 변경 */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingImage}
            className="relative shrink-0 group"
          >
            <UserAvatar
              nickname={user?.nickname ?? ''}
              imageUrl={user?.profileImageUrl}
              size="lg"
            />
            {editingNickname ? (
              <div className="absolute -bottom-0.5 -right-0.5 w-6 h-6 rounded-full bg-gray-900 flex items-center justify-center ring-2 ring-white">
                <Pencil size={12} className="text-white" />
              </div>
            ) : (
              <div className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                <Camera
                  size={20}
                  className="text-white opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </div>
            )}
            {uploadingImage && (
              <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleImageChange}
            className="hidden"
          />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {editingNickname ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={nicknameInput}
                    onChange={(e) => setNicknameInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveNickname();
                      if (e.key === 'Escape') setEditingNickname(false);
                    }}
                    autoFocus
                    className="text-lg font-bold text-gray-900 border-b-2 border-gray-300 focus:border-gray-900 outline-none bg-transparent w-32"
                  />
                  <button
                    onClick={handleSaveNickname}
                    disabled={savingNickname}
                    className="text-xs text-white bg-gray-900 px-2.5 py-1 rounded-md hover:bg-gray-800 disabled:opacity-50"
                  >
                    {savingNickname ? '저장 중...' : '저장'}
                  </button>
                  <button
                    onClick={() => setEditingNickname(false)}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    취소
                  </button>
                </div>
              ) : (
                <>
                  <span className="text-lg font-bold text-gray-900">{user?.nickname}</span>
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
                </>
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
        <div className="flex items-center gap-3 mt-4">
          <button
            onClick={startEditNickname}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            프로필 수정
          </button>
          <button
            onClick={handleDeleteAccount}
            className="text-sm text-gray-400 hover:text-red-500 transition-colors"
          >
            회원 탈퇴
          </button>
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
                activeTab === key ? 'text-neutral-950 border-b-2 border-black' : 'text-gray-400'
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
            {errorPosts && <TabError onRetry={() => postsQuery.refetch()} />}
            {!loadingPosts && !errorPosts && postsData?.items.length === 0 && (
              <TabEmpty message="작성한 글이 없어요." />
            )}
            {!loadingPosts &&
              postsData?.items.map((post) => <PostCard key={post.id} post={post} />)}
            {!loadingPosts && postsData && postsData.totalPages > 1 && (
              <div className="flex items-center justify-center gap-1 py-6">
                <button
                  onClick={() => setPostsPage(postsPage - 1)}
                  disabled={postsPage === 1}
                  className="p-2 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: postsData.totalPages }, (_, i) => i + 1).map((page) => (
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
                ))}
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
            {errorComments && <TabError onRetry={() => commentsQuery.refetch()} />}
            {!loadingComments && !errorComments && commentsData?.items.length === 0 && (
              <TabEmpty message="답글 단 글이 없어요." />
            )}
            {!loadingComments &&
              commentsData?.items.map((comment) => (
                <CommentItem key={comment.commentId} comment={comment} />
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
                {Array.from({ length: commentsData.totalPages }, (_, i) => i + 1).map((page) => (
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
                ))}
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
            {errorScraps && <TabError onRetry={() => scrapsQuery.refetch()} />}
            {!loadingScraps && !errorScraps && scrapsData?.items.length === 0 && (
              <TabEmpty message="스크랩한 글이 없어요." />
            )}
            {!loadingScraps &&
              scrapsData?.items.map((scrap) => (
                <PostCard
                  key={scrap.postId}
                  post={{
                    id: scrap.postId,
                    contentPreview: scrap.contentPreview,
                    authorNickname: scrap.authorNickname,
                    therapyArea: scrap.therapyArea as PostSummary['therapyArea'],
                    viewCount: scrap.viewCount,
                    createdAt: scrap.postCreatedAt,
                  }}
                />
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
                {Array.from({ length: scrapsData.totalPages }, (_, i) => i + 1).map((page) => (
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
                ))}
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
      <p className="text-sm text-destructive mb-2">데이터를 불러오는 데 실패했습니다.</p>
      <button onClick={onRetry} className="text-sm text-gray-500 underline hover:text-gray-700">
        다시 시도
      </button>
    </div>
  );
}

function TabEmpty({ message }: { message: string }) {
  return <p className="text-sm text-gray-400 text-center py-12">{message}</p>;
}

function CommentItem({ comment }: { comment: MyComment }) {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => navigate(`/posts/${comment.postId}`)}
      className="w-full text-left px-6 py-4 border-b border-gray-200 hover:bg-gray-50 transition-colors"
    >
      <p className="text-sm text-gray-900 line-clamp-2">{comment.content}</p>
      <p className="text-xs text-gray-400 mt-1">
        {new Date(comment.createdAt).toLocaleDateString('ko-KR')}
      </p>
    </button>
  );
}
