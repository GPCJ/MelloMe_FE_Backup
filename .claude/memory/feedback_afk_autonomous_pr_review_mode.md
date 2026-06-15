---
name: feedback_afk_autonomous_pr_review_mode
description: 사용자가 자리 비울 때(AFK) 작업 모드 — unlock 미리 갱신 + 안전 범위만 자율 진행 + 인지부채 코드는 PR로 async 리뷰.
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 1f7daa41-4d30-4445-be00-95aa16cbc6ee
---

# 자리 비울 때(AFK) 자율 작업 + PR 리뷰 모드

사용자가 "저녁 먹고 올게, 그동안 진행해줘"처럼 자리를 비우며 자율 진행을 맡길 때의 운영 규약:

1. **unlock 미리 갱신** — `.claude/deadline-unlock` touch(4h 창). 단, 실제 AI 로직이 없으면 불필요했다고 사후에 명시할 것([[feedback_direct_coding_default]]).
2. **안전한 범위만 자율 진행** — CLI 스캐폴딩·설정·빌드·커밋 등 검증 불필요한 기계적 작업. 추측성 미검증 코드(테스트 불가·외부 기기/계정 필요·실제 로직 결정 동반)는 **자율 작업에서 제외**하고 "돌아오면 결정할 것"으로 남긴다.
3. **인지부채/실로직 코드는 직접 커밋하지 말고 PR로** — 사용자가 async로 코드를 볼 수 있는 리뷰 surface 제공. PR 본문에 ⑴리뷰 포인트(어디 볼지) ⑵실행/재현 가이드 ⑶다음 결정 대기 항목을 담을 것.
4. 커밋 위생 — 같은 워킹트리의 다른 미커밋 작업(예: F-15)은 스테이징에서 제외해 PR에 안 섞이게.

**Why**: 2026-06-11 Capacitor C1 세션에서 사용자가 명시 요청한 패턴. 기존 원칙([[feedback_ai_written_code_cognitive_debt]]·[[feedback_selfqa_merge_gate]])의 "자리 비움" 버전 — 자율성은 안전 범위로 제한하고, 위험한 부분은 커밋이 아니라 리뷰 대기 상태(PR)로 만들어 사용자 검토권을 보존한다.

**How to apply**: AFK 신호 시 위 4단계로. 멈출 지점 = "맥북/계정/실기기 필요" 또는 "실제 로직 결정 필요"가 나오는 곳. 거기서 멈추고 PR + 요약으로 닫는다.
