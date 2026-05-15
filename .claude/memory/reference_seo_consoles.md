---
name: seo-google-search-console-naver-search-advisor
description: 검색엔진 색인 콘솔 2종의 URL·소유 확인 방식·색인 가속 동선. Mellti 도메인 색인 모니터링·재요청용.
metadata: 
  node_type: memory
  type: reference
  originSessionId: fb6b7655-3b51-48e2-b827-07464d491cc4
---

# SEO 콘솔 — Google Search Console + Naver Search Advisor

검색엔진 색인을 모니터링·가속하는 외부 콘솔 2종. Mellti 도메인(`www.melonnetherapists.com`)의 색인 상태 확인 + 새 페이지·재색인 강제 요청용.

**Why:** 코드·콘텐츠 변경 후 검색 결과 반영까지 며칠~몇 주 대기인데, 콘솔에서 "URL 검사 → 색인 요청"으로 가속 가능. 특히 브랜드 표기 변경(멜로미 → Mellti) 직후 재색인 요청 필수.

**How to apply:** SEO 관련 코드·콘텐츠 변경 → prod 배포 → 콘솔 색인 재요청. `site:melonnetherapists.com`로 색인 진행 상황 확인.

---

## Google Search Console

- **URL**: https://search.google.com/search-console
- **등록 상태**: 등록됨 (`index.html`에 `<meta name="google-site-verification" content="cZuyZEZ9eWZ_1HbxFXHDQfVDp7wWJMQlSxkcwbE10ug">` 박혀 있음)
- **색인 가속 동선**: 좌측 메뉴 "URL 검사" → 검색창에 페이지 URL 입력 → "색인 생성 요청"
- **sitemap 제출**: 좌측 "Sitemaps" → `https://www.melonnetherapists.com/sitemap.xml` 입력

## Naver Search Advisor

- **URL**: https://searchadvisor.naver.com
- **등록 상태**: 등록됨 — **non-www + www 양쪽 모두** (`index.html`에 verification meta 2줄, 둘 다 소유 확인 통과)
  - non-www (`melonnetherapists.com`): 2026-05-14 등록, token `201aed28261c2a38d30c7a2f3bc789ca2c61f6a5`, 커밋 `a232f6a`
  - www (`www.melonnetherapists.com`): 2026-05-15 등록, token `485256736f56c29eaa6a13ad3a2960fa0f47a2c3`, 커밋 `82d3196`
- **사이트맵 / 웹페이지 수집**: www 사이트 기준 제출 완료 (2026-05-15). non-www는 Vercel 308 redirect 걸려 있어 사실상 trivial — 모니터링 우선순위 낮음
- **Vercel 도메인 redirect**: 2026-05-15 Vercel Dashboard에서 non-www → www 308 redirect 활성화. 확인: `curl -I https://melonnetherapists.com/` → `HTTP/2 308`
- **소유 확인 방식**: HTML 태그 (가장 가벼움). DNS·HTML 파일 업로드도 가능.
- **등록 후 동선**: "요청 → 사이트맵 제출" + "요청 → 웹페이지 수집" (URL 직접 요청)
- **사이트맵 제출 UI 함정**: 입력 도메인 prefix가 등록 도메인과 동일해야 함. www 등록엔 www 사이트맵, non-www 등록엔 non-www 사이트맵.
- **메타 태그 삭제 사고 방지**: `index.html`에 verification 4종(Google 1 + Naver 2) 박혀 있고 각각 위에 `(삭제하면 ... 연결 해제됨)` 주석 있음. 제거하면 콘솔 연결 끊김.

## 색인 현황 확인 (콘솔 없이도 가능)

- Google 검색창에 `site:melonnetherapists.com` 입력 → 색인된 페이지 목록 표시
- 각 페이지의 title·snippet에서 "Mellti" 보이면 새 색인 반영, "멜로미"면 옛 색인 잔존
- 한국 사용자 검색은 Naver가 따로라 Google 색인만으론 부족 — Naver Search Advisor 등록 후 별도 확인

## 색인 파이프라인 시간 감각

```
[T0] 코드 변경 → [T1] Vercel 배포(1-3분) → [T2] 봇 재크롤(1~수 일)
   → [T3] 색인 DB 갱신(1-3일) → [T4] 검색 결과 반영
낙관 1~3일 / 비관 2-4주 (콘솔에서 강제 요청 시 가속됨)
```

## 연관 메모리

- [[pm-seo-keywords-2026-05-14]] — PM SEO 키워드 26종 (메타·콘텐츠 적용 대상)
- [[project_service_name_mellti]] — 브랜드 표기 코드 반영 완료 정보
- [[reference_analytics_dashboards]] — GA4·Clarity (다른 분석 대시보드)
- [[seo-2-vite-prerender-plugin-2026-04-27]] (wiki) — SEO 채택 결정
