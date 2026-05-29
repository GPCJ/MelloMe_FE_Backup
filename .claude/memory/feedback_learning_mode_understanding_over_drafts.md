---
name: feedback-learning-mode-understanding-over-drafts
description: 사용자가 학습 진행 중일 때는 긴 산출물(초안/스펙/문서) 작성 전에 본인 이해 확보를 우선한다
metadata: 
  node_type: memory
  type: feedback
  originSessionId: d82e89cf-0f08-46ed-9f5f-bfa5044cbc5f
---

학습 진행 중 사용자가 "잘 안 들어온다" / "이해 못했다" 류 신호 보내면, 긴 산출물(초안/스펙/마크다운 문서) 작성을 중단하고 사용자 본인의 이해 확보를 우선한다.

**Why:** 2026-05-19 OAuth 재도입 작업 중 사용자가 "잘 머리에 안 들어오네", "긴 메시지 초안 같은거 만들지 말고 나를 이해시켜줘"라고 명시. 산출물 우선 모드는 학습 흡수를 방해하고, 사용자가 자기 표현으로 정리해보는 단계를 건너뛰게 만든다.

**How to apply:**
- 사용자가 "잘 안 들어온다" / "이해 못했다" / 자기 표현으로 정리 시도하며 검증 요청하는 신호 보이면 → 초안/스펙 작성 중단
- 줄 단위 ✅/⚠️ 검증 + 비유로 학습 진행 ([[user_knowledge_auth]], [[user_comprehension_criterion]])
- 사용자가 자기 표현으로 다시 정리하고 보정 받은 후에 → 산출물 단계로 이동
- 학습 모드의 효과적 패턴: 사용자 정리 → AI 검증(✅/⚠️) → 한 군데 보정 → 재정리

**관련:** [[user_comprehension_criterion]], [[feedback_concise_when_tired]], [[feedback_learning_gap_socratic_checkin]], [[user_collab_style_meta]]
