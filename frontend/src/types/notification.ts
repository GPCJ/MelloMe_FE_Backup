export type NotificationType =
  | 'NEW_COMMENT'
  | 'NEW_REPLY'
  | 'NEW_POST_REACTION'
  | 'NEW_COMMENT_REACTION'
  | 'NEW_SCRAP'
  | 'VERIFICATION_APPROVED'
  | 'VERIFICATION_REJECTED';

export interface NotificationResponse {
  id: number;
  type: NotificationType;
  content: string;
  referenceId?: number;
  postId?: number;
  senderId?: number;
  senderNickname?: string;
  read: boolean;
  readAt: string | null;
  createdAt: string;
}

export interface PaginatedNotifications {
  items: NotificationResponse[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  hasNext: boolean;
}

export interface UnreadCountResponse {
  count: number;
}
