---
name: React Query 마이그레이션 구현 로그 (인지부채 HIGH)
description: useInfiniteFeed 등 RQ 마이그레이션 작업의 메커니즘 상세를 단계별로 적층. Claude 직접 작성 코드 → 작업 종료 후 일괄 복기 Q&A용.
type: project
created: 2026-04-27
status: in_progress
cognitive_debt: HIGH
originSessionId: 795e24ed-d2c2-4561-9722-2a738013005f
---
# React Query 마이그레이션 구현 로그

## 인지부채 태그 — 읽기 전 주의

본 파일에 기록된 코드는 사용자가 아닌 Claude가 직접 작성한 결과입니다. `user_self_coding_goal.md` 정책상 위임된 코드라서, 사용자가 멘탈 모델을 직접 만들지 못한 상태입니다. 다음에 RQ 코드를 만지거나 같은 패턴을 다른 페이지로 옮기기 전에는 아래 "핵심 메커니즘"을 정독한 다음 진행해야 합니다. 마이그레이션이 완료되면(R-01b 브라우저 회귀 통과 시점) 한 번에 복기 Q&A를 돌릴 예정입니다.

---

## 진행 현황 (2026-04-27 기준)

| 단계 | 작업 | 상태 | 커밋 |
|---|---|---|---|
| R-01a | ProfilePage 3탭 `useQuery` + `keepPreviousData` | 완료 (2026-04-23, 사용자 직접 작성) | 924d55e, 0ba0523 |
| R-01b | PostListPage `useInfiniteFeed` → `useInfiniteQuery` | production 코드 반영, 런타임 회귀 검증 대기 (2026-04-27). prerender 비활성 우회(0dcf346)는 6d234cc에서 해소 | 8f0b595, cd126d6 |
| R-05 | ProfilePage 관심사 분리 (RQ 마이그레이션 후속 정리) | 미착수 | — |

---

## R-01b — useInfiniteFeed RQ 치환 (2026-04-27)

### 무엇을 했나

`frontend/src/hooks/useInfiniteFeed.ts`를 통째로 교체했습니다(127줄 → 173줄, 주석 포함). 트레이드오프 결정은 Option 1(훅 내부만 치환, 최소 범위)이라 인터페이스를 그대로 유지했고, `PostListPage.tsx` 호출부는 변경하지 않았습니다. 마이그레이션 가이드는 wiki `r-01b-useinfinitefeed-useinfinitequery`에 있습니다.

### 핵심 메커니즘 7개

#### 1. RQ 캐시 정신모델 — "책" 은유

`useInfiniteQuery`의 `data`는 두 개의 평행 배열로 표현되는 한 권의 책입니다.

```
data = {
  pages:      [page0, page1, page2, ...]   ← 펼친 페이지 내용 (queryFn 리턴값)
  pageParams: [null,  'c_x', 'c_y', ...]   ← 각 페이지를 펼칠 때 사용한 책갈피
}
```

불변량: `pages.length === pageParams.length`. `initialData`를 직접 만들거나 `queryClient.setQueryData`로 손댈 때 이 불변량을 어기면 `getNextPageParam` 호출 흐름이 어긋납니다.

#### 2. signal 자동화로 E패턴이 사라짐

v1에서는 `inflightRef.current?.abort()` + `requestIdRef`로 stale 응답을 직접 걸렀습니다. v5에서는 `queryFn: ({ signal }) => fetchFeed({ signal })`만 적어 두면 RQ가 컴포넌트 언마운트, queryKey 변경, `queryClient.cancelQueries()` 호출 시점에 알아서 abort 합니다. stale 응답 무시도 캐시 단위 `fetchStatus` 머신이 보장하므로 `requestIdRef` 패턴이 필요 없어집니다. 합쳐서 약 40줄이 사라집니다.

#### 3. initialData로 스냅샷 주입 + staleTime 함정

뒤로가기 스냅샷 복원은 `useFeedScrollStore.consume()`이 돌려준 데이터를 `initialSnapshot`으로 훅에 넘겨, 훅 내부에서 `initialData = { pages: [page0], pageParams: [null] }` 모양으로 변환해 RQ에 주입하는 방식입니다.

여기에 함정이 하나 있습니다. RQ 기본 `staleTime=0`이라 `initialData`가 있어도 마운트 직후 백그라운드 refetch가 일어납니다. 결과적으로 첫 페이지가 새로 받은 데이터로 덮여 버려 스크롤 복원 위치의 아이템이 바뀌는 회귀가 생깁니다. 이를 막기 위해 `staleTime: Infinity` + `refetchOnWindowFocus: false`를 명시했습니다. 이렇게 두면 명시적 `fetchNextPage` / `refetch`만 네트워크를 일으키므로 v1 동작과 동일해집니다. 부수효과로 탭 전환 시 RQ 캐시가 재사용되는 이득도 따라옵니다.

#### 4. onError 콜백 → useEffect(isError) 우회

RQ v5는 `useQuery`의 `onError` 옵션을 제거했기 때문에 `useEffect(() => { if (query.isError) onErrorRef.current?.(); }, [query.isError])` 패턴으로 우회합니다. 콜백은 `useRef`에 보관해서, 부모가 매 렌더 새 함수를 넘겨도 effect 의존성을 흔들지 않도록 했습니다. PostListPage는 이 콜백을 받아 `feedFailed=true`로 만들어 페이지네이션 모드로 폴백합니다(P1 fallback과 동일한 흐름).

#### 5. retry 의미 보존 (refetch vs fetchNextPage)

v1의 `retry`는 "아직 한 페이지도 못 받았으면 처음부터 다시, 일부 페이지를 받은 상태에서 다음 페이지 페치가 실패한 거라면 그 다음 페이지만 재시도"라는 의미였고, 이때 받은 페이지는 버리지 않았습니다.

RQ의 `query.refetch()`는 모든 페이지를 처음부터 다시 가져오는 동작이라, 그대로 매핑하면 "받은 N개 페이지를 버린다"는 의미로 바뀝니다. 그래서 분기를 둡니다.

```ts
if (items.length === 0) query.refetch();
else query.fetchNextPage();
```

`fetchNextPage`는 직전 실패 페이지를 다시 시도하므로 사용자 시나리오가 보존됩니다.

#### 6. v1 ↔ v5 상태 매핑

| v1 반환 | v5 매핑 | 비고 |
|---|---|---|
| `isLoading` | `query.isLoading` | "초기 스켈레톤 띄울 때" 의미 동일 (`isPending && isFetching`) |
| `isFetchingMore` | `query.isFetchingNextPage` | 1:1 매핑 |
| `error` (string\|null) | `query.isError ? string : null` | 메시지 그대로 |
| `hasNext` | `query.hasNextPage ?? false` | `getNextPageParam`이 undefined를 리턴한 마지막 페이지에서 자동 false |
| `nextCursor` | `query.data?.pages.at(-1)?.nextCursor ?? null` | 외부 호환용. 내부 페치에는 사용하지 않음 |

#### 7. retry 자동 비활성화 (P1 fallback 회귀 방지)

RQ 기본값 `retry: 3` + 지수 backoff(1s/2s/4s)이라 첫 실패 후 약 7초간 `isError=false`가 유지됩니다. 그동안 스켈레톤이 계속 노출되고 P1 fallback도 그만큼 지연됩니다. v1에는 retry 로직이 없어 단발 실패였으므로 동작 보존을 위해 `retry: false`로 명시했습니다(2026-04-27 MSW 검증 중 발견, 커밋 cd126d6).

사용자 정책: 500 에러는 즉시 페이지네이션 모드로 폴백, 자동 재시도 없음. 재시도는 브라우저 새로고침으로만 허용합니다.

### 회귀 위험 체크리스트

1. 스크롤 복원 시 첫 페이지 덮어쓰기 금지. `staleTime: Infinity` 유지. RQ 옵션을 만질 때 반드시 다시 검증해야 합니다.
2. `pages.length === pageParams.length` 불변량. `initialData`를 만들거나 외부에서 수동 조작할 때 어기면 `getNextPageParam` 흐름이 어긋납니다.
3. `enabled` 토글 시 캐시 보존. 필터 모드 진입(false) → 빠짐(true)으로 돌아왔을 때 첫 페이지 재요청이 일어나지 않아야 정상입니다.
4. 에러 폴백의 멱등성. 같은 `isError` 값에서 useEffect가 다시 발화하지 않는지 확인해야 합니다 (의존성 `[query.isError]` 유지).
5. `retry` 호출 후 로딩 플래그 분기. `fetchNextPage`는 `isFetchingNextPage=true`로 진입하고 `isLoading`은 false 유지입니다. 스켈레톤과 인라인 로더 구분이 깨지지 않아야 합니다.
6. RQ `retry` 옵션을 만질 때 P1 fallback 지연 회귀 검증 필수. 기본값(`retry: 3`)으로 되돌리면 첫 실패 후 ~7초간 `isError=false`가 유지되어 스켈레톤 노출과 폴백 전환이 동시에 지연됩니다.

### 트레이드오프 / 보류

- Option 1(최소 범위) 채택 이유: Zustand 스냅샷 스토어를 그대로 두고 `initialData`로만 주입하므로 변경 범위가 좁고 회귀 리스크가 낮습니다.
- Option 2(RQ-native: `queryClient.setQueryData` + 별도 scrollY 스토어)는 변경 범위가 넓어져 MVP 안정화 시기에 보류했습니다.
- `useInfiniteFeed` 단위 테스트는 R-01b 범위 밖 → 그대로 부재 상태입니다.

### 관련 메모리

- `feedback_ai_written_code_cognitive_debt.md` — 본 파일의 메타 규칙(인지부채 HIGH 기록 의무).
- `user_self_coding_goal.md` — AI 위임 정책.
- wiki `r-01b-useinfinitefeed-useinfinitequery` — 마이그레이션 가이드(체크리스트, 빈칸 스켈레톤).
- wiki `useinfinitefeed-e-requestidref` — v1 E패턴 디버깅 기록.
- wiki `p1-feed-pagination-auto-fallback-high` — P1 fallback 메커니즘. 본 훅의 `onError`가 발화시키는 흐름의 반대편.
- `project_infinite_scroll_progress.md` — v1 머지 직후 상태(2026-04-14, stale).

---

### Production 코드 반영 + 런타임 검증 대기 (2026-04-27)

cd126d6 push 직후 Vercel 빌드 hang이 났는데, **R-01b 코드와 무관한 prerender 빌드 결함**으로 판명됐습니다(원인: React 19 + `react-dom/server` 잔류 핸들, `preactjs/vite-prerender-plugin` Issue #3). 1차로 prerender 임시 비활성화(0dcf346)로 우회 → R-01b 코드 production 반영. 이후 6d234cc에서 `closeBundle` 훅 + `process.exit(0)` 패턴으로 prerender 재활성 + 우회 해소. 상세는 wiki `vite-prerender-plugin-react-19-hang` (debugging). 즉 빌드/배포 측 검증은 모두 통과 — `tsc -b && vite build` + Vercel deployment + prerender 산출물 3개 정상.

**남은 검증**: 런타임 회귀(production 사이트에서 직접 확인 필요)
- 무한 스크롤 다음 페이지 페치
- 게시글 클릭 → 뒤로가기 시 스크롤/필터 복원
- 필터 칩 변경 시 깜빡임 없는지
- 에러 시 P1 fallback 전환

런타임 검증 통과 시 본 파일 `status: in_progress` → `done`으로 이동.

---

## R-01a — ProfilePage 3탭 RQ 전환 (2026-04-23, 보존용)

사용자 직접 작성이라 인지부채 HIGH 기록 의무 대상은 아니지만, RQ 마이그레이션 흐름의 일부로 헤더만 남겨 둡니다. 상세 메커니즘은 별도 기록되지 않았으므로, R-05(ProfilePage 관심사 분리) 진행 시 본 파일에 후속으로 보강합니다.

- 파일: `pages/profile/ProfilePage.tsx`
- 패턴: `useQuery` + `keepPreviousData`로 작성글/스크랩/내정보 3탭 전환 시 깜빡임 제거.
- 커밋: 924d55e, 0ba0523.
