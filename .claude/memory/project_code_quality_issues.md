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

- `THERAPY_AREA_LABELS` 객체 — PostListPage, PostDetailPage, MyPage 3곳에 동일하게 선언됨
- `formatRelativeTime()` 함수 — PostListPage, PostDetailPage 2곳에 동일하게 선언됨
- `THERAPY_CHIPS` 배열 — PostCreatePage, PostEditPage 2곳에 동일하게 선언됨
- → `src/constants/` 또는 `src/utils/` 파일로 분리 권장

## 기능 이슈 (백엔드 연결 시 수정 필요)

- **isAuthor 닉네임 비교** (`PostDetailPage.tsx:160`)
  - `post.authorNickname === user?.nickname` 으로 수정/삭제 권한 판단 중
  - 닉네임 중복 시 타인 글에 수정/삭제 버튼 노출될 수 있음
  - 해결: 백엔드에 `PostDetail` 응답에 `canEdit` / `canDelete` 필드 추가 요청 필요

- **401 에러 인터셉터 없음** (`axiosInstance.ts`)
  - Access Token 만료 시 자동 로그아웃 또는 refresh 처리 없음
  - 백엔드 연결 후 토큰 만료 시 조용히 실패함
  - 해결: `axiosInstance.interceptors.response.use` 에러 핸들러 추가 필요

- **SignupPage 이중 API 호출** (`SignupPage.tsx:25-27`)
  - `signup()` 이 `AuthResponse`를 반환하는데 무시하고 `login()`을 다시 호출함
  - API 요청 불필요하게 2번 발생
  - 해결: `signup()` 응답으로 바로 `setAuth` 처리하도록 수정
