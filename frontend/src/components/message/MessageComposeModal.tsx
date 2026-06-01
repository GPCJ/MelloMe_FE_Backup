import { useEffect, useState } from 'react';
import { ArrowLeft, PencilLine } from 'lucide-react';
import { useMessageComposeStore } from '../../stores/messageComposeStore';
import { useSendMessage, MESSAGE_MAX_LENGTH } from '../../hooks/useSendMessage';

// PC 전용 쪽지 작성 모달. 루트(Layout)에 항상 마운트되어 store의 open으로 토글.
// 모바일은 /messages/new?to=:id 라우트(MessageComposePage)로 분기하므로 이 모달과 무관.
// 정답지: CommentReplyModal(chrome/IME 가드) + PostWriteModal(store 토글/스크롤 잠금).
export default function MessageComposeModal() {
  const open = useMessageComposeStore((s) => s.open);
  const receiverId = useMessageComposeStore((s) => s.receiverId);
  const receiverNickname = useMessageComposeStore((s) => s.receiverNickname);
  const closeCompose = useMessageComposeStore((s) => s.closeCompose);

  const [content, setContent] = useState('');
  const { submitting, send } = useSendMessage({ onSuccess: closeCompose });

  // 닫힐 때 입력값 리셋 — 항상 마운트된 모달이라 content가 살아남는다.
  // 외부 closeCompose() 직접 호출도 일관 커버하도록 open=false를 트리거로 비운다.
  useEffect(() => {
    if (!open) setContent('');
  }, [open]);

  // ESC로 닫기 + body 스크롤 잠금 (열려있는 동안만).
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') closeCompose();
    }
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, closeCompose]);

  if (!open || receiverId == null) return null;

  const canSubmit = content.trim().length > 0 && !submitting;

  function handleSubmit() {
    if (receiverId == null) return;
    send(receiverId, content);
  }

  // CommentReplyModal과 동일한 IME 중복 발화 방어 + Enter=제출, Shift+Enter=줄바꿈. PC 전용.
  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.nativeEvent.isComposing) return;
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (canSubmit) handleSubmit();
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4"
      // mousedown 기준 닫기 — 모달 내부에서 시작한 드래그가 배경에서 끝나도 닫힘으로 인식되는 사고 방지.
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) closeCompose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="message-compose-modal-title"
        className="w-full max-w-[520px] max-h-[90vh] bg-white rounded-2xl shadow-[0px_4px_20px_0px_rgba(0,0,0,0.15)] overflow-hidden flex flex-col"
      >
        {/* 헤더 — ← (close) / 가운데 타이틀 / ✏️ (submit). CommentReplyModal 동일 패턴 */}
        <header className="flex items-center justify-between px-4 py-3 border-b border-gray-100 shrink-0">
          <button
            type="button"
            onClick={closeCompose}
            aria-label="닫기"
            className="p-1 -ml-1 text-gray-700 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 id="message-compose-modal-title" className="text-base font-semibold text-gray-900">
            쪽지
          </h1>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            aria-label="쪽지 보내기"
            className="p-1 -mr-1 text-gray-900 hover:text-black transition-colors disabled:text-gray-300 disabled:cursor-not-allowed"
          >
            <PencilLine size={20} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col">
          {/* 받는 사람 컨텍스트 — 드롭다운에서 넘어온 닉네임 표시 */}
          <p className="text-sm text-gray-500 mb-3">
            받는 사람 · <span className="font-semibold text-gray-900">{receiverNickname}</span>
          </p>

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="쪽지를 입력하세요..."
            maxLength={MESSAGE_MAX_LENGTH}
            rows={5}
            autoFocus
            disabled={submitting}
            className="w-full resize-none rounded-2xl bg-gray-100 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:opacity-50"
          />
          <p className="text-xs text-gray-400 text-right mt-1">
            {content.length} / {MESSAGE_MAX_LENGTH}
          </p>
        </div>
      </div>
    </div>
  );
}
