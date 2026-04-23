---
name: GA4 + Clarity 설치 (인지부채 HIGH — AI 전체 작성)
description: useGA4PageView 훅 + AnalyticsTracker 래퍼는 Claude가 전체 작성. SPA에서 page_view 수동 발송이 왜 필요한지 메커니즘 기록. 재학습 필요.
type: project
originSessionId: 66a71c38-a303-4648-9da9-5f6eff5595a0
---
## 플래그

**인지부채 HIGH** — 2026-04-23 2단계(GA4/Clarity 설치) 진행 중 useGA4PageView.ts 및 App.tsx AnalyticsTracker 부분을 **AI가 전체 작성**. 사용자가 index.html 부분은 직접 타이핑했으나, TypeScript 훅/전역 타입 선언 부분은 학습 우선순위로 위임.

**Why:** 외부 서비스(GA4) + SPA 라우팅 + TypeScript 전역 타입 선언이 복합적으로 얽혀 있어 단번에 타이핑하기 부담. 대신 메커니즘 상세 주석으로 후속 학습 자료화.

**How to apply:** 이 코드 이해하려면 아래 4개 구조가 한 번에 머리에 그려져야 함. 하나라도 막히면 재학습 필요.

---

## 파일별 책임 분담

| 파일 | 역할 | 누가 작성 |
|---|---|---|
| `frontend/index.html` | GA4 gtag 스니펫 + Clarity IIFE 삽입 → `window.gtag`, `window.clarity` 전역 주입 | **사용자 직접** |
| `frontend/src/hooks/useGA4PageView.ts` | `useLocation` 구독 + `window.gtag('event', 'page_view', ...)` 발송 + `Window` 인터페이스 전역 확장 | **AI 작성** |
| `frontend/src/App.tsx` | `<AnalyticsTracker />` 래퍼로 BrowserRouter 내부에서 훅 호출 | **AI 수정** |

---

## 왜 SPA에서 page_view를 수동 발송해야 하나

**기본 가정 (MPA 기준)**: `gtag('config', ID)`는 스크립트 로드 시점에 자동으로 page_view 1회 발송. 전통적인 멀티페이지 웹사이트는 페이지 이동 = 브라우저 재로드 = 스크립트 재실행 = page_view 자동 재발송. 문제 없음.

**SPA에서 깨지는 이유**: React Router의 navigate는 `history.pushState`로 URL만 바꾸고 브라우저는 재로드하지 않음 → GA4 스크립트는 딱 1번만 실행됨 → 사용자가 `/` → `/posts` → `/profile` 이동해도 GA 입장에서는 "한 페이지에만 머묾"으로 집계. 유입 분석·퍼널·이탈률 전부 망가짐.

**해결 구조**:
```
useLocation() (react-router-dom)
      ↓  pathname/search 변경 감지
useEffect 재실행
      ↓
window.gtag('event', 'page_view', { page_path, page_location, page_title })
      ↓
GA4 서버로 이벤트 전송
```

---

## 핵심 이해 포인트 4개 (전부 짚어봐야 코드가 읽힘)

### 1. `declare global { interface Window { gtag?: ... } }`

- `declare global`: 이 선언을 전역 네임스페이스에 올린다는 뜻.
- `interface Window { ... }`: TS 기본 lib에 이미 있는 `Window` 인터페이스를 **선언 병합(declaration merging)**으로 확장. 기존 속성은 그대로 두고 `gtag?` 하나 추가.
- `?`: optional 속성 — 애드블로커로 GA 스크립트가 차단된 환경에서 `window.gtag`가 undefined일 수 있음을 타입에 반영.
- 이 선언이 없으면 `window.gtag(...)` 호출 시 TS가 "Property 'gtag' does not exist on type 'Window'" 에러.

### 2. `useLocation`은 왜 BrowserRouter 내부에서만 쓸 수 있나

- `useLocation`은 React Context로 현재 경로를 구독함.
- `<BrowserRouter>`가 Router context Provider 역할.
- Provider 밖에서 훅 호출 → context 값이 기본값(null 또는 throw)이라 런타임 에러.
- 따라서 `App` 컴포넌트 본문(= BrowserRouter **바깥**)에서 직접 `useGA4PageView()` 호출 불가 → `<AnalyticsTracker />` 래퍼를 BrowserRouter **자식**으로 두고 그 안에서 훅 호출.

### 3. AnalyticsTracker는 왜 `return null`인가

- React 컴포넌트는 UI 렌더 + 사이드이펙트 둘 다 할 수 있음.
- 이 컴포넌트는 UI가 필요 없음(이벤트 발송만 하면 끝).
- `return null`로 "렌더할 DOM 없음" 명시 — 컴포넌트 트리엔 존재하지만 DOM엔 흔적 없음.
- 이 패턴은 "headless 컴포넌트"라고도 부름.

### 4. useEffect 의존성 배열 `[location.pathname, location.search]`

- `[location]` 전체를 넣으면: location 객체가 매 렌더마다 새 참조 생성될 수 있어 불필요한 재실행 위험.
- `[location.pathname, location.search]`만 넣으면: 실제 경로/쿼리 값이 바뀔 때만 effect 실행.
- 쿼리스트링도 분석에 의미 있으므로(`?tag=ABA` 같은 필터) search까지 포함.

---

## Clarity는 왜 훅이 없나

Clarity 스크립트는 내부적으로 `history.pushState`/`popstate`를 가로채 SPA 라우트 변경을 **자동 감지**함. 세션 녹화/히트맵은 Clarity가 알아서 페이지 전환을 기록 → 추가 훅 불필요.

GA4는 이런 자동 감지가 없어서 수동 트래킹이 표준 패턴.

---

## 검증 방법 (배포 후)

1. 페이지 접속 → 브라우저 DevTools Network 탭 → `google-analytics.com/g/collect` 요청 발생 확인
2. GA4 실시간 리포트(관리 → 실시간) → 내 방문 1건 잡힘
3. `/posts` → `/profile` 이동 → Network에 `collect` 요청 **추가로** 발생 (각 라우트별 1개씩)
4. Clarity 대시보드 → Recordings 메뉴에 세션 올라오는지 (10분~1시간 지연 가능)

---

## 재학습 체크리스트

코드 다시 읽을 때 아래 질문에 답할 수 있어야 함:

- [ ] index.html에서 `window.gtag`는 정확히 어느 줄에서 주입되나?
- [ ] `window.dataLayer`는 왜 배열이고, gtag 함수는 왜 dataLayer에 push만 하나?
- [ ] `declare global`을 지우면 어떤 TS 에러가 나나?
- [ ] `useGA4PageView`를 App 최상단에서 호출하면 왜 터지나?
- [ ] AnalyticsTracker를 `<BrowserRouter>` 밖에 두면 어떻게 되나?
- [ ] Clarity는 왜 훅이 없는데 SPA 라우트 변경을 알까?
