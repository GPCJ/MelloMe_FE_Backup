---
name: 코드 리뷰 severity triage 워크플로우
description: severity로 분류된 코드 리뷰 결과를 받으면 HIGH 즉시 조치 + 나머지는 project 메모리 + notepad priority("오늘 뭐하지") 적재
type: feedback
originSessionId: b6f844ce-ccb5-4c47-a5ba-95c70db3b21d
---
코드 리뷰 결과가 severity(HIGH/Medium/Low)로 분류되어 나오면:
1. **HIGH만 즉시 조치**한다.
2. Medium/Low 잔여 항목은 `project_*.md` 파일 1개로 묶어 저장한다.
3. `MEMORY.md` 인덱스에 한 줄 추가한다.
4. notepad **Priority Context** (사용자 표현: **"오늘 뭐하지" 목록**)에 포인터로 연결한다.

**Why:** 2026-04-20 세션에서 사용자가 프로필 편집 코드 리뷰 후 명시적으로 이 흐름을 요청("일단 HIGH 사항만 조치하자. 남은 부분은 메모리에 저장해줘 오늘 뭐하지 목록에 추가해줘"). 큰 리뷰 결과를 한 번에 모두 치려 하지 말고 중요도 기반으로 쪼개는 방식을 선호.

**How to apply:**
- `/review`, `code-reviewer` agent 결과, 또는 직접 작성한 severity-tagged 리뷰가 나오면 기본적으로 이 triage 플로우를 제안한다.
- 사용자가 "오늘 뭐하지"라고 말하면 곧 notepad priority context를 의미하므로 `notepad_write_priority`로 업데이트한다.
- Medium/Low를 메모리에 저장할 때는 **각 항목에 위치(파일:라인)** 와 **제거 조건(백엔드 컨펌 완료, 특정 배포 등)** 을 명시해, 나중에 해제 시점에 번거로운 재탐색이 없도록 한다.
