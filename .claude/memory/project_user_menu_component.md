---
name: UserMenu 컴포넌트 패턴 — PC 케밥 + 모바일 햄버거 공유
description: 같은 메뉴 콘텐츠가 PC/모바일에서 다른 펼침 방향·트리거 스타일로 쓰이는 dropdown 공유 컴포넌트
type: project
originSessionId: 5c1474ba-454d-4ace-a838-b4d4fb191aba
---
# UserMenu 컴포넌트 패턴

## 위치
`frontend/src/components/layout/UserMenu.tsx`

## 메뉴 3항목
- 로그아웃 (즉시 동작)
- 계정 (`/account`) — 라우트 미구현 → `App.tsx` `*` 매칭으로 `NotFoundPage` (MVP 의도)
- 고객센터 (`/support`) — 동일

## props 설계
호출처가 위치·스타일을 결정합니다.

| prop | 용도 |
|---|---|
| `side` / `align` / `sideOffset` | 펼침 방향 (PC: `right`/`start`/`16`, 모바일 햄버거 F3 예정) |
| `className` | trigger 스타일 (PC: `p-2 rounded-xl text-gray-400 ...`) |
| `ariaLabel` | a11y 라벨 (기본 "더보기") |
| `children` | trigger 아이콘 (PC: `<MoreHorizontal />`) |

## shadcn DropdownMenuTrigger `asChild` 미지원
Button과 동일하게 `asChild` 미지원 → trigger에 className 직접 적용 + children은 아이콘만 (button 중첩 회피).

**Why**:
- 같은 메뉴 콘텐츠가 두 위치(PC 사이드바 케밥 / 모바일 햄버거)에서 **다른 펼침 방향**과 **다른 트리거 스타일** 필요
- 이전 C2의 "SideNav 6→5 자르기" 결정 일부 되돌림 — 시안 재확인 후 케밥 슬롯이 데스크탑 로그아웃 진입점이라 확인됨

**How to apply**: 새 위치에서 같은 메뉴 노출 시 UserMenu 재사용 + props로 위치/스타일 조정. 메뉴 항목 추가 시 라우트 존재 여부를 먼저 확인합니다.

## 연관
- chrome 통일 정책 → `project_chrome_unification_policy.md`
- shadcn asChild 미지원 (Button + DropdownMenuTrigger) → `feedback_shadcn_button_aschild.md`
