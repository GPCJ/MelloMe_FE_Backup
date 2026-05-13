import type { NotificationType } from '../types/notification';

/**
 * 알림 타입에 따라 이동할 라우트를 반환.
 * postId: 백엔드가 모든 알림에 제공하는 게시글 ID (NEW_COMMENT_REACTION 포함).
 */
export function getNotificationRoute(
  type: NotificationType,
  postId?: number,
): string {
  switch (type) {
    case 'NEW_COMMENT':
    case 'NEW_REPLY':
    case 'NEW_POST_REACTION':
    case 'NEW_COMMENT_REACTION':
    case 'NEW_SCRAP':
      return postId ? `/posts/${postId}` : '/posts';

    case 'VERIFICATION_APPROVED':
    case 'VERIFICATION_REJECTED':
      return '/profile';

    default:
      return '/posts';
  }
}
