---
name: 헤더/네비게이션 chrome 통일 정책 (2026-05-08)
description: Layout 글로벌 헤더 폐기 + PageHeader 단일 통일 + SideNav/BottomNav 5슬롯 + UserMenu 케밥 — 시안 기반 chrome 통일 정책
type: project
originSessionId: 5c1474ba-454d-4ace-a838-b4d4fb191aba
---
# 헤더/네비게이션 chrome 통일 정책 (2026-05-08)

시안 기반 chrome 통일 작업 결과로 채택된 정책입니다.

## 결정

- **Layout 글로벌 헤더 폐기** — 페이지별 헤더로 일원화
- **PageHeader 단일 컴포넌트** — 구 `MobilePageHeader`를 `PageHeader`로 리네임 + PC/모바일 동일 노출
  - `title: ReactNode`로 확장 (string + JSX 모두 허용, PostListPage "mellty" 로고 등)
  - 위치: `frontend/src/components/common/PageHeader.tsx`
- **SideNav 6슬롯** — 홈/검색/글쓰기/알림/프로필 5개 + UserMenu 케밥 1개
- **BottomNav 3→5개 확장** — 홈/검색/글쓰기/알림/프로필

**Why**: 시안 1321:5061·4871(치료사 인증) / 1321:4066·3821·3936(PostListPage)에서 일관된 chrome 통일 정책을 추출했습니다. PostListPage 시안엔 글로벌 헤더 없음, 좌측 사이드바 + 페이지별 sub-header 구조입니다.

**How to apply**: 새 페이지는 `PageHeader` 사용(`rightAction`/`backTo`/`leftAction` 슬롯 활용), `Layout`에 헤더 컴포넌트 추가 X. 네비게이션 슬롯 변경 시 시안 정합성을 우선합니다.

## 한계 / 후속

- PostListPage PC 검색바 잔존 (B3 유보, 추후 큰 UI 수정 시 정리)
- 알림 페이지 미구현 (`/notifications` → `NotFoundPage`)
- 인증완료 모달 미구현 (시안 1321:5251, 현재는 `VerificationCompletePage` 페이지)

## 연관

- UserMenu 컴포넌트 패턴 → `project_user_menu_component.md`
- backlog F3 (모바일 햄버거 UserMenu 재사용) / F4 (비인증 차단 카드) / F5 (카드 액션바)
