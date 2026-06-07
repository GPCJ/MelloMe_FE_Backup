---
name: feedback-code-review-ultra-high-usage
description: /code-review high(extra-high 다각도 7 finder × 1 sweep)는 큰 변경 누적 + AI 작성 비중 큰 영역 검증에 효과적 — 본 세션 15 finding 다수 실제 정정 반영
metadata:
  type: feedback
  originSessionId: e6719f80-10c5-489c-afe5-fb6b595f6c5d
---

`/code-review high`(또는 ultra)는 다음 상황에서 검증 보강 수단으로 적극 활용.

**Why**: 2026-05-29 고민카드 세션에서 Task 6~9 + 정정 위임 누적 후 high 실행 → 15 finding 발견, 다수 실제 정정 반영(draft loss 가드, submit race, popover capture phase, IME isComposing, 누락 필드 토스트, WriteFormHeader 공통 추출 등). AI 작성 비중 큰 영역(Speed Mode) + 본인 흡수 미완 코드 다층 검토에 특히 유효. 학습 모드만큼 시간 투입 없이 회귀 위험 사전 차단.

**How to apply**:

- **트리거 신호**: ① 큰 기능 단위(여러 Task) 작업 완료 시점 ② AI(Cursor/Claude) 일괄 작성 비중 큰 코드 ③ 본인 흡수 미완 자각 영역 ④ Speed Mode로 빠르게 작성한 새 로직.
- **회피 상황**: 단일 PR 단위 작은 변경(low/medium로 충분). 학습 모드 진행 중인 코드(검토보다 본인 손 작성이 흡수에 유익).
- **활용 시 후속**: HIGH→MEDIUM→LOW+Altitude 순서로 동기 정정. 정정 자체가 AI 작성이라면 [[feedback_ai_written_code_cognitive_debt]] 박제 의무 유지. 각 정정에 대한 트레이드오프·회귀 위험 메모리에 박제.
- **tsc/lint로는 잡히지 않는 것 우선 발견**: race guard, dirty confirm, popover backdrop 충돌, IME 가드, a11y orphan(aria-labelledby), 분기 누락(USER 가드), 캐시 invalidate 누락 등.

관련: [[feedback_speed_mode_ai_first_task_split]], [[feedback_ai_written_code_cognitive_debt]], [[feedback_review_triage_workflow]].
