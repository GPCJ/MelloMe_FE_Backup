import { useState, useEffect } from 'react';
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

export default function SearchPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [query, setQuery] = useState('');
  const [therapyArea, setTherapyArea] = useState<TherapyArea | ''>('');
  const [sortType, setSortType] = useState<PostSort>('LATEST');
  const [results, setResults] = useState<PostSummary[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  async function doSearch(page: number) {
    if (!query.trim() && !therapyArea) return;
    setLoading(true);
    setSearched(true);
    setError(null);
    try {
      const data = await fetchPosts({
        ...(therapyArea ? { therapyArea } : {}),
        ...(query.trim() ? { keyword: query.trim() } : {}),
        sortType,
        page: page - 1,
        size: 10,
      });
      setResults(data.items);
      setTotalPages(data.totalPages || 1);
      setCurrentPage(page);
    } catch {
      setResults([]);
      setError('검색 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }

  function handleSearch() {
    setCurrentPage(1);
    doSearch(1);
  }

  function handlePageChange(page: number) {
    doSearch(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // URL ?q= 파라미터로 진입 시 자동 검색
  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      setQuery(q);
      setLoading(true);
      setSearched(true);
      fetchPosts({ keyword: q, sortType, page: 0, size: 10 })
        .then((data) => {
          setResults(data.items);
          setTotalPages(data.totalPages || 1);
          setCurrentPage(1);
        })
        .catch(() => {
          setResults([]);
          setError('검색 중 오류가 발생했습니다.');
        })
        .finally(() => setLoading(false));
    }
  }, [searchParams]);

  // 필터/정렬 변경 시 재검색
  useEffect(() => {
    if (searched) doSearch(1);
  }, [therapyArea, sortType]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleSearch();
  }

  return (
    <div className="pb-20 md:pb-8">
      {/* 검색 헤더 */}
      <div className="sticky top-14 z-40 bg-white border-b border-gray-200">
        <div className="flex items-center gap-2 px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            className="p-1 text-gray-500 hover:text-gray-900 transition-colors shrink-0"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1 flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="검색어를 입력하세요"
              className="flex-1 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 outline-none"
              autoFocus
            />
            <button
              onClick={handleSearch}
              className="text-gray-500 hover:text-gray-900 transition-colors shrink-0"
            >
              <Search size={18} />
            </button>
          </div>
        </div>

        {/* 필터 칩 + 정렬 */}
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
            {FILTER_CHIPS.map((chip) => (
              <button
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
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
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
          ))}
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
