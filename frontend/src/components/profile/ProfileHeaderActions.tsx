import type { ComponentType } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Search, MoreVertical } from 'lucide-react';
import { ProfileEditIcon } from '@/components/icons/ProfileEditIcon';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/shadcn-ui/dropdown-menu';
import MessageUnreadBadge from '@/components/message/MessageUnreadBadge';

interface ProfileHeaderActionsProps {
  onEditProfile: () => void;
}

interface HeaderAction {
  key: string;
  label: string;
  Icon: ComponentType<{ size?: number; className?: string }>;
  onClick?: () => void;
}

// 프로필 헤더 우측 액션(쪽지함/검색/프로필 수정).
// 좁은 화면에선 아이콘 3개가 PageHeader 정중앙 타이틀과 겹쳐, 화면 폭으로 분기한다.
// - PC(md+): 아이콘 가로 나열 + 호버 시 기능명 툴팁(CSS group-hover, 외부 의존성 없음)
// - 모바일(md-): 케밥(⋮) 1개 → 드롭다운에 [아이콘 + 아래 라벨] 세로 목록
export default function ProfileHeaderActions({ onEditProfile }: ProfileHeaderActionsProps) {
  const navigate = useNavigate();

  // 검색은 시안상 자리만 있고 기능 미구현(onClick 없음) — 쪽지함/수정만 동작한다.
  const actions: HeaderAction[] = [
    { key: 'messages', label: '쪽지함', Icon: MessageCircle, onClick: () => navigate('/messages') },
    { key: 'search', label: '검색', Icon: Search },
    { key: 'edit', label: '프로필 수정', Icon: ProfileEditIcon, onClick: onEditProfile },
  ];

  return (
    <>
      {/* PC: 가로 아이콘 + 호버 툴팁 */}
      <div className="hidden items-center gap-4 md:flex">
        {actions.map(({ key, label, Icon, onClick }) => (
          <div key={key} className="group relative flex">
            <button
              type="button"
              onClick={onClick}
              aria-label={label}
              className="text-gray-900 transition-colors hover:text-gray-600"
            >
              <Icon size={24} />
            </button>
            {/* 쪽지함 아이콘에만 안읽음 뱃지(부모 relative). */}
            {key === 'messages' && <MessageUnreadBadge />}
            <span className="pointer-events-none absolute left-1/2 top-full z-50 mt-1.5 -translate-x-1/2 whitespace-nowrap rounded bg-gray-900 px-1.5 py-0.5 text-[11px] text-white opacity-0 transition-opacity group-hover:opacity-100">
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* 모바일: 케밥 → 드롭다운(아이콘 + 아래 라벨, 세로).
          modal=false: 드롭다운이 body 스크롤을 잠가 다른 모달로 누수되는 함정 회피(slice 1 전례). */}
      <div className="relative flex md:hidden">
        {/* 쪽지함이 드롭다운 안에 숨으므로, 케밥 트리거에 안읽음 뱃지를 얹어 열기 전에 알린다. */}
        <MessageUnreadBadge />
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger aria-label="메뉴" className="text-gray-900">
            <MoreVertical size={24} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-0 w-24">
            {actions.map(({ key, label, Icon, onClick }) => (
              <DropdownMenuItem
                key={key}
                onClick={onClick}
                className="flex flex-col items-center gap-1 py-2"
              >
                {/* size prop이 아니라 size- 클래스로 지정 — DropdownMenuItem의
                    `[&_svg:not([class*='size-'])]:size-4` 강제 규칙을 벗어나기 위함(size-10=40px) */}
                <Icon className="size-6" />
                <span className="text-[11px] text-gray-600">{label}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
}
