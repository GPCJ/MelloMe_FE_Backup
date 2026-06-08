import { useState } from 'react';
import { User, UserPlus, UserCheck, Mail } from 'lucide-react';
import UserAvatar from './UserAvatar';
import { useAuthStore } from '../../stores/useAuthStore';
import { useFollowUser } from '../../hooks/useFollowUser';
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
  // 드롭다운이 열렸을 때만 팔로우 상태를 조회한다(닫혀 있으면 호출 안 함).
  const [open, setOpen] = useState(false);
  const follow = useFollowUser(targetUserId, open);

  // 본인이면 메뉴 없이 아바타만 (hooks는 위에서 무조건 호출되어 순서 보장).
  if (targetUserId === myId) {
    return <UserAvatar nickname={nickname} imageUrl={imageUrl} size={size} />;
  }

  return (
    <DropdownMenu modal={false} open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger aria-label={`${nickname}님 메뉴`} onClick={(e) => e.stopPropagation()}>
        <UserAvatar nickname={nickname} imageUrl={imageUrl} size={size} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" onClick={(e) => e.stopPropagation()}>
        <DropdownMenuItem
          onClick={() => toast('준비 중인 기능이에요', { id: 'coming-soon' })}
          className="text-gray-400"
        >
          <User size={14} className="mr-2" />
          프로필
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => follow.toggle()}
          disabled={follow.isLoading || follow.pending}
          className={follow.following ? 'text-gray-400' : ''}
        >
          {follow.isLoading ? (
            '불러오는 중…'
          ) : follow.following ? (
            <>
              <UserCheck size={14} className="mr-2" />
              팔로잉
            </>
          ) : (
            <>
              <UserPlus size={14} className="mr-2" />
              팔로우
            </>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onMessageClick?.()}>
          <Mail size={14} className="mr-2" />
          쪽지
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default UserActionDropdown;
