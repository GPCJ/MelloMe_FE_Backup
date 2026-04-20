---
name: 최근 push 시간 질문은 git log로 답하기
description: 사용자가 "최근 push 시간이 언제야?"처럼 마지막 동기화 시점을 물어보면 별도 sync_status.md 파일이 아니라 git log 커밋 타임스탬프를 사용해 답한다
type: feedback
originSessionId: 08bef002-5c19-4a76-8951-5c27bc960427
---
사용자가 "최근 push 시간", "마지막 sync 시간" 등을 물어오면 `git log -1 --format='%ai'` (또는 origin/main 기준) 값으로 답한다.

**Why:** 이전에는 push-mello 스크립트가 `sync_status.md`를 매번 재생성해서 "마지막 동기화 시간" 표시용으로 썼는데, 그 때문에 실행마다 `chore: push 변경사항 동기화` 커밋이 강제 생성되는 부작용이 있었음. 2026-04-20에 sync_status.md 자동 생성 로직을 스크립트에서 제거했고(커밋 `3a74732` 이후 수정), 해당 파일도 삭제 — 이제 마지막 push 시간은 git 히스토리로만 확인한다.

**How to apply**
- 질문 형태: "마지막에 언제 push했어?", "최근 sync 언제야?" 등
- 응답 소스: `git -C <repo> log -1 --format='%ai %s'` 또는 GitHub 커밋 타임스탬프
- sync_status.md 파일을 참조하거나 재생성하지 말 것
