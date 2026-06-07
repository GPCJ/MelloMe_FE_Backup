---
name: 분석/검색 대시보드 레퍼런스 (Search Console, GA4, Clarity)
description: 멜로미 운영 중인 3개 외부 분석 도구의 대시보드 URL과 식별자. 코드 찾기/디버깅 시 참조.
type: reference
originSessionId: 66a71c38-a303-4648-9da9-5f6eff5595a0
---
2026-04-23 설치 완료. 설치 맥락·SPA 라우트 트래킹 메커니즘은 `./project_analytics_ga4_clarity_install.md` 참조.

---

## Google Search Console

- **대시보드**: https://search.google.com/search-console
- **속성**: `https://www.melonnetherapists.com` (URL 접두어 방식)
- **소유권 확인**: 2026-04-23 HTML 태그 방식으로 확인 완료
- **소유권 확인 메타태그** (index.html에 심어둠 — 삭제되면 연결 해제됨):
  ```html
  <meta name="google-site-verification" content="cZuyZEZ9eWZ_1HbxFXHDQfVDp7wWJMQlSxkcwbE10ug" />
  ```
- **제출한 sitemap**: `/sitemap.xml` (공개 라우트 3개: `/`, `/login`, `/signup`)

## Google Analytics 4 (GA4)

- **대시보드**: https://analytics.google.com
- **속성명**: 멜로미
- **측정 ID**: `G-7VPMPFL76M` (index.html gtag 스니펫에 하드코딩)
- **시간대**: 대한민국 / 통화: KRW
- **비즈니스 목표 선택**: "웹/앱 트래픽 파악" + "사용자 참여·유지율 보기"
- **실시간 리포트**: 좌측 "보고서 > 실시간"
- **prod 도메인 가드** (2026-04-27 이후): `index.html`에서 `location.hostname === 'www.melonnetherapists.com'`일 때만 `gtag('config', ...)` 호출. develop/staging/localhost는 발사 차단. 검증 절차 = [[feedback_verify_analytics_env_gate_first]]
- **이벤트 발사 검증 빠른 경로**: 보고서 → 실시간 → "지난 30분 이벤트" 카드 → 이벤트명 클릭 → 매개변수 패널에서 값 확인
- **매개변수 → 분석 차원 등록**: 관리 → 맞춤 정의 → 맞춤 측정기준 만들기 (범위=이벤트, 매개변수명 코드와 정확히 일치)
  - 함정: 매개변수만 추가 ≠ 보고서·탐색 분할 가능. 차원 등록 후 발생한 이벤트부터 적용(소급 X)
  - 한도: 속성당 50개(이벤트 범위)
  - 결정 정책 = [[project_ga4_event_naming_pattern_2026_05_29]]

## Microsoft Clarity

- **대시보드**: https://clarity.microsoft.com
- **프로젝트명**: 멜로미
- **Project ID**: `wg3vefhmgy` (index.html Clarity IIFE 스니펫에 하드코딩)
- **세션 녹화 지연**: 10분~1시간

---

## 보안 참고

이 3개 식별자는 모두 **공개 식별자**(브라우저 view-source에 노출되는 값). 민감 정보 아님. 메모리에 저장 OK.

단, 이 대시보드들에 접근하려면 **관리 계정(melonnebuilders@gmail.com 등)** 로그인 필요 — 로그인 정보는 절대 메모리에 저장하지 않음.
