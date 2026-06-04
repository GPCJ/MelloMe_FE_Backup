import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { PencilLine } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import { useSendMessage, MESSAGE_MAX_LENGTH } from '../../hooks/useSendMessage';

// 모바일 전용 쪽지 작성 라우트. /messages/new?to=:id&name=:nickname
// PC는 MessageComposeModal(store)로 분기하므로 이 페이지와 무관.
// 받는 사람 id는 쿼리 to에서, 표시용 닉네임은 name에서 받는다(store 없이 URL만으로 완결).
export default function MessageComposePage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const to = params.get('to');
  const receiverNickname = params.get('name');

  const [content, setContent] = useState('');
  // 전송 성공 후 쪽지함(보낸함 탭에서 확인 가능)으로 이동.
  const { submitting, send } = useSendMessage({ onSuccess: () => navigate('/messages') });

  // to가 누락/비숫자면 작성 불가 — 안내 + 빠져나갈 링크(PostDetailPage 404 가드 패턴).
  if (!to || isNaN(Number(to))) {
    return (
      <div>
        <PageHeader title="쪽지" backTo="/posts" />
        <div className="px-4 py-10 text-center">
          <p className="text-sm text-gray-600">받는 사람을 찾을 수 없어요.</p>
          <Link to="/posts" className="mt-3 inline-block text-sm text-blue-600 underline">
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  const receiverId = Number(to);
  const canSubmit = content.trim().length > 0 && !submitting;

  return (
    <div>
      <PageHeader
        title="쪽지"
        backTo="/posts"
        rightAction={
          <button
            type="button"
            onClick={() => send(receiverId, content)}
            disabled={!canSubmit}
            aria-label="쪽지 보내기"
            className="text-gray-900 hover:text-black transition-colors disabled:text-gray-300 disabled:cursor-not-allowed"
          >
            <PencilLine size={22} />
          </button>
        }
      />
      <div className="px-4 py-4">
        <p className="text-sm text-gray-500 mb-3">
          받는 사람 · <span className="font-semibold text-gray-900">{receiverNickname ?? '상대방'}</span>
        </p>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="쪽지를 입력하세요..."
          maxLength={MESSAGE_MAX_LENGTH}
          rows={8}
          autoFocus
          disabled={submitting}
          className="w-full resize-none rounded-2xl bg-gray-100 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:opacity-50"
        />
        <p className="text-xs text-gray-400 text-right mt-1">
          {content.length} / {MESSAGE_MAX_LENGTH}
        </p>
      </div>
    </div>
  );
}
