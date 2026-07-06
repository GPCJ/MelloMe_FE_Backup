import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import FilterChips from '../common/FilterChips';
import JobPostCard from './JobPostCard';
import { useInfiniteJobPosts } from '../../hooks/useInfiniteJobPosts';
import { REGION_FILTER_OPTIONS, EMPLOYMENT_FILTER_OPTIONS } from '../../constants/jobPost';
import { useAuthStore } from '../../stores/useAuthStore';
import type { TherapyArea } from '../../types/post';
import type { EmploymentType, JobRegion } from '../../types/jobPost';

// 홈피드 "구인" 탭 본문. PostListPage의 PostSummary 머신과 격리 — 자체 데이터/필터/카드 소유.
// 필터는 로컬 state(Phase 1). 뒤로가기 시 필터 복원은 미지원(범위 밖).
export default function JobPostFeed() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  // 작성 진입은 인증 치료사(THERAPIST/ADMIN)만 — ProfilePage:157의 isVerified 컨벤션 재사용.
  // 일반 USER/비로그인은 버튼 미노출. (2026-07-06 결정: 인증 치료사 자유 작성)
  const canWrite = user?.role === 'THERAPIST' || user?.role === 'ADMIN';

  const [therapyArea, setTherapyArea] = useState<TherapyArea | ''>('');
  const [region, setRegion] = useState<JobRegion | ''>('');
  const [employmentType, setEmploymentType] = useState<EmploymentType | ''>('');
  const [openOnly, setOpenOnly] = useState(true);

  const feed = useInfiniteJobPosts({
    status: openOnly ? 'OPEN' : undefined,
    therapyArea: therapyArea || undefined,
    region: region || undefined,
    employmentType: employmentType || undefined,
  });

  const sentinelRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) feed.loadMore();
      },
      { rootMargin: '200px' },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [feed.loadMore]);

  const selectClass =
    'flex-1 min-w-0 rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-xs text-gray-700';

  return (
    <div className="bg-white">
      {/* 작성 진입 — 인증 치료사만 노출 */}
      {canWrite && (
        <div className="flex justify-end px-4 pt-3">
          <button
            type="button"
            onClick={() => navigate('/job-posts/new')}
            className="flex items-center gap-1 rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-black"
          >
            <Plus size={14} />
            구인공고 작성
          </button>
        </div>
      )}

      {/* 필터 */}
      <div className="p-4 border-b border-gray-200 space-y-3">
        <FilterChips value={therapyArea} onChange={setTherapyArea} />
        <div className="flex items-center gap-2">
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value as JobRegion | '')}
            className={selectClass}
          >
            {REGION_FILTER_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <select
            value={employmentType}
            onChange={(e) => setEmploymentType(e.target.value as EmploymentType | '')}
            className={selectClass}
          >
            {EMPLOYMENT_FILTER_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setOpenOnly((v) => !v)}
            className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
              openOnly
                ? 'bg-gray-900 text-white border-gray-900'
                : 'text-gray-500 border-gray-300 hover:border-gray-400'
            }`}
          >
            모집중만
          </button>
        </div>
      </div>

      {/* 목록 */}
      {feed.isLoading
        ? Array.from({ length: 4 }).map((_, i) => <JobPostCardSkeleton key={i} />)
        : feed.items.map((job) => (
            <JobPostCard key={job.id} job={job} backTo="/posts?tab=jobs" />
          ))}

      {feed.isFetchingMore &&
        Array.from({ length: 2 }).map((_, i) => <JobPostCardSkeleton key={`more-${i}`} />)}

      {feed.error && (
        <div className="flex flex-col items-center gap-3 py-8">
          <p className="text-sm text-destructive">{feed.error}</p>
          <button
            onClick={feed.retry}
            className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            재시도
          </button>
        </div>
      )}

      {!feed.isLoading && !feed.error && feed.items.length === 0 && (
        <div className="text-center py-16">
          <p className="text-gray-400">조건에 맞는 구인공고가 없어요.</p>
        </div>
      )}

      {!feed.isLoading && !feed.hasNext && feed.items.length > 0 && (
        <p className="text-center text-sm text-gray-400 py-8">마지막 공고예요</p>
      )}

      <div ref={sentinelRef} aria-hidden className="h-1" />
    </div>
  );
}

function JobPostCardSkeleton() {
  return (
    <div className="px-6 py-5 border-b border-gray-200 animate-pulse">
      <div className="h-4 w-16 bg-gray-100 rounded-full mb-2" />
      <div className="h-5 w-2/3 bg-gray-100 rounded mb-2" />
      <div className="h-4 w-1/2 bg-gray-100 rounded mb-3" />
      <div className="flex gap-1.5">
        <div className="h-5 w-14 bg-gray-100 rounded-full" />
        <div className="h-5 w-14 bg-gray-100 rounded-full" />
        <div className="h-5 w-14 bg-gray-100 rounded-full" />
      </div>
    </div>
  );
}
