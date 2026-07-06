import { Navigate, useNavigate } from 'react-router-dom';
import NarrowPage from '../../components/common/NarrowPage';
import PageHeader from '../../components/common/PageHeader';
import JobPostForm from '../../components/jobpost/JobPostForm';
import { useJobPostMutations } from '../../hooks/useJobPostMutations';
import { useAuthStore } from '../../stores/useAuthStore';
import type { JobPostCreatePayload } from '../../types/jobPost';

// Phase 2 구인공고 작성 페이지. /job-posts/new.
// 작성 권한 = 로그인한 모든 유저(USER/THERAPIST/ADMIN) — 버튼 노출(JobPostFeed) + 이 라우트 가드 이중.
// 비로그인만 차단(AuthRoute). 실제 권한 최종 판정은 BE POST가 소유(MSW는 정책 시뮬).
export default function JobPostCreatePage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { create } = useJobPostMutations();
  // 작성 권한 = 로그인한 모든 유저(USER/THERAPIST/ADMIN). 비로그인만 차단(AuthRoute가 이미 로그인으로 보냄).
  const canWrite =
    user?.role === 'USER' || user?.role === 'THERAPIST' || user?.role === 'ADMIN';

  // 캐시 무효화는 create mutation의 onSuccess가 담당(useJobPostMutations). 여기선 상세로 이동만.
  const handleSubmit = async (payload: JobPostCreatePayload) => {
    const created = await create.mutateAsync(payload);
    navigate(`/job-posts/${created.id}`, { state: { from: '/posts?tab=jobs' } });
  };

  // 인증 치료사 아니면 구인 탭으로 돌려보냄(비로그인은 AuthRoute가 이미 로그인으로 보냄).
  if (!canWrite) return <Navigate to="/posts?tab=jobs" replace />;

  return (
    <NarrowPage>
      <PageHeader title="구인공고 작성" backTo="/posts?tab=jobs" />
      <JobPostForm onSubmit={handleSubmit} />
    </NarrowPage>
  );
}
