import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Search } from 'lucide-react';
import PostCard from '../../components/post/PostCard';
import FilterChips from '../../components/common/FilterChips';
import { fetchPosts } from '../../api/posts';
import type { TherapyArea, PostSort, PostSummary } from '../../types/post';
import Pagination from '../../components/common/Pagination';

const SORT_OPTIONS: { value: PostSort; label: string }[] = [
  { value: 'LATEST', label: '최신순' },
  { value: 'MOST_VIEWED', label: '조회순' },
];

export default function SearchPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const inputRef = useRef<HTMLInputElement>(null);
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
    // 한글 IME 조합 완료 후 input.value가 확정되도록 다음 프레임에서 실행
    requestAnimationFrame(() => executeSearch());
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
        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-2 px-4 py-3"
        >
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
          <FilterChips value={therapyArea} onChange={setTherapyArea} />
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
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}
