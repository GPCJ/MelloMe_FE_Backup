---
name: PostListPage ref 렌더 중 접근 이슈
description: PostListPage.tsx의 initialSnapshotRef를 렌더 본문에서 읽고 쓰는 문제 — useEffect로 이전 중단, useInfiniteFeed 타이밍 문제 미해결
type: project
originSessionId: c58e4401-482a-4e1e-b976-dea3c48b6a5f
---
`PostListPage.tsx` 63~65번 줄에서 렌더 본문에 `initialSnapshotRef.current`를 읽고 쓰는 코드가 있어 React 19에서 "Cannot access refs during render" 에러 발생.

**개선 방향:**
- `useEffect`로 이전 + `[isInfiniteMode]` 의존성 배열
- 단, `useEffect`는 렌더 이후 실행되기 때문에 `useInfiniteFeed`의 `initialSnapshot` prop이 첫 렌더에서 `null`로 전달되는 타이밍 문제가 남아 있음
- 이 타이밍 문제를 어떻게 해결할지가 다음 과제

**Why:** Concurrent Mode에서 렌더가 중단/재시작될 때 ref.current가 그 사이 바뀔 수 있어 일관성 깨짐. state는 렌더 시 스냅샷 고정, ref는 항상 최신값 참조.

**How to apply:** 내일 아침 이어서 — useInfiniteFeed의 initialSnapshot 타이밍 문제 해결법 고민 후 직접 수정
