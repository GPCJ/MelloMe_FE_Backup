import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Search } from 'lucide-react';
import PostCard from '../../components/post/PostCard';
import FilterChips from '../../components/common/FilterChips';
import { fetchPosts } from '../../api/posts';
import type { TherapyArea, PostSort, PostSummary } from '../../types/post';
import Pagination from '../../components/common/Pagination';

export default function SearchPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const inputRef = useRef<HTMLInputElement>(null);
  const [therapyArea, setTherapyArea] = useState<TherapyArea | ''>('');
  const sortType: PostSort = 'LATEST';
  const [results, setResults] = useState<PostSummary[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // 현재 검색 키워드 (검색 실행 시점에 확정된 값)
  const keywordRef = useRef('');

  async function doSearch(keyword: string, page: number) {
    // 초기 마운트 보호: 검색어/필터 둘 다 비어있고 아직 검색 이력 없으면 호출 생략.
    // 첫 검색 후에는 "전체"(therapyArea='') 리셋도 정상 재조회되도록 허용.
    if (!keyword && !therapyArea && !searched) return;
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

  // 필터 변경 시 검색 실행 (검색어 없어도 필터만으로 트리거)
  // 초기 마운트는 doSearch 가드에서 흡수.
  useEffect(() => {
    doSearch(keywordRef.current, 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [therapyArea]);

  return (
    <div className="pb-20 md:pb-8">
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
              placeholder="발음"
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
          <FilterChips value={therapyArea} onChange={setTherapyArea} />
        </div>
      </div>

      {/* 검색 결과 */}
      <div className="bg-white">
        {loading && <p className="text-center text-gray-400 text-sm py-12">검색 중...</p>}

        {!loading && error && <p className="text-center text-red-500 text-sm py-12">{error}</p>}

        {!loading && !error && searched && results?.length === 0 && (
          <p className="text-center text-gray-400 text-sm py-12">검색 결과가 없습니다</p>
        )}

        {!loading && results?.map((post) => <PostCard key={post.id} post={post} />)}

        {!searched && !loading && (
          <p className="text-[#6d7685] text-lg font-bold p-6">
            시그널을 찾아보세요!
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
