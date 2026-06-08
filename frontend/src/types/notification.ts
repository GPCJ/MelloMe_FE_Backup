export type NotificationType =
  | 'NEW_COMMENT'
  | 'NEW_REPLY'
  | 'NEW_POST_REACTION'
  | 'NEW_COMMENT_REACTION'
  | 'NEW_SCRAP'
  | 'VERIFICATION_SUBMITTED'
  | 'VERIFICATION_APPROVED'
  | 'VERIFICATION_REJECTED'
  | 'NEW_FOLLOW'
  | 'NEW_MESSAGE';

// 백엔드 NotificationResponse 스펙 (api-staging Swagger 기준).
// referenceId 의미는 type별로 다름:
//   NEW_POST_REACTION/NEW_SCRAP → 게시글 ID
//   NEW_COMMENT/NEW_REPLY/NEW_COMMENT_REACTION → 댓글 ID (게시글 ID 미동봉 — 백엔드 추가 필요)
//   VERIFICATION_* → 인증 신청 ID
//   NEW_MESSAGE → 쪽지 ID (messageId) 추정, 백엔드 확인 필요(Q1)
export interface NotificationResponse {
  id: number;
  type: NotificationType;
  content: string;
  referenceId?: number;
  senderId?: number;
  senderNickname?: string;
  read: boolean;
  readAt: string | null;
  createdAt: string;
}

export interface PaginatedNotifications {
  items: NotificationResponse[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
}

export interface UnreadCountResponse {
  count: number;
}
