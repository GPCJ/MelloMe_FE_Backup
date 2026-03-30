---
name: 코드 리뷰 — 미해결 코드 품질 이슈 (2026-03-22)
description: 전체 코드 리뷰에서 발견된 유지보수 필요 항목 — 백엔드 연결 전후로 정리 필요
type: project
---

2026-03-22 전체 코드 리뷰에서 발견된 미해결 항목.

**Why:** 당장 동작에 문제는 없지만, 백엔드 연결 시점 또는 코드 정리 시 함께 수정 필요.

**How to apply:** 리팩토링 or 백엔드 연결 작업 시 이 항목들 참고해서 함께 처리.

---

## 중복 코드 (리팩토링 대상)

✅ 완료 (2026-03-27)
- `THERAPY_AREA_LABELS`, `THERAPY_CHIPS`, `AGE_CHIPS` → `src/constants/post.ts`로 분리
- `formatRelativeTime()` → `src/utils/formatDate.ts`로 분리
- 5개 파일(PostListPage, PostDetailPage, MyPage, PostCreatePage, PostEditPage)에서 import로 교체

## 기능 이슈 (백엔드 연결 시 수정 필요)

- **isAuthor 닉네임 비교** — ✅ 해결 (2026-03-30)
  - 백엔드가 `canEdit`/`canDelete` 필드를 응답에 추가해줌으로써 자연스럽게 해결됨
  - `PostDetailPage.tsx`에서 이미 `canEdit`/`canDelete` 기반으로 구현 완료

- **401 에러 인터셉터 없음** (`axiosInstance.ts`)
  - Access Token 만료 시 자동 로그아웃 또는 refresh 처리 없음
  - 백엔드 연결 후 토큰 만료 시 조용히 실패함
  - 해결: `axiosInstance.interceptors.response.use` 에러 핸들러 추가 필요

- **SignupPage signup + login 순차 호출** — 이중 호출 아님, 정상 흐름
  - 백엔드 회원가입 응답은 `{ id, email }`만 반환, 토큰은 로그인에서만 발급
  - signup 후 login 호출은 스펙상 필수
