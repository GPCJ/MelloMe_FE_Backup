---
name: project_ga4_event_naming_pattern_2026_05_29
description: "GA4 새 이벤트 분기 추가 시 단일 이벤트 + 매개변수 + Custom Dimension 패턴 채택, 별도 이벤트명 신설 회피 결정 (2026-05-29 고민카드 도입 시 정리)"
metadata: 
  node_type: memory
  type: project
  originSessionId: 94754fcd-1b35-49f6-b186-e83a95e63830
---

새 GA4 이벤트 분기 추가 시 **단일 이벤트 + 매개변수 + Custom Dimension 등록** 패턴 채택. 별도 이벤트명 신설(`concern_card_created` 등) 회피.

## 적용 예 (현재 박힌 것)

- `reaction { type: react_like | react_useful | react_curious | comment | scrap | download }` — 6분기 통합 ([[project_analytics_event_spec_pm_v1]])
- `post_created { postType: CONCERN_CARD | undefined }` — 게시글 타입 분기, 2026-05-29 고민카드 발사 prod 확인
- `screen_exit { screen_name, duration }` — 3개 화면 통합

## 채택 이유

| 항목 | 단일 + 매개변수 | 별도 이벤트명 |
|---|---|---|
| PM 단일화 철학 일관성 | ✅ | ❌ 신설, PM 합의 필요 ([[project_analytics_event_ownership]]) |
| 북극성 KPI 정의 | 깔끔 ("유저당 post_created 비율") | 갈라짐 (union 매번 필요) |
| GA4 무료 티어 이벤트 카운트 한도 | 절약 | 인플레 |
| "전체 X 수" 집계 | 그대로 | union 필요 |
| 보고서 즉시성 | Custom Dimension 1회 등록 필요 | 좌측 이벤트 리스트에 바로 보임 |

→ 즉시성 1가지를 위해 4가지 비용을 지불할 가치 없음. **단일 + 매개변수 + Custom Dimension** 정설.

## 등록 절차 (PM 핸드오프 필요)

매개변수만 추가하면 보고서·탐색에서 차원 분할 불가. 차원으로 쓰려면 GA4 콘솔 **관리 → 맞춤 정의 → 맞춤 측정기준**에서 등록 필요.

- 범위: 이벤트
- 매개변수명: 코드와 정확히 일치 (예: `postType`)
- 한도: 속성당 50개(이벤트 범위) — 사실상 여유

⚠️ **소급 적용 안 됨** — 등록 후 발생한 이벤트부터 차원 적용. 코드 발사 시점과 등록 시점 사이 데이터는 매개변수 패널로만 확인 가능.

PM 핸드오프 문구 박제 = [[project_concern_card_prod_followup_2026_05_30]] 트리거 B.

## How to apply (다음에 새 이벤트 분기 결정 시)

1. 기존 이벤트에 매개변수 추가로 충분한가? → 우선
2. 새 이벤트명이 필요한 진짜 이유는? (북극성 KPI 분기 OK?)
3. PM 합의 필요한지 ([[project_analytics_event_ownership]] 정책)
4. 매개변수 패턴 채택 시 Custom Dimension 등록도 PM 핸드오프에 함께 넣기

관련:
- [[project_analytics_event_ownership]]
- [[project_analytics_event_spec_pm_v1]]
- [[reference_analytics_dashboards]] (등록 메뉴 위치)
