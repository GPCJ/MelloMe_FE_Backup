---
name: 무한 스크롤 구현 진행 상황 — main 머지 완료 (React Query 마이그레이션 대기)
description: 2026-04-14 main 머지 + push 완료, 다음 단계는 React Query 마이그레이션
type: project
originSessionId: d12295c1-2860-4023-84f6-43c8ab8c5586
---
## 현재 상태 (2026-04-14)

**브랜치:** `feat/infinite-scroll` (유지, 다음 작업 이어감) / `main` = `7d2803e` (무한 스크롤 + visibility 통합 완료, origin에 push됨)
**Plan:** `docs/superpowers/plans/2026-04-13-msw-infinite-scroll.md`

## 머지 이력 (2026-04-14)

1. feat/infinite-scroll에 `b73cca6` 블러 복원 커밋 추가 → main 최신 로직과 충돌 리스크 발견 → `reset --hard HEAD~1`로 취소
2. `git merge main` (feat 브랜치 쪽에서) → main의 visibility 최신 구현 자동 유입 + 무한 스크롤 코드 자동 병합 성공
3. 메모리 파일 3개 충돌만 HEAD 버전으로 수동 해결
4. 머지 커밋 `7d2803e`: "merge: main의 visibility 구현을 무한 스크롤 브랜치에 통합" (한국어 커밋 규칙 첫 적용)
5. `main` 체크아웃 → `merge --ff-only feat/infinite-scroll` → `push origin main` 완료

## 프로덕션 배포 확인 사항

- **Vercel `VITE_MSW_ENABLED=false` 확인됨** — MSW가 프로덕션 빌드에서 비활성
- **백엔드 `/api/v1/posts/feed` 실구현 확인됨** (2026-04-14, Swagger)
  - 파라미터: `size`, `cursor`
  - 응답: `{success, data: {items, nextCursor, hasNext, size}}` envelope
  - `fetchFeed`의 `res.data?.data ?? res.data` 언래핑이 정확히 대응

## 다음 단계

- **React Query 마이그레이션** (2026-04-15 예정) — 직접 구현한 `useInfiniteFeed`(E 패턴: `AbortController` + `requestIdRef`)를 `useInfiniteQuery`로 교체. 아래 백로그 이슈들이 RQ 마이그레이션 중 자연 해소될 가능성 높음.

## 남은 기술부채 (RQ 마이그레이션 시 확인)

- **StrictMode 스크롤 복원 손실**: `initialSnapshotRef` 렌더 중 할당 방식이 React 19 StrictMode 더블마운트에서 스냅샷을 잃을 수 있음 — dev 전용, 프로덕션 무관
- **`handleCardClick` 비네비 클릭 스냅샷 갱신**: PostCard 내 스크랩 버튼 등 비네비 요소 클릭 시에도 scrollY 저장됨 → 엣지케이스에서 과거 시점이 복원될 수 있음
- **IntersectionObserver 재구독**: `infinite.loadMore` 참조 변경마다 observer disconnect/observe 반복 — 기능상 버그 아님, 성능 nit
- **useInfiniteFeed 단위 테스트 부재** (Vitest + RTL)
- **정렬 토글 UI** (LATEST/POPULAR) — 디자이너 시안 대기
- **백엔드 협의**: `/posts/feed`에 필터 파라미터 추가 → 받으면 하이브리드 분기 제거 가능

## 핵심 결정 요약

- 커서 기반 (`/posts/feed`), LATEST 고정
- 필터/팔로잉 탭은 기존 페이지네이션(`/posts`) 유지 — `isInfiniteMode = !therapyArea && activeTab === 'all'`
- cursor 불투명 문자열 취급 (프론트는 인코딩 방식 몰라도 됨)
- 스크롤 복원: Zustand store, TTL 5분, consume 1회 (`feedScrollStore`)
