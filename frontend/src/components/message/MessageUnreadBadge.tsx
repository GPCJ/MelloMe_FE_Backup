import { useMessageStore } from '../../stores/useMessageStore';

// 안읽은 쪽지 수 빨간 숫자 뱃지. 0이면 렌더하지 않음.
// absolute 포지셔닝이라 부모 요소가 relative여야 한다. 정답지: SideNav의 unreadCount 뱃지.
export default function MessageUnreadBadge() {
  const unreadCount = useMessageStore((s) => s.unreadCount);

  if (unreadCount <= 0) return null;

  return (
    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold leading-none px-1">
      {unreadCount > 99 ? '99+' : unreadCount}
    </span>
  );
}
