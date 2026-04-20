---
name: compact/clear 타이밍 판단 — 매 답변마다 추천
description: 세션이 길어질 때 compact 또는 clear를 proactive하게 추천할 것
type: feedback
---

매 답변마다 세션 길이를 판단해서 적절한 시점에 compact 또는 clear를 추천할 것.

**Why:** jin24님이 "세션을 너무 길게 가져가고 있나" 판단이 잘 안 선다고 함. Claude가 먼저 판단해서 알려주는 것을 원함.

**How to apply:**
- 파일 읽기/수정 10회 이상 누적 → compact 추천
- 주요 작업 하나가 완전히 마무리됨 → compact 추천
- 완전히 새로운 주제로 전환 → clear 추천
- 메모리 읽기/쓰기가 많이 쌓임 → compact 추천
- 답변 말미에 자연스럽게 한 줄로 언급 ("슬슬 compact 타이밍이에요" 정도)
