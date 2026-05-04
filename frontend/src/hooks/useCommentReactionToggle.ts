import { useState } from 'react';
import { toggleCommentReaction } from '../api/posts';
import type { ReactionType, CommentResponse } from '../types/post';

function getCountKey(type: ReactionType): 'likeCount' | 'curiousCount' | 'usefulCount' {
  if (type === 'LIKE') return 'likeCount';
  if (type === 'CURIOUS') return 'curiousCount';
  // else케이스
  return 'usefulCount';
}

export function useCommentReactionToggle(
  // 원본 댓글 정보
  comments: CommentResponse[],
  // 변경된 댓글 정보를 setComments함수로 부모에게 알림
  setComments: (next: CommentResponse[]) => void,
) {
  const [togglingId, setTogglingId] = useState<number | null>(null);

  // type이 지금 막 눌린 리액션
  async function handleToggle(commentId: number, type: ReactionType) {
    if (togglingId !== null) return;
    setTogglingId(commentId);

    // CommentResponse[]에서 handleToggle함수를 사용한 commentId를 찾아서 target으로 지정함
    const target = comments.find((c) => c.id === commentId);
    if (!target) return;
    // 롤백용 원본 저장
    const prevComments = comments;

    // wasActive: 이전 리액션과 이번 리액션 비교
    const wasActive = target.myReactionType === type;
    const countKey = getCountKey(type);
    const updated = { ...target };

    // 현재 리액션이 존재하면서 이전 리액션과 이번 리액션이 같지 않으면 (true가 아니면)? => 현재 리액션을 적용해야함
    if (target.myReactionType && !wasActive) {
      const prevKey = getCountKey(target.myReactionType);
      updated[prevKey] = (updated[prevKey] ?? 0) - 1;
    }

    // 새로 클릭한 리액션 증감(wasActive가 true라는건 이전 리액션과 이번 리액션이 같다는 이야기 즉 같은 리액션은 한번 더 클릭했다는 것)
    // 근데 만약에 updated[countKey] undefined이면? 0
    updated[countKey] = (updated[countKey] ?? 0) + (wasActive ? -1 : 1);
    updated.myReactionType = wasActive ? null : type;

    setComments(comments.map((c) => (c.id === commentId ? updated : c)));

    try {
      // api요청을 보내고 fresh변수에 담아서 target댓글의 정보를 변경함
      const fresh = await toggleCommentReaction(commentId, type);
      setComments(
        comments.map((c) =>
          c.id === commentId
            ? {
                ...c,
                likeCount: fresh.likeCount,
                curiousCount: fresh.curiousCount,
                usefulCount: fresh.usefulCount,
                myReactionType: fresh.myReactionType,
              }
            : c,
        ),
      );
    } catch {
      setComments(prevComments);
    } finally {
      setTogglingId(null);
    }
  }

  return { togglingId, handleToggle };
}
