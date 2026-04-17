# 노션 업데이트 초안

**대상 페이지:** 멜로미 프론트엔드 개발 진행 상황
**URL:** https://www.notion.so/322c8200749b81a2a188dd0082b6b15a

(이력서/포트폴리오/면접 답변에 그대로 인용할 수 있도록 STAR 형식으로 정리)

---

## 기능 1. 메인 피드 무한 스크롤

### 한 줄 요약
페이지네이션 버튼 방식의 메인 피드를 커서 기반 무한 스크롤로 전환하여 탐색 흐름을 끊김 없이 개선

### Situation
- 멜로미 메인 피드는 "다음 페이지" 버튼 기반 페이지네이션이었음
- 모바일 사용자 비중이 높은 커뮤니티 특성상, 버튼 클릭 → 상단 점프 → 새 목록 로딩 흐름이 탐색 피로도를 키움
- 백엔드가 별도 커서 기반 엔드포인트(`GET /api/v1/posts/feed`)를 제공하기 시작

### Task
- 기존 페이지네이션은 유지하되, 기본 전체 피드에만 무한 스크롤을 적용
- 게시글 상세 진입 후 뒤로가기 시 스크롤 위치 복원
- StrictMode·중복 요청·취소(race condition) 케이스 안전성 확보

### Action
- IntersectionObserver + 커스텀 훅 `useInfiniteFeed` 직접 구현
  - `AbortController`로 진행 중 요청 취소
  - `requestIdRef`로 늦게 도착한 응답을 무시하는 "요청 ID 가드 패턴" 적용
- 스크롤 복원: Zustand 스토어에 `(scrollY, snapshot, TTL 5분)` 저장, 1회 소비 후 폐기 (`feedScrollStore`)
- 모드 분기: `isInfiniteMode = !therapyArea && activeTab === 'all'` — 필터/팔로잉 탭은 기존 페이지네이션 유지
- API 응답 envelope(`{success, data: {items, nextCursor, hasNext}}`) 언래핑을 한 곳에서 처리해 호출부 간소화
- MSW에 커서 기반 mock 추가하여 백엔드 준비 전부터 동일 인터페이스로 개발

### Result
- 04-14 main 머지·배포 완료, 백엔드 실서버 `/posts/feed` 연동 검증 완료
- 모바일 탐색 흐름이 끊김 없이 이어지고, 상세에서 돌아와도 보던 위치가 유지됨
- 다음 단계로 React Query `useInfiniteQuery` 마이그레이션을 계획 중 (직접 구현으로 race/취소 패턴을 학습한 뒤 라이브러리로 이관)

### 면접 예상 질문 & 답변 포인트
- **Q. 왜 React Query를 처음부터 쓰지 않았나요?**
  - A. 라이브러리에 의존하기 전에 race condition·요청 취소·StrictMode 더블마운트의 동작 원리를 직접 다뤄보고 싶었습니다. 직접 구현해본 경험이 있으니, 추후 React Query로 옮길 때도 어떤 문제를 추상화해주는지 명확히 이해한 채로 사용할 수 있습니다.
- **Q. race condition은 어떻게 처리했나요?**
  - A. 두 가지를 같이 썼습니다. (1) `AbortController`로 진행 중 fetch를 취소, (2) `requestIdRef`로 응답에 요청 ID를 매겨, 가장 마지막 요청 ID와 일치하지 않으면 결과를 버립니다. abort만으로는 StrictMode 더블마운트나 마이크로태스크 타이밍에서 새는 응답이 있어서 ID 가드를 추가했습니다.
- **Q. 스크롤 복원은 어떻게 구현했나요?**
  - A. 라우팅 시점에 Zustand 스토어에 scrollY와 목록 스냅샷을 TTL 5분으로 저장하고, 피드로 복귀할 때 1회 소비합니다. 5분이 지났거나 다른 진입이면 무시되어 항상 최신 데이터가 우선되도록 했습니다.

---

## 기능 2. 게시글 공개/비공개(visibility) 정책 + 블러 카드

### 한 줄 요약
치료사 전용 게시글을 일반 회원에게 "내용은 가리되 존재는 보이는" 블러 카드로 노출하여 가입 전환 동선을 확보

### Situation
- 멜로미는 일반 사용자(USER)와 인증 치료사(THERAPIST) 두 권한이 공존
- 치료사 전용(`PRIVATE`) 게시글에 대한 응답 정책이 디자이너/백엔드 사이에서 어긋나 있었음
  - 디자이너 의도: 목록에는 노출하되 본문은 블러 + "인증 회원 전용" 안내 → 가입 유도
  - 백엔드 초기 동작: USER 응답에서 PRIVATE 글을 아예 제외 → 콘텐츠가 존재한다는 신호 자체가 사라짐

### Task
- 두 입장 차이를 정리해 회의 안건으로 올리고, 합의된 정책을 프론트·mock·백엔드 전반에 일관되게 반영

### Action
- 충돌 지점을 정리해 04-14 데일리 스크럼에 안건 상정 → 디자이너 안(블러 카드) 채택
- 프론트:
  - `PostCard`/`PostDetailPage`의 `isBlurred` 분기 복원 및 안내 카피·접근성(aria-label) 정리
  - USER 롤에서도 PRIVATE 카드가 목록·상세에 노출되도록 라우팅·렌더링 흐름 점검
- MSW: `isBlurred=true` + 빈 `content`/`contentPreview`로 응답하도록 mock을 디자이너 안과 일치시켜, 백엔드 수정 전부터 프론트 회귀를 방지
- 작성자 측 UI: `PostCreatePage`에 자물쇠 토글(`LockOpen`/`Lock`) 추가, 모바일/데스크탑 레이아웃 분기로 한 줄 정렬
- 백엔드에는 동일 응답 정책으로 맞춰달라는 요청을 GitHub Issue로 추적

### Result
- 04-14 main 머지 완료(770e7af, 9b88447 등), USER가 비공개 글의 존재를 인지하고 가입으로 이어질 수 있는 동선 확보
- mock과 디자이너 시안이 일치하여, 백엔드 정책 반영 전후로도 프론트 회귀 위험 없음
- 백엔드 응답 정책 반영은 추적 중 (대기 항목으로 메모리·이슈에 등록)

### 면접 예상 질문 & 답변 포인트
- **Q. 디자이너와 백엔드의 정책이 다를 때 어떻게 조율했나요?**
  - A. 먼저 어떤 응답이 어느 사용자 경험으로 이어지는지를 사례로 정리했습니다. "USER에게 글을 빼면 콘텐츠 존재 자체를 모르고, 가입 유도 동선과 기존 블러 UI 자산이 무용해진다"는 점을 근거로 디자이너 안을 채택하자고 제안했고, 데일리 스크럼에서 합의했습니다.
- **Q. 백엔드 수정이 늦어지는 동안 프론트는 어떻게 보호했나요?**
  - A. MSW mock을 합의된 디자이너 안에 맞춰 두었습니다. mock이 백엔드 정책 우회를 허용하면 프론트 회귀가 숨겨지기 때문에, mock은 항상 "최종 합의된 백엔드 정책을 시뮬레이션"하는 위치로 운용한다는 원칙을 갖고 있습니다.
- **Q. 권한별 UI 분기에서 신경 쓴 부분은?**
  - A. 단순히 보이고/안 보이고가 아니라, USER에게 "가려져 있다"는 사실 자체를 명확히 전달하는 것이 가입 전환의 핵심이라고 봤습니다. 그래서 카드 자체는 노출하되, 본문 영역에 잠금 안내 + 가입/인증 액션을 함께 두는 형태로 정리했습니다.

---

## 이력서 한 줄 버전 (참고)
- 메인 피드 커서 기반 무한 스크롤 도입 — IntersectionObserver + AbortController + requestId 가드로 race/취소 안전성 확보, Zustand 기반 스크롤 복원(TTL 5분) 구현
- 권한별 게시글 공개/비공개 정책 정리 — 디자이너/백엔드 충돌을 회의 안건으로 올려 블러 카드 정책으로 합의, MSW를 합의된 정책에 맞춰 프론트 회귀 방지

---

# 설계 결정 & 아키텍처 — 04-15 — feed 실패 시 pagination auto-fallback 설계

## 1. fallback 트리거 정책 7개 결정

**문제:** 백엔드 `/posts/feed`가 임시로 500을 뱉는 상황에서 메인 피드가 무력화. 무한 스크롤을 유지하면서도 feed 실패 시 안전하게 pagination으로 내려오는 경로가 필요.

**검토한 선택지:**
- (a) 무한 스크롤 비활성화 — 임시 회피지만 사용자 경험 후퇴
- (b) 진입 시 시도 → 실패 시 1회 fallback — 정상 복구 시 자동 재활성화
- (c) sticky per-session 플래그 — 새로고침에도 살아남지만 복구 탐지 경로 없음

**결정:** (b) 채택. 다음 7가지 세부 정책 확정.
1. 필터 칩은 기존 pagination 유지 (백엔드 `/posts/feed`가 `therapyArea` 파라미터 받기 전까지)
2. Sticky 아님 — mount 단위로만 유지, 새로고침/재진입 시 재시도
3. 렌더 실패하는 모든 에러 (4xx/5xx/네트워크) = fallback 트리거. 401은 인터셉터가 먼저 처리하므로 자연 통과
4. 로딩 UX는 인라인 안내 텍스트 1줄 (완전 무음 교체 지양)
5. 디버깅 우선 — P0 drift 버그 먼저 클로즈 후 새 설계 (재발 방지)
6. fallback 로직은 임시 가드가 아니라 pagination 엔드포인트 제거 시점까지 영구 유지
7. 적용 범위 `/posts`에만 한정 (SearchPage/ProfilePage 보류)

---

## 2. "한 mount 1회 시도" 보장 메커니즘

**문제:** P0 버그(`d776f85`)에서 `isInfiniteMode` flip으로 `useInfiniteFeed`가 재활성화 → 중복 요청/race. 새 설계에서 같은 메커니즘이 살아남으면 안 됨.

**검토한 선택지:**
- (a) fallback 신호를 부모의 `useEffect(() => watch(infinite.error))`로 감지 — render→commit→effect 한 프레임 지연. 그 사이 다른 effect가 enabled 재평가 가능 (P0 재발 위험)
- (b) `useInfiniteFeed`에 `onError` 콜백 prop — 훅 내부 catch에서 즉시 동기 호출. setError + setFeedFailed가 React batching으로 한 번의 리렌더에 처리됨

**결정:** (b) 콜백 + `feedFailed` state를 단방향(false→true)으로 운용.
- `feedFailed=true`가 되면 `isInfiniteMode=false`로 고정, 어떤 사용자 액션(필터 칩/탭/URL)으로도 false로 돌아가지 않음
- 해제 경로는 unmount/remount만 (`useState(false)` 초기값)
- 회귀 가드: 코드베이스 어디에도 `setFeedFailed(false)` 등장 금지 (grep 필수)

---

## 3. onError 콜백의 stale closure 회피

**문제:** 부모가 매 렌더 새 함수 객체로 `onError`를 전달. useCallback deps에 그대로 넣으면 `fetchPage`가 매 렌더 재생성 → fetch effect가 매 렌더 abort+재시작 → 04-14 race 재현.

**검토한 선택지:**
- (a) deps에 `options.onError` 포함 — race 재발
- (b) 부모가 useCallback으로 stable 참조 전달 — 호출부에 규율 강제, 잊으면 즉시 회귀
- (c) 훅 내부에서 `onErrorRef = useRef(options.onError)` + 매 렌더 `onErrorRef.current = options.onError` 동기화 — latest 참조 보장 + fetchPage stability 유지

**결정:** (c) Latest ref 패턴. 04-14 `requestIdRef` 패턴과 같은 부류. 호출부에 규율을 요구하지 않아 안전.

---

# TIL — 2026-04-15 — onErrorRef latest-ref 패턴과 React batching으로 1회 시도 보장

**분류:** React 패턴 / 상태 머신 설계

## 오늘 한 것
- `/posts/feed` 500 대응 fallback 구현 (커밋 f4a50cc, 3파일 변경)
- `useInfiniteFeed`에 `onError` 콜백 prop 추가 + `onErrorRef` 패턴 적용
- `PostListPage`에 `feedFailed` state(단방향 sticky-per-mount)로 모드 분기 고정
- MSW에 `FORCE_FEED_500` 검증 토글 추가 (기본 false)

## 배운 것 / 인사이트

### 1. Latest ref 패턴 — 콜백 prop을 useCallback deps에서 제외하는 법
- 부모가 매 렌더 새 함수 객체로 콜백을 넘길 때, deps에 직접 넣으면 하위 useCallback/useEffect가 매 렌더 재생성/재실행 → abort+재시작 race
- 해법: 훅 내부에서 `ref.current = options.callback`를 매 렌더 동기화. 소비 시점에는 `ref.current?.()`로 latest 참조만 읽음 → deps에서 빠지면서도 최신 값 보장
- 04-14 `requestIdRef`(응답 순서 가드)와 구조가 같음. "mutable reference로 closure stale 문제 우회"라는 같은 가족

### 2. React batching으로 "상태 머신 한 스텝 이동" 보장
- catch 블록에서 `setError(...)` + `onErrorRef.current?.()`(내부에서 `setFeedFailed(true)`) 두 set state가 batching으로 한 번의 리렌더에 처리됨
- 다음 렌더에서 `feedFailed=true` → `useInfinite=false` → `enabled=false` → fetch effect cleanup만 실행되고 종료. 중간에 "isInfiniteMode=true인 프레임"이 존재하지 않음
- 반면 부모 `useEffect(() => watch(error))` 방식은 render→commit→effect 한 프레임 지연. 그 사이 다른 effect가 enabled를 재평가할 여지 생김
- 교훈: **fallback/상태 전환 신호는 "지연 없는 동기 콜백"이 effect watch보다 안전**

### 3. 단방향 state로 재진입 자체를 봉쇄
- `feedFailed`는 false→true 단방향. reset 경로를 아예 코드에서 제거
- 결과: 필터 칩 클릭, 탭 토글, URL 변경 등 어떤 사용자 액션도 `isInfiniteMode`를 true로 되돌릴 수 없음 → 한 mount 1회 시도 기계적으로 보장
- 회귀 가드는 정적: "`setFeedFailed(false)`가 grep에서 나오면 안 됨" 한 줄

## 포트폴리오 어필 포인트
- **race 재발 방지 설계력:** P0 drift 버그(d776f85)를 해결한 직후 새 fallback 설계에서 같은 메커니즘이 살아남지 않도록 "단방향 state + 동기 콜백 + latest ref" 3중으로 방어
- **라이브러리 없이 상태 머신 원리 학습:** React Query `useInfiniteQuery`로 이관 전에 batching/effect 타이밍/closure stale을 직접 다뤄봄
- **검증 가능한 설계:** MSW `FORCE_FEED_500` 토글로 팀원 누구나 수동 검증 가능. 6개 시나리오 스펙 문서화

---

# 📈 프로젝트 성과 & 지표 — 04-17 — 백엔드-프론트 API 이슈 전면 정리 및 블로킹 해소

## 블로킹 항목 정리 성과
- 기존 블로킹 대기 7건(B-01~B-06) → 정리 후 5건으로 감소 (P0 1건, P1 4건)
- **해소 3건**
  - B-02 title 필드 optional 반영
  - B-05 `scrapped` 필드 백엔드 추가 → 프론트 연동 완료
  - B-06 isNewUser 하드코딩: 회원가입 = 첫 로그인 전제의 의도된 처리로 확정
- **신규 분리 2건**
  - BE-PERM USER 롤 `canWritePrivatePost` 권한 필드 도입
  - BE-FILE 첨부파일 이미지 MIME 허용 여부 확인
- **UI 섹션 → 완료 아카이브 이동**
  - U-04 검색 API (페이지네이션 버전 구현 완료)
  - U-07 공개/비공개 토글 API 연동 (이미 `visibility: PUBLIC|PRIVATE` 전송 중 확인)

## 프론트 최신화 커밋 2건
- `0bbb77b` — B-05 scrapped 필드 초기값을 PostCard/PostDetailPage에 연동
  - `PostCard`: prop으로 post를 즉시 받으므로 `useState(post.scrapped ?? false)` 초기값으로 해결
  - `PostDetailPage`: post를 fetch로 받으므로 Promise.all 성공 콜백에서 `setScrapped(postData.scrapped ?? false)` 동기화
  - 데이터 수명주기(prop-driven vs fetch-driven) 차이를 반영한 동기화 시점 분리 설계
- `b66aefd` — B-01 프로필 이미지 localhost origin 치환 핫픽스
  - `resolveImageUrl`에서 `http://localhost:8080` → 배포 origin 치환
  - 백엔드 수정 배포 후 제거 예정 (한시적 핫픽스)

## 전달 전략 정립
- P0(B-01) 단독 선공유 → P1 4건 일괄 공유 우선순위 결정
- 전달 원칙: "왜 문제인지 + 기대 결과"만 전달, 구현 방식은 백엔드에 위임 (기존 원칙 재확인 + 케이스 적용)
- backlog.md 섹션 리모델링: B-넘버링 유지 + BE-PERM/BE-FILE 접두 분리로 넘버링 충돌 회피

## 이력서 bullet 예시
- 블로킹 중인 백엔드 API 이슈 7건을 코드·메모리·Swagger 교차검증으로 재분류, 3건 해소·2건 세분화하여 백엔드 전달용 우선순위 문서 작성
- 백엔드 응답 필드 추가(`scrapped`)를 프론트에 즉시 반영, 데이터 수명주기(prop vs fetch)에 따라 동기화 시점을 분기 설계 — PostCard는 prop 초기값, PostDetailPage는 fetch 성공 콜백에서 setter 호출

---

# 🔧 트러블슈팅 — #NNN — PostCard useState 두 줄 적용 위치 오류

**날짜**: 2026-04-17
**분류**: React useState / 코드 수정 실수
**난이도**: ★☆☆ (간단하지만 실전에서 자주 재현되는 패턴)

## 문제 상황
- B-05(백엔드 `scrapped` 필드 응답) 반영을 위해 `PostCard.tsx`에서 `useState` 초기값 수정이 필요했음
- 원래 변경 대상: 19줄 `const [scrapped, setScrapped] = useState(false)` → `useState(post.scrapped ?? false)`
- 실제 적용 결과: 바로 아래 20줄 `scrapLoading` 쪽에 `post.scrapped ?? false`가 잘못 들어감
- **증상**: 이미 스크랩한 글이 목록 진입 즉시 `scrapLoading === true`로 시작 → 버튼 disabled → 사용자가 클릭해도 반응 없음. `scrapped`는 여전히 `useState(false)` 고정이라 **B-05 자체도 해결 안 됨**

## 원인 분석
- 두 줄이 인접해있고 둘 다 원래 `useState(false)` 패턴 → 수정 시 줄 식별 시각적 실수
- 타입 체크(tsc)는 `boolean` 자리에 `boolean`이 들어간 거라 통과 → **컴파일러는 실수 감지 못 함**
- 리뷰 단계에서 "컴파일 잘 되니까 맞겠지"로 넘어가면 런타임 증상이 드러나기 전까지 못 잡음

## 해결 과정
1. 수정 직후 파일 재읽기(Read tool)로 실제 라인 확인
2. 19-20줄이 뒤바뀐 것 발견
3. 두 줄 순서만 교정:
   ```tsx
   const [scrapped, setScrapped] = useState(post.scrapped ?? false);
   const [scrapLoading, setScrapLoading] = useState(false);
   ```

## 핵심 개념
- **useState 초기값은 런타임 state를 결정하지만, 타입 체크는 실수를 못 잡는다** — 둘 다 `boolean`이면 TypeScript는 무사 통과
- **수정 후 "결과 파일 직접 재읽기"가 최소 체크리스트** — 특히 인접 줄에 같은 패턴이 있을 때
- `tsc -b`는 "타입이 맞는 실수"를 절대 못 잡음 → 단위 테스트 / E2E / 수동 DevTools 검증이 필요

## 면접 포인트
- **Q. 간단한 수정에서 왜 실수했나요?**
  - A. 두 줄이 인접해 있고 둘 다 동일 패턴(`useState(false)`)이라 줄 식별을 시각적으로 잘못했습니다. 이후에는 수정 후 반드시 해당 줄을 직접 다시 읽어 확인하는 절차를 습관화했습니다.
- **Q. 이런 실수를 방지하려면 어떻게 설계를 바꿀 수 있을까요?**
  - A. (1) 런타임 검증: E2E나 Storybook 스냅샷으로 초기 렌더 상태를 자동 검증. (2) 구조 리팩토링: 단일 컴포넌트에 `useState` 개수를 줄이기 위해 `useScrap` 같은 커스텀 훅으로 분리 → 인접 useState가 줄면 실수 여지도 준다.

---

# 💡 TIL — 2026-04-17 — git 클린 커밋 히스토리를 위한 섞인 스테이징 분리 실전

**분류**: Git / 협업 워크플로우

## 오늘 한 것
- 한 세션에 뒤섞인 9개 파일을 3개 논리 단위 커밋으로 분리
  1. `0bbb77b` — B-05 scrapped 필드 프론트 연동 (PostCard, PostDetailPage)
  2. `b66aefd` — B-01 프로필 이미지 localhost origin 핫픽스 (resolveImageUrl)
  3. `b8bffb9` — 백로그 최신화 + 메모리 정리 + Prettier 포매팅 (6개 파일)

## 배운 것 / 인사이트

### 1. 커밋 직전 `git status` 진단이 핵심
- "이미 스테이징된 것 + unstaged 변경"이 주제가 다른 채 공존하면 **그대로 커밋 금지 신호**
- 그 상태로 그냥 커밋하면 포매팅/기능/메모리가 한 덩어리 → 나중에 특정 기능 찾을 때 관련 없는 diff까지 전부 헤쳐야 함

### 2. 섞인 스테이징 분리 패턴
- `git reset HEAD` → 스테이징만 초기화 (워킹 트리 변경은 유지)
- 주제별로 `git add <관련 파일만>` → `git commit -m "..."` 반복
- 한국어 커밋 메시지 컨벤션: "동사 중심 + 1줄 제목 + 필요 시 body에 bullet"

### 3. "미래의 읽기"를 기준으로 분리 단위 설계
- 기준: 나중에 이 커밋을 **누가·어떤 맥락에서** 읽을 것인가
- B-05와 B-01은 내용이 완전히 다른 작업 → 섞이면 롤백 시 부수 피해
- 포매팅 + 주석 + 메모리는 논리적으로 "환경 정리"라서 한 커밋에 묶어도 무방
- 분리의 비용(시간) vs 통합의 비용(히스토리 탐색 난이도)을 저울질

## 포트폴리오 어필 포인트
- **성숙한 협업 의식**: "일단 다 커밋"이 아니라 "나중의 히스토리 독자"를 상정하고 커밋 단위를 설계
- **정적 원칙 + 동적 판단**: 메모리에 클린 커밋 룰을 저장해두되, 매 커밋마다 `git status` 진단 → 섞임 탐지 → 분리라는 실천 루프를 돌림
- **의도 기반 메시지**: `[동사] + [대상] + [근거]` 구조로 한국어 메시지 통일 (forward-only 룰 적용, 과거 영어 커밋은 rewrite 없이 둠)

---

# 🔧 트러블슈팅 — #NNN — WSL 비정상 종료로 인한 .git object 손상 복구 + .git.backup 폴더 push-mello 오염 사고

**날짜**: 2026-04-17
**분류**: Git 내부 구조 / 인프라 / 자동화 스크립트 엣지 케이스
**난이도**: ★★★ (2중 사고 + 근본 원인 이해 필요)

## 문제 상황
세션 중 두 건의 연속 사고 발생:

**1차 — git object 손상**
- `git commit` 실행 시 `fatal: could not parse HEAD` 에러
- `git fsck --full` 결과 9개 object 손상 (0바이트 파일 8개 + inflate 실패 1개)
- `HEAD`, `refs/heads/main`, `origin/main`이 가리키는 commit object까지 영향
- 원인 추정: WSL/PC 비정상 종료로 fsync 안 된 write가 0바이트로 잔존

**2차 — 복구 백업 폴더 레포 오염**
- 복구 절차에서 생성한 `.git.backup_20260417_193934/` 폴더가 프로젝트 루트에 남음
- `.gitignore`에 패턴 미등록
- `push-mello` 자동화 스크립트가 `git add -A` 수행 → 2857개 파일 스테이징 → 커밋(`242a10b`) + GitHub push 완료
- 결과: 백업 레포에 불필요한 `.git` 내부 파일 2857개 업로드됨

## 원인 분석

### 1차 원인 — object 파일 0바이트화
- SSD 자체는 정상. WSL 환경에서 창 닫기/시스템 재시작 시 fsync 전 writes가 flush 되지 않음
- commit/merge 중 발생 시 object 파일이 0바이트로 남아 HEAD가 깨진 참조를 가리킴

### 2차 원인 — `.git`과 `.git.backup_*`의 취급 차이
- git은 **정확히** `.git/` 한 폴더만 특수 무시
- `.git.backup_<timestamp>/`은 이름이 비슷해도 git 입장에서 평범한 폴더
- 이름 기반 직관("git으로 시작하니 무시되겠지")이 git 동작과 불일치

### 3차 원인 — 자동화 스크립트의 `git add -A`
- push-mello는 주기적으로 모든 변경을 밀어넣는 구조
- `git add -A`는 의도를 구분 못 함 → `.gitignore`가 유일한 방어선
- 예외 상황(복구 백업 폴더)에서 `.gitignore` 미등록 = 오염 직행

## 해결 과정

### Phase 1 — 비파괴 object 복구
1. `cp -a .git .git.backup_$(date +%Y%m%d_%H%M%S)` (복구 실패 대비 보험)
2. `git fsck --full` → 손상 object 9개 해시 목록 추출
3. `rm .git/objects/XX/YYYY...` (손상된 것만 선별 삭제)
4. `git fetch origin --no-tags` → 원격에서 object 재수급
5. `git fsck` 재검증 → clean

### Phase 2 — 레포 오염 정리
1. 사고 감지: `push-mello` 로그에서 `2857 files changed` 이상 징후
2. 복구 옵션 비교
   - Revert 커밋: 안전하지만 히스토리에 오염 흔적 남음
   - Force push: 깔끔하지만 공유 레포에선 위험
   - `git rm --cached`: 로컬 보존 OK, 하지만 히스토리에 오염 커밋 남음
3. 선택: **`git reset --mixed b8bffb9` + `git push --force-with-lease`**
   - 이유: 백업 레포가 단독 소유 + 오염 커밋 잃을 가치 없음 + 로컬 백업 폴더 보존 가능
4. `.gitignore`에 `.git.backup_*/` 패턴 영구 등록
5. 2개 커밋(.gitignore 정리 / 메모리 sync) 생성 후 force-with-lease push

### 결과
- 원격 히스토리에서 오염 커밋(`242a10b`) 증발
- 로컬 `.git.backup_20260417_193934/` 폴더는 학습 자료로 보존
- 재발 방지: `.gitignore` 패턴 등록 완료

## 핵심 개념

### 1. `.git`의 "정확한 이름" 특수성
- git이 무시하는 건 `.git/` 딱 하나
- `.git.backup_*`, `.git2`, `mygit` 전부 일반 폴더
- **이름 기반 직관이 git 동작과 어긋나는 지점** — 코드베이스 관행 문서화 가치 있음

### 2. 비파괴 복구 vs fresh clone 트레이드오프
- **비파괴**: `git fsck` + 선별 삭제 + `git fetch` — 로컬 작업 보존, 다만 절차 복잡
- **fresh clone**: 단순하지만 미푸시 로컬 작업·스태시·브랜치 전부 소실
- 이번엔 스테이징된 7개 파일 + 워킹트리 수정본 때문에 비파괴 선택

### 3. 자동화 스크립트의 엣지 케이스
- `git add -A` 계열은 "의도"를 구분 못 하는 블라인드 도구
- `.gitignore`가 유일한 예외 처리 수단
- **원칙**: "평소엔 없다가 예외 상황에만 생기는 폴더"(복구 백업, 임시 덤프 등)는 생성 즉시 `.gitignore`에 등록

### 4. force push 안전 수칙
- `--force-with-lease`: "내가 본 원격 상태에서만 덮어쓰기" — 제3자가 push한 커밋은 보호
- 단독 소유 레포 vs 공유 레포 구분
- 잃을 가치 있는 커밋이 영향권에 있는지 사전 확인

## 면접 포인트

- **Q. git object corruption을 어떻게 복구했나요?**
  - A. `.git` 전체 백업을 먼저 만들고, `git fsck`로 손상 object를 선별해 삭제한 뒤 `git fetch`로 원격에서 재수급하는 비파괴 복구를 적용했습니다. fresh clone이 가장 단순하지만 스테이징된 작업과 워킹트리 수정본이 있어 보존을 우선했습니다.

- **Q. 복구 중 2차 사고는 왜 생겼나요?**
  - A. 복구 실패 대비용 `.git` 백업 폴더(`.git.backup_<timestamp>`)가 프로젝트 루트에 남았는데, git은 정확히 `.git/` 한 폴더만 특수 무시한다는 점을 간과했습니다. `.gitignore`에 등록하지 않은 상태에서 자동 push 스크립트가 `git add -A`로 2857개 파일을 백업 레포에 업로드한 사고였습니다.

- **Q. 어떻게 정리했나요?**
  - A. 백업 레포가 단독 소유임을 확인하고, `git reset --mixed`로 오염 커밋을 취소한 뒤 `--force-with-lease`로 안전하게 force push 했습니다. 로컬 백업 폴더는 학습 자료로 보존하고, `.gitignore`에 `.git.backup_*/` 패턴을 영구 등록해 재발을 차단했습니다.

- **Q. 재발 방지 원칙은?**
  - A. (1) `.git`과 비슷한 이름의 폴더도 일반 폴더로 취급됨을 프로젝트 문서로 남김, (2) `git add -A`를 쓰는 자동화 스크립트에서 `.gitignore`가 유일한 방어선임을 인지, (3) 예외 상황에서 생성되는 폴더는 생성 즉시 `.gitignore` 등록, (4) force push는 단독 소유 확인 + `--force-with-lease` 반드시 적용.

- **Q. 이 경험에서 얻은 일반화된 교훈은?**
  - A. "자동화 도구는 의도를 모른다"는 것입니다. `git add -A`처럼 편의를 위해 만든 광범위 자동화는 정상 상황에선 이득이지만, 예외 상태(백업 폴더, 임시 덤프, 로컬 설정)에서 조용히 사고를 키웁니다. 자동화를 쓸 때는 항상 "이 도구가 실수할 수 있는 범위"를 명시적으로 차단하는 방어 장치(이 경우 `.gitignore`)를 같이 설계해야 합니다.

---

# 노션 작성 대기 초안 (2026-04-20)

---

## 📄 초안 1 — TIL

**페이지**: `323c8200749b80c2bbe6caf194055593`

**제목**: `2026-04-20 — 코드 리뷰에서 임시 대응(Workaround) 체계적으로 추적하기`

**분류**: 개발 방법론 / 코드 품질 관리

### 오늘 한 것

- 프로필 편집 코드(`ProfilePage.tsx`, `api/auth.ts`, `utils/resolveImageUrl.ts`)에 숨어 있던 임시 대응 3건을 발굴·정리
  - T1: `PATCH /me`가 400을 피하려고 `profileImageUrl`을 재전송
  - T2: 닉네임만 바꾸는 UI 흐름이 이미지 URL까지 보내게 된 부수효과
  - T3: `resolveImageUrl`이 응답에 박힌 `http://localhost:8080`을 치환 (`APP_BASE_URL` 누락 대응, backlog B-01)
- HIGH 이슈(레이스 컨디션)만 먼저 조치, 나머지는 backlog로 명시 분리
- Severity triage 워크플로우 정립: `HIGH 즉시 조치 → Medium/Low는 project 메모리 + notepad priority("오늘 뭐하지")` 3중 적재

### 배운 것 / 인사이트

1. **임시 대응은 "3중 추적"해야 사라진다.** 코드 주석만 달면 잊혀지고, 메모리에만 적으면 코드에서 안 보인다. 해결책 = 코드 주석(태그 `T1`, `B-01`) + `project_*.md`(제거 조건/위치) + backlog 인덱스(MEMORY.md 한 줄) 3중.
2. **임시 대응은 다른 임시 대응을 낳는다.** T1(백엔드 필드 optional 미처리) → T2(프론트가 값 채워 전송) → HIGH 레이스(업로드 중 PATCH가 옛 값을 덮어씀). 근본 원인이 해제되기 전까지 부수효과 가드가 필요.
3. **Severity triage가 리뷰 피로도를 낮춘다.** "모든 걸 한 번에" 대신 "HIGH만 즉시, 나머지는 명시된 backlog"로 쪼개면 PR이 작아지고 재검토 부담도 준다.
4. **비자명한 가드 코드는 예외적으로 상세 주석이 필요하다.** 일반 "WHY만 짧게" 규칙을 적용하면 6개월 뒤 "왜 이게 여기 있지?"가 되어 잘못 제거된다. 의존 관계(T1 해제 시 함께 제거)까지 주석에 남길 것.

### 포트폴리오 어필 포인트

- "임시 대응도 관리 대상"이라는 시각으로 **워크어라운드 라이프사이클 프로세스**(발굴 → 태깅 → 제거 조건 명시 → backlog 추적)를 팀 컨벤션으로 제안·정립
- Severity-based code review triage 워크플로우를 도구화(project memory + notepad priority 연동)해 리뷰 결과가 사라지지 않고 반드시 해소되게 설계

---

## 📄 초안 2 — 🔧 트러블슈팅

**페이지**: `322c8200749b81f39f71f9c8a4d6eb44`

**제목**: `#NNN — 프로필 이미지 업로드 롤백 레이스 컨디션`
*(NNN = 기존 목록 마지막 번호 +1)*

**날짜**: 2026-04-20
**분류**: 동시성 / 상태 관리 / UX
**난이도**: 중

### 문제 상황

**한 줄 요약**: 두 API 요청이 **거의 동시에** 진행될 때, 도착 순서에 따라 결과가 뒤집히는 **동시성 버그(race condition)**. "늦게 도착한 요청이 먼저 저장된 값을 덮어쓰는" 현상.

**시간축으로 보면:**

```
[시간] →
①이미지 업로드 요청 ─────── ①도착: 새 이미지 저장 완료
                           ②닉네임 PATCH 요청 ─── ②도착: 옛 이미지 URL 로 덮어쓰기 ❌
```

프로필 페이지에서 이미지 업로드와 닉네임 편집은 **독립 플로우**:

- 이미지 업로드: `POST /me/profile-image` (multipart)
- 닉네임 저장: `PATCH /me` (body에 `nickname` + `profileImageUrl`)

사용자가 닉네임 편집 모드를 연 상태에서 아바타를 클릭해 이미지를 바꾸고, 업로드가 **끝나기 전에** 엔터 또는 "저장"을 누르면, `PATCH /me`가 **스토어에 남아 있는 옛 `profileImageUrl`을 서버에 다시 써버려** 방금 업로드한 이미지가 롤백.

UI상 아바타 버튼만 `disabled={uploadingImage}`로 막혀 있고, 닉네임 저장 버튼에는 교차 가드가 없었음.

### 원인 분석

근본 원인은 **백엔드 API의 임시 대응(T1)**.

- `PATCH /me`가 `profileImageUrl` 필드를 필수로 받고, 생략하면 400 에러.
- 프론트는 400 회피를 위해 "닉네임만 바꾸는 요청"이어도 스토어에 있는 `profileImageUrl`을 **그대로 재전송**하는 임시 대응(T1)을 넣어둔 상태.
- 그 결과, 두 API가 동시에 진행되면 **"늦게 도착한 PATCH의 옛 URL"이 "먼저 저장된 새 URL"을 덮어쓰는** 레이스가 구조적으로 가능.

즉, 레이스는 **T1이 만든 부수효과**. T1이 제거되기 전에는 프론트에서 막아야 함.

### 해결 과정

1. **로직 가드 (핸들러 진입 차단)**
   - `handleImageChange`: `savingNickname` 중이면 alert로 안내하고 업로드 중단.
   - `startEditNickname`: `uploadingImage` 중이면 편집 진입 자체 차단 (Enter로 저장 핸들러가 도는 경로까지 원천 봉쇄).
   - `handleSaveNickname`: `uploadingImage` 중이면 PATCH 자체 차단.

2. **UI 가드 (버튼 `disabled` 교차 반영)**
   - 아바타 버튼: `disabled={uploadingImage || savingNickname}`
   - 닉네임 저장 버튼: `disabled={savingNickname || uploadingImage}`

3. **의도 전달용 주석**
   - 각 가드 위치에 "왜 필요한지 + T1 임시 대응과의 관계 + T1 해제 시 같이 제거 가능"을 한국어로 상세 주석.

4. **후속 정리**
   - `project_profile_edit_cleanup.md`에 T1 제거 시 HIGH 가드도 함께 제거한다는 연결 고리 명시.
   - notepad priority에 backlog로 연결.

### 핵심 개념

- **레이스 컨디션의 구조적 원인**: 두 비동기 요청이 같은 리소스(`profileImageUrl`)에 대해 write 권한을 가지면 **도착 순서 = 최종 상태**가 된다. 클라이언트 측 직렬화(mutex-like disable)로 막을 수 있지만 근본 해결은 서버에서 요청을 PATCH-merge로 다루게 만드는 것.
- **임시 대응의 부수효과**: 어떤 API를 API-level에서 workaround하면, 그 workaround를 경유하는 모든 플로우에 새 제약이 생긴다. 이번 건은 "닉네임만 저장하는 플로우가 이미지도 덮어쓴다"는 의도치 않은 결합.
- **방어 깊이(Defense in Depth)**: 핸들러 내부 가드 + 버튼 `disabled` UI 가드 **둘 다** 추가. 내부 가드만 있으면 사용자 피드백이 없고, UI 가드만 있으면 키보드 Enter 등으로 뚫릴 수 있음.

### 면접 포인트

- **"이 레이스가 실제 발생한 버그인지, 선제 차단인지?"**
  → 선제 차단. 실제 재현 경로는 좁지만(편집 중 업로드 + 업로드 중 Enter), 임시 대응(T1)이 살아있는 한 구조적으로 열려 있는 창. 백엔드 수정 전까지 유지.
- **"왜 서버 수정이 아닌 프론트 가드로 막았나?"**
  → 백엔드 스펙 변경은 커뮤니케이션·배포 비용이 크고, 다른 기능과 묶여 있음. **임시 대응이 제거되면 이 가드도 함께 제거한다**는 조건을 주석·메모리에 명시해 기술 부채로 관리.
- **"가드를 주석까지 꼼꼼히 단 이유?"**
  → 비자명한 코드는 6개월 뒤 "왜 이게 여기 있지?"가 되어 잘못 제거되기 쉬움. T1과의 연결 관계를 기록해, T1 해제 시 동시 제거할 수 있게 맥락을 보존.

---

## 📄 초안 3 — TIL (Git 사고 복구)

**페이지**: `323c8200749b80c2bbe6caf194055593`

**제목**: `2026-04-20 — rsync --delete 사고와 git revert로 안전하게 복구하기 — Claude 메모리 백업 레포 대량 삭제 사례`

**분류**: Git / 백업·동기화 / 사고 대응

### TL;DR

SSD 포맷 직후 `pull-mello`를 건너뛴 채 세션을 진행했고, 로컬 메모리가 13개만 쌓인 상태에서 `push-mello`가 돌아 **GitHub 백업 레포의 120+ 메모리 파일이 `rsync --delete`로 대량 삭제**됨. `git revert` + 수동 merge 절차로 **원격 히스토리를 보존하며 비파괴 복구**, 재발 방지용 가드를 스크립트에 추가하고 "새 환경이면 pull 먼저" 원칙을 메모리로 저장.

### 오늘 한 것

- **사고 감지**: `push-mello` 출력에서 `delete mode 100644` 라인 13개 발견 → 로컬 쪽 `ls`로 대조 → 레포 `git ls-tree`로 fed2feb 시점 실제 파일 수 확인 → **120+ 파일 삭제 확인**
- **5단계 복구 절차 실행**:
  1. `/tmp/mello_memory_backup_<timestamp>/` 에 로컬 13개 파일 수동 백업
  2. `git revert 9c75a33` (destructive 커밋을 새 revert 커밋으로 무효화)
  3. `git push origin main` (force 없이 revert 커밋 푸시 → 원격 복구 완료)
  4. `pull-mello` 실행 (레포의 복구된 120+ 파일이 로컬로 복원, --delete 때문에 로컬 오늘 파일은 순간 삭제)
  5. 백업에서 오늘 파일 11개 복원 + `MEMORY.md`·`notion_draft.md` 수동 merge
- **재발 방지 장치**:
  - `scripts/memory-sync.sh`에 `guard_no_mass_deletion` 추가 (로컬 < 레포×0.5 → abort, `FORCE_PUSH=1`로 우회)
  - push-mello 실행 순서 조정 (`pull --rebase --autostash` → guard → rsync → commit → push)
  - `feedback_new_env_pull_first.md` 메모리 저장 (새 환경이면 `pull-mello` 선행 원칙)
  - 임시 백업을 `/tmp` → `~/claude-memory-backups/` durable 경로로 이관

### 배운 것 / 인사이트

#### 1. `rsync --delete` 와 `git merge` 의 근본적 차이

| 도구 | 동작 원리 | 결과 |
|---|---|---|
| `git merge/rebase` | 양쪽 변경을 **조합** | 보존적. 충돌은 명시적 에러로 드러남 |
| `rsync -a --delete` | 한쪽을 다른 쪽으로 **덮어씀** | 파괴적. "원본에 없는 것은 대상에서 삭제" |

- 메모리 sync처럼 "로컬이 권위" 전제로 만든 파이프라인은 **로컬이 권위가 아닐 때** 그대로 치명적 파괴 도구가 됨.
- 교훈: **단방향 sync 도구는 "어느 쪽이 권위인가"를 런타임에 검증해야 한다** (가드 함수로 구현).

#### 2. `git revert` 의 진가 — force push 없이 원격 복구

- **`git reset --hard <이전커밋>`** 으로도 로컬은 되돌릴 수 있지만, 원격과 어긋나서 push 시 `--force`(혹은 `--force-with-lease`)가 필요.
- **`git revert <나쁜커밋>`** 은 **새 커밋**을 만들어 변경을 무효화 → 선형 히스토리 유지 + **일반 push 가능** + 다른 작업자 로컬 상태 보호.
- 이번 건에서 `git revert 9c75a33` → `git push` (force 없이) → 완벽 복구.
- 교훈: **공유 레포에서는 사고 대응 1순위가 `revert`, `reset --hard + --force`는 최후 수단**.

#### 3. `git pull --rebase --autostash`

- push-mello 스크립트에 `pull --rebase`를 앞으로 옮겼더니, **unstaged 변경**이 있을 때 pull이 에러로 중단됨.
- `--autostash` 옵션: pull 직전 자동으로 `git stash`, rebase 완료 후 자동으로 `git stash pop` → **스크립트 내부 pull은 항상 autostash와 세트**로.
- 교훈: 자동화 스크립트 내의 `git pull`은 사용자 환경의 워킹 트리 상태를 전제할 수 없으므로, autostash 기본값으로.

#### 4. Defense in Depth — 가드의 실제 사례 연구

- **Layer 1 (기존)**: `파일 < 5개 → abort` — 완전 빈 소스 **만** 감지. 과거 1차 사고(완전 와이프) 대응으로 추가됨.
- **Layer 2 (신규)**: `로컬 < 레포 × 0.5 → abort` — **부분 파손** 감지. 오늘 사고(13 vs 131)를 막을 수 있었음.
- 각 layer는 서로 다른 failure mode를 커버함. **"가드 하나로는 모든 사고를 막지 못한다"**는 것이 이번 사고의 가장 큰 교훈.
- 교훈: 새 사고를 겪을 때마다 기존 가드가 커버하지 못한 **독립 failure mode**를 식별하고 추가. 단 가드는 늘 우회 수단(`FORCE_PUSH=1`)을 함께 제공 — 가드가 의도된 작업을 막으면 생산성을 해치고 우회 꼼수를 유발.

#### 5. "자동화 도구는 의도를 모른다"

- 과거 `.git.backup_*` 폴더가 `.gitignore` 누락으로 `git add -A`에 걸려 백업 레포에 2857개 파일 업로드된 사고(04-17)
- 오늘 `rsync --delete`로 메모리 120+ 삭제된 사고(04-20)
- **공통 패턴**: 편의를 위한 광범위 자동화(`git add -A`, `rsync -a --delete`)는 정상 상황에선 시간을 절약하지만, **예외 상황(백업 폴더 존재, 로컬 일부 파손)에서 조용히 대형 사고로 번짐**
- 대응 원칙: 광범위 자동화는 반드시 **"이 도구가 실수할 수 있는 범위"를 선언적으로 차단**하는 방어 장치(`.gitignore`, guard 함수, dry-run 모드)와 세트로 사용.

#### 6. 백업은 `/tmp` 가 아니라 durable 경로에

- 복구 절차 1단계에서 임시 백업을 `/tmp/mello_memory_backup_<timestamp>/`에 만들었지만, 리눅스 `/tmp`는 재부팅 시(distro에 따라 자동 청소) 또는 cron으로 수 일 내 삭제될 수 있음.
- 복구 완료 후 `~/claude-memory-backups/` 로 이관 → **사고 증적은 최소 며칠~몇 주 보존**.
- 교훈: `/tmp`는 **초단기 작업용** (수분~몇 시간). 복구 증적·디버깅 스냅샷은 홈 디렉토리 하위 durable 경로.

### 면접 예상 질문 & 답변 포인트

- **Q. `rsync --delete` 같은 도구가 위험한 줄 알면 왜 써요?**
  - A. 편합니다. 메모리 sync는 "로컬이 권위 있는 최신"인 경우가 99%라, `rsync --delete`로 로컬을 그대로 레포에 반영하는 모델이 단순하고 일관성 유지에 좋습니다. 문제는 1%의 예외 상황(로컬 파손)인데, 이번 사고로 **런타임 가드로 권위 전제를 검증**하는 게 정답이라는 걸 확인했습니다.

- **Q. 왜 `git reset --hard`가 아니라 `git revert`를 선택했나요?**
  - A. 첫째, `revert`는 히스토리를 보존해서 "무엇이 잘못됐고 어떻게 되돌렸는지"가 `git log`에 그대로 남습니다. 둘째, 일반 `push`만으로 원격을 고칠 수 있어 **force push 권한·동료 영향 같은 부수 리스크**가 0입니다. `reset --hard + --force-with-lease`는 로컬만 쓰는 브랜치일 때 고려하고, 공유 레포에는 기본 `revert`가 안전합니다.

- **Q. 스크립트에 가드를 추가했는데, 가드가 "의도된 정리"를 막는 상황은 어떻게 해결했나요?**
  - A. `FORCE_PUSH=1` 환경변수로 명시적 우회 경로를 열어뒀습니다. 가드 에러 메시지에 우회 방법과 "혹시 새 환경이면 `pull-mello`부터"라는 대안을 같이 출력해, 사용자가 상황에 맞춰 선택할 수 있게 했습니다. 가드가 우회 불가능하면 꼼수(가드 코드 주석 처리 같은)를 유발해 오히려 위험해집니다.

- **Q. 이번 복구에서 가장 어려웠던 부분은?**
  - A. 단순 revert로 끝나지 않고, **오늘 세션에서 만든 11개 신규 메모리 + MEMORY.md 인덱스**를 보존하면서 120+ 개 이전 파일도 돌려놓는 게 포인트였습니다. revert → pull-mello(--delete) → 백업에서 오늘 파일 복원 → MEMORY.md 수동 merge → 재push 순서로 진행했고, 중간중간 `diff` 로 결과를 검증했습니다. "파괴적 동작 한 번 + 수동 merge 한 번" 순서가 실수 여지가 가장 적었습니다.

### 포트폴리오 어필 포인트

- **사고 복구 프로세스의 설계력**: `destructive 동작 감지 → 백업(durable) → git revert 비파괴 복구 → 수동 merge로 신규 작업 보존 → 재발 방지 가드` 의 일관된 복구 파이프라인 실천. 한 번의 사고를 "복구 + 방지" 2차원으로 처리.
- **자동화 도구의 failure mode 분석**: `git add -A`, `rsync --delete` 같은 광범위 자동화의 **위험 pattern을 카탈로그화**하고, 각 도구 주변에 선언적 방어 장치(`.gitignore`, guard 함수, autostash)를 쌍으로 배치.
- **Defense in Depth 가드 설계**: 단일 가드의 한계를 이번 사고로 실증. 기존 가드(완전 비어있음)가 부분 파손을 못 막는다는 점을 파악하고 **독립 failure mode**를 커버하는 2차 가드 추가. 우회 경로(`FORCE_PUSH=1`)로 의도된 작업은 허용.
- **Git 복구 전략의 실제 적용**: `git revert` vs `reset --hard + --force` 트레이드오프를 공유 레포 맥락에서 판단. force push 없이 히스토리 보존한 채 원격 상태를 되돌림.
