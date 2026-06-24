import axiosInstance from './axiosInstance';
import type {
  CursorPagedJobPosts,
  JobPostDetail,
  JobPostListParams,
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
