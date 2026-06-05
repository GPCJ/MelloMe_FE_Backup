import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import NarrowPage from '../../components/common/NarrowPage';
import { fetchMessageDetail, deleteMessage, fetchUnreadMessageCount } from '../../api/messages';
import { useAuthStore } from '../../stores/useAuthStore';
import { useMessageStore } from '../../stores/useMessageStore';
import type { MessageResponse } from '../../types/message';
import { useSendMessage, MESSAGE_MAX_LENGTH } from '../../hooks/useSendMessage';

// 쪽지 전문 + 삭제. 수신자가 조회하면 백엔드가 자동 읽음 처리(스펙 Q2).
export default function MessageDetailPage() {
  const { messageId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const myId = useAuthStore((s) => s.user?.id);

  const id = Number(messageId);
  const validId = messageId !== undefined && !isNaN(id);

  const messageQuery = useQuery({
    queryKey: ['messages', 'detail', id],
    queryFn: () => fetchMessageDetail(id),
    enabled: validId,
  });
  const message = messageQuery.data;

  // 수신자가 상세를 열면 백엔드가 자동 읽음 처리 후 read:true로 응답한다(스펙 Q2).
  // 그래서 응답의 read로는 "이번에 읽혔는지"를 알 수 없어 낙관적 -1을 쓸 수 없다.
  // 읽음이 서버에 커밋된 직후이므로, 받은함 목록 캐시를 무효화하고 안읽음 카운트를
  // 서버에서 다시 받아 뱃지를 맞춘다(서버 = 신뢰 소스). SPA 이동만으로도 즉시 최신화됨.
  useEffect(() => {
    if (message && myId != null && message.receiverId === myId) {
      queryClient.invalidateQueries({ queryKey: ['messages', 'received'] });
      fetchUnreadMessageCount()
        .then(({ unreadCount }) => useMessageStore.getState().setUnreadCount(unreadCount))
        .catch(() => {});
    }
  }, [message, myId, queryClient]);

  const deleteMutation = useMutation({
    mutationFn: () => deleteMessage(id),
    onSuccess: () => {
      // detail 캐시는 건드리지 않는다(invalidate/remove 모두 — 상세가 아직 마운트된 상태라
      // active observer가 캐시 변화에 반응해 삭제된 쪽지를 다시 refetch → 404가 난다).
      // navigate로 상세를 언마운트시켜 자연 소멸시키고, 목록만 무효화한다.
      // 성공 토스트는 생략 — Layout의 라우트 전환 시 toast.dismiss()로 즉시 닫혀 보이지 않음.
      navigate('/messages');
      queryClient.invalidateQueries({ queryKey: ['messages', 'received'] });
      queryClient.invalidateQueries({ queryKey: ['messages', 'sent'] });
    },
    onError: (err) => {
      console.error('쪽지 삭제 실패:', err);
      toast.error('쪽지를 삭제하지 못했습니다.');
    },
  });

  function handleDelete() {
    if (!confirm('이 쪽지를 삭제할까요?')) return;
    deleteMutation.mutate();
  }

  // to가 비숫자/누락이면 작성 화면과 동일하게 가드(PostDetailPage 404 가드 패턴).
  if (!validId) {
    return (
      // NarrowPage 미사용: NarrowPage가 강제하는 pb-20(모바일 하단바 여백)이
      // 이 짧은 가드 화면엔 불필요 → 폭(max-w-[640px])만 맞춘 단순 div로 둔다.
      <div className="mx-auto max-w-[640px]">
        <PageHeader title="쪽지" backTo="/messages" />
        <div className="px-4 py-10 text-center">
          <p className="text-sm text-gray-600">쪽지를 찾을 수 없어요.</p>
          <Link to="/messages" className="mt-3 inline-block text-sm text-blue-600 underline">
            쪽지함으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <NarrowPage>
      <PageHeader
        title="쪽지"
        backTo="/messages"
        rightAction={
          message ? (
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              aria-label="쪽지 삭제"
              className="text-gray-400 hover:text-red-500 transition-colors disabled:opacity-40"
            >
              <Trash2 size={20} />
            </button>
          ) : undefined
        }
      />

      <div>
        {messageQuery.isLoading ? (
          <div className="py-12 text-center text-gray-400 text-sm">불러오는 중...</div>
        ) : messageQuery.isError || !message ? (
          <div className="py-12 text-center">
            <p className="text-sm text-gray-600">쪽지를 불러오지 못했어요.</p>
            <Link to="/messages" className="mt-3 inline-block text-sm text-blue-600 underline">
              쪽지함으로 돌아가기
            </Link>
          </div>
        ) : (
          <MessageBody message={message} myId={myId} />
        )}
      </div>
    </NarrowPage>
  );
}

function MessageBody({ message, myId }: { message: MessageResponse; myId?: number }) {
  const [ input, setInput ] = useState<string>('');
  const { submitting, send } = useSendMessage({ onSuccess: () => setInput('') });

  const iAmSender = myId != null && message.senderId === myId;
  // 내가 보낸 쪽지면 "받는 사람", 받은 쪽지면 "보낸 사람"을 상대방으로 표시.
  const label = iAmSender ? '받는 사람' : '보낸 사람';
  const counterpart = iAmSender ? message.receiverNickname : message.senderNickname;

  // 모바일은 Enter가 줄바꿈/완료 키라 전송 키로 쓰지 않고 전송 버튼을 강제(댓글 입력과 동일 정책).
  const isMobile = navigator.maxTouchPoints > 0;

  function handleSend() {
    send(message.senderId, input);
  }

  // Enter=전송(데스크탑), Shift+Enter=줄바꿈. 한글 IME 합성 종료 시 Enter가 2회 발화하는
  // React 이슈 방어(isComposing) — CommentInput과 동일 패턴.
  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.nativeEvent.isComposing) return;
    if (e.key === 'Enter' && !e.shiftKey && !isMobile) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <>
      <div className="bg-white px-4 py-5 border-b border-gray-100">
        <div className="flex items-center gap-2 pb-4 border-b border-gray-100">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-400">{label}</p>
            <p className="text-sm font-semibold text-gray-900 truncate">{counterpart}</p>
          </div>
          {message.broadcast && (
            <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-700">
              공지
            </span>
          )}
        </div>

        <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-relaxed text-gray-800">
          {message.content}
        </p>

        <p className="mt-6 text-xs text-gray-400">
          {new Date(message.createdAt).toLocaleString('ko-KR')}
        </p>
      </div>

      {!iAmSender && !message.broadcast && (
        <div className="flex items-center gap-2 bg-white px-4 py-5 border-t border-gray-100">
          <textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown} placeholder="답장을 입력해보세요!" maxLength = {MESSAGE_MAX_LENGTH} rows={1} className="field-sizing-content w-full rounded-lg border border-gray-200 px-4 py-3 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent" />
          <button onClick={handleSend} disabled={submitting} className="px-5 py-3 text-base font-medium text-white bg-gray-500 rounded-md hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0">
            전송
          </button>
        </div>
      )}
    </>
  );
}
