import type { UserSummary } from './auth';

export type BoardType = 'therapy_board' | 'document_board' | 'anonymous_board';
export type PostSort = 'LATEST' | 'MOST_VIEWED' | 'MOST_LIKED';
export type ReactionType = 'LIKE' | 'DISLIKE';
export type TherapyArea = 'UNSPECIFIED' | 'OCCUPATIONAL_THERAPY';
export type AgeGroup = 'UNSPECIFIED' | 'AGE_6_12';

export interface PostSummary {
  id: number;
  board: BoardType;
  title: string;
  therapyArea?: TherapyArea;
  ageGroup?: AgeGroup;
  viewCount: number;
  commentCount: number;
  likeCount: number;
  dislikeCount: number;
  author: UserSummary;
  createdAt: string;
}

export interface PostDetail extends PostSummary {
  content: string;
  updatedAt?: string;
  myReactionType?: ReactionType | null;
  scrapped: boolean;
}

export interface PaginatedPosts {
  items: PostSummary[];
  page: {
    number: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
}

export interface PostCreateRequest {
  board: BoardType;
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
  author: UserSummary;
  parentCommentId?: number | null;
  content?: string;
  deleted: boolean;
  createdAt: string;
  updatedAt: string;
}
