---
name: feedback_fallback_log_to_avoid_masking
description: "graceful 폴백(이니셜·기본값·빈 상태)으로 실패를 가릴 때, 검증 시 정상 오인 방지 위해 console.warn으로 원인 노출"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 1328806d-2b5a-4004-bd3f-0367923ba9f3
---

# 폴백이 문제를 가리지 않게 — 폴백 시점에 console.warn으로 원인 노출

graceful 폴백(이미지 onError → 이니셜 아바타, 기본값, 빈 상태 등)으로 실패를 우아하게 처리할 때, **그 폴백이 실제 문제를 가려 브라우저/QA 검증 시 "정상"으로 오인**될 수 있다. 폴백 시점에 도메인 prefix 붙인 `console.warn`으로 원인을 남겨 검증자가 알아채게 할 것.

**Why:** `UserAvatar` onError가 깨진 이미지를 이니셜로 떨어뜨리니, BE의 raw S3 키 문제(F-14)가 화면상 안 보여 회귀로 오인될 위험을 사용자가 지적함(2026-06-09). "검증 시 문제없어 보이는 게 진짜 위험."

**How to apply:** 폴백/디폴트 처리 코드에 도메인 prefix(`[avatar]`, `[image-attach]` 등 — [[project_image_attach_log_prefix_convention]])를 붙인 경고 로깅 추가. console-only 의도면 `console.warn`, 원격 수집 필요는 별도 판단([[feedback_clarify_logging_intent_console_vs_remote]]). [[feedback_error_handling]](에러 삼키지 말기)의 **UI-폴백 버전** — API 에러뿐 아니라 표시 레이어의 silent degradation도 동일 원칙.
