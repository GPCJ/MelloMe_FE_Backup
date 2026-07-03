import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import NarrowPage from '../../components/common/NarrowPage';
import PageHeader from '../../components/common/PageHeader';
import JobPostForm from '../../components/jobpost/JobPostForm';

// Phase 2 구인공고 작성 페이지. 숨긴 라우트(/job-posts/new) — 진입 버튼은 아직 노출 안 함(스테이징 검증용).
// ADMIN 전용 작성 게이트는 보류(2026-07-03 결정): 이용자 소수라 우선순위 낮음.
export default function JobPostCreatePage() {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const handleSuccess = (id: number) => {
    // 목록 캐시를 stale 처리 → 새 공고가 피드 상단에 반영되게. 이후 작성한 공고 상세로 이동.
    qc.invalidateQueries({ queryKey: ['job-posts'] });
    navigate(`/job-posts/${id}`, { state: { from: '/posts?tab=jobs' } });
  };

  return (
    <NarrowPage>
      <PageHeader title="구인공고 작성" backTo="/posts?tab=jobs" />
      <JobPostForm onSuccess={handleSuccess} />
    </NarrowPage>
  );
}
