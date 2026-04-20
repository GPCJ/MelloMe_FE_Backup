---
name: 백엔드 추가 개발 요청 목록 (2026-04-04)
description: 현재 38개 엔드포인트 외 추가 개발 요청 20개 — P0~PostMVP 우선순위 분류
type: project
---

백엔드 추가 개발 요청 목록 (2026-04-04 기준, 38개 기존 엔드포인트 외)

## P0 — MVP 기능 직접 블로킹 (스키마 변경)

1. `POST /auth/signup` — nickname 필드 제거 + 응답에 tokens 포함
   - 현재 프론트 임시 랜덤 nickname 생성 중, 회원가입 후 자동 로그인 깨짐
2. `POST /therapist-verifications` — therapyAreas 배열 필드 추가
   - FNC-007 치료사 정보 제출 85% 블로커
3. `POST /posts`, `PATCH /posts/{postId}` — title 필드 optional 변경
   - 현재 프론트 빈 문자열 전송 중
4. `POST /auth/login` 응답 — isNewUser 실제 값 정상 반환 (버그 수정)
   - 신규 유저 환영 페이지 미표시 버그

## P1 — MVP 필수

5. `POST /users/{userId}/follow` — 팔로우
6. `DELETE /users/{userId}/follow` — 언팔로우
7. `GET /users/{userId}` — 다른 유저 프로필 (팔로워·팔로잉 수, isFollowing 포함)
8. `GET /posts?followingOnly=true` (또는 별도 엔드포인트) — 팔로우 피드
9. `POST /auth/forgot-password` — 비밀번호 찾기 이메일 발송
10. `POST /auth/reset-password` — 토큰 + 새 비밀번호로 재설정
11. `POST /posts` — postType `CERTIFIED_ONLY` 추가 + 미인증 유저 블러 응답 방식 확정

## P2 — MVP 범위, 후순위

12. `GET /users/{userId}/followers` — 팔로워 목록
13. `GET /users/{userId}/following` — 팔로잉 목록
14. `POST /auth/login` — rememberMe 파라미터 추가 (주간회의 04-07~08 결정 후)
15. `GET /posts/{postId}/attachments` — 첨부파일 목록 조회
16. `PATCH /therapist-verifications/me` — 인증 재신청 (REJECTED 후)

## Post-MVP

17. `GET /auth/oauth/google/start` — Google OAuth 시작점 (주간회의 결정 후)
18. `GET /notifications` — 알림 목록
19. `GET /notifications/stream` — SSE 실시간 알림 스트림
20. `PATCH /notifications/{notificationId}/read` — 알림 읽음 처리

**Why:** 현재 38개 엔드포인트 전수 분석 결과 도출. P0 4개가 현재 프론트 임시 코드·버그의 근본 원인.

**How to apply:** 백엔드 개발자에게 P0부터 순서대로 공유. P1 팔로우는 설계 논의 먼저 필요.
