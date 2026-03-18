---
name: 코드 리뷰 학습 진행 상황
description: axios interceptor / React Router 코드 리뷰 학습 완료 내용 및 다음 학습 후보
type: project
---

## 완료 (2026-03-14)

### axiosInstance.ts request/response interceptor
- 모듈은 처음 import 시 한 번만 실행됨 (JS 모듈 시스템)
- `useAuthStore.getState()` — 컴포넌트 밖에서 Zustand 스토어를 읽는 올바른 방법
- interceptor에서 매 요청마다 토큰을 읽는 이유 — 로그인/갱신 후 최신 토큰 반영
- React 훅 규칙 — 컴포넌트/커스텀 훅 안에서만 사용 가능 (파일 확장자 무관)
- response interceptor의 역할 — 401 전역 처리
- `Promise.reject(error)` — 에러를 호출부로 전달
- `window.location.href` vs `navigate()` — interceptor는 컴포넌트 밖이라 훅 사용 불가

### Zustand 스토어 (`useAuthStore`)
- 개념 수준으로 이해 완료 (코드 리뷰 스킵)
- 전역 상태 저장소 역할 (토큰, 유저 정보)
- `persist` 미들웨어로 localStorage 연동
- Redux/Context 대비 장점: Provider 불필요, 보일러플레이트 적음, `getState()`로 컴포넌트 밖 접근 가능

### React Router 구조 (App.tsx, ProtectedRoute, GuestRoute) + 면접 시뮬레이션
- `Outlet` — 부모 Route 컴포넌트 내부에서 자식 Route가 렌더링될 위치 지정
- path 없는 Route (레이아웃 라우트) — URL 소비 없이 컴포넌트만 중간에 끼워넣음
- `ProtectedRoute` — user 없으면 /login 리다이렉트, 있으면 Outlet으로 자식 렌더링
- `GuestRoute` — 로그인 유저의 /login, /signup 접근 차단
- `replace` — 히스토리 스택 덮어쓰기, 없으면 보호된 페이지 ↔ 로그인 페이지 무한 반복
- URL 파라미터 (`:id`) — 특정 자원 식별, `useParams()`로 꺼내씀
- REST API — URL로 자원 표현, HTTP 메서드로 행위 표현 (GET/POST/PUT/DELETE)
- HTTP vs HTTPS — S는 SSL/TLS 암호화. 미적용 시 Mixed Content 오류 (멜로미 백엔드 이슈)

### CRUD + 마이페이지 심층 이해 (2026-03-15, 1줄 요약으로 빠르게 훑음)

- `posts.ts` — axiosInstance로 게시글 CRUD + 댓글/스크랩/좋아요 API 함수 모음. 토큰은 interceptor가 자동 처리
- `PostListPage` — URL 쿼리스트링(`?therapyArea=...`)으로 필터 상태 관리, 필터 변경 시 fetchPosts 재호출
- `PostDetailPage` — `Promise.all`로 게시글+댓글 동시 로딩, 좋아요/스크랩은 낙관적 업데이트
- `PostCreatePage` — 제목·내용·치료영역 모두 채워야 제출 가능, 성공 시 새 게시글 상세로 이동
- `PostEditPage` — 진입 시 기존 게시글 불러와 폼에 채움, 수정 완료 시 상세 페이지로 복귀
- `mypage.ts` — 대시보드·내 게시글·활동 내역 GET 함수 3개

## 미완료 / 다음 학습 후보

- `MyPage.tsx` — 아직 미완료, 다음 세션에서 시작
- 위 파일들 제대로 된 심층 리뷰 (오늘은 1줄 요약으로만 훑음 — 내일 처음부터 다시 시작 예정)

**Why:** code-review 워크트리에서 면접 대비 코드 이해 및 언어화 연습 중
**How to apply:** 다음 세션에서 "저번에 하던 코드 리뷰 이어서 하자"고 하면 이 파일 기준으로 이어서 진행. 내일은 posts.ts부터 다시 제대로 시작
