---
name: 2주 우선순위 2026-04-23~05-07 (SEO / 유저 행동 데이터 / 디자이너 UI)
description: 2주 창 동안 SEO 해결·유저 행동 데이터 수집·디자이너 UI 안정화 3가지만 최우선, 다른 R-xx 리팩토링은 모두 후순위
type: project
originSessionId: 66a71c38-a303-4648-9da9-5f6eff5595a0
---
2026-04-23 ~ 2026-05-07 2주 창 동안 아래 3가지가 다른 모든 작업보다 우선.

**Why:** 사용자가 이 기간 동안 SEO 문제 해결, 유저 행동 데이터 수집 구현, 디자이너 피그마 보고 UI 안정화 3가지를 끝내야 한다고 명시적으로 선언. "다른 작업은 모두 이 주제들보다 후순위"로 못박음.

**How to apply:** 이 기간엔 "오늘 뭐 할까?" / "다음 작업 뭐가 좋을까?" 류 질문에 대해 아래 3가지 범위 안에서만 제안. 리팩토링 백로그는 꺼내지 말 것. 2026-05-07 지나면 이 파일 갱신 또는 삭제.

---

## 2주 창 최우선 3가지

### 1. SEO 해결 — 완료
- **1단계 (완료 2026-04-23)**: 메타태그 + robots.txt + sitemap.xml + Search Console 등록
- **3단계 (완료 2026-04-27)**: SPA 크롤링 대응 — `vite-prerender-plugin` 채택, `/`·`/privacy`·`/terms` 3개 정적 HTML 생성, 페이지별 메타 단일 소스. 상세 `./project_seo_option2_decision.md`

### 2. 유저 행동 데이터 수집
- **GA4/Clarity 설치 (완료 2026-04-23)** — 상세 `./project_analytics_ga4_clarity_install.md`
- **1차 4종 삽입 (완료 2026-04-24, cf7750e)** — `signup_completed`/`login_completed`/`verification_requested`/`first_post_created` (사용자 임시 선택)
- **PM 정식 스펙 24종 도착 (2026-04-27)** — 주요 7개(`sign_up`/`profile_edited`/`certification_started`/`certification_completed`/`post_created`/`reaction`/`screen_exit`) + 부가 17개. 상세 `./project_analytics_event_spec_pm_v1.md`
- **추가 삽입 — 주요 7개부터 1차 ship** (B 단계, 프론트 독립 즉시 가능 — `analyticsId` 드롭으로 백엔드 의존성 0)
- **개인정보 처리방침 문구 — 1차 P-01에서 분석 쿠키 고지 완료**. 추가 이벤트 삽입 시 별도 갱신 불필요(익명 유지)

### 3. 디자이너 피그마 보고 UI 안정화
- 피그마 최신 버전 diff 확인 (미진행)
- 변경 항목 체크리스트 → 구현 범위 확정
- 구현 실행

## 후순위 (2주 이후 재검토)

다음 항목들은 이 기간에 제안하지 않음:
- R-01b (useInfiniteFeed → useInfiniteQuery)
- R-02 (AbortController 일괄 적용)
- R-04 (FilterChips 컴포넌트 추출)
- R-05 (ProfilePage 관심사 분리)
- L-02, L-03 (학습 태스크)
- 블로그 2~4편 (단 SEO/Analytics 작업 자체를 블로그 소재로 겸사 활용은 OK)

## 병렬 블로킹 상황

- 2026-04-22~04-28 **백엔드 배포 freeze** 여전히 적용 → 프론트 단독 완결 작업만 가능 (이 주제 3개는 모두 프론트 단독)
