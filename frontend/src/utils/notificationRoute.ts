import type { NotificationType } from '../types/notification';

// 알림 클릭 시 이동 라우트.
// 백엔드 NotificationResponse.referenceId 의미가 type별로 다름:
//   NEW_POST_REACTION/NEW_SCRAP → 게시글 ID → 상세로 이동 가능
//   NEW_COMMENT/NEW_REPLY/NEW_COMMENT_REACTION → 댓글 ID → 게시글 ID 미동봉이라 상세 못 감 → 목록 fallback
// 추후 백엔드가 postId를 별도 동봉하면 댓글 계열도 상세로 라우팅 가능.
export function getNotificationRoute(
  type: NotificationType,
  referenceId?: number,
): string {
  switch (type) {
    case 'NEW_POST_REACTION':
    case 'NEW_SCRAP':
      return referenceId ? `/posts/${referenceId}` : '/posts';

    case 'NEW_COMMENT':
    case 'NEW_REPLY':
    case 'NEW_COMMENT_REACTION':
      return '/posts';

    case 'VERIFICATION_SUBMITTED':
    case 'VERIFICATION_APPROVED':
    case 'VERIFICATION_REJECTED':
      return '/profile';

    case 'NEW_MESSAGE':
      // referenceId = messageId 확인됨(2026-06-05 런타임 대조). 쪽지 상세로 직행, 없으면 목록 fallback.
      return referenceId ? `/messages/${referenceId}` : '/messages';

    default:
      return '/posts';
  }
}
