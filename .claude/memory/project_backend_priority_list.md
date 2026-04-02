---
name: 백엔드 API 요청 우선순위 (2026-04-02)
description: P0/P1/P2 분류 — P0 3개 해결 시 핵심 플로우 시연 가능
type: project
---

백엔드 API 요청 우선순위 정리 (2026-04-02)

## P0 — 이게 없으면 데모 불가
1. `GET /posts?therapyArea=` 옵셔널 파라미터 추가
2. `title` 필드 optional 변경 (프론트 빈 문자열 전송 중)
3. 치료사 인증 즉시 승인 로직 (합의됐으나 미반영)

## P1 — MVP 필수, 데모 시 "준비 중" 표시 가능
4. 팔로우 시스템 (POST/DELETE /users/:userId/follow + 팔로우 피드)
5. 인증 전용 게시글 블러 (postType 또는 별도 필드)
6. 스크랩 API (POST/DELETE /posts/:postId/scrap)
7. `GET /me/posts` (프로필 "내가 쓴 글" 탭)

## P2 — MVP 범위지만 후순위
8. 파일 업로드 API
9. 회원가입 응답에 토큰 포함
10. 답글 단 글 API

**Why:** P0 3개만 해결되면 Vercel 배포 URL로 핵심 플로우 시연 가능 (회원가입→인증→글작성→필터→리액션/댓글)

**How to apply:** 백엔드 팀원에게 이 우선순위로 공유. P1 중 팔로우는 설계 논의 먼저 필요.
