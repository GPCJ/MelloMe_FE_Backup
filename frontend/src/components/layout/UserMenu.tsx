import type { ReactNode } from 'react';
import { LogOut, Settings, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/useAuthStore';
import { logout } from '../../api/auth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/shadcn-ui/dropdown-menu';

interface UserMenuProps {
  className?: string;
  ariaLabel?: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  sideOffset?: number;
  children: ReactNode;
}

export default function UserMenu({
  className,
  ariaLabel = '더보기',
  side = 'bottom',
  align = 'end',
  sideOffset = 8,
  children,
}: UserMenuProps) {
  const navigate = useNavigate();
  const clearAuth = useAuthStore((s) => s.clearAuth);

  function handleLogout() {
    clearAuth();
    navigate('/login');
    logout().catch(() => {});
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={className} aria-label={ariaLabel} title={ariaLabel}>
        {children}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side={side}
        align={align}
        sideOffset={sideOffset}
        className="rounded-2xl shadow-lg min-w-[180px] p-2"
      >
        <DropdownMenuItem onClick={handleLogout} className="px-3 py-2.5 rounded-xl text-sm">
          <LogOut size={18} className="mr-3" />
          로그아웃
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => navigate('/account')}
          className="px-3 py-2.5 rounded-xl text-sm"
        >
          <Settings size={18} className="mr-3" />
          계정
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => navigate('/support')}
          className="px-3 py-2.5 rounded-xl text-sm"
        >
          <Info size={18} className="mr-3" />
          고객센터
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
