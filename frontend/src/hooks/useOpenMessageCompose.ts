import { useNavigate } from 'react-router-dom';
import { useMessageComposeStore } from '../stores/messageComposeStore';

// 쪽지 작성 진입의 PC/모바일 분기를 한 곳에 모은 헬퍼.
// PC(>=768px): 전역 store로 모달 토글 / 모바일: /messages/new 라우트로 navigate (CH-09 정책).
// 모든 진입점(PostDetailPage, CommentCard 등)이 이 hook만 호출하면 분기가 통일된다.
export function useOpenMessageCompose() {
  const navigate = useNavigate();
  const openCompose = useMessageComposeStore((s) => s.openCompose);

  return function open(receiver: { id: number; nickname: string }) {
    if (window.matchMedia('(min-width: 768px)').matches) {
      openCompose(receiver);
    } else {
      navigate(`/messages/new?to=${receiver.id}&name=${encodeURIComponent(receiver.nickname)}`);
    }
  };
}
