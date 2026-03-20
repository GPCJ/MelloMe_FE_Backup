export type BoardType = 'therapy_board' | 'document_board' | 'anonymous_board';
export type PostSort = 'LATEST' | 'MOST_VIEWED';
export type ReactionType = 'LIKE' | 'DISLIKE';
export type TherapyArea =
  | 'UNSPECIFIED'
  | 'OCCUPATIONAL'
  | 'SPEECH'
  | 'COGNITIVE'
  | 'PLAY';
export type AgeGroup =
  | 'UNSPECIFIED'
  | 'AGE_0_2'
  | 'AGE_3_5'
  | 'AGE_6_12'
  | 'AGE_13_18'
  | 'AGE_19_64'
  | 'AGE_65_PLUS';

export interface PostSummary {
  id: number;
  title: string;
  contentPreview?: string;
  authorNickname: string;
  therapyArea?: TherapyArea;
  ageGroup?: AgeGroup;
  viewCount: number;
  createdAt: string;
}

export interface PostDetail {
  id: number;
  title: string;
  content: string;
  authorNickname: string;
  therapyArea?: TherapyArea;
  ageGroup?: AgeGroup;
  viewCount: number;
  createdAt: string;
  updatedAt?: string;
}

export interface PaginatedPosts {
  posts: PostSummary[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
}

export interface PostCreateRequest {
  title: string;
  content: string;
  therapyArea?: TherapyArea;
  ageGroup?: AgeGroup;
}

export interface PostUpdateRequest {
  title?: string;
  content?: string;
  therapyArea?: TherapyArea;
  ageGroup?: AgeGroup;
}

export interface CommentResponse {
  id: number;
  postId: number;
  parentCommentId?: number | null;
  authorId: number;
  authorNickname: string;
  authorRole: string;
  content?: string;
  deleted: boolean;
  canEdit: boolean;
  canDelete: boolean;
  createdAt: string;
  updatedAt: string;
  replies?: CommentResponse[];
}
