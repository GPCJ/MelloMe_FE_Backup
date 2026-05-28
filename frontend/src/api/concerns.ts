import { createPost } from '@/api/posts';
import type { AgeGroup, TherapyArea, Visibility, PostDetail } from '@/types/post';

export interface CreateConcernInput {
  content: string;
  therapyArea: TherapyArea;
  ageGroup: AgeGroup;
  diagnoses: string[];
  otherNotes?: string;
  visibility?: Visibility;
}

export async function createConcern(input: CreateConcernInput): Promise<PostDetail> {
  return createPost({
    postType: 'CONCERN_CARD',
    content: input.content,
    therapyArea: input.therapyArea,
    ageGroup: input.ageGroup,
    diagnoses: input.diagnoses,
    otherNotes: input.otherNotes?.trim() || undefined,
    visibility: input.visibility ?? 'PUBLIC',
  });
}
