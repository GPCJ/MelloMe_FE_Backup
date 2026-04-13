import { useState } from 'react';
import type { PostReaction, ReactionType } from '../types/post';
import { toggleReaction } from '../api/posts';

function getCountKey(
  type: ReactionType,
): 'empathyCount' | 'appreciateCount' | 'helpfulCount' {
  if (type === 'EMPATHY') return 'empathyCount';
  if (type === 'APPRECIATE') return 'appreciateCount';
  // else케이스
  return 'helpfulCount';
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
