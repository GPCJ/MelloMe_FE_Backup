---
name: navigate(-1) fallback 금지
description: 뒤로가기 버튼에 강제 fallback 경로를 넣지 말 것
type: feedback
---

`navigate(-1)`에 `/posts` 같은 fallback 경로를 억지로 넣지 말 것.

**Why:** 사용자가 외부(구글 등)에서 진입했으면 거기로 돌아가는 게 정상 UX다. fallback을 넣으면 오히려 사용자 의도를 깨는 것. 히스토리가 없는 경우(주소창 직접 입력)는 브라우저가 알아서 처리한다. 이번 세션에서 버그로 잘못 분류했다가 토론 중 바로잡음.

**How to apply:** 뒤로가기 버튼 구현 시 `navigate(-1)` 단독 사용. fallback이 필요한 특수한 UX 요구사항이 있을 때만 예외적으로 추가.
