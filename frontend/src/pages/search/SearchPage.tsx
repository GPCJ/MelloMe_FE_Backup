import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Search } from 'lucide-react';
import PostCard from '../../components/post/PostCard';
import FilterChips from '../../components/common/FilterChips';
import { fetchPosts, fetchSearch } from '../../api/posts';
import { useInfiniteFeed } from '@/hooks/useInfiniteFeed';
import type { TherapyArea, PaginatedPosts } from '../../types/post';
import Pagination from '../../components/common/Pagination';

export default function SearchPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const inputRef = useRef<HTMLInputElement>(null);
  const [therapyArea, setTherapyArea] = useState<TherapyArea | ''>('');
  // 검색 실행 시점에 확정된 키워드. 입력 중 값이 아니라 "제출된" 값만 데이터 페치를 움직인다.
  const [submittedKeyword, setSubmittedKeyword] = useState('');
  const [searched, setSearched] = useState(false);
  // 무한스크롤(/posts/search) 호출 실패 시 offset(/posts)으로 폴백하는 스위치.
  const [feedFailed, setFeedFailed] = useState(false);

  // 모드 결정: 검색어가 있고 무한스크롤이 실패하지 않았으면 무한스크롤, 그 외엔 offset.
  // - 검색어 있음           → /posts/search (RELEVANCE, 커서, 무한스크롤)  ← 기본
  // - 검색어 있는데 실패     → /posts (sortType=RELEVANCE, offset)         ← 에러 폴백
  // - 검색어 없이 필터만     → /posts (LATEST, offset)                     ← keyword 필수라 search 불가
  const hasKeyword = submittedKeyword.trim().length > 0;
  const isInfiniteMode = hasKeyword && !feedFailed;

  // ── 무한스크롤 (검색어 모드) ────────────────────────────────
  // queryKey에 keyword/therapyArea를 넣어 검색 조건이 바뀌면 별개 캐시로 재조회.
  // fetchSearch 어댑터가 2-값 커서(score,id)를 단일 문자열로 감싸 useInfiniteFeed가 그대로 먹는다.
  const infinite = useInfiniteFeed({
    queryKey: ['post-search', { keyword: submittedKeyword, therapyArea }],
    fetchPage: ({ pageParam, signal }) =>
      fetchSearch({
        keyword: submittedKeyword,
        ...(therapyArea ? { therapyArea } : {}),
        cursor: pageParam,
        size: 10,
        signal,
      }),
    enabled: isInfiniteMode,
    onError: () => setFeedFailed(true),
  });

  // ── offset (필터-only / 무한스크롤 폴백 모드) ──────────────────
  const [offsetData, setOffsetData] = useState<PaginatedPosts | null>(null);
  const [offsetLoading, setOffsetLoading] = useState(false);
  const [offsetError, setOffsetError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (isInfiniteMode) return; // 무한스크롤이 담당
    // 초기 마운트 보호: 검색어/필터 둘 다 없고 검색 이력도 없으면 호출 생략.
    if (!hasKeyword && !therapyArea && !searched) return;
    setOffsetLoading(true);
    setOffsetError(null);
    fetchPosts({
      ...(therapyArea ? { therapyArea } : {}),
      ...(hasKeyword ? { keyword: submittedKeyword } : {}),
      // 검색어가 있는 폴백 경로는 관련도순, 필터-only는 최신순.
      sortType: hasKeyword ? 'RELEVANCE' : 'LATEST',
      page: currentPage - 1,
      size: 10,
    })
      .then(setOffsetData)
      .catch(() => {
        setOffsetData(null);
        setOffsetError('검색 중 오류가 발생했습니다.');
      })
      .finally(() => setOffsetLoading(false));
  }, [isInfiniteMode, hasKeyword, submittedKeyword, therapyArea, currentPage, searched]);

  // ── 무한스크롤 sentinel ──────────────────────────────────────
  const { loadMore } = infinite;
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!isInfiniteMode) return;
    const node = sentinelRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore();
      },
      { rootMargin: '200px' },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [isInfiniteMode, loadMore]);

  // ── 검색 실행 ────────────────────────────────────────────────
  function executeSearch() {
    const value = inputRef.current?.value.trim() ?? '';
    setSubmittedKeyword(value);
    setFeedFailed(false); // 새 검색마다 폴백 스위치 리셋
    setCurrentPage(1);
    setSearched(true);
    setSearchParams(value ? { q: value } : {});
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // 한글 IME 조합 완료 후 input.value가 확정되도록 다음 프레임에서 실행
    requestAnimationFrame(() => executeSearch());
  }

  function handleTherapyAreaChange(value: TherapyArea | '') {
    setTherapyArea(value);
    setFeedFailed(false);
    setCurrentPage(1);
    setSearched(true);
  }

  function handlePageChange(page: number) {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // URL ?q= 파라미터로 진입 시 자동 검색
  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      if (inputRef.current) inputRef.current.value = q;
      setSubmittedKeyword(q);
      setSearched(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── 표시용 통합 변수 (모드별 소스 선택) ────────────────────────
  const items = isInfiniteMode ? infinite.items : offsetData?.items ?? [];
  const loading = isInfiniteMode ? infinite.isLoading : offsetLoading;
  const error = isInfiniteMode ? infinite.error : offsetError;

  return (
    <div className="max-w-3xl mx-auto pb-20 md:pb-8">
      {/* 검색 헤더 */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <form onSubmit={handleSubmit} className="flex items-center h-14 pr-4">
          <button
            type="button"
            onClick={() => navigate('/posts')}
            className="flex items-center justify-center px-4 h-full text-gray-700 hover:text-gray-900 transition-colors shrink-0"
            aria-label="뒤로가기"
          >
            <ArrowLeft size={24} />
          </button>
          <div className="flex-1 flex items-center bg-[#f3f3f5] rounded-full pl-4 pr-1 h-9">
            <input
              ref={inputRef}
              type="text"
              name="keyword"
              defaultValue={searchParams.get('q') ?? ''}
              placeholder="검색어를 입력하세요"
              className="flex-1 min-w-0 bg-transparent text-[13px] text-gray-900 placeholder:text-[#99a1af] outline-none"
              autoFocus
            />
            <button
              type="submit"
              className="flex items-center justify-center w-10 h-9 text-gray-700 hover:text-gray-900 transition-colors shrink-0"
              aria-label="검색"
            >
              <Search size={18} />
            </button>
          </div>
        </form>

        {/* 카테고리 필터 칩 */}
        <div className="px-4 pt-2 pb-4">
          <FilterChips value={therapyArea} onChange={handleTherapyAreaChange} />
        </div>
      </div>

      {/* 검색 결과 */}
      <div className="bg-white">
        {loading && <p className="text-center text-gray-400 text-sm py-12">검색 중...</p>}

        {!loading && error && <p className="text-center text-red-500 text-sm py-12">{error}</p>}

        {!loading && !error && searched && items.length === 0 && (
          <p className="text-center text-gray-400 text-sm py-12">검색 결과가 없습니다</p>
        )}

        {!loading && items.map((post) => <PostCard key={post.id} post={post} />)}

        {!searched && !loading && (
          <p className="text-[#6d7685] text-lg font-bold p-6">시그널을 찾아보세요!</p>
        )}
      </div>

      {/* 무한스크롤 모드: sentinel + 추가 로딩 표시 */}
      {isInfiniteMode && (
        <>
          <div ref={sentinelRef} aria-hidden className="h-1" />
          {infinite.isFetchingMore && (
            <p className="text-center text-gray-400 text-sm py-6">더 불러오는 중...</p>
          )}
        </>
      )}

      {/* offset 모드: 페이지네이션 */}
      {!isInfiniteMode && searched && !loading && (offsetData?.totalPages ?? 1) > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={offsetData?.totalPages ?? 1}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}
