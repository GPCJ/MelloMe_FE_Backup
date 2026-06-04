import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'sonner';
import { sendMessage } from '../api/messages';
import type { MessageResponse } from '../types/message';

// 백엔드 MessageSendRequest.content maxLength=1000 (staging Swagger 2026-06-01 확인).
// 설계 스펙의 2000은 CommentReplyModal에서 잘못 빌려온 값 → 백엔드 제약에 맞춤.
export const MESSAGE_MAX_LENGTH = 1000;

interface UseSendMessageOptions {
  // 발송 성공 시 호출. 모달은 close, 페이지는 navigate 등 후처리를 호출처가 결정.
  onSuccess?: (message: MessageResponse) => void;
}

export function useSendMessage({ onSuccess }: UseSendMessageOptions = {}) {
  const [submitting, setSubmitting] = useState(false);
  const queryClient = useQueryClient();

  async function send(receiverId: number, content: string) {
    // in-flight 가드: setSubmitting 비동기 배치라 동기 이중 호출(IME Enter 이중 발화, 더블탭)을
    // 막지 못함. 진입 시점 state로 직접 차단. (useCommentSubmit 동일 패턴)
    if (submitting) return;
    const trimmed = content.trim();
    if (!trimmed) return;
    // 방어적 상한 — textarea maxLength로도 막지만, 외부 호출 대비 한 번 더.
    if (trimmed.length > MESSAGE_MAX_LENGTH) {
      toast.error(`쪽지는 ${MESSAGE_MAX_LENGTH}자까지 보낼 수 있어요.`);
      return;
    }

    setSubmitting(true);
    try {
      const message = await sendMessage({ receiverId, content: trimmed });
      // 전송 직후 쪽지함 캐시 무효화 — 보낸함(+broadcast면 받은함)이 staleTime(30s) 안이어도
      // 쪽지함 진입 시 최신 목록을 다시 받게 한다. onSuccess(navigate)보다 먼저 무효화.
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      toast.success('쪽지를 보냈어요.');
      onSuccess?.(message);
    } catch (err) {
      // 401은 axiosInstance 인터셉터가 흡수하므로 여기 안 옴.
      // 백엔드가 200 외 에러 코드를 문서화하지 않아(2026-06-01 Swagger) 정확한 원인 매핑 불가.
      // 보수적으로 4xx(요청 자체 문제 — 없는/차단된 수신자 등)와 그 외(서버·네트워크 일시 문제)만 분기.
      // 추후 백엔드가 코드 확정하면 세분화.
      const status = axios.isAxiosError(err) ? err.response?.status : undefined;
      if (status && status >= 400 && status < 500) {
        toast.error('받는 사람에게 쪽지를 보낼 수 없어요.');
      } else {
        toast.error('쪽지 전송에 실패했어요. 잠시 후 다시 시도해주세요.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return { submitting, send };
}
