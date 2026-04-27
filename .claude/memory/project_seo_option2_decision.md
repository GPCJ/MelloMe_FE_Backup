---
name: SEO 옵션 2 — vite-prerender-plugin 채택 (2026-04-27)
description: SPA 크롤링 대응으로 옵션 2(빌드 타임 prerender) 채택. 최초 후보 vite-plugin-react-ssg는 Vite 8 peer 충돌로 폐기 → vite-prerender-plugin (preactjs org)로 재선택. 핵심 의존성 변경 0건
type: project
originSessionId: 2026-04-27
---

**상태: 구현 완료 (2026-04-27)** — `vite-prerender-plugin`(preactjs org)로 채택 + 빌드 검증 완료. `/`, `/privacy`, `/terms` 3개 정적 HTML 생성 + 페이지별 메타 태그(title/description/canonical/og:title) 단일 소스 주입. Vite 7 + RR v7 + plugin-react 5 그대로 유지.

2026-04-27 SEO 3단계(SPA 크롤링 대응)로 **옵션 2(빌드 타임 prerender)** 채택. 최초 후보 `vite-plugin-react-ssg`는 Vite 8 peer 충돌 + 평판 Medium으로 폐기 → **`vite-prerender-plugin`** (preactjs org)로 재선택.

**Why:** Next.js 마이그레이션 비용(53h, `project_nextjs_decision.md` 참조) 대비 약 1/10 비용(4~6h)에 동일 SEO 효용 달성 가능. 게시글 비공개 정책 하에서 크롤러 도달 페이지가 5개뿐이라 정적 prerender로 충분.

**How to apply:** 다음 세션부터 7단계 체크포인트로 구현 착수. 게시글 공개 정책 변경 시점에는 Next.js 재평가.

---

## 채택 플러그인

**`vite-plugin-react-ssg`** (by wbbb0730, Source: Medium, Benchmark: 92)

- React Router v6.4+ data router 지원 (v7 포함)
- `react >= 18.3.1` (React 19 호환), Vite 메이저 제한 없음 (Vite 7 호환)
- `vite build` 후 prerender만 추가 → CSR 자산 그대로 보존 (비침투적)
- `@unhead/react` 통합 (페이지별 `useHead`, `useSeoMeta`)

## 폐기한 첫 후보: vite-react-ssg

`vite-react-ssg` (by daydreamer-riri, Source: High, Benchmark: 86) — 평판 더 높지만 **README에서 React Router v7 사용자에게 비권장 명시**:

> "React Router v7 now includes built-in SSG capabilities. ... vite-react-ssg will continue to provide SSG functionality for users of React Router v6."

우리는 `react-router-dom@^7.13.1` 사용 → 권장 스택 이탈. 코드 변경 전(`feedback_verify_spec_before_workaround` 적용)에 발견하여 갈아탐.

## 사전 조건 — data router 모드 전환

`vite-plugin-react-ssg`는 `createBrowserRouter` 객체 config를 요구. 현재 `App.tsx`는 JSX `<BrowserRouter>` 방식 → 라우트 16개 객체 전환 필요.

```tsx
// 현재 (JSX 라우트)
<BrowserRouter><Routes><Route path="/" element={<LandingPage />} /></Routes></BrowserRouter>

// 전환 후 (data router)
const router = createBrowserRouter([{ path: '/', Component: LandingPage }, ...]);
<RouterProvider router={router} />
```

이 전환은 prerender 목적이 아니더라도 React Router 7 권장 방향이라 부수적 가치 있음.

## Prerender 타깃

3개만 prerender:

- `/` (LandingPage)
- `/privacy` (PrivacyPage)
- `/terms` (TermsPage)

`/login`, `/signup`은 보통 `noindex` 권장이라 제외. 모두 Layout 밖 라우트 → AuthRoute/GuestRoute 가드 우회 처리 불필요.

## 7단계 체크포인트

각 단계 끝에 `npm run dev` 또는 `npm run build`로 정상 동작 검증:

1. `vite-plugin-react-ssg` + `@unhead/react` 설치
2. `App.tsx` 라우트 16개 → `createBrowserRouter` 객체 config 전환
3. `main.tsx` `hydrateRoot` + `__staticRouterHydrationData` 활용 형태로 변경
4. SSR-safe 가드 추가 (MSW worker, GA4 페이지뷰 훅, Zustand persist 등 window 의존 코드)
5. `vite.config.ts`에 플러그인 등록 + prerender 타깃 명시
6. LandingPage/PrivacyPage/TermsPage에 `useSeoMeta` 추가
7. `npm run preview` + curl로 각 라우트 HTML 정적 응답 검증

## 추정 비용

총 5~6시간. MSW 가드(4단계)가 변수.

## 위험 요소

1. **Medium 평판 소스** — 막히면 puppeteer 기반 폴백(`vite-plugin-prerender-spa-plugin` 류) 가능
2. **Layout/AuthRoute/GuestRoute의 `<Outlet>` 패턴** — data router에서 정상 지원되지만 구조 점검 필요
3. **MSW worker SSR-safe** — `worker.start()` 호출부에 `typeof window !== 'undefined'` 가드 필수
4. **Zustand persist** — 모듈 평가 시점 localStorage 접근 시 SSR 깨짐. 확인 필요

## 부수 작업 (이번 세션 완료)

- `frontend/public/sitemap.xml`에 `/privacy`, `/terms` 추가 (5개 URL 구성)

## 재검토 트리거

- 게시글 비로그인 공개 정책 변경 → Next.js 재평가
- prerender 타깃이 동적 페이지(게시글 등)로 확장 필요 시 → React Router v7 framework mode 또는 Next.js 검토

---

## 1단계 시도 트러블 (2026-04-27)

`npm install vite-plugin-react-ssg @unhead/react` 실행 시 ERESOLVE 충돌로 1단계 미완료.

**충돌 내용**

- `vite-plugin-react-ssg` 전 버전(0.0.1, 0.1.0, 0.2.0 / 2026-04-02 ~ 2026-04-07 릴리스) 모두 `vite@^8.0.3` 요구
- 본 메모 상단의 "Vite 메이저 제한 없음 (Vite 7 호환)" 기재는 **사실과 다름** (NPM peerDependencies 직접 확인으로 정정)
- 현재 환경: `vite@7.3.1`

**Vite 8 업그레이드도 단순하지 않음** — 우리 두 핵심 플러그인이 Vite 8 미지원:

| 플러그인 | 현재 버전 | peer vite | Vite 8 지원 |
|---|---|---|---|
| `@vitejs/plugin-react` | 5.1.1 | `^4 \|\| ^5 \|\| ^6 \|\| ^7` | ✗ (메이저 업 필요) |
| `@tailwindcss/vite` | 4.2.1 | `^5 \|\| ^6 \|\| ^7` | ✗ (메이저 업 필요) |

→ Vite 8 업그레이드 시 메이저 3개 동시 변경 → "위험 낮음, 5~6h" 산정 무너짐.

**검토한 옵션 (트레이드오프)**

| 옵션 | 비용 | 위험 | 비고 |
|---|---|---|---|
| A. Vite 7→8 + plugin-react/tailwind 동반 메이저 업 | +3~5h | 메이저 3개 동시, 빌드 회귀 가능 | 결정 메모 갱신 필요 |
| B. `--legacy-peer-deps` 강행 | 즉시 | plugin이 vite 8 API 호출 시 런타임 깨짐 | `feedback_verify_spec_before_workaround` 위반, 비채택 |
| C. 폐기했던 `vite-react-ssg`로 회귀 | 사용자 정의 | RR v7 비권장 README 명시 | 폐기 사유 재검토 필요 |
| D. puppeteer 기반 prerender 플러그인으로 피벗 | +2h(조사) | 빌드 시간 증가, 평판 안정적 | 새 후보 조사 필요 |
| **E. 1단계 보류 + 결정 재검토** | 0 | — | **선택됨** |

**교훈** — `feedback_verify_spec_before_workaround` 적용으로 `--legacy-peer-deps` 우회를 차단했고, 메모상 호환성 기재를 NPM 1차 소스로 검증하지 않은 부주의를 1단계에서 잡음.

---

## 재선택 결과 (2026-04-27): D — `vite-prerender-plugin` 채택

**채택**: `vite-prerender-plugin` (preactjs org, 메인테이너 rschristian, latest 0.5.13 / 2026-03-15)

**peer**: `vite: 5.x || 6.x || 7.x || 8.x` → 우리 Vite 7 그대로 OK. 핵심 의존성 변경 0건.

**Why D**:
1. 우리 prerender 타깃은 정적 3개(`/`, `/privacy`, `/terms`)뿐 → 직접 `prerender()` 함수 작성 부담 최소
2. **data router 전환 불필요** (`<BrowserRouter>` JSX 그대로 유지) → 7단계 중 가장 큰 변경(2단계) 사라짐 → 추정 5~6h → 2~3h
3. Vite 7 그대로, RR v7 그대로 → 회귀 위험 0
4. preactjs org 유지보수 = 평판 안정적
5. `feedback_dependency_blast_radius` 적용: SEO 하나 때문에 핵심 의존성 메이저 업을 끌고 오는 옵션 회피

**A 폐기 사유**: Vite 7→8 + `@vitejs/plugin-react` 5→6 메이저 업 2개 동시. `vite-plugin-react-ssg` 평판도 Medium·단독 메인테이너. 회귀 영역 광범위, 사전 예측 불가능.

**C 폐기 사유 (재확인)**: `vite-react-ssg@0.9.x` peer `react-router-dom: ^6.14.1` — 우리 v7과 회색지대. README도 RR v7 사용자에게 명시적 비권장. 향후 호환성 단절 위험.

**새 작업 단계 (D 기준)**:

1. `vite-prerender-plugin` 설치 (단일 패키지)
2. `vite.config.ts`에 플러그인 등록 + `additionalPrerenderRoutes`로 3개 타깃 지정
3. prerender 진입 스크립트 작성 (`renderToString` + RR `StaticRouter` 또는 `<script prerender>` 패턴)
4. SSR-safe 가드 (MSW worker, GA4, Zustand persist) — 기존 7단계 4단계와 동일
5. LandingPage/PrivacyPage/TermsPage의 `<head>` 메타 태그 prerender 결과에 주입
6. `npm run build` + `npm run preview` + curl로 정적 HTML 검증

**기존 7단계 중 폐기**: 2단계(data router 전환), 3단계(`hydrateRoot`/`__staticRouterHydrationData`)는 `vite-prerender-plugin`에서는 불필요하거나 다른 형태.

**추정 비용**: 2~3h. 실측 약 1.5h.

## 구현 후 메모 (2026-04-27)

**index.html SEO 메타 → prerender 단일 소스로 이관**: vite-prerender-plugin은 head `elements`를 **append** 방식으로 주입하기 때문에 index.html의 hardcoded `<link rel="canonical">`/`<meta property="og:*">`/`<meta name="description">`이 prerender 결과와 중첩(canonical 2개 등)되면서 크롤러 동작이 모호해짐. → index.html에서 SEO 태그 일괄 제거하고 prerender만 단일 소스로 운영. **보존**: GA4 스니펫(`G-7VPMPFL76M`), Clarity(`wg3vefhmgy`), `google-site-verification`, favicon. **사이드 이펙트**: prerender 대상 외(`/login`·`/signup`·`/posts/*` 등) 라우트는 SEO 태그 없는 SPA로 동작 — 어차피 인증 필요/noindex 권장 페이지라 OK.

**SSR-safe 가드 작업 사라짐**: 원래 4단계로 잡혀 있던 "MSW worker / GA4 페이지뷰 훅 / Zustand persist의 SSR 가드" 작업이 빌드 통과로 불필요해짐. 이유:
- main.tsx가 prerender 진입점이 아님 (`prerenderScript: src/prerender.tsx`로 별도 진입 → MSW 코드는 evaluation에 포함되지 않음)
- LandingPage가 useAuthStore를 import하지만 zustand persist가 Node 환경에서 graceful (localStorage 없으면 hydration skip, 에러 throw 안 함)
- useGA4PageView는 `typeof window.gtag !== 'function'` 가드 사전 존재
- AnalyticsTracker는 App.tsx에 있어 prerender.tsx는 import하지 않음

**StaticRouter import 위치**: RR v7은 `react-router-dom` 메인에서 직접 export (`react-router-dom/server` subpath 없음). 메모 작성 시점 v7.13.1 기준.
