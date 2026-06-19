---
name: feedback_jira_ticket_technical_level
description: Jira 티켓 작성 시 기술 용어 적절히 포함 — 너무 쉽게 쓰면 BE가 정확히 이해 못함
metadata: 
  node_type: memory
  type: feedback
  originSessionId: a5835828-e8c1-4ac9-be73-f3a5cf7cf102
---

핵심 기술 용어(`REFRESH_TOKEN_INVALID`, `SameSite=Lax`, `cross-origin`, `capacitor://localhost` 등)는 Jira 티켓에 포함해야 한다.

**Why:** "용어 최소화" 요청에 과하게 반응해 핵심 식별자까지 제거하면 BE가 정확히 이해하기 어렵다. "쉽게 쓰기"는 설명 방식의 문제이지, 기술 키워드를 생략하라는 뜻이 아님 (2026-06-19 MEL-72 작성 후 수정 요청).

**How to apply:** 티켓 작성 시 — 설명문은 쉽게, 에러 코드·설정값·origin·API 경로 등 식별자는 그대로 유지.
