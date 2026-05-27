import UserAvatar from './UserAvatar';
import { useAuthStore } from '../../stores/useAuthStore';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/shadcn-ui/dropdown-menu';
import { toast } from 'sonner';

interface UserActionDropdownProps {
  targetUserId: number;
  nickname: string;
  imageUrl?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  onMessageClick?: () => void;
}

function UserActionDropdown({
  targetUserId,
  nickname,
  imageUrl,
  size,
  onMessageClick,
}: UserActionDropdownProps) {
  const myId = useAuthStore((s) => s.user?.id);

  if (targetUserId === myId) {
    return <UserAvatar nickname={nickname} imageUrl={imageUrl} size={size} />;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger aria-label={`${nickname}님 메뉴`} onClick={(e) => e.stopPropagation()}>
        <UserAvatar nickname={nickname} imageUrl={imageUrl} size={size} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" onClick={(e) => e.stopPropagation()}>
        <DropdownMenuItem
          onClick={() => toast('준비 중인 기능이에요')}
          className="text-gray-400"
        >
          프로필
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => toast('준비 중인 기능이에요')}
          className="text-gray-400"
        >
          팔로우
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onMessageClick?.()}>쪽지</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default UserActionDropdown;
