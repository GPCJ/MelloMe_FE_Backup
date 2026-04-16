---
name: 세션 중 notepad 자동 기록 의무
description: 중요 결정/변경 발생 시 Claude가 notepad_write_working으로 한 줄 기록 — wrap-up이 이걸 읽음
type: feedback
originSessionId: f733d60b-43f4-4c4c-be62-0deecb757652
---
세션 중 중요한 결정, 상태 변경, 합의 사항이 발생하면 `notepad_write_working`으로 즉시 한 줄 기록해야 한다.

**Why:** wrap-up 스킬이 대화 전체 스캔 대신 notepad working 섹션을 읽어서 저장 대상을 식별함. 기록하지 않으면 wrap-up이 빈 상태로 동작하고, 사용자가 지쳐있을 때 직접 설명해야 하는 부담이 생김.

**How to apply:**
- 결정/합의 확정 시 → 한 줄 기록 (예: "1-3 에러통일 확정(해소)")
- 파일 생성/구조 변경 시 → 한 줄 기록 (예: "backlog.md 신규 생성")
- feedback 성격 발언 시 → `[feedback]` 태그 붙여 기록
- 기록은 Claude가 자동으로 하며, 사용자에게 매번 알리지 않아도 됨
