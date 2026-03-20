---
name: 다음 세션 리마인드 (2026-03-21)
description: 2026-03-20 타입 수정 완료 후 남은 작업
type: project
---

## 이번 세션에서 완료된 것

- `TherapyArea` enum 값 단축 (`OCCUPATIONAL_THERAPY` → `OCCUPATIONAL` 등)
- `PostSummary` → `author` 객체 제거, `authorNickname` string으로 전환, `likeCount/commentCount/dislikeCount/board` 제거, `contentPreview` 추가
- `PostDetail` → 독립 인터페이스로 분리, `authorNickname`, `scrapped/myReactionType` 제거
- `CommentResponse` → `authorId/authorNickname/authorRole`, `canEdit/canDelete`, `replies` 추가
- `PostCreateRequest` → `board` 제거
- 모든 페이지 (`PostListPage`, `PostDetailPage`, `PostCreatePage`, `PostEditPage`, `MyPage`) 타입 맞춰 수정
- `handlers.ts` mock 데이터 전체 구조 수정
- `npx tsc -b` 통과 확인

## 이번 세션에서 추가 완료된 것 (2026-03-20)

- 백엔드 CORS 반영 완료 확인
- `vercel.json` API 프록시 rewrite 제거 완료

## 다음에 할 것

1. **[1순위] Vercel 환경변수 변경** — 대시보드에서 `VITE_API_BASE_URL` `/api` → `https://api.melonnetherapists.com/api/v1` 변경 후 재배포
2. **백엔드 circular reference 이슈 해결 여부 확인** — 해결되면 로그인 테스트
3. **`GET /me` 실제 동작 확인** — 백엔드 연결 시 MSW `/me` 핸들러 401 처리 정리
4. **백엔드 연결 후 전체 기능 테스트** — 로그인 → 게시글 19개 DB 시딩 → CRUD 확인

**Why:** CORS + 프록시 제거 완료, 이제 Vercel 환경변수 변경 + 백엔드 이슈 해결만 남음

**How to apply:** 다음 대화 시작 시 이 항목들 먼저 알려줄 것.
