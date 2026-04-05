import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import PostCard from '../components/PostCard';
import { fetchPosts } from '../api/posts';
import type { TherapyArea, PostSort, PostSummary } from '../types/post';

const FILTER_CHIPS: { value: TherapyArea | ''; label: string }[] = [
  { value: '', label: '전체' },
  { value: 'OCCUPATIONAL', label: '작업치료' },
  { value: 'SPEECH', label: '언어치료' },
  { value: 'PLAY', label: '놀이치료' },
  { value: 'COGNITIVE', label: '인지치료' },
];

const SORT_OPTIONS: { value: PostSort; label: string }[] = [
  { value: 'LATEST', label: '최신순' },
  { value: 'MOST_VIEWED', label: '조회순' },
];

function getPageNumbers(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | '...')[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) pages.push('...');
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < total - 1) pages.push('...');
  pages.push(total);
  return pages;
}

export default function SearchPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const inputRef = useRef<HTMLInputElement>(null);
  const isComposingRef = useRef(false);
  const pendingSubmitRef = useRef(false);
  const [therapyArea, setTherapyArea] = useState<TherapyArea | ''>('');
  const [sortType, setSortType] = useState<PostSort>('LATEST');
  const [results, setResults] = useState<PostSummary[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // 현재 검색 키워드 (검색 실행 시점에 확정된 값)
  const keywordRef = useRef('');

  async function doSearch(keyword: string, page: number) {
    if (!keyword && !therapyArea) return;
    setLoading(true);
    setSearched(true);
    setError(null);
    try {
      const data = await fetchPosts({
        ...(therapyArea ? { therapyArea } : {}),
        ...(keyword ? { keyword } : {}),
        sortType,
        page: page - 1,
        size: 10,
      });
      setResults(data.items ?? []);
      setTotalPages(data.totalPages ?? 1);
      setCurrentPage(page);
    } catch {
      setResults([]);
      setError('검색 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }

  function executeSearch() {
    const value = inputRef.current?.value.trim() ?? '';
    keywordRef.current = value;
    if (value) {
      setSearchParams({ q: value });
    }
    setCurrentPage(1);
    doSearch(value, 1);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isComposingRef.current) {
      // 조합 중이면 submit 보류 → compositionEnd에서 실행
      pendingSubmitRef.current = true;
      return;
    }
    executeSearch();
  }

  function handleCompositionEnd() {
    isComposingRef.current = false;
    if (pendingSubmitRef.current) {
      pendingSubmitRef.current = false;
      // compositionend 후 input.value가 확정되도록 다음 틱에서 실행
      requestAnimationFrame(() => executeSearch());
    }
  }

  function handlePageChange(page: number) {
    doSearch(keywordRef.current, page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // URL ?q= 파라미터로 진입 시 자동 검색
  useEffect(() => {
    const q = searchParams.get('q');
    if (q && inputRef.current) {
      inputRef.current.value = q;
      keywordRef.current = q;
      doSearch(q, 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 필터/정렬 변경 시 재검색
  useEffect(() => {
    if (searched) doSearch(keywordRef.current, 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [therapyArea, sortType]);

  return (
    <div className="pb-20 md:pb-8">
      {/* 검색 헤더 */}
      <div className="sticky top-14 z-40 bg-white border-b border-gray-200">
        <form onSubmit={handleSubmit} className="flex items-center gap-2 px-4 py-3">
          <button
            type="button"
            onClick={() => navigate('/posts')}
            className="p-1 text-gray-500 hover:text-gray-900 transition-colors shrink-0"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1 flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
            <input
              ref={inputRef}
              type="text"
              name="keyword"
              defaultValue={searchParams.get('q') ?? ''}
              onCompositionStart={() => { isComposingRef.current = true; }}
              onCompositionEnd={handleCompositionEnd}
              placeholder="검색어를 입력하세요"
              className="flex-1 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 outline-none"
              autoFocus
            />
            <button
              type="submit"
              className="text-gray-500 hover:text-gray-900 transition-colors shrink-0"
            >
              <Search size={18} />
            </button>
          </div>
        </form>

        {/* 필터 칩 + 정렬 */}
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
            {FILTER_CHIPS.map((chip) => (
              <button
                type="button"
                key={chip.value}
                onClick={() => setTherapyArea(chip.value)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  therapyArea === chip.value
                    ? 'bg-gray-900 text-white'
                    : 'bg-white text-neutral-950 border border-gray-200'
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>
          <select
            value={sortType}
            onChange={(e) => setSortType(e.target.value as PostSort)}
            className="shrink-0 ml-2 text-xs text-gray-600 border border-gray-200 rounded-md px-2 py-1.5 bg-white"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 검색 결과 */}
      <div className="bg-white">
        {loading && (
          <p className="text-center text-gray-400 text-sm py-12">검색 중...</p>
        )}

        {!loading && error && (
          <p className="text-center text-red-500 text-sm py-12">{error}</p>
        )}

        {!loading && !error && searched && results?.length === 0 && (
          <p className="text-center text-gray-400 text-sm py-12">
            검색 결과가 없습니다
          </p>
        )}

        {!loading &&
          results?.map((post) => <PostCard key={post.id} post={post} />)}

        {!searched && !loading && (
          <p className="text-center text-gray-400 text-sm py-12">
            검색어를 입력하고 돋보기 버튼을 눌러주세요
          </p>
        )}
      </div>

      {/* 페이지네이션 */}
      {searched && !loading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 py-6">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="p-1 text-gray-400 disabled:opacity-30"
          >
            <ChevronLeft size={18} />
          </button>
          {getPageNumbers(currentPage, totalPages).map((page, idx) =>
            page === '...' ? (
              <span key={`ellipsis-${idx}`} className="w-8 text-center text-gray-400 text-sm">
                ...
              </span>
            ) : (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`w-8 h-8 rounded-full text-sm ${
                  page === currentPage
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {page}
              </button>
            ),
          )}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="p-1 text-gray-400 disabled:opacity-30"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
