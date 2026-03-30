---
name: API 불일치 & 백엔드 문의 리스트 (2026-03-24)
description: 프론트 코드 vs 백엔드 OpenAPI 스펙 전수 비교 결과 — 백엔드 문의 항목 및 프론트 수정 항목
type: project
---

2026-03-24 API 통신 테스트 사전 분석. openapi-3.0.yaml + frontend/src/api/*.ts + types/*.ts 전수 비교.

**Why:** 백엔드 API 실제 통신 테스트 전에 이슈를 미리 파악해서 문의 리스트 정리.
**How to apply:** 백엔드 논의 시 이 리스트 참고. 해결된 항목은 상태 업데이트할 것.

---

**백엔드 복귀 후 🔴 항목 해결 예상 기간: 약 1주일 (2026-03-30 기준)**

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
- `GET /posts/:postId` authorId 필드 추가 — 백엔드에 요청 완료 (2026-03-27), 대기 중 (내가 쓴 글 + isAuthor 판단 모두 이 필드로 해결)
- 답글 단 글 API — 백엔드 병목으로 보류
- 반응 3종 — 백엔드 병목으로 보류
- 상태: 일부 요청 완료, 응답 대기 중

### #5 therapistVerification.status 값 불일치
- 프론트: `NOT_REQUESTED | PENDING | APPROVED | REJECTED`
- 백엔드 스펙: TherapistVerificationSummary.status = string (enum 미정의)
- 인증 미요청 사용자에게 NOT_REQUESTED 내려주는지 확인 필요
- 상태: 미해결

### #6 therapistVerification nullable 여부 미명시
- 인증 미요청 사용자의 경우 필드가 null인지, 빈 객체인지 스펙에 없음
- 프론트 타입은 non-nullable로 정의 → 런타임 에러 가능
- 상태: 미해결

### #7 Google OAuth callback 엔드포인트 스펙 미포함
- 프론트 LoginPage.tsx:57: `/auth/oauth/google/start` 리다이렉트
- OpenAPI 스펙에 OAuth 관련 엔드포인트 없음
- 상태: ✅ 해결 (2026-03-25) — Google OAuth 전면 제거, 이메일 로그인만 사용

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
- #7 Google OAuth 전면 제거 ✅
- #10 PostCreateRequest 필수 필드 + postType + 연령대 UI + 페이지 0-based ✅
