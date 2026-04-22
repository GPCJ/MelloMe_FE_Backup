---
name: R-01 ProfilePage React Query 마이그레이션 진행
description: ProfilePage 3탭 RQ 마이그레이션 5단계 진행 상태 추적 — 다음 세션 재개 진입점
type: project
originSessionId: a18075a5-29d9-4659-8c62-9a0a363faeea
---
R-01 React Query 마이그레이션 (백로그) — `frontend/src/pages/profile/ProfilePage.tsx` 3탭 데이터 페칭을 `useQuery`로 교체.

## 진행 상태 (2026-04-22 종료)

- ✅ **1단계** "내가 쓴 글"(`posts`) 탭 — `useQuery` 교체 완료 (ProfilePage.tsx L118-128)
  - import 추가: `useQuery, keepPreviousData` from `@tanstack/react-query` (L21)
  - `postsQuery` 선언 + `postsData/loadingPosts/errorPosts` 재매핑 3줄
  - JSX `onRetry` → `postsQuery.refetch()` (L318)
- ⏳ **2단계** "답글 단 글"(`commented`) 탭 — 미시작
- ⏳ **3단계** "스크랩"(`scrapped`) 탭 — 미시작
- ⏳ **4단계** 정리 — 안 쓰는 타입 import 제거 (`PaginatedComments, PaginatedScraps`)
- ⏳ **5단계** 브라우저 실제 시나리오 검증 — 3탭 왕복, 페이지 이동, 재시도, staleTime/keepPreviousData 효과

## ⚠️ 체크포인트 미실행

1단계 완료 직후 체크포인트(`tsc -b` + posts 탭 브라우저 동작 확인) **아직 돌리지 않음**. 2단계 진입 전 먼저 통과시킬 것.

## 적용 규약

- `queryKey`: `['myPosts' | 'myComments' | 'myScraps', page - 1]` (0-based 백엔드 규약 반영)
- `staleTime: 30_000` / `placeholderData: keepPreviousData` / `enabled: activeTab === '...'`
- 페이지네이션 state(`postsPage`, `commentsPage`, `scrapsPage`)는 UI 상태이므로 `useState` 유지
- 기존 fetch 함수(`fetchMyPosts` 등)는 그대로 사용 — 래핑만 `useQuery`로 변경
- JSX 최소 변경 위해 `const postsData = postsQuery.data` 등 변수 재매핑 사용

## 2단계 재개 체크리스트 (다음 세션 진입점)

1. 1단계 체크포인트 먼저 통과 (`tsc -b` + posts 탭 브라우저 확인)
2. 2단계 대상 (오늘 기준 라인 번호):
   - 삭제: L130-133 (`commentsData/loadingComments/errorComments` useState), L140-147 (`loadComments` 함수)
   - 추가: posts 패턴 복붙 + `myComments`/`fetchMyComments`/`activeTab === 'commented'`로 파라미터 교체
   - JSX L362: `onRetry={() => loadComments(commentsPage)}` → `onRetry={() => commentsQuery.refetch()}`
3. 완료 후 체크포인트(`tsc -b` + commented 탭 브라우저) 통과 → 3단계 scrapped 동일 패턴

## 관련

- 백로그 항목: `backlog.md` R-01
- 가이드라인: `feedback_phased_migration_checkpoints.md`
- 선행 컨텍스트: `project_infinite_scroll_progress.md` (useInfiniteFeed — 이후 useInfiniteQuery 교체 예정)
- 블로그 3편 소재: `project_blog_first_series.md` (useInfiniteQuery 마이그레이션 후기)
