---
name: 업로드 대기 초안
description: 노션에 작성할 초안. /post-notion-draft로 업로드 가능.
type: draft
updated: 2026-04-23
originSessionId: 66a71c38-a303-4648-9da9-5f6eff5595a0
---
# 노션 업로드 대기 초안

**세션 날짜**: 2026-04-23
**주제**: SEO 기본 인프라 + GA4/Clarity 분석 인프라 구축
**분류**: TIL 1개 + 설계 결정 1개 + 프로젝트 성과 1개 (트러블슈팅 해당 없음)

---

## ① TIL

**업로드 위치**: TIL 페이지 (`323c8200749b80c2bbe6caf194055593`)

**제목**: `2026-04-23 — SEO + 분석 인프라 구축 (SPA에 GA4/Clarity 붙이기)`

**분류**: 인프라 세팅, 외부 서비스 연동, SPA 특성 이해

## 오늘 한 것

- **SEO 기본 세팅**: `index.html` 메타태그(title/description/canonical/OG/Twitter Card) 보강 + `robots.txt`·`sitemap.xml` 정비
- **Google Search Console 등록**: URL 접두어 + HTML 태그 소유권 확인 → sitemap 제출 → URL 검사 통과
- **GA4 + Clarity 설치**: 두 스크립트 `<head>`에 인라인 삽입
- **SPA page_view 트래킹**: `useGA4PageView` 훅 + `<AnalyticsTracker />` 래퍼로 라우트 변경 시 `gtag('event', 'page_view')` 수동 발송

## 배운 것 / 인사이트

### 1. 큐잉 버퍼 패턴 — 트래킹 스니펫의 보편 구조

GA4와 Clarity 스크립트는 겉보기엔 완전히 다른 코드처럼 보이지만 **같은 패턴**이라는 걸 배웠다.

```js
// GA4
window.dataLayer = [];
function gtag() { dataLayer.push(arguments); }  // 빈 깡통 함수 먼저 정의
```

```js
// Clarity (IIFE로 압축)
c[a] = c[a] || function() { (c[a].q = c[a].q || []).push(arguments) };
```

**왜 이렇게 만드나**:
- `async` 스크립트는 언제 도착할지 예측 불가
- 도착 전 이벤트 호출이 발생하면 유실
- 그래서 "호출을 받을 수 있는 큐 + 푸시 함수"를 먼저 설치 → 뒤늦게 도착한 실제 스크립트가 쌓인 호출을 일괄 처리

**GA뿐 아니라 비동기 로드되는 모든 SDK에서 반복되는 패턴**이라는 걸 알게 되어 앞으로 비슷한 스크립트를 볼 때 바로 읽힌다.

### 2. SEO ≠ OG — 카톡 썸네일은 "URL unfurling"

- **SEO**: 구글봇이 사이트를 크롤링·색인 → `title`/`description`/`canonical`/`robots.txt`/`sitemap.xml`
- **URL unfurling (OG)**: 카톡/슬랙/페이스북 서버가 URL을 **대신 방문**해서 HTML을 파싱 → `og:title`/`og:image`로 미리보기 카드 생성

구글은 `og:image`를 랭킹에 쓰지 않고, 카톡은 `<title>` 대신 `og:title`을 우선 읽는다. 두 레이어는 완전히 다른 서버/주체에 의해 소비됨.

### 3. SPA에서 GA4 page_view가 1건만 찍히는 구조적 문제

`gtag('config', ID)`는 **스크립트 최초 실행 시 딱 1회** page_view를 자동 발송한다. MPA는 페이지 이동 = 브라우저 재로드 = 스크립트 재실행이라 자동 발송이 반복되지만, SPA는 `history.pushState`로 URL만 바뀌고 재로드가 없다 → GA4 입장에선 사용자가 첫 페이지에만 머문 것처럼 보인다.

**해결 구조**:

```
useLocation() → pathname/search 변경 감지
      ↓
useEffect 재실행
      ↓
window.gtag('event', 'page_view', {...})
```

훅을 `<BrowserRouter>` 내부에 `<AnalyticsTracker />`로 심어두면 모든 페이지 컴포넌트는 GA 존재를 모른 채로 자동 트래킹됨. **"프로토콜 레벨에선 수동, 개발자 관점에선 자동"**.

### 4. React Context의 구조적 이해 — 왜 훅이 Router 내부에서만 동작하나

`useLocation` 같은 Router 훅은 `<BrowserRouter>`가 주입하는 **Context**에서 값을 꺼낸다. Provider 바깥에서 호출하면 context 기본값(null) → 즉시 throw.

비유하자면 "사내 공유 폴더는 사장(Provider) 관할 트리 안의 직원만 열 수 있다". 이 구조가 그려지면 `<AnalyticsTracker />` 위치를 **외우지 않고 판단**할 수 있다.

## 포트폴리오 어필 포인트

- **결과물만 내지 않고 구조를 이해**: AI 위임으로 빠르게 구현하되 종료 직후 소크라테스식 Q&A로 이해 구멍 진단·보강하는 학습 루프 운영
- **SPA 특성에 대한 깊은 이해**: GA4 자동 발송 구조가 SPA에서 깨지는 이유를 history API와 React Router 상호작용 관점에서 설명 가능
- **서드파티 SDK 공통 패턴 파악**: 큐잉 버퍼 패턴을 통해 유사 스크립트(페이스북 픽셀, Hotjar 등)도 같은 시각으로 읽을 수 있는 메타지식 확보

---

## ② 설계 결정

**업로드 위치**: 설계 결정 & 아키텍처 페이지 (`32dc8200749b81e899bde7aea0a37937`)

**제목**: `04-23 — SEO + 분석 인프라 아키텍처 결정`

## 1. SPA page_view 트래킹을 `<AnalyticsTracker />` 래퍼 컴포넌트로 분리

**문제:** `useGA4PageView` 훅은 `useLocation`에 의존 → `<BrowserRouter>` 내부에서만 호출 가능. App 컴포넌트 본문에서 직접 호출 시 Router context 없어 런타임 에러.

**검토한 선택지:**
1. `App` 본문에서 직접 `useGA4PageView()` 호출 → ❌ Context 없음 에러
2. 각 페이지 컴포넌트에서 개별 호출 → ❌ 중복 + 누락 위험
3. `<BrowserRouter>` 내부 전용 래퍼 컴포넌트(`<AnalyticsTracker />`) → ✅ 채택

**결정:** 옵션 3. UI 렌더하지 않는 headless 컴포넌트(`return null`)로 라우트 트래킹만 담당.

**근거:**
- 한 곳에서만 구독 → 단일 책임
- 페이지 컴포넌트는 GA 존재를 몰라도 됨 (전역 사이드이펙트 처리)
- 추후 공통 이벤트(session_start 등) 확장 시 이 컴포넌트에 묶을 수 있음

---

## 2. Clarity 설치 방식: NPM 패키지 대신 script 수동 삽입

**문제:** Clarity는 NPM(`@microsoft/clarity`)과 HTML `<script>` 두 방식 제공.

**검토한 선택지:**
1. NPM 패키지 설치 → TypeScript 지원, 번들 통합
2. `index.html` `<script>` 인라인 삽입 → 의존성 0, GA4와 일관

**결정:** 옵션 2.

**근거:**
- GA4도 `<script>` 방식이라 일관성
- 한 줄 트래킹 스크립트 위해 npm 의존성 추가는 오버엔지니어링
- `async` 로드라 앱 초기화 블로킹 0
- 추후 세밀한 제어 필요 시 NPM 이전 비용 낮음

---

## ③ 프로젝트 성과 & 지표

**업로드 위치**: 프로젝트 성과 & 지표 페이지 (`32dc8200749b8157b695e5e84e60e01b`)

**제목**: `04-23 — SEO + 분석 인프라 구축 성과`

## SEO 기본 세팅

- **배포 상태**: 프로덕션 배포 완료 (커밋 `5a36327` + `a6cbdfd`)
- **개선 전**: `site:melonnetherapists.com` 구글 검색 결과 **0건** (인덱싱 전무), 기본 메타태그 대부분 누락
- **개선 후**: 메타태그 14종(description/canonical/OG 7종/Twitter Card 4종) + `robots.txt` + `sitemap.xml`(공개 라우트 3개) 정비

## Google Search Console

- **등록 방식**: URL 접두어 + HTML 태그 소유권 확인 (2026-04-23 완료)
- **sitemap 제출**: URL 검사에서 **"URL을 Google에 등록할 수 있음"** 통과
- **기대 효과**: 구글 크롤링 시작, 수 주 내 검색 노출 시작 예상

## 유저 행동 데이터 수집

- **배포 상태**: 프로덕션 배포 완료 (커밋 `d6857f2`)
- **GA4**: 실시간 리포트 수집 확인
- **Clarity**: 히트맵 + 세션 녹화 자동 수집
- **SPA 라우트 트래킹 훅**:
  - `useGA4PageView` (74줄) + `<AnalyticsTracker />` 래퍼 (10줄)
  - 검증: DevTools Network에서 라우트 이동 시마다 `/g/collect` 요청 생성
  - GA4 실시간 리포트에 방문 집계 확인

## 이력서 bullet 예시

- **"회원 전용 SPA(React 19 + Vite)에 SEO 기본 인프라(`meta`/`robots.txt`/`sitemap.xml`) 및 Google Search Console 등록을 통해 구글 검색 인덱싱 불가(`site:` 검색 0건) 상태를 해소"**
- **"SPA 라우트 변경 시 GA4 `page_view`가 1회만 집계되던 구조적 한계를 `useLocation` 기반 커스텀 훅(`useGA4PageView`)으로 해결, 라우트별 집계 정확성 확보"**
- **"GA4 + Microsoft Clarity를 도입해 유입 채널·히트맵·세션 녹화 기반 UX 개선 파이프라인 구축"**
