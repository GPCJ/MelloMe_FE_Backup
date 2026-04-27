---
name: 업로드 대기 초안
description: 노션에 작성할 초안. /post-notion-draft로 업로드 가능.
type: draft
updated: 2026-04-27
originSessionId: current
---

# SEO 작업을 하면서 Next.js를 적용하지 않은 이유

## 작업 배경

멜로미 MVP에서 SEO를 본격적으로 챙기려는 시점이었습니다. 1단계(메타태그·robots.txt·sitemap.xml·Search Console 등록)는 이미 끝낸 상태였고, 다음 단계로 SPA 크롤링 한계를 어떻게 다룰지 고민하기 시작했습니다.

선택지는 세 가지였습니다.

- 옵션 1: `react-helmet-async` (클라이언트 사이드에서 페이지별 메타 분기)
- 옵션 2: `vite-plugin-ssg` / prerender (빌드 타임에 정적 페이지를 진짜 HTML로 굽기)
- 옵션 3: Next.js 마이그레이션 (SSR로 모든 라우트 대응)

옵션 1과 2를 비교하면서 한계가 명확해 보였고, "결국 Next.js로 가야 하는 거 아닌가?"라는 생각이 자연스럽게 들었습니다. 그래서 비용과 리턴을 정직하게 계산해보기로 했습니다.

## Next.js를 적용하면 무엇을 건드려야 하는가

현재 코드베이스 규모는 크지 않습니다. 7,481 LOC, 페이지 16개, 컴포넌트 26개, 훅 7개, stores 2개. 그래도 마이그레이션 시 손대야 할 영역을 항목별로 펼쳐보면 생각보다 넓습니다.

| # | 항목 | 추정 시간 | 위험도 |
|---|---|---|---|
| 1 | Vite → Next.js 프로젝트 셋업 (config·tsconfig·scripts) | 4h | 낮음 |
| 2 | 페이지 16개 → `app/` 디렉토리 구조로 매핑 | 8h | 중간 |
| 3 | `react-router-dom` API 24개 파일 치환 (`useNavigate`→`useRouter` 등) | 4h | 중간 |
| 4 | `GuestRoute`/`AuthRoute` → `middleware.ts` + `layout.tsx` 가드 재설계 | 4h | 중간 |
| 5 | `'use client'` 경계 설정 + Hydration mismatch 잡기 | 4h | 높음 |
| 6 | MSW Next.js 통합 (SSR `setupServer` + CSR `setupWorker` 양쪽) | 6h | 높음 |
| 7 | TanStack Query SSR Hydration (`dehydrate/hydrate`, prefetch) | 4h | 중간 |
| 8 | Zustand SSR 호환 패턴 | 2h | 중간 |
| 9 | 환경변수 `VITE_*` → `NEXT_PUBLIC_*` 14곳 + Vercel 재설정 | 2h | 낮음 |
| 10 | Tailwind v4 + Next.js 통합 | 2h | 중간 |
| 11 | GA4/Clarity → `next/script`, `useGA4PageView` → `usePathname` 기반으로 재작성 | 1h | 낮음 |
| 12 | 메타태그 → `metadata` export / `generateMetadata` API | 2h | 낮음 |
| 13 | 회귀 테스트 + Hydration·MSW 디버깅 | 8h | 높음 |
| 14 | Vercel 빌드/배포 설정 검증 | 2h | 낮음 |

총 약 53시간. 사이드 작업과 병행하면 2~3주 분량입니다.

## Next.js를 적용했을 때 오는 리턴

SEO 측면에서 Next.js의 진짜 가치는 두 가지입니다.

첫째, JS를 실행하지 않는 모든 크롤러까지 대응 가능합니다. 카톡·슬랙·네이버 봇은 정적 HTML만 읽기 때문에 SPA에서는 공유 미리보기가 기본 OG로 고정되어 버리는데, Next.js는 SSR로 진짜 HTML을 내려주기 때문에 모든 봇이 페이지별 메타와 본문을 정상 인식합니다.

둘째, 동적 페이지에서도 페이지별 메타가 정상 작동합니다. `generateMetadata` API로 게시글 ID를 받아 제목과 OG 이미지를 페이지마다 다르게 생성할 수 있습니다.

부수적으로는 `next/image` 자동 최적화, `next/script` 로드 타이밍 제어, ISR로 인기 게시글 캐싱 같은 기능이 따라옵니다.

## 적용하지 않기로 한 핵심 근거

비용 53시간 자체를 보고 멈춘 게 아닙니다. 비용은 비용대로 크지만, 진짜 결정을 만든 건 **현재 정책 하에서 그 비용으로 사는 것이 무엇인지**를 다시 들여다본 순간이었습니다.

### 1. 게시글이 비공개라 크롤러가 도달할 페이지가 5개뿐

멜로미는 게시글을 모두 로그인 후에만 열람할 수 있는 정책입니다. 크롤러가 도달 가능한 라우트가 `/`, `/login`, `/signup`, `/privacy`, `/terms` 5개에 불과하고, 이 5개는 전부 빌드 타임에 내용이 결정되는 정적 페이지입니다.

여기서 깨달은 점이 핵심이었습니다. Next.js의 진가는 "동적 페이지를 SSR로 내려주는 것"인데, 지금 정책에서는 그게 필요한 페이지가 단 한 개도 없습니다. 정적 페이지 5개를 위해 SSR 프레임워크를 통째로 들이는 건 과한 선택입니다.

### 2. 옵션 2가 Next.js와 동일한 SEO 효용을 약 1/10 비용에 달성

옵션 2(vite-plugin-ssg)는 빌드 타임에 정적 라우트를 진짜 HTML 파일로 구워둡니다. `/privacy.html`, `/terms.html` 같은 식입니다. 카톡·네이버·구글 봇 전부 진짜 HTML을 받기 때문에 SEO 본질이 동일하게 해결됩니다.

추정 비용은 4~6시간. 53시간 대비 1/10 수준이고, 현재 정책 하에서 SEO 효용은 Next.js와 같습니다. 동일한 결과를 적은 비용으로 얻을 수 있다면 그쪽이 합리적입니다.

### 3. 공개 페이지 정책이 미확정

만약 게시글을 비로그인 공개로 정책 변경한다면 그 순간 Next.js의 가치가 폭발합니다. 동적 게시글 페이지마다 메타 분기, OG 미리보기, 검색 노출이 의미를 갖기 때문입니다. 하지만 정책은 아직 정해지지 않았고, MVP 단계에서는 비공개 유지 쪽으로 잡혀 있습니다.

즉, 지금 시점에 Next.js를 도입하는 건 "정책이 바뀔지도 모르니 미리 준비해두자"는 사고에 가깝습니다. 그런데 마이그레이션 비용 자체가 53시간이라 "미리 준비"의 비용이 작지 않고, 정책이 바뀌는 시점에 도입해도 비용은 동일합니다. 미리 준비한다고 비용이 절약되지 않습니다.

### 4. MSW 통합 리스크

현재 백엔드 모킹을 MSW로 하고 있습니다. Vite에서는 `main.tsx`에서 `worker.start()` 한 줄로 끝나는데, Next.js는 SSR/CSR을 분리해서 각각 모킹해야 합니다(`setupServer` + `setupWorker`). 공식 가이드는 있지만 App Router 환경에서 간헐적 충돌이 보고되어, 53시간 추정 중 6~10시간 정도가 이 디버깅에 잠식될 가능성이 있습니다.

### 5. MVP 단계의 우선순위

REQ-001~012 어디에도 SSR은 명시되어 있지 않습니다. SEO 1단계(메타·sitemap·robots·Search Console)는 이미 완료되었고, GA4/Clarity 분석 인프라도 완료 상태입니다. 다음 SEO 투자는 콘텐츠 공개 정책이 확정된 후가 ROI가 분명합니다. 정책 미확정 상태에서 53시간을 투자하는 건 옵션 가치가 낮은 베팅입니다.

## 의사결정의 관점

이 결정을 만든 사고 흐름을 정리하면 다음과 같습니다.

1. **"더 좋은 도구"가 아니라 "지금 풀어야 하는 문제에 맞는 도구"인지를 봤습니다.** Next.js가 일반론적으로 SPA의 SEO 한계를 가장 잘 푸는 도구인 건 맞습니다. 하지만 멜로미가 지금 풀어야 하는 문제는 "정적 페이지 5개의 메타·OG가 모든 크롤러에서 정상 인식되도록 한다"입니다. 이 문제는 옵션 2로 충분히 풀립니다.

2. **"미리 준비"의 비용을 점검했습니다.** "정책 바뀔 때 어차피 갈 거면 지금 가자"는 압박이 처음에 있었지만, 미리 도입한다고 마이그레이션 비용이 줄지 않는다는 걸 확인했습니다. 오히려 미리 도입한 인프라 위에 6개월간 코드가 쌓이면 그 코드까지 같이 마이그레이션해야 해서 미래 비용이 늘어날 수도 있습니다.

3. **비용을 항목별로 펼쳐서 추상이 아닌 숫자로 봤습니다.** 처음에는 "Next.js 마이그레이션 비용이 크다" 정도의 막연한 인상이었는데, 14개 항목으로 펼쳐 53시간이라는 수치를 만들고 위험도를 표시하니 결정이 분명해졌습니다. 도구 선택을 "느낌"에서 "숫자"로 끌어내리는 게 결정의 핵심이었습니다.

## 결정과 재검토 트리거

옵션 2(`vite-plugin-ssg`)만 작업 착수하기로 했습니다.

- 비용: 4~6시간
- 리턴: 정적 페이지 5개에서 카톡·네이버·구글 모두 진짜 HTML 인식 → 현재 정책 하의 SEO 본질 해결
- 보존: Vite 셋업·MSW 통합·React Router 그대로 유지
- 재검토 트리거: 게시글 비로그인 공개로 정책이 변경되는 시점에 Next.js 재평가

## 회고

처음엔 "SEO를 끝까지 가려면 Next.js로 가야 하는 것 아닌가"라는 막연한 압박감이 있었습니다. 그런데 비용을 항목별로 풀어 적고 리턴을 페이지 수와 크롤러 도달 가능성으로 다시 보니, 현재 정책에서는 Next.js의 가치가 거의 발휘되지 않는다는 게 명확해졌습니다.

같은 효용을 약 1/10 비용으로 살 수 있는 도구(`vite-plugin-ssg`)가 있을 때 더 큰 도구(Next.js)를 선택하는 건, 그 도구가 가진 추가 가치(동적 SSR·ISR·페이지별 동적 메타)가 비용을 정당화할 때만 합리적이라고 판단했습니다. 그 추가 가치는 게시글 공개 정책이 확정되어야 비로소 의미를 갖기 때문에, 그 시점이 오면 다시 평가할 예정입니다.

---

# 옵션 2 구현 — 플러그인 선택의 시행착오

옵션 2(빌드 타임 prerender)로 결정한 후, 어떤 플러그인을 쓸지 정하는 과정에서 시행착오가 있었습니다. 첫 선택은 `vite-react-ssg`였는데, 호환성 검증 단계에서 더 적합한 도구로 갈아탔습니다. 그 과정을 기록합니다.

## 첫 후보: vite-react-ssg

처음 검토한 플러그인은 `vite-react-ssg` (by daydreamer-riri)였습니다. 선택 근거는 다음과 같았습니다.

- React + Vite + React Router 조합에 특화된 SSG 도구
- 빌드 타임에 React 컴포넌트를 SSR해서 정적 HTML 생성
- 113개 코드 스니펫 (문서화 풍부)
- Source 평판 High, Benchmark 86

호환성 검증을 위해 공식 문서를 확인하던 중, README에서 다음 문장을 발견했습니다.

> "React Router v7 now includes built-in SSG capabilities. If you are utilizing React Router v7, it is recommended to leverage its official SSG features for enhanced support and seamless integration. The vite-react-ssg library will continue to provide SSG functionality for users of React Router v6."

저자 본인이 "React Router v7 사용자에게는 이 라이브러리를 권장하지 않는다"고 명시한 것입니다. 우리 프로젝트는 `react-router-dom@^7.13.1`을 사용 중이라 권장 스택에서 벗어납니다.

## 코드 변경 앞에서 발견할 수 있었던 이유

이 사실을 코드 변경 전에 잡을 수 있었던 건 우연이 아닙니다. 메모리에 누적해둔 규칙 `feedback_verify_spec_before_workaround`("workaround 추가 전 스펙·상태 재확인")가 작동한 결과였습니다.

이 규칙은 과거에 백엔드 응답을 의심 없이 수용해서 잘못된 workaround를 만들었던 사고에서 만들어진 것이었습니다. 이번에는 도메인은 다르지만 같은 사고 패턴, "도구를 의심 없이 수용"하는 상황을 막아주었습니다. 만약 이걸 놓치고 설치부터 했다면, 라우트 객체 config 전환까지 마친 뒤에 호환성 문제가 터져서 롤백 비용이 크게 들었을 것입니다.

## 두 번째 후보: vite-plugin-react-ssg

대안으로 검토한 `vite-plugin-react-ssg` (by wbbb0730)는 우리 스택에 정확히 맞았습니다.

| 항목 | vite-react-ssg | vite-plugin-react-ssg |
|---|---|---|
| React 19 지원 | 명시 없음 | `react >= 18.3.1` (19 포함) |
| Vite 7 지원 | 예제 v5 | 메이저 제한 없음 |
| React Router 7 | 저자가 v6 전용으로 권고 | React Router v6.4+ data router 지원 (v7 포함) |
| 동작 방식 | dev/build 모두 SSR화 | `vite build` 후 prerender만 추가, CSR 자산 그대로 보존 |
| 페이지별 메타 | 별도 라이브러리 | `@unhead/react` 통합 (`useHead`, `useSeoMeta`) |
| Source 평판 | High, Benchmark 86 | Medium, Benchmark 92 |

`vite-plugin-react-ssg`의 핵심 장점은 **비침투적 동작**입니다. 기존 CSR 빌드 결과물은 그대로 두고, prerender 대상 라우트만 추가로 정적 HTML을 생성합니다. SPA로 동작하던 부분은 여전히 SPA로 동작하고, prerender된 라우트는 첫 응답에서 진짜 HTML을 받습니다. 우리가 원했던 "정적 페이지 3개만 HTML로 굽기" 시나리오에 정확히 맞습니다.

평판 점수는 Medium으로 떨어지긴 했지만, 우리가 풀어야 하는 문제(React Router v7 환경에서 정적 페이지 3개 prerender)에 정확히 맞는 도구라는 점이 더 결정적이었습니다. Next.js 결정 때 적용했던 "더 좋은 도구가 아니라 지금 풀어야 하는 문제에 맞는 도구"라는 사고를 한 단계 안에서 다시 사용한 셈입니다.

## 사전 조건과 또 한 번의 시행착오

`vite-plugin-react-ssg`는 React Router의 data router 모드(`createBrowserRouter`)를 요구합니다. 현재 `App.tsx`는 JSX `<BrowserRouter>` 방식이라 라우트 16개를 객체 config로 전환해야 했습니다. 이 전환은 prerender 목적이 아니더라도 React Router 7의 권장 방향이라 부수적 가치가 있는 작업이었습니다.

라우트 전환은 가장 큰 변경이라 마지막 단계 직전에 두고, 1단계인 패키지 설치부터 시작했습니다. 그런데 그 첫 명령에서 막혔습니다.

```
npm install vite-plugin-react-ssg @unhead/react
npm error code ERESOLVE
npm error peer vite@"^8.0.3" from vite-plugin-react-ssg@0.2.0
npm error Found: vite@7.3.2
```

NPM에서 직접 확인해보니 `vite-plugin-react-ssg`는 첫 릴리스(0.0.1)부터 모든 버전이 `vite@^8.0.3`을 요구하고 있었습니다. 위 비교표에 적었던 "Vite 7 지원: 메이저 제한 없음"은 사실과 달랐고, NPM peerDependencies를 1차 소스로 검증하지 않은 부주의가 잡혔습니다.

문제는 한 패키지 호환성에 그치지 않았습니다. Vite 8로 올리면 다른 의존성도 따라가야 했습니다.

| 플러그인 | 현재 | peer vite | Vite 8 지원 |
|---|---|---|---|
| `@vitejs/plugin-react` | 5.1.1 | `^4 ~ ^7` | 6.0.x가 vite 8용으로 별도 출시 (메이저 업 필요) |
| `@tailwindcss/vite` | 4.2.1 | `^5 ~ ^7` | 4.2.4부터 vite 8 추가 (마이너 업) |

한 번의 SEO 작업을 위해 빌드 툴체인 메이저 두 개(Vite + plugin-react)와 마이너 한 개를 동시에 올려야 하는 구조였습니다.

## 핵심 의존성 메이저 업그레이드를 회피한 이유

이 시점에 사용자가 명확한 거부감을 표명했습니다.

> "SEO 하나 때문에 다른 핵심 라이브러리들의 버전을 변경하게 되면 갑자기 연쇄적으로 근본 시스템에 장애가 생길 것 같은 공포가 든다. 정확히 어떤 문제가 생길지는 모르겠지만."

이 직관은 합리적이었습니다. Vite·React·React Router·@vitejs/plugin-react·@tailwindcss/vite 같은 빌드 툴체인 메이저 업그레이드는 사전에 회귀 영역을 예측하기 어렵습니다. 직접 import하지 않은 코드 경로에서도 깨질 수 있고, 무엇이 깨질지 미리 열거할 수 없는 상태에서 메이저 변경을 강행하는 건 옵션 가치가 낮은 베팅입니다.

대신 핵심 의존성 변경 없이 같은 효용을 주는 후보를 찾기로 했습니다.

## 세 번째 후보: vite-prerender-plugin

NPM 검색으로 `vite-prerender-plugin` (by rschristian, preactjs org 메인테이너, 0.5.13 / 2026-03-15 출시)을 발견했습니다. 직전 후보들과 비교하면 다음과 같았습니다.

| 항목 | A. Vite 8 + vite-plugin-react-ssg | C. vite-react-ssg | D. vite-prerender-plugin |
|---|---|---|---|
| Vite 호환 | 8.x 강제, 메이저 업 필요 | 7.x OK | 5·6·7·8 모두 OK |
| 동반 변경 | plugin-react 5→6, tailwind 마이너 | 없음 | 없음 |
| RR v7 호환 | 명시 지원 | 회색지대(저자가 v6 권장) | RR 무관 |
| data router 전환 | 필수 | 필수 | 불필요 |
| 메타 태그 | `@unhead/react` 통합 | beasties/critters | head 옵션 직접 설정 |
| 메인테이너 | wbbb0730 단독, 평판 Medium | daydreamer-riri, 평판 High (v7 비권장) | preactjs org, 매우 활발 |
| prerender 함수 | 자동 | 자동 | 직접 작성 |

`vite-prerender-plugin`은 프레임워크 무관 도구라 사용자가 직접 `prerender()` 함수를 작성해야 한다는 단점이 있습니다. 그러나 우리의 prerender 타깃이 정적 3개(`/`, `/privacy`, `/terms`)뿐이라 이 부담은 작고, 대신 data router 전환(원래 가장 큰 변경)이 사라지는 큰 이득을 얻을 수 있었습니다. 추정 비용도 5~6시간에서 2~3시간으로 절반 가까이 줄었습니다.

## 구현 과정

다음 흐름으로 진행했습니다.

1. `npm install vite-prerender-plugin` — 16개 트랜시티브 추가, ERESOLVE 0건
2. `vite.config.ts`에 플러그인 등록 + `additionalPrerenderRoutes: ['/privacy', '/terms']` 지정
3. `src/prerender.tsx` 신규 작성 — `StaticRouter` + `renderToString`으로 페이지별 HTML을 생성하고, head 옵션에 페이지별 메타(title·description·canonical·og:title)를 주입
4. `npm run build` — 4.5초에 `dist/index.html`, `dist/privacy/index.html`, `dist/terms/index.html` 세 개 정적 HTML 생성

여기서 한 가지 발견이 있었습니다.

## 발견: 메타 태그 중복과 플러그인의 append 동작

빌드 후 dist HTML을 grep해보니 `<link rel="canonical">`이 페이지마다 두 개씩 박혀 있었습니다.

```html
<link rel="canonical" href="https://www.melonnetherapists.com/" />        <!-- index.html 원본 -->
<link rel="canonical" href="https://www.melonnetherapists.com/privacy" /> <!-- prerender 추가 -->
```

원인은 플러그인의 동작 방식에 있었습니다. `vite-prerender-plugin`은 `head.elements`를 append 방식으로 주입합니다. index.html에 hardcode된 SEO 태그를 그대로 두고 prerender가 그 위에 추가만 합니다. 같은 종류의 태그가 두 번 박히면, 크롤러가 보통 첫 번째 canonical을 우선시한다는 점에서 모든 prerender 페이지가 `/`로 인식되어 페이지별 차별화 효과가 사라지게 됩니다.

해결책으로 `index.html`의 SEO 메타(canonical, og:*, twitter:*, description, keywords)를 일괄 제거하고 prerender만 단일 소스로 두기로 했습니다. prerender 외 라우트(`/login`, `/signup`, `/posts/*` 등)는 어차피 인증 필요 페이지로 noindex 권장 대상이므로 메타 부재가 문제가 되지 않았습니다. GA4(`G-7VPMPFL76M`), Clarity(`wg3vefhmgy`), Google Search Console verification, favicon은 모두 보존했습니다.

```html
<!-- 변경 후 index.html -->
<title>멜로미</title>
<!-- SEO 메타는 src/prerender.tsx에서 페이지별로 주입 -->
```

다시 빌드하니 페이지별로 `<title>`·description·canonical·og:title이 정확히 한 개씩만 박혔고, GA4 측정 ID와 Clarity 태그도 그대로 유지됐습니다. 실측 작업 시간 약 1.5시간으로 마무리됐습니다.

## 회고: 메모리 규칙이 두 번 작동한 사례

이번 작업 전체에서 메모리에 누적해둔 규칙이 두 번 작동했습니다.

첫 번째는 `feedback_verify_spec_before_workaround`였습니다. 첫 후보(`vite-react-ssg`)를 README 한 줄로 폐기하게 해주었고, 두 번째 후보의 ERESOLVE 충돌에서 `--legacy-peer-deps`로 강행하지 않고 멈춰서 다시 검토하게 만들어주었습니다.

두 번째는 이번 세션에서 새로 명문화된 `feedback_dependency_blast_radius` 규칙입니다. "보조 기능이 핵심 의존성 메이저 업을 끌고 오면 회피"라는 한 줄짜리 원칙인데, 사용자의 "핵심 라이브러리 변경이 무섭다"는 직관에서 이름 붙여졌습니다. 이 규칙이 옵션 A(Vite 8 메이저 업)를 D(`vite-prerender-plugin`)로 갈아타게 만든 결정적 신호였습니다.

직관을 규칙으로 명문화하는 작업은 그 자체로 작은 비용이지만, 미래에 같은 직관을 매번 재발견하는 비용을 없애줍니다. 이번 세션은 직관에서 규칙으로, 그 규칙이 다음 결정에서 자동 적용되는 사이클이 한 번 완결된 사례였습니다.

또 하나의 배움은 플러그인 동작 방식(append vs replace)을 빌드 결과물로 직접 검증한 가치였습니다. 동작 방식이 readme에 명시되어 있을 때도 있고 아닐 때도 있는데, 빌드 결과를 grep 한 번으로 확인하니 중복 태그가 명확히 보였고, 추측이 아닌 사실 기반으로 후속 정리(index.html SEO 일원화)를 결정할 수 있었습니다. 작은 검증 한 단계가 큰 의사결정에서 신뢰의 기반이 되었습니다.
