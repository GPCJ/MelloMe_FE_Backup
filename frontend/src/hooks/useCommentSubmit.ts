import { useState } from 'react';
import { toast } from 'sonner';
import { createComment } from '../api/posts';
import type { CommentResponse } from '../types/post';
import { trackReaction } from '../lib/analytics';

interface UseCommentSubmitOptions {
  postId: number;
  parentCommentId?: number;
  onSuccess: (newComment: CommentResponse) => void;
  onReset?: () => void;
}

export function useCommentSubmit({
  postId,
  parentCommentId,
  onSuccess,
  onReset,
}: UseCommentSubmitOptions) {
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(content: string) {
    // in-flight 가드: setSubmitting은 비동기 배치라 동기적 이중 호출(IME Enter 이중 발화,
    // 더블탭 등)을 막지 못함. 함수 진입 시점 state로 직접 차단해야 두 번째 호출이 빠져나가지 않음.
    if (submitting) return;
    const normalized = content.replace(/\n{3,}/g, '\n\n').trim();
    if (!normalized.trim()) return;
    setSubmitting(true);
    try {
      const newComment = await createComment(postId, {
        content: normalized,
        ...(parentCommentId && { parentCommentId }),
      });
      // PM 정식 스펙(2026-04-27): 댓글 작성도 reaction 단일 이벤트의 type=comment로 통합.
      // 답글(parentCommentId 있음)도 동일하게 카운트.
      trackReaction('comment', { postId });
      onSuccess(newComment);
      onReset?.();
    } catch {
      toast.error(
        parentCommentId
          ? '답글 작성에 실패했습니다. 다시 시도해주세요.'
          : '댓글 작성에 실패했습니다. 다시 시도해주세요.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return { submitting, handleSubmit };
}
