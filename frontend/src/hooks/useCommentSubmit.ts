import { useState } from 'react';
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

  async function handleSubmit(e: React.FormEvent, content: string) {
    e.preventDefault();
    if (!content.trim()) return;
    setSubmitting(true);
    try {
      const newComment = await createComment(postId, {
        content,
        ...(parentCommentId && { parentCommentId }),
      });
      // PM 정식 스펙(2026-04-27): 댓글 작성도 reaction 단일 이벤트의 type=comment로 통합.
      // 답글(parentCommentId 있음)도 동일하게 카운트.
      trackReaction('comment', { postId });
      onSuccess(newComment);
      onReset?.();
    } catch {
      alert(
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
