import { useMessageStore } from '../../stores/useMessageStore';

// 안읽은 쪽지 수 빨간 뱃지. 0이면 렌더하지 않음.
// absolute 포지셔닝이라 부모 요소가 relative여야 한다. 정답지: SideNav의 unreadCount 뱃지.
// dotOnly=true(모바일): 화면이 좁아 숫자가 안 보이므로 작은 점만 표기.
interface MessageUnreadBadgeProps {
  dotOnly?: boolean;
}

export default function MessageUnreadBadge({ dotOnly = false }: MessageUnreadBadgeProps) {
  const unreadCount = useMessageStore((s) => s.unreadCount);

  if (unreadCount <= 0) return null;

  if (dotOnly) {
    return <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-red-500" />;
  }

  return (
    <span className="absolute -top-1 -right-1 min-w-[15px] h-[15px] flex items-center justify-center rounded-full bg-red-500 text-white text-[9px] font-bold leading-none px-1">
      {unreadCount > 99 ? '99+' : unreadCount}
    </span>
  );
}
