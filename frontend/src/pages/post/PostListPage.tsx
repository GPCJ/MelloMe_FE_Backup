import { useEffect, useRef, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { isAxiosError } from 'axios';
import { Plus, Menu } from 'lucide-react';
import { buttonVariants } from '@/components/shadcn-ui/button';
import { Skeleton } from '@/components/shadcn-ui/skeleton';
import { fetchPosts, fetchFeed } from '../../api/posts';
import type { TherapyArea, PaginatedPosts, PostReaction } from '../../types/post';
import { FILTER_CHIPS } from '../../constants/post';
import WelcomeModal from '@/components/auth/WelcomeModal';
import PostCard from '../../components/post/PostCard';
import FilterChips from '../../components/common/FilterChips';
import PageHeader from '@/components/common/PageHeader';
import UserMenu from '@/components/layout/UserMenu';
import Pagination from '../../components/common/Pagination';
import { useInfiniteFeed } from '@/hooks/useInfiniteFeed';
import { useFeedScrollStore } from '@/stores/feedScrollStore';
import { usePostWriteModalStore } from '@/stores/postWriteModalStore';
import { useScreenExit } from '@/hooks/useScreenExit';
import { useWelcomeModal } from '@/hooks/useWelcomeModal';
import { useQueryClient, type InfiniteData } from '@tanstack/react-query';

type FeedSort = 'LATEST' | 'POPULAR';

function PostCardSkeleton() {
  return (
    <div className="px-6 py-5 border-b border-gray-200">
      <div className="flex items-center gap-2 mb-3">
        <Skeleton className="w-5 h-5 rounded-full" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-10" />
      </div>
      <div className="flex gap-2 mb-3">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-14 rounded-full" />
      </div>
      <Skeleton className="h-4 w-full mb-1.5" />
      <Skeleton className="h-4 w-3/4 mb-3" />
      <div className="flex gap-3">
        <Skeleton className="h-4 w-10" />
        <Skeleton className="h-4 w-10" />
      </div>
    </div>
  );
}

export default function PostListPage() {
  // 체류 시간 측정 — PM 정식 스펙 부가 KPI(피드 체류).
  useScreenExit('feed');

  const welcome = useWelcomeModal();
  const navigate = useNavigate();
  const openWriteModal = usePostWriteModalStore((s) => s.openModal);

  const [searchParams, setSearchParams] = useSearchParams();
  const therapyArea = (searchParams.get('therapyArea') as TherapyArea) ?? '';
  const currentPage = Number(searchParams.get('page') ?? '1');

  // 단일 전체 피드 — 팔로우/구인 탭 제거됨.
  const activeTab = 'all' as const;
  const [data, setData] = useState<PaginatedPosts | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedFailed, setFeedFailed] = useState(false);

  const isInfiniteMode = !therapyArea && activeTab === 'all' && !feedFailed;

  const consumeSnapshot = useFeedScrollStore((s) => s.consume);
  const saveSnapshot = useFeedScrollStore((s) => s.save);
  function pickInitialSnapshot() {
    const snap = consumeSnapshot();
    if (!snap) return null;
    if (snap.tab === 'all' && isInfiniteMode) return snap;
    return null;
  }
  const initialSnapshotRef = useRef(pickInitialSnapshot());

  // 뒤로가기 복원 시 snapshot에 저장된 sort를 초기값으로 사용.
  const [sort, setSort] = useState<FeedSort>(initialSnapshotRef.current?.sort ?? 'LATEST');

  const qc = useQueryClient();

  const infinite = useInfiniteFeed({
    queryKey: ['feed', { size: 20, sort }],
    fetchPage: ({ pageParam, signal }) =>
      fetchFeed({ size: 20, sort, ...(pageParam ? { cursor: pageParam } : {}), signal }),
    enabled: isInfiniteMode,
    initialSnapshot: initialSnapshotRef.current?.tab === 'all'
      ? {
          items: initialSnapshotRef.current.items,
          nextCursor: initialSnapshotRef.current.nextCursor,
          hasNext: initialSnapshotRef.current.hasNext,
        }
      : undefined,
    onError: () => setFeedFailed(true),
  });

  useEffect(() => {
    // pickInitialSnapshot이 "지금 전체 피드에 유효한 스냅샷"일 때만 ref를 채우므로
    // (아니면 null) snap 존재 여부만으로 복원을 게이트한다.
    const snap = initialSnapshotRef.current;
    if (!snap) return;
    requestAnimationFrame(() => {
      window.scrollTo({
        top: snap.scrollY,
        behavior: 'instant' as ScrollBehavior,
      });
    });
  }, []);

  const VALID_THERAPY_AREAS: (TherapyArea | '')[] = FILTER_CHIPS.map((chip) => chip.value);

  useEffect(() => {
    if (therapyArea && !VALID_THERAPY_AREAS.includes(therapyArea)) {
      setSearchParams({});
      return;
    }
  }, [therapyArea]);

  useEffect(() => {
    if (activeTab !== 'all') return;
    if (isInfiniteMode) return;
    if (therapyArea && !VALID_THERAPY_AREAS.includes(therapyArea)) return;
    setLoading(true);
    setError(null);
    fetchPosts({
      ...(therapyArea ? { therapyArea } : {}),
      page: currentPage - 1,
    })
      .then(setData)
      .catch((err) => {
        if (isAxiosError(err) && err.response?.status === 403) {
          setData({
            items: [],
            page: 0,
            size: 0,
            totalPages: 0,
            totalElements: 0,
            hasNext: false,
          });
          setError('공개 게시물이 없습니다.');
          return;
        }
        setError('게시글을 불러오는 데 실패했습니다.');
      })
      .finally(() => setLoading(false));
  }, [therapyArea, currentPage, activeTab, isInfiniteMode]);

  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isInfiniteMode) return;
    const node = sentinelRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          infinite.loadMore();
        }
      },
      { rootMargin: '200px' },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [isInfiniteMode, infinite.loadMore]);

  function handleCardClick() {
    if (!isInfiniteMode) return;
    saveSnapshot({
      items: infinite.items,
      nextCursor: infinite.nextCursor,
      hasNext: infinite.hasNext,
      scrollY: window.scrollY,
      sort,
      tab: 'all',
    });
  }

  function handleSortChange(next: FeedSort) {
    if (next === sort) return;
    setSort(next);
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }

  function handleFilterClick(value: TherapyArea | '') {
    setSearchParams(value ? { therapyArea: value } : {});
  }

  function handlePageChange(page: number) {
    const params: Record<string, string> = { page: String(page) };
    if (therapyArea) params.therapyArea = therapyArea;
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const totalPages = data?.totalPages ?? 1;

  function handleReactionUpdated(fresh: PostReaction) {
    const patch = (old: InfiniteData<PaginatedPosts> | undefined) => {
      if (!old) return old;
      return {
        ...old,
        pages: old.pages.map((page: PaginatedPosts) => ({
          ...page,
          items: page.items.map((item: PaginatedPosts['items'][number]) =>
            item.id === fresh.postId
              ? {
                  ...item,
                  likeCount: fresh.likeCount,
                  curiousCount: fresh.curiousCount,
                  usefulCount: fresh.usefulCount,
                  myReactionType: fresh.myReactionType,
                }
              : item,
          ),
        })),
      };
    };
    // 전체 피드(['feed']) 캐시 패치.
    qc.setQueriesData<InfiniteData<PaginatedPosts>>({ queryKey: ['feed'] }, patch);
  }

  // 빈 상태 CTA — PC는 모달, 모바일은 라우트 이동.
  function handleWriteClick() {
    if (window.matchMedia('(min-width: 768px)').matches) openWriteModal();
    else navigate('/posts/new');
  }

  return (
    <div className="max-w-3xl mx-auto pb-20 md:pb-8">
      {/* 회원가입 환영 모달(useWelcomeModal훅의 함수와 state를 import해서 상속중) */}
      <WelcomeModal open={welcome.open} onClose={welcome.onClose} onVerify={welcome.onVerify} />
      {/* 모바일 상단 헤더 */}
      <PageHeader
        title={<span className="text-2xl font-bold text-gray-900">Mellti</span>}
        leftAction={
          <div className="md:hidden">
            <UserMenu
              side="bottom"
              align="start"
              sideOffset={8}
              className="flex h-full items-center justify-center px-4 text-gray-900 hover:bg-gray-50 transition-colors"
              ariaLabel="메뉴"
            >
              <Menu size={24} />
            </UserMenu>
          </div>
        }
      />

      {/* 필터 칩 */}
      <div className="p-4 bg-white border-b border-gray-200">
        <FilterChips value={therapyArea} onChange={handleFilterClick} />
      </div>

      {/* 정렬 전환 — 무한스크롤 모드(전체 피드 + 필터 없음)에서만 노출 */}
      {isInfiniteMode && (
        <div className="flex px-4 py-2 gap-2 border-b border-gray-200 bg-white">
          <button
            onClick={() => handleSortChange('LATEST')}
            className={`text-xs px-3 py-1 rounded-full border transition-colors ${
              sort === 'LATEST'
                ? 'bg-gray-900 text-white border-gray-900'
                : 'text-gray-500 border-gray-300 hover:border-gray-400'
            }`}
          >
            최신순
          </button>
          <button
            onClick={() => handleSortChange('POPULAR')}
            className={`text-xs px-3 py-1 rounded-full border transition-colors ${
              sort === 'POPULAR'
                ? 'bg-gray-900 text-white border-gray-900'
                : 'text-gray-500 border-gray-300 hover:border-gray-400'
            }`}
          >
            인기순
          </button>
        </div>
      )}

      {/* 피드 콘텐츠 */}
      <div className="bg-white">
          {isInfiniteMode ? (
            <>
              {infinite.isLoading
                ? Array.from({ length: 4 }).map((_, i) => <PostCardSkeleton key={i} />)
                : infinite.items.map((post) => (
                    <div key={post.id} onClickCapture={handleCardClick}>
                      <PostCard post={post} onReactionUpdated={handleReactionUpdated} />
                    </div>
                  ))}

              {infinite.isFetchingMore &&
                Array.from({ length: 2 }).map((_, i) => <PostCardSkeleton key={`more-${i}`} />)}

              {infinite.error && (
                <div className="flex flex-col items-center gap-3 py-8">
                  <p className="text-sm text-destructive">{infinite.error}</p>
                  <button
                    onClick={infinite.retry}
                    className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    재시도
                  </button>
                </div>
              )}

              {!infinite.isLoading && !infinite.error && infinite.items.length === 0 && (
                <div className="text-center py-16">
                  <p className="text-gray-400 mb-4">아직 게시글이 없어요.</p>
                  <button
                    type="button"
                    onClick={handleWriteClick}
                    className={buttonVariants({ size: 'sm' }) + ' gap-1'}
                  >
                    <Plus size={15} />첫 글 작성하기
                  </button>
                </div>
              )}

              {!infinite.isLoading && !infinite.hasNext && infinite.items.length > 0 && (
                <p className="text-center text-sm text-gray-400 py-8">마지막 글이에요</p>
              )}

              <div ref={sentinelRef} aria-hidden className="h-1" />
            </>
          ) : (
            <>
              {feedFailed && (
                <div className="bg-gray-50 border-y border-gray-200 px-4 py-2.5">
                  <p className="text-center text-xs text-gray-500">
                    최신 피드를 불러오지 못해 페이지 모드로 전환했어요
                  </p>
                </div>
              )}

              {error && (
                <p
                  className={`text-center py-12 ${error === '공개 게시물이 없습니다.' ? 'text-gray-400' : 'text-destructive'}`}
                >
                  {error}
                </p>
              )}

              {loading
                ? Array.from({ length: 4 }).map((_, i) => <PostCardSkeleton key={i} />)
                : data?.items.map((post) => (
                    <PostCard key={post.id} post={post} onReactionUpdated={handleReactionUpdated} />
                  ))}

              {!loading && !error && data?.items.length === 0 && (
                <div className="text-center py-16">
                  <p className="text-gray-400 mb-4">아직 게시글이 없어요.</p>
                  <button
                    type="button"
                    onClick={handleWriteClick}
                    className={buttonVariants({ size: 'sm' }) + ' gap-1'}
                  >
                    <Plus size={15} />첫 글 작성하기
                  </button>
                </div>
              )}

              {!loading && totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              )}
            </>
          )}
        </div>
    </div>
  );
}
