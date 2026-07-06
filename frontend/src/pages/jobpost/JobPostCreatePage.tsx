import { useNavigate } from 'react-router-dom';
import NarrowPage from '../../components/common/NarrowPage';
import PageHeader from '../../components/common/PageHeader';
import JobPostForm from '../../components/jobpost/JobPostForm';
import { useJobPostMutations } from '../../hooks/useJobPostMutations';
import type { JobPostCreatePayload } from '../../types/jobPost';

// Phase 2 구인공고 작성 페이지. 숨긴 라우트(/job-posts/new) — 진입 버튼은 아직 노출 안 함(스테이징 검증용).
// ADMIN 전용 작성 게이트는 보류(2026-07-03 결정): 이용자 소수라 우선순위 낮음.
export default function JobPostCreatePage() {
  const navigate = useNavigate();
  const { create } = useJobPostMutations();

  // 캐시 무효화는 create mutation의 onSuccess가 담당(useJobPostMutations). 여기선 상세로 이동만.
  const handleSubmit = async (payload: JobPostCreatePayload) => {
    const created = await create.mutateAsync(payload);
    navigate(`/job-posts/${created.id}`, { state: { from: '/posts?tab=jobs' } });
  };

  return (
    <NarrowPage>
      <PageHeader title="구인공고 작성" backTo="/posts?tab=jobs" />
      <JobPostForm onSubmit={handleSubmit} />
    </NarrowPage>
  );
}
