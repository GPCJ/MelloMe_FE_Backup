import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import PageHeader from '../../components/common/PageHeader';
import Pagination from '../../components/common/Pagination';
import { fetchReceivedMessages, fetchSentMessages } from '../../api/messages';
import type { MessageResponse } from '../../types/message';

const PAGE_SIZE = 20;

type Tab = 'received' | 'sent';

// 받은함/보낸함 2탭. 목록은 React Query로 가져오고(정답지: NotificationPage),
// 안읽음 카운트는 slice 3에서 store로 별도 관리(목록=RQ / 카운트=store 이원화).
export default function MessageBoxPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('received');
  const [page, setPage] = useState(1);

  const queryKey = ['messages', tab, page - 1] as const;
  const messagesQuery = useQuery({
    queryKey,
    queryFn: () =>
      tab === 'received'
        ? fetchReceivedMessages(page - 1, PAGE_SIZE)
        : fetchSentMessages(page - 1, PAGE_SIZE),
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  });

  const data = messagesQuery.data;
  const messages = data?.items ?? [];
  const totalPages = data
    ? Math.max(1, data.totalPages ?? Math.ceil(data.totalElements / data.size))
    : 1;
  const loading = messagesQuery.isLoading;

  function switchTab(next: Tab) {
    if (next === tab) return;
    setTab(next);
    setPage(1);
  }

  return (
    <div className="mx-auto max-w-[640px] pb-20 md:pb-0">
      <PageHeader title="쪽지함" backTo="/profile" />

      {/* 받은함/보낸함 탭 — 프로필 탭과 동일 컨벤션(sticky + bg-white, text-xs/py-2.5) */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="flex">
          {(
            [
              ['received', '받은 쪽지'],
              ['sent', '보낸 쪽지'],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              onClick={() => switchTab(value)}
              className={`flex-1 py-2.5 text-xs font-medium text-center transition-colors ${
                tab === value ? 'text-neutral-950 border-b-2 border-black' : 'text-gray-400'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="px-4 py-12 text-center text-gray-400 text-sm">불러오는 중...</div>
      ) : messages.length === 0 ? (
        <div className="px-4 py-12 text-center text-gray-400 text-sm">
          {tab === 'received' ? '받은 쪽지가 없습니다' : '보낸 쪽지가 없습니다'}
        </div>
      ) : (
        <>
          <ul>
            {messages.map((m) => (
              <MessageRow
                key={m.messageId}
                message={m}
                tab={tab}
                onClick={() => navigate(`/messages/${m.messageId}`)}
              />
            ))}
          </ul>

          {totalPages > 1 && (
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          )}
        </>
      )}
    </div>
  );
}

interface MessageRowProps {
  message: MessageResponse;
  tab: Tab;
  onClick: () => void;
}

function MessageRow({ message, tab, onClick }: MessageRowProps) {
  // 받은함이면 보낸 사람, 보낸함이면 받는 사람을 상대방으로 표시.
  const counterpart = tab === 'received' ? message.senderNickname : message.receiverNickname;
  // 안읽음 강조는 받은함에서만 의미 있음(보낸함의 read는 "상대가 읽었는지"라 강조 대상 아님).
  const highlightUnread = tab === 'received' && !message.read;

  return (
    <li
      onClick={onClick}
      className={`flex items-start gap-3 px-4 py-4 border-b border-gray-100 cursor-pointer transition-colors ${
        highlightUnread ? 'bg-blue-50/40 hover:bg-blue-50' : 'bg-white hover:bg-gray-50'
      }`}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className={`text-sm truncate ${
              highlightUnread ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'
            }`}
          >
            {counterpart}
          </span>
          {message.broadcast && (
            <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-700">
              공지
            </span>
          )}
        </div>
        <p
          className={`mt-1 text-sm leading-snug line-clamp-2 ${
            highlightUnread ? 'text-gray-800' : 'text-gray-500'
          }`}
        >
          {message.content}
        </p>
        <p className="mt-1 text-xs text-gray-400">
          {new Date(message.createdAt).toLocaleString('ko-KR')}
        </p>
      </div>
    </li>
  );
}
