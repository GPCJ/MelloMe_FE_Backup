import { useState } from 'react';
import type { PostReaction, ReactionType, PostDetail } from '../types/post';
import { toggleReaction } from '../api/posts';

function getCountKey(type: ReactionType): 'likeCount' | 'curiousCount' | 'usefulCount' {
  if (type === 'LIKE') return 'likeCount';
  if (type === 'CURIOUS') return 'curiousCount';
  // else케이스
  return 'usefulCount';
}

// PostDetail의 reactionCounts/myReactionType을 PostReaction 형태로 변환.
// 백엔드 명세 변경(2026-04-21)으로 상세 응답에 리액션이 포함되면서 별도 GET /reaction 호출 불필요.
export function reactionFromPostDetail(post: PostDetail): PostReaction {
  const counts = post.reactionCounts;
  return {
    postId: post.id,
    likeCount: counts?.LIKE ?? 0,
    curiousCount: counts?.CURIOUS ?? 0,
    usefulCount: counts?.USEFUL ?? 0,
    myReactionType: post.myReactionType ?? null,
  };
}

export function useReactionToggle(initialReaction: PostReaction) {
  const [reaction, setReaction] = useState<PostReaction>(initialReaction);
  const [toggling, setToggling] = useState(false);

  async function handleToggle(type: ReactionType) {
    if (toggling) return;
    setToggling(true);

    const wasActive = reaction.myReactionType === type;
    const countKey = getCountKey(type);
    const prev = { ...reaction };

    const updated = { ...reaction };
    // 이전 리액션이 있고 다른 타입으로 변경 시 이전 카운트 감소
    if (reaction.myReactionType && !wasActive) {
      const prevKey = getCountKey(reaction.myReactionType);
      updated[prevKey] = updated[prevKey] - 1;
    }
    updated[countKey] = updated[countKey] + (wasActive ? -1 : 1);
    updated.myReactionType = wasActive ? null : type;

    setReaction(updated);

    try {
      await toggleReaction(reaction.postId, type);
    } catch {
      setReaction(prev);
    } finally {
      setToggling(false);
    }
  }

  return { reaction, setReaction, toggling, handleToggle };
}
