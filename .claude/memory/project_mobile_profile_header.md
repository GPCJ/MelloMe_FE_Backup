---
name: 모바일 프로필 헤더 구현 — 로그아웃 임시 진입점
description: ProfilePage에 MobilePageHeader + Settings 드롭다운 추가. 톱니바퀴 → 로그아웃 1개 항목 임시 구현, 설정 메뉴 확장은 팀 논의 안건
type: project
originSessionId: 1c5f9820-1e8b-4d01-bbca-a067d9627bb2
---
모바일 뷰에서 로그아웃 진입점이 없던 버그를 해결하기 위해 `ProfilePage`에 디자이너 시안(`← 내 프로필 ⚙️`)에 맞춘 헤더 구현. 2026-04-14, 커밋 `9b88447`.

**구성:**
- `MobilePageHeader title="내 프로필" backTo="/posts"`
- `rightAction`: `Settings` 아이콘 → `DropdownMenu` → "로그아웃" 항목 1개
- `handleLogout` = `Layout.tsx` 패턴 복사: `clearAuth() → navigate('/login') → logout().catch(()=>{})`

**Why:** 모바일 유저가 로그아웃하려면 데스크탑 뷰로 전환해야 했던 버그. 디자이너 시안의 톱니바퀴는 설정 드롭다운을 의도하지만, 구체적인 설정 메뉴 항목은 미정. 로그아웃 필요성이 가장 시급해서 임시로 단일 항목만 넣음.

**How to apply:**
- **설정 드롭다운 항목 확장은 팀 논의 안건** — 추가 항목(프로필 편집, 알림 설정, 탈퇴 등) 필요 시 여기에 추가
- 데스크탑은 기존 `Layout.tsx` 헤더의 UserAvatar dropdown에 로그아웃이 이미 있어 중복 구현 불필요 (`MobilePageHeader`가 `md:hidden`이라 충돌 없음)
- backTo=/posts — 프로필은 보통 게시글 탐색 중 접근하므로 홈 피드로 복귀가 자연스러움
