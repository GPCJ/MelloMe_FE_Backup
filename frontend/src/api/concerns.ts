import { createPost } from '@/api/posts';
import type { AgeGroup, TherapyArea, Visibility, PostDetail } from '@/types/post';

export interface CreateConcernInput {
  content: string;
  therapyArea: TherapyArea;
  ageGroup: AgeGroup;
  diagnoses: string[];
  otherNotes?: string;
  visibility?: Visibility;
  // AI 자동 댓글 초안 요청 여부 — ConcernForm 체크박스값. 전체공개일 때만 true로 전달됨.
  requestAutoComment?: boolean;
}

export async function createConcern(input: CreateConcernInput): Promise<PostDetail> {
  return createPost({
    postType: 'CONCERN_CARD',
    content: input.content.trim(),
    therapyArea: input.therapyArea,
    ageGroup: input.ageGroup,
    diagnoses: input.diagnoses,
    otherNotes: input.otherNotes?.trim() || undefined,
    visibility: input.visibility ?? 'PUBLIC',
    requestAutoComment: input.requestAutoComment,
  });
}
