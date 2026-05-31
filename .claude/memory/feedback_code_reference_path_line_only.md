---
name: feedback-code-reference-path-line-only
description: "코드 설명 시 파일 경로+줄 번호만 명시, 답변 본문에 코드 블록 넣지 않기"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 770b00bb-5716-4274-83ca-a89a94e65635
---

코드 설명·논의 시, 답변에 코드 자체(스니펫·블록·인라인 발췌 모두)를 넣지 않는다.
대신 **파일 경로 + 줄 번호**만 명시해서 사용자가 직접 열어 보게 한다.

예시:
- ❌ "이 부분 보세요: ```ts ... ```"
- ❌ "`uploadOneAttachment` 안에 `for (let attempt = 1; ...)` 루프가..."
- ✅ "`frontend/src/api/posts.ts:216~249` 의 재시도 루프를 보세요"
- ✅ "`posts.ts:218` PUT 호출 직후 catch 블록에서..."

**Why:**
사용자(jin24)는 "이미지/구조 떠올라야 흡수" 기준([[user-comprehension-criterion]])이라 답변 안에 코드를 인용하면 시각적 정보량이 늘어나 줄거리를 따라가지 못한다. 본인이 IDE에서 직접 열어 보는 편이 흐름 추적([[user-code-navigation-style]] outside-in)에 맞고, AI 산문 패턴([[feedback-ai-prose-patterns]])과도 충돌이 적다.

**How to apply:**
- 변경 규모·동작 차이 설명 시 코드 블록 대신 자연어로 narrate ("218줄 PUT이 403을 던지면 247줄 delay로 가서…")
- 의사코드도 가급적 피하고, 라인 번호로 실제 코드를 참조하게 유도
- 사용자가 명시적으로 "코드로 보여줘"라고 요청한 경우에만 코드 인라인 허용
- 예외: 신규 작성 코드(미존재 파일/함수)는 라인 번호가 없으므로 불가피하게 코드 제시 — 이 경우에도 가능하면 별도 메시지로 분리
