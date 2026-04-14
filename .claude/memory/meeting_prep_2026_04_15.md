---
name: 2026-04-15 UI 싱크 회의 준비 문서
description: 프론트 주도 UI 싱크 회의 체크리스트 (BACKEND/기획/디자이너/공유). 원본은 docs/meetings/2026-04-15-ui-sync.md
type: project
originSessionId: fa4a79a3-3bd8-4345-83ef-12424170ca09
---
회의 준비 문서 원본: `docs/meetings/2026-04-15-ui-sync.md`

## 안건 요약

**BACKEND**
- B-1: PostSummary에 authorId / empathyCount / appreciateCount / helpfulCount 추가
- B-4: ⭐ DELETED_ACCOUNT 에러 코드 분리 (중점 논의)
- B-5: /posts/feed 필터 파라미터 지원 가능성 (하이브리드 분기 제거용)

**기획**
- C-4: 자기 글 스크랩 차단 정책 (진행자 제안: 아이콘 완전 숨김)

**디자이너**
- D-1: PRIVATE 배지 표기 통일 (Lock only vs Lock + "치료사 전용")
- D-2: PRIVATE 블러 UI 강화 여부
- D-3: PostDetailPage 에러 재시도 버튼
- D-4: 모바일 헤더 rightAction 시안 확정
- D-7: UI-only 기능 일괄 drop (비번찾기 / 배너통계 / 로그인유지 / 이용약관)

**공유만**
- 무한 스크롤 구현 완료, 외부 라이브러리 기반 리팩토링 예정
- visibility API 연동 + 블러 구현 완료
- localhost 이슈 프론트 workaround 완료
- MobilePageHeader, UserAvatar, 페이지네이션 0-based
- 프로필 헤더 카운트는 totalElements로 집계 중

## 회의 후 메모리 갱신 TODO
- project_auth_policy_change.md — title 잔존 언급 제거
- project_post_visibility_ui.md — outdated 갱신
- project_profile_image_localhost_bug.md — P0 제거
- project_ui_only_features.md — D-7 결정 반영
- project_infinite_scroll_progress.md — HEAD 7d2803e + 리팩토링 계획
- project_backend_priority_list.md — B-1/B-4/B-5 우선순위
