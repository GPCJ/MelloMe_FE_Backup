import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createJobPost,
  updateJobPost,
  deleteJobPost,
} from '../api/jobPosts';
import type {
  JobPostCreatePayload,
  JobPostUpdatePayload,
} from '../types/jobPost';

// 구인공고 쓰기(생성/수정/삭제) mutation 모음 + 캐시 무효화를 한 곳에 모음.
//
// 캐시 키 두 갈래를 왜 나눠 무효화하는지:
//   - ['job-posts']       = 목록(무한스크롤 피드). 생성/수정/삭제 모두 목록 스냅샷이 바뀌므로 항상 stale.
//   - ['job-post', id]    = 개별 상세. 수정은 그 상세를 갱신하므로 invalidate(재조회),
//                           삭제는 상세가 사라지므로 remove(재조회하면 404이니 캐시에서 제거).
// 생성은 아직 상세 캐시가 없으니 목록만 무효화하면 됨.
export function useJobPostMutations() {
  const qc = useQueryClient();

  const create = useMutation({
    mutationFn: (payload: JobPostCreatePayload) => createJobPost(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['job-posts'] });
    },
  });

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: JobPostUpdatePayload }) =>
      updateJobPost(id, payload),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: ['job-posts'] });
      qc.invalidateQueries({ queryKey: ['job-post', id] });
    },
  });

  const remove = useMutation({
    mutationFn: (id: number) => deleteJobPost(id),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: ['job-posts'] });
      // 삭제된 상세는 재조회하면 404 → 무효화(재요청) 대신 캐시에서 제거.
      qc.removeQueries({ queryKey: ['job-post', id] });
    },
  });

  return { create, update, remove };
}
