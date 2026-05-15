---
name: seo-description-requires-body-signal
description: SEO description 변경 시 메타만으로는 효과 미보장 — prerender 본문 시그널을 함께 박아야 검색 결과 부연설명이 의도대로 잡힘
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 89f6e9e1-410d-40bb-bb2d-73e92636a654
---

# SEO description 변경 = 메타 + 본문 시그널 동시 적용

검색 결과 부연설명(description)을 바꾸고 싶을 때 `<meta name="description">`만 갱신하지 말 것. **prerender HTML 본문에도 키워드 시그널을 박아야** 의도대로 잡힘.

**Why:** Googlebot은 description meta를 참고만 한다. 실제 검색 결과 부연설명은 메타·본문·검색 쿼리를 종합해 자체 판단으로 선택. 특히 SPA + prerender + redirect 패턴에서 prerender 본문이 비어 있으면(`EmptyRoot` 같은 빈 컴포넌트) hydrate 후 redirected 페이지 본문(/signup 등)이 자동 추출 우선 채택되어 메타를 무시함. 2026-05-15 baseline 스크린샷에서 `/` 검색 결과에 `/signup` 회원가입 폼 텍스트("이메일 *. 비밀번호 *...")가 잡히는 문제 직접 확인. 메타만 바꿔도 동일 결과 가능성 높았음.

**How to apply:**
- SEO description 변경 작업 시작 시 baseline 검색 결과 스크린샷부터 확인 (구글 검색 + `site:` 연산자)
- 메타만 바꾸려는 첫 충동을 멈추고 prerender 본문 상태부터 점검 (`SeoRoot` / `EmptyRoot` / 정식 랜딩 등)
- 본문이 비어 있거나 redirect 패턴이면 메타 + 본문 시그널 **동시 적용**:
  - 본문 시그널 1: visually hidden 본문 (`<div className="sr-only">키워드 자연어 문단</div>`) — 사용자 UX 영향 0, 디자이너 컨펌 불필요
  - 본문 시그널 2: visible 본문 (0.5초 노출 후 redirect) — UX 영향 있어 PM·디자이너 컨펌 필요
  - 본문 시그널 3: 정식 콘텐츠 페이지 신설 (`/about` 등) — 정공법, MVP 후
- 키워드 stuffing(단순 나열) 회피 — spam 페널티. 자연어 문장으로 풀어 씀
- 효과 검증은 색인 갱신 며칠~1주 후. 즉시 결과 확인 못 함 → fix 검증은 baseline 비교로

**연관 메모리:**
- [[pm-seo-keywords-2026-05-14]] — 이 룰을 도출한 작업 (2026-05-15 A+B 동시 적용)
- [[seo-google-search-console-naver-search-advisor]] — 색인 가속·모니터링 동선
- [[feedback_verify_fix_with_baseline]] — baseline 측정 우선 룰의 SEO 적용 사례
