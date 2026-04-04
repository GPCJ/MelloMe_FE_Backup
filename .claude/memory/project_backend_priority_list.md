---
name: 백엔드 API 요청 우선순위 (2026-04-02)
description: P0/P1/P2 분류 — P0 3개 해결 시 핵심 플로우 시연 가능
type: project
---

백엔드 API 요청 우선순위 정리 (2026-04-04 업데이트)

## P0 — 이게 없으면 데모 불가
1. ~~`GET /posts?therapyArea=` 옵셔널 파라미터 추가~~ ✅ 해소 (04-03 Swagger 확인)
2. `title` 필드 optional 변경 (프론트 빈 문자열 전송 중) ❌ 여전히 required
3. ~~치료사 인증 즉시 승인 로직~~ ✅ 해소 — 신청 즉시 THERAPIST 승격 반영됨

## P1 — MVP 필수, 데모 시 "준비 중" 표시 가능
4. 팔로우 시스템 (POST/DELETE /users/:userId/follow + 팔로우 피드) ❌ 미지원
5. 인증 전용 게시글 블러 (postType 또는 별도 필드) ❌ 미지원
6. ~~스크랩 API~~ ✅ 해소 — `/posts/{postId}/scrap` (GET/POST/DELETE), `/me/scraps` 존재
7. ~~`GET /me/posts`~~ ✅ 해소 — 페이징 포함 지원됨

## P2 — MVP 범위지만 후순위
8. ~~파일 업로드 API~~ ✅ 해소 — 업로드/다운로드/삭제 지원됨
9. 회원가입 응답에 토큰 포함 ❓ 확인 필요 (서버 현재 `{id, email}`만 반환, 프론트 AuthResponse 기대 → 타입 불일치 확정)
10. ~~답글 단 글 API~~ ✅ 해소 — `GET /me/comments` 확정 (04-04 Swagger 확인)

## 마이페이지 추가 확정 (04-04)
- `DELETE /me` ✅ 존재 — 회원 탈퇴
- `PATCH /me` ✅ 존재 — 프로필 수정 (nickname + profileImageUrl)

## 비고
- `isNewUser` 필드: 로그인 응답에 boolean으로 존재 확인. 실제 값 정상 여부는 호출 테스트 필요.
- `nickname` 필드: 여전히 회원가입/프로필수정에 존재 (2~20자). 제거 요청 미반영.
- `visibility/isPublic` 필드: 스키마에 없음.
- 추가 개발 요청 20개 전체 목록: `project_backend_additional_requests.md` 참조

**Why:** P0 3개만 해결되면 Vercel 배포 URL로 핵심 플로우 시연 가능 (회원가입→인증→글작성→필터→리액션/댓글)

**How to apply:** 백엔드 팀원에게 이 우선순위로 공유. P1 중 팔로우는 설계 논의 먼저 필요.
