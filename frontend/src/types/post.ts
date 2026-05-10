export type PostSort = 'LATEST' | 'MOST_VIEWED';
export type PostType = 'COMMUNITY' | 'RESOURCE';
export type Visibility = 'PUBLIC' | 'PRIVATE';

// UI 3-옵션 공개 범위. 백엔드 API는 PUBLIC/PRIVATE 2-옵션만 지원 — 작성/수정 시 toApiVisibility 거쳐 매핑.
// PRIVATE_ONLY(나만 보기)는 현재 PRIVATE(인증치료사 전용)에 임시 매핑되며 백엔드 지원 시 분리.
export type UIVisibility = 'PUBLIC' | 'VERIFIED_ONLY' | 'PRIVATE_ONLY';
export type ReactionType = 'LIKE' | 'CURIOUS' | 'USEFUL';

export interface PostReaction {
  postId: number;
  likeCount: number;
  curiousCount: number;
  usefulCount: number;
  myReactionType: ReactionType | null;
  reactionCounts?: Record<ReactionType, number>;
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
  popularityScore?: number;
  commentCount?: number;
  likeCount?: number;
  myReactionType: ReactionType | null;
  hasAttachment?: boolean;
  // 백엔드가 인증 전용 글을 USER에게 전달할 때 true로 내려오며 contentPreview는 "비공개 글입니다"로 마스킹, imageUrls=[], 카운트=0
  accessLocked?: boolean;
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

export interface PostImage {
  id: number;
  imageUrl: string;
  originalFilename: string;
  displayOrder: number;
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
  // 신규: 백엔드 명세 변경 (2026-04-21) — 활성 댓글 수, soft-delete 제외
  commentCount?: number;
  // 신규: 백엔드 명세 변경 (2026-04-21) — 3종 모두 항상 존재(0이어도 키 존재)
  reactionCounts?: Record<ReactionType, number>;
  // 신규: 백엔드 명세 변경 (2026-04-21) — 로그인 사용자가 현재 누른 반응, 없으면 null
  myReactionType?: ReactionType | null;
  createdAt: string;
  updatedAt?: string;
  canEdit: boolean;
  canDelete: boolean;
  attachments?: Attachment[];
  authorVerificationStatus?: 'NOT_REQUESTED' | 'PENDING' | 'APPROVED' | 'REJECTED';
  // 백엔드가 인증 전용 글을 USER에게 전달할 때 true로 내려오며 GET /posts/:id 직접 진입은 4xx로 차단됨
  accessLocked?: boolean;
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

export interface CursorPagedPosts {
  items: PostSummary[];
  nextCursor: string | null;
  hasNext: boolean;
  size: number;
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
  likeCount?: number;
  curiousCount?: number;
  usefulCount?: number;
  myReactionType?: ReactionType | null;
  replies?: CommentResponse[];
}

export interface CommentReaction {
  commentId: number;
  likeCount: number;
  curiousCount: number;
  usefulCount: number;
  myReactionType: ReactionType | null;
}

// Presigned Upload (3단계 흐름)
export type UploadKind = 'IMAGE' | 'ATTACHMENT' | 'VIDEO';

export interface UploadInitRequest {
  kind: UploadKind;
  originalFilename: string;
  contentType: string;
  sizeBytes: number;
}

export interface UploadInitResponse {
  uploadUrl: string;
  storedKey: string;
  expiresAt: string;
}

export interface UploadConfirmRequest {
  kind: UploadKind;
  storedKey: string;
  originalFilename: string;
}

export interface UploadConfirmResponse {
  kind: UploadKind;
  image?: PostImage;
  attachment?: Attachment;
}
