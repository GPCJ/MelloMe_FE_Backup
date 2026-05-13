---
name: ""
description: 디자이너 확인/공유 후 구현 가능한 UI 항목 목록 + 협업 방식 + 모바일 퍼스트 정책
metadata: 
  node_type: memory
  type: project
  originSessionId: f47fa414-3a3a-44f8-b2c5-506a39a424fe
---

디자이너와 상의 없이 임의 구현 금지. 확정 후 구현 진행.

**Why:** 협업 프로젝트에서 디자이너 확인 없이 UI 구현 시 재작업 발생.

**How to apply:** UI 작업 요청 시 이 목록 먼저 확인. 미확정 항목은 타입/로직만 구현하고 UI 보류.

---

## 협업 워크플로우
- 디자이너가 당일 확정한 UI 공유 → 프론트가 구현 → 다음날 진행 상황 보고
- UI 디자인 없이는 임의 구현 금지 (타입/로직만 선구현)
- **"확정 기준 레벨" 사전 합의 필요** — 와이어프레임 수준 vs 컬러/스타일까지 확정 후 시작
- **모바일 퍼스트**: 모바일 기준으로 먼저 구현, 데스크탑은 디자인 확정 후 맞추기

---

## 대기 중

- **치료영역 배지** (FNC-025) — 인증된 치료사 닉네임 옆 태그/배지 디자인 미확정. 백엔드 완료, 디자인 확정 후 즉시 구현 가능. `PostCard`는 현재 `VerifiedBadge`(상태 배지)만 노출.
- **팔로우/언팔로우 버튼** — 프로필 페이지 및 게시글 작성자 영역 위치·디자인 (REQ-005, REQ-011). notepad 1순위 "타인 프로필 열람 Jira 티켓"에 묶여 백엔드 API + DM/팔로우 진입점 함께 대기.

## 완료 (2026-05-13 검증)

- **첨부파일 UI** — `PostDetailPage` 칩 패턴 시안 정합 완료 (`PostDetailPage.tsx:371-468`, 1387:12297). PostCard 첨부 칩만 백엔드 `attachments` 필드 머지 대기 (`project_postcard_attachment_chip_pending`).
- **3종 리액션 UI** — `ReactionBar.tsx`에 LIKE(좋아요·Heart)/CURIOUS(궁금해요·Star)/USEFUL(유용해요·Lightbulb) 구현 완료. [[project_comment_reaction_3type_decision]] 정합.
- **인증 전용 게시글 블러 UI** — `PostCard.tsx:92-95` `blur-[5.8px] opacity-50` + 안내 오버레이 완료. URL 직접 진입은 `PostDetailPage.tsx:158` 인증 페이지로 redirect.
- **마이페이지 프로필 화면** — `ProfilePage.tsx` 완료. [[project_profile_page_signal_chrome_2026_05_11]] 시안 정합 적용.
- **마이페이지 아카이빙 탭** — `posts | commented | scrapped` 3탭 + RQ 캐시 무효화 (`ProfilePage.tsx:21-148`).
- **스크랩 버튼** — 게시글/마이페이지 스크랩 탭 + handlers 완료 (`scrap.handlers.ts`, mypage API).
- **데스크탑 헤더 글쓰기 버튼** — `SideNav.tsx:48-53` 글쓰기 버튼 + `Layout.tsx:23,47-50` PC 게시글 작성 모달 진입점 (store 토글).
- **VerificationCompletePage** — PENDING/APPROVED/REJECTED 3분기 + 거절 사유 표시 완료 (`VerificationCompletePage.tsx:50-95`).
- **치료사 인증 상세 정보 UI** — `TherapistVerificationPage.tsx:129-148` 거절 사유 + 심사일 표시 완료.
