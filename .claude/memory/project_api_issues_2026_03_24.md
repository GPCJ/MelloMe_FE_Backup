---
name: API 불일치 & 백엔드 문의 리스트 (2026-03-24)
description: 프론트 코드 vs 백엔드 OpenAPI 스펙 전수 비교 결과 — 백엔드 문의 항목 및 프론트 수정 항목
type: project
---

2026-03-24 API 통신 테스트 사전 분석. openapi-3.0.yaml + frontend/src/api/*.ts + types/*.ts 전수 비교.

**Why:** 백엔드 API 실제 통신 테스트 전에 이슈를 미리 파악해서 문의 리스트 정리.
**How to apply:** 백엔드 논의 시 이 리스트 참고. 해결된 항목은 상태 업데이트할 것.

---

**백엔드 개발자 복귀 완료 (2026-04-02 확인)** — 🔴 항목 순차 공유 진행

## 백엔드 문의 필요 (우선순위 높음)

### #1 댓글 삭제 URL 불일치
- 프론트 `posts.ts:64`: `DELETE /posts/:postId/comments/:commentId`
- 백엔드 스펙: `DELETE /comments/:commentId` (postId 경로 없음)
- 상태: ✅ 해결 (2026-03-25) — `deleteComment(commentId)`, URL `/comments/${commentId}`로 수정

### #2 게시글 좋아요 시스템 완전 불일치
- 프론트 `posts.ts:76-82`: `PUT /posts/:postId/reaction { reactionType: 'LIKE' }` + `DELETE /posts/:postId/reaction`
- 백엔드 스펙: reactionType enum = `EMPATHY | APPRECIATE | HELPFUL` (LIKE 없음), DELETE 없이 PUT 토글 방식
- 댓글 리액션은 별도 엔드포인트: `PUT /comments/:commentId/reaction { reactionType: 'LIKE'|'DISLIKE' }`
- 상태: ✅ 해결 (2026-03-30) — `ReactionType` enum 수정, `likePost`/`unlikePost` → `getReaction`/`toggleReaction` 교체. UI는 디자이너 확정 후 구현 예정, 임시로 EMPATHY 고정.

### #3 게시글 목록 필터 파라미터 없음
- 프론트 `posts.ts:13`: `GET /posts?board=...&therapyArea=...&sort=...`
- 백엔드 스펙: `GET /posts?sortType=...` 만 있음 (board, therapyArea 없음)
- 파라미터 이름도 다름: 프론트 `sort` vs 백엔드 `sortType`
- 상태: ✅ 해결 (2026-03-25) — `board` 파라미터 제거, `sort` → `sortType` 수정

### #4 프로필 페이지 API 미구현
- 페이지명 마이페이지 → **프로필**로 변경
- 탭 구성: 내가 쓴 글 / 답글 단 글 / 스크랩
- `GET /me/scraps` — ✅ 백엔드 구현 완료
- `GET /me/posts` — 백엔드에 요청 완료 (2026-03-27), 대기 중
- `GET /posts/:postId` authorId → canEdit/canDelete 필드 — ✅ 해결 (2026-03-30)
- 답글 단 글 API — 백엔드 병목으로 보류
- 반응 3종 — 백엔드 병목으로 보류
- 상태: 일부 요청 완료, 응답 대기 중

### #5/#6 therapistVerification nullable 여부 및 status enum
- 프론트 `MeResponse` 타입: `therapistVerification` non-nullable, status = `NOT_REQUESTED | PENDING | APPROVED | REJECTED`
- 백엔드 확인 완료: 미신청 유저에게 항상 `{ status: 'NOT_REQUESTED' }` 객체 반환 (null/빈객체 없음)
- 프론트 코드 모든 접근에 optional chaining `?.` 사용 중 → 문제없음
- `GET /therapist-verifications/me`는 프론트에서 호출하지 않음 → 404 이슈 해당 없음
- 상태: ✅ 해결 (2026-03-31) — 기존 코드 수정 불필요, 백엔드 응답 형태 확인으로 종결

### #7 Google OAuth callback 엔드포인트 스펙 미포함
- 프론트 LoginPage.tsx:57: `/auth/oauth/google/start` 리다이렉트
- OpenAPI 스펙에 OAuth 관련 엔드포인트 없음
- 상태: ✅ 해결 (2026-03-25) — Google OAuth 전면 제거, 이메일 로그인만 사용

### #13 팔로우 시스템 API 미구현 (FNC-029, 040, 041)
- `POST /users/:userId/follow` — 팔로우
- `DELETE /users/:userId/follow` — 언팔로우
- `GET /users/:userId` — 팔로워·팔로잉 수 포함한 프로필 응답
- `GET /posts?followingOnly=true` 또는 별도 엔드포인트 — 팔로우 피드
- 상태: 🔴 미구현 — REQ-005/011, 프론트 팔로우/언팔로우 버튼·팔로우 피드·프로필 페이지 모두 이 API 의존

### #14 postType 인증 전용 게시글 (FNC-026, 027)
- 현재 postType은 'COMMUNITY' 고정
- 인증 전용 게시글을 위한 'CERTIFIED_ONLY' 또는 별도 필드(isPrivate 등) 설계 필요
- 미인증 회원에게 블러 처리된 게시글 응답 방식 확정 필요 (필드 제외 vs 블러 신호 전달)
- 상태: 🔴 미구현 — REQ-003, postType 설계 확정 전에는 프론트 FNC-026/027 구현 불가

### #15 파일 업로드 API (FNC-033, 034)
- 이미지·영상: `POST /posts/:postId/attachments` 또는 게시글 작성 시 multipart/form-data 방식
- PDF: 동일 엔드포인트 or 별도
- 파일 크기·형식 제한 정책 확인 필요
- 상태: 🔴 미구현 — REQ-007, 엔드포인트 스펙 없음

### #16 therapyArea 필터 파라미터 (FNC-030)
- `GET /posts?therapyArea=` 옵셔널 파라미터 추가 요청
- 현재 백엔드 `sortType`만 지원, therapyArea 필터 미지원
- 프론트 UI는 완료, 파라미터 미지원으로 동작 안 함
- 상태: 🔴 미구현 — REQ-006, 요청 방식 확정 (기존 엔드포인트에 옵셔널 파라미터)

---

## 백엔드 문의 필요 (우선순위 중간)

### #8 회원가입 응답에 토큰 없음
- 프론트 `auth.ts:9`: 로그인과 동일한 `{ isNewUser, user, tokens }` 기대 (AuthResponse 타입)
- 백엔드 스펙 SignupResponse: `{ id, email }` 만 반환
- 소셜 로그인 only라면 signup 엔드포인트 사용 방향 재논의 필요
- 상태: 미해결

### #9 /home 엔드포인트 응답 구조
- 백엔드 스펙: `Map<String, String>` (단순 문자열 맵)
- 프론트 MSW: `{ viewer, sections }` 복잡한 구조
- 홈 화면 기획 확정 후 재논의
- 상태: 미해결

---

## 프론트 수정 필요 (백엔드 스펙 기준)

### #10 PostCreateRequest / PostUpdateRequest 필수 필드
- 백엔드 스펙: therapyArea, ageGroup, title, content 모두 required + postType 필드 추가 확인
- 프론트 `types/post.ts`: PostCreateRequest.therapyArea?, ageGroup? 모두 optional
- 상태: ✅ 해결 (2026-03-25) — `postType: 'COMMUNITY'` 고정, `therapyArea`/`ageGroup` 필수 + 연령대 UI 추가, 페이지 0-based 변환(`currentPage - 1`)

### #11 401 자동 refresh 로직 없음
- `axiosInstance.ts`에 401 에러 시 refresh token 재발급 + 재요청 로직 없음
- 상태: ✅ 해결 (2026-03-28) — isRefreshing 큐 방식, `_retry` 무한루프 방지 구현 완료

---

## 스펙에 없는 것 (나중에 논의)

### #12 /meta/options 엔드포인트
- MSW handlers.ts에만 있고 백엔드 스펙에 없음
- 실제로 이 API 쓰는 곳 있는지 확인 필요

---

## 해결된 항목
- #1 댓글 삭제 URL ✅
- #3 sort → sortType, board 파라미터 제거 ✅
- #4 canEdit/canDelete 필드 ✅ (2026-03-30)
- #7 Google OAuth 전면 제거 ✅
- #10 PostCreateRequest 필수 필드 + postType + 연령대 UI + 페이지 0-based ✅
- #11 401 자동 refresh ✅ (2026-03-28)
- #5/#6 therapistVerification nullable 확인 ✅ (2026-03-31) — 항상 객체 반환, 코드 수정 불필요
