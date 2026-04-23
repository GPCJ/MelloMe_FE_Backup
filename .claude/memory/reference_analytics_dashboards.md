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

## Microsoft Clarity

- **대시보드**: https://clarity.microsoft.com
- **프로젝트명**: 멜로미
- **Project ID**: `wg3vefhmgy` (index.html Clarity IIFE 스니펫에 하드코딩)
- **세션 녹화 지연**: 10분~1시간

---

## 보안 참고

이 3개 식별자는 모두 **공개 식별자**(브라우저 view-source에 노출되는 값). 민감 정보 아님. 메모리에 저장 OK.

단, 이 대시보드들에 접근하려면 **관리 계정(melonnebuilders@gmail.com 등)** 로그인 필요 — 로그인 정보는 절대 메모리에 저장하지 않음.
