import { useEffect, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { isAxiosError } from 'axios';
import { Plus, PenSquare, Search } from 'lucide-react';
import { buttonVariants } from '@/components/shadcn-ui/button';
import { Skeleton } from '@/components/shadcn-ui/skeleton';
import { fetchPosts } from '../../api/posts';
import type { TherapyArea, PaginatedPosts } from '../../types/post';
import PostCard from '../../components/post/PostCard';
import FilterChips from '../../components/common/FilterChips';
import Pagination from '../../components/common/Pagination';

type FeedTab = 'all' | 'following';

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
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const therapyArea = (searchParams.get('therapyArea') as TherapyArea) ?? '';
  const currentPage = Number(searchParams.get('page') ?? '1');

  const [activeTab, setActiveTab] = useState<FeedTab>('all');
  const [data, setData] = useState<PaginatedPosts | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const VALID_THERAPY_AREAS: (TherapyArea | '')[] = [
    '',
    'OCCUPATIONAL',
    'SPEECH',
    'PLAY',
    'COGNITIVE',
    'UNSPECIFIED',
  ];

  useEffect(() => {
    if (therapyArea && !VALID_THERAPY_AREAS.includes(therapyArea)) {
      setSearchParams({});
      return;
    }
  }, [therapyArea]);

  useEffect(() => {
    if (activeTab !== 'all') return;
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
  }, [therapyArea, currentPage, activeTab]);

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
      {/* 데스크탑 검색바 + 글쓰기 버튼 */}
      <div className="hidden md:flex items-center gap-2 px-4 py-3 border-b border-gray-200 bg-white">
        <div className="flex-1 flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-1.5">
          <Search size={16} className="text-gray-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && searchQuery.trim()) {
                navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
                setSearchQuery('');
              }
            }}
            placeholder="검색"
            className="bg-transparent text-sm text-gray-900 placeholder:text-gray-400 outline-none w-full"
          />
        </div>
        <button
          onClick={() => navigate('/posts/new')}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors shrink-0"
        >
          <PenSquare size={16} />
          글쓰기
        </button>
      </div>

      {/* 탭 */}
      <div className="sticky top-14 z-40 bg-white">
        <div className="flex">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 py-2 text-xs font-medium text-center transition-colors ${
              activeTab === 'all'
                ? 'text-neutral-950 border-b-2 border-black'
                : 'text-gray-400 border-b border-gray-200'
            }`}
          >
            전체 피드
          </button>
          <button
            onClick={() => setActiveTab('following')}
            className={`flex-1 py-2 text-xs font-medium text-center transition-colors ${
              activeTab === 'following'
                ? 'text-neutral-950 border-b-2 border-black'
                : 'text-gray-400 border-b border-gray-200'
            }`}
          >
            팔로우
          </button>
        </div>
      </div>

      {/* 필터 칩 */}
      <div className="p-4 border-b border-gray-200">
        <FilterChips value={therapyArea} onChange={handleFilterClick} />
      </div>

      {/* 피드 콘텐츠 */}
      {activeTab === 'all' ? (
        <div className="bg-white">
          {error && (
            <p
              className={`text-center py-12 ${error === '공개 게시물이 없습니다.' ? 'text-gray-400' : 'text-destructive'}`}
            >
              {error}
            </p>
          )}

          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <PostCardSkeleton key={i} />
              ))
            : data?.items.map((post) => <PostCard key={post.id} post={post} />)}

          {!loading && !error && data?.items.length === 0 && (
            <div className="text-center py-16">
              <p className="text-gray-400 mb-4">아직 게시글이 없어요.</p>
              <Link
                to="/posts/new"
                className={buttonVariants({ size: 'sm' }) + ' gap-1'}
              >
                <Plus size={15} />첫 글 작성하기
              </Link>
            </div>
          )}

          {!loading && totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-gray-400 text-sm">
            팔로우한 치료사의 글이 여기에 표시됩니다.
          </p>
        </div>
      )}
    </div>
  );
}
