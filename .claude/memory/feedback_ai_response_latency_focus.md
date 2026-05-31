---
name: feedback-ai-response-latency-focus
description: "AI 응답 대기 10초+ 시 사용자 집중력 흐트러져 딴짓 유발. ping-pong형 Q&A 비효율, 배치 모드 default"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 770b00bb-5716-4274-83ca-a89a94e65635
---

사용자가 직접 발견한 자기 관찰 (2026-05-28):
**본인이 답변하는 순간은 주의력 ↑, AI 응답을 기다리는 공백 시간(10초~1분+)이 집중력 함정.** YouTube 등 딴짓 유발.

## 함의

- 소크라테스 Q&A ([[feedback-learning-gap-socratic-checkin]], [[feedback-socratic-code-excerpt-pattern]])는 ping-pong 횟수가 많을수록 대기 시간 누적 → 본인 학습 효과보다 집중력 손실이 큼.
- "AI 50%+ 작업 후 소크라테스 체크"가 필요한 학습 맥락이라도, Q&A를 5번 돌릴 거면 차라리 한 번에 끌어가는 형식이 나음.
- 도구(MCP/Bash/Read) 호출이 길어질 때 침묵하면 사용자 이탈 위험.

**Why:** 잘 짜인 Q&A라도 사용자 집중력이 끊기면 학습 효과 0. [[feedback-assess-user-state-before-rule]] 원칙대로 본인 컨디션 우선.

## How to apply

- **소크라테스 Q&A default ❌.** 학습 맥락이라도 자동으로 Q&A 들어가지 말 것. 옵션 제시 후 사용자가 명시적으로 고른 경우에만.
- **Default = 배치 모드:** AI 초안(의사코드/요약) → 사용자 검토·수정 → 다음 단계. ping-pong 최소화.
- Q&A를 한다면 **한 메시지에 한 질문만**, 그리고 답변 받자마자 다음 단계로 넘길 응답을 미리 준비해서 동봉.
- **긴 도구 체인 사전 예고:** "도구 호출 좀 깁니다, ~초 걸려요" 한 줄 먼저.
- 본인이 컨디션 좋아 깊이 학습을 원한다고 명시한 경우에만 Q&A 진행.
