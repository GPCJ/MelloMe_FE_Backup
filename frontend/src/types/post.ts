export type PostSort = 'LATEST' | 'MOST_VIEWED';
export type PostType = 'COMMUNITY' | 'RESOURCE';
export type Visibility = 'PUBLIC' | 'PRIVATE';
export type ReactionType = 'EMPATHY' | 'APPRECIATE' | 'HELPFUL';

export interface PostReaction {
  postId: number;
  empathyCount: number;
  appreciateCount: number;
  helpfulCount: number;
  myReactionType: ReactionType | null;
  reactionCounts?: Record<string, number>;
  topReactionType?: ReactionType | null;
  topReactionCount?: number;
  topReactionColorToken?: string;
}
export type TherapyArea =
  | 'UNSPECIFIED'
  | 'SENSORY_INTEGRATION'
  | 'SPEECH'
  | 'OCCUPATIONAL'
  | 'COGNITIVE'
  | 'PHYSICAL'
  | 'ART'
  | 'MUSIC'
  | 'PLAY'
  | 'BEHAVIOR';
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
  postType?: PostType;
  contentPreview?: string;
  authorNickname: string;
  authorProfileImageUrl?: string | null;
  authorVerificationStatus?: 'NOT_REQUESTED' | 'PENDING' | 'APPROVED' | 'REJECTED';
  therapyArea?: TherapyArea;
  visibility?: Visibility;
  viewCount: number;
  commentCount?: number;
  hasAttachment?: boolean;
  isBlurred?: boolean;
  createdAt: string;
  scrapped?: boolean;
}

export interface Attachment {
  id: number;
  originalFilename: string;
  contentType: string;
  sizeBytes: number;
  extension: string;
  downloadUrl: string;
  createdAt: string;
}

export interface PostDetail {
  id: number;
  content: string;
  postType?: PostType;
  authorId: number;
  authorNickname: string;
  authorProfileImageUrl?: string | null;
  therapyArea?: TherapyArea;
  visibility?: Visibility;
  viewCount: number;
  createdAt: string;
  updatedAt?: string;
  canEdit: boolean;
  canDelete: boolean;
  attachments?: Attachment[];
  authorVerificationStatus?: 'NOT_REQUESTED' | 'PENDING' | 'APPROVED' | 'REJECTED';
  isBlurred?: boolean;
  scrapped?: boolean;
}

export interface PaginatedPosts {
  items: PostSummary[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
}

export interface PostCreateRequest {
  content: string;
  therapyArea?: TherapyArea;
  visibility?: Visibility;
}

export interface PostUpdateRequest {
  content: string;
  therapyArea?: TherapyArea;
  visibility?: Visibility;
}

export interface CommentResponse {
  id: number;
  postId: number;
  parentCommentId?: number | null;
  authorId: number;
  authorNickname: string;
  authorProfileImageUrl?: string | null;
  authorRole: string;
  content?: string;
  deleted: boolean;
  canEdit: boolean;
  canDelete: boolean;
  createdAt: string;
  updatedAt: string;
  replies?: CommentResponse[];
}
