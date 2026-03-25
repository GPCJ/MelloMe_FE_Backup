import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Eye, Search, Plus, TrendingUp, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchPosts } from '../api/posts';
import type { PostSummary, TherapyArea, PaginatedPosts } from '../types/post';

const THERAPY_AREA_LABELS: Record<string, string> = {
  UNSPECIFIED: '전체',
  OCCUPATIONAL: '작업치료',
  SPEECH: '언어치료',
  COGNITIVE: '인지치료',
  PLAY: '놀이치료',
};

const FILTER_CHIPS: { value: TherapyArea | ''; label: string }[] = [
  { value: '', label: '전체' },
  { value: 'OCCUPATIONAL', label: '작업치료' },
  { value: 'SPEECH', label: '언어치료' },
  { value: 'PLAY', label: '놀이치료' },
  { value: 'COGNITIVE', label: '인지치료' },
];

function formatRelativeTime(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${Math.max(1, minutes)}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}일 전`;
  return new Date(isoString).toLocaleDateString('ko-KR');
}

function PostCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex gap-2 mb-3">
        <Skeleton className="h-5 w-14 rounded-full" />
        <Skeleton className="h-4 w-20" />
      </div>
      <Skeleton className="h-5 w-3/4 mb-2" />
      <Skeleton className="h-4 w-full mb-1" />
      <Skeleton className="h-4 w-2/3 mb-4" />
      <div className="flex justify-between">
        <div className="flex gap-3">
          <Skeleton className="h-4 w-10" />
          <Skeleton className="h-4 w-10" />
          <Skeleton className="h-4 w-10" />
        </div>
        <Skeleton className="h-4 w-12" />
      </div>
    </div>
  );
}

function PostCard({ post }: { post: PostSummary }) {
  const therapyLabel =
    post.therapyArea && post.therapyArea !== 'UNSPECIFIED'
      ? THERAPY_AREA_LABELS[post.therapyArea]
      : null;

  return (
    <Link to={`/posts/${post.id}`}>
      <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow cursor-pointer">
        {/* 작성자 정보 */}
        <div className="flex items-center gap-2 mb-2">
          {therapyLabel && (
            <Badge variant="secondary" className="text-xs font-medium">
              {therapyLabel}
            </Badge>
          )}
          <span className="text-sm text-gray-600">{post.authorNickname}</span>
        </div>

        {/* 제목 */}
        <h2 className="text-base font-semibold text-gray-900 mb-3 leading-snug">
          {post.title}
        </h2>

        {/* 통계 */}
        <div className="flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Eye size={13} /> 조회 {post.viewCount}
            </span>
          </div>
          <span>{formatRelativeTime(post.createdAt)}</span>
        </div>
      </div>
    </Link>
  );
}

export default function PostListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const therapyArea = (searchParams.get('therapyArea') as TherapyArea) ?? '';
  const currentPage = Number(searchParams.get('page') ?? '1');

  const [data, setData] = useState<PaginatedPosts | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchPosts({
      ...(therapyArea ? { therapyArea } : {}),
      page: currentPage,
    })
      .then(setData)
      .catch(() => setError('게시글을 불러오는 데 실패했습니다.'))
      .finally(() => setLoading(false));
  }, [therapyArea, currentPage]);

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

  return (
    <div className="pb-20 md:pb-8">
      {/* 배너 — 디자이너 색상 확정 전 placeholder */}
      <div className="bg-gray-200 py-10 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">멜로미 커뮤니티</h1>
          <p className="text-sm text-gray-500 mb-5">치료사들의 따뜻한 성장 공간</p>
          <div className="flex gap-3">
            <div className="flex items-center gap-1.5 bg-white/70 rounded-full px-3 py-1.5 text-sm text-gray-600">
              <TrendingUp size={14} />
              이번 주 게시글 42개
            </div>
            <div className="flex items-center gap-1.5 bg-white/70 rounded-full px-3 py-1.5 text-sm text-gray-600">
              <Heart size={14} />
              누적 공감 1,234개
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* 검색바 + 글쓰기 버튼 */}
        <div className="flex gap-2 mb-5">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="검색해보세요"
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-gray-200"
            />
          </div>
          <Link
            to="/posts/new"
            className={buttonVariants({ size: 'sm' }) + ' gap-1 shrink-0'}
          >
            <Plus size={15} />
            글쓰기
          </Link>
        </div>

        {/* 필터 칩 */}
        <div className="flex items-center gap-2 flex-wrap mb-5">
          {FILTER_CHIPS.map((chip) => (
            <button
              key={chip.value}
              onClick={() => handleFilterClick(chip.value)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                therapyArea === chip.value
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* 에러 */}
        {error && <p className="text-center text-destructive py-12">{error}</p>}

        {/* 목록 */}
        <div className="flex flex-col gap-3">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <PostCardSkeleton key={i} />)
            : data?.posts.map((post) => <PostCard key={post.id} post={post} />)}
        </div>

        {/* 빈 상태 */}
        {!loading && !error && data?.posts.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-400 mb-4">아직 게시글이 없어요.</p>
            <Link to="/posts/new" className={buttonVariants({ size: 'sm' }) + ' gap-1'}>
              <Plus size={15} />
              첫 글 작성하기
            </Link>
          </div>
        )}

        {/* 페이지네이션 */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-1 mt-8">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                  currentPage === page
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
