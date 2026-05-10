---
name: pull-mello 후 노션 초안 존재 시 VSCode 우선 확인 요청
description: pull-mello 실행 후 notion_draft.md에 내용이 있으면 1순위로 VSCode를 열어 사용자에게 확인 요청
type: feedback
originSessionId: c144dea0-49f5-41ab-b6e0-0a54691d8a28
---
pull-mello 실행 후 `.claude/memory/notion_draft.md`에 업로드 대기 내용이 존재하면, **다른 작업보다 1순위로** `code .claude/memory/notion_draft.md`로 VSCode를 열어 사용자에게 "초안이 남아있습니다, 확인해주세요"라고 요청할 것.

**Why:** PR #12처럼 내용이 풍부한 초안은 집중력이 좋을 때 업로드하고 싶어서, 세션 시작 시점에 바로 상기시켜주는 것을 원함.

**How to apply:** pull-mello 완료 직후, notion_draft.md 프론트매터 이후에 실제 내용(#으로 시작하는 섹션)이 있는지 확인. 있으면 즉시 VSCode로 열고 알림.
