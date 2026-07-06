import axiosInstance from './axiosInstance';
import type {
  CursorPagedJobPosts,
  JobPostCreatePayload,
  JobPostDetail,
  JobPostListParams,
  JobPostUpdatePayload,
} from '../types/jobPost';

// 구인공고 목록 — cursor 페이지네이션 + 필터(status/therapyArea/region/employmentType).
// 응답 shape은 피드와 동일하게 { success, data:{ items, nextCursor, hasNext, size } }.
// axiosInstance 인터셉터가 success+data를 이미 벗기지만, fetchFeed와 동일하게 방어적으로 한 번 더 unwrap.
export async function fetchJobPosts(
  params: JobPostListParams & { signal?: AbortSignal },
): Promise<CursorPagedJobPosts> {
  const { signal, ...query } = params;
  const res = await axiosInstance.get('/job-posts', { params: query, signal });
  return res.data?.data ?? res.data;
}

export async function fetchJobPostDetail(
  id: number,
  signal?: AbortSignal,
): Promise<JobPostDetail> {
  const res = await axiosInstance.get(`/job-posts/${id}`, { signal });
  return res.data?.data ?? res.data;
}

// 구인공고 작성 — Phase 2. 현재 MSW 목이 응답(생성된 상세 반환).
// BE POST /job-posts 계약 확정·배포 시 이 함수는 그대로 두고 MSW만 OFF하면 실통신.
export async function createJobPost(
  payload: JobPostCreatePayload,
): Promise<JobPostDetail> {
  const res = await axiosInstance.post('/job-posts', payload);
  return res.data?.data ?? res.data;
}

// 수정 — Phase 2. PATCH /job-posts/{id}. 응답은 갱신된 상세(create와 동일 형태).
export async function updateJobPost(
  id: number,
  payload: JobPostUpdatePayload,
): Promise<JobPostDetail> {
  const res = await axiosInstance.patch(`/job-posts/${id}`, payload);
  return res.data?.data ?? res.data;
}

// 삭제 — Phase 2. DELETE /job-posts/{id}. 응답 바디 없음(204).
export async function deleteJobPost(id: number): Promise<void> {
  await axiosInstance.delete(`/job-posts/${id}`);
}
