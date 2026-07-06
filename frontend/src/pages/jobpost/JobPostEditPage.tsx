import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import NarrowPage from '../../components/common/NarrowPage';
import PageHeader from '../../components/common/PageHeader';
import JobPostForm from '../../components/jobpost/JobPostForm';
import { useJobPostMutations } from '../../hooks/useJobPostMutations';
import { fetchJobPostDetail } from '../../api/jobPosts';
import { jobPostToFormValues } from '../../utils/jobPost';
import type { JobPostCreatePayload } from '../../types/jobPost';

// Phase 2 구인공고 수정 페이지 — /job-posts/:jobPostId/edit.
// 상세를 먼저 불러와 폼에 prefill한 뒤, 제출 시 update mutation으로 저장하고 상세로 복귀.
export default function JobPostEditPage() {
  const { jobPostId } = useParams();
  const navigate = useNavigate();
  const { update } = useJobPostMutations();
  const id = Number(jobPostId);

  const {
    data: job,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['job-post', id],
    queryFn: ({ signal }) => fetchJobPostDetail(id, signal),
    enabled: !Number.isNaN(id),
  });

  // 캐시 무효화(목록 + 이 상세)는 update mutation onSuccess가 담당. 여기선 상세로 이동만.
  const handleSubmit = async (payload: JobPostCreatePayload) => {
    await update.mutateAsync({ id, payload });
    navigate(`/job-posts/${id}`, { state: { from: '/posts?tab=jobs' } });
  };

  return (
    <NarrowPage>
      <PageHeader title="구인공고 수정" backTo={`/job-posts/${id}`} />

      {isLoading && <p className="text-center py-16 text-gray-400">불러오는 중…</p>}
      {isError && (
        <p className="text-center py-16 text-destructive">공고를 불러오지 못했어요.</p>
      )}

      {job && (
        <JobPostForm
          initialValues={jobPostToFormValues(job)}
          submitLabel="수정 완료"
          onSubmit={handleSubmit}
        />
      )}
    </NarrowPage>
  );
}
