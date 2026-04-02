import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Search } from 'lucide-react';
import PostCard from '../components/PostCard';
import { fetchPosts } from '../api/posts';
import type { TherapyArea, PostSummary } from '../types/post';

const FILTER_CHIPS: { value: TherapyArea | ''; label: string }[] = [
  { value: '', label: '전체' },
  { value: 'OCCUPATIONAL', label: '작업치료' },
  { value: 'SPEECH', label: '언어치료' },
  { value: 'PLAY', label: '놀이치료' },
  { value: 'COGNITIVE', label: '인지치료' },
];

export default function SearchPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [query, setQuery] = useState('');
  const [therapyArea, setTherapyArea] = useState<TherapyArea | ''>('');
  const [results, setResults] = useState<PostSummary[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function handleSearch() {
    if (!query.trim() && !therapyArea) return;
    setLoading(true);
    setSearched(true);
    try {
      const data = await fetchPosts({
        ...(therapyArea ? { therapyArea } : {}),
      });
      // 클라이언트 사이드 텍스트 필터 (백엔드 검색 API 없음)
      const filtered = query.trim()
        ? data.posts.filter(
            (p) =>
              p.contentPreview?.includes(query) ||
              p.authorNickname.includes(query),
          )
        : data.posts;
      setResults(filtered);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  // URL ?q= 파라미터로 진입 시 자동 검색
  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      setQuery(q);
      setLoading(true);
      setSearched(true);
      fetchPosts({}).then((data) => {
        const filtered = data.posts.filter(
          (p) =>
            p.contentPreview?.includes(q) ||
            p.authorNickname.includes(q),
        );
        setResults(filtered);
      }).catch(() => setResults([])).finally(() => setLoading(false));
    }
  }, [searchParams]);

  useEffect(() => {
    if (searched) handleSearch();
  }, [therapyArea]);

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

        {/* 필터 칩 */}
        <div className="flex items-center gap-2 px-4 py-2 overflow-x-auto scrollbar-hide">
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
      </div>

      {/* 검색 결과 */}
      <div className="bg-white">
        {loading && (
          <p className="text-center text-gray-400 text-sm py-12">검색 중...</p>
        )}

        {!loading && searched && results?.length === 0 && (
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
    </div>
  );
}
