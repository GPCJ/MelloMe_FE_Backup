import { useState } from 'react';

export function useReplyInput() {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyInput, setReplyInput] = useState('');
  const [replyToNickname, setReplyToNickname] = useState<string | null>(null);

  function handleReplyClick(nickname: string) {
    setReplyToNickname(nickname);
    setReplyInput(`@${nickname} `);
    setShowReplyInput(true);
  }

  function resetReply() {
    setShowReplyInput(false);
    setReplyInput('');
    setReplyToNickname(null);
  }

  return {
    showReplyInput,
    replyInput,
    setReplyInput,
    replyToNickname,
    handleReplyClick,
    resetReply,
  };
}
