---
name: sync/자동화 전용 chore 커밋 만들지 않기
description: 메모리 동기화나 자동화 루틴을 위한 별도 chore 커밋(예 "chore(memory): sync", "chore: push 변경사항 동기화")을 만들지 말 것. 개발 히스토리는 feat/fix 단위로 유지하고 연관 메모리 변경은 해당 feat 커밋에 자연스럽게 포함
type: feedback
originSessionId: 08bef002-5c19-4a76-8951-5c27bc960427
---
스크립트/자동화 도구가 매 실행마다 자동으로 생성하는 sync 전용 커밋은 개발 히스토리를 오염시킨다. 메모리 변경은 연관된 feat/fix 작업의 커밋에 함께 포함시키거나, 스크립트는 워킹 트리에만 변경을 남기고 커밋은 사용자의 다음 수동 커밋에 맡긴다.

**Why:** 2026-04-20 `scripts/memory-sync.sh`의 `push-mello`가 `sync_status.md`를 매 실행마다 재생성하면서 "chore: push 변경사항 동기화" 커밋을 강제로 만들던 문제를 제거. 사용자가 "개발 순서에 맞게 히스토리를 남기고 싶다" + "sync관련 메모리를 별도 커밋으로 처리하는 거 마음에 안 든다"고 명시. 대안으로 제시한 "chore(memory): sync" 분리 커밋도 같은 이유로 거절됨. 마지막 push 시간은 `git log -1 --format='%ai'`로 확인하기로 결정.

**How to apply**
- 자동 커밋 로직을 제안/추가할 때: 기본값 off. 자동 커밋이 꼭 필요한지 사용자 확인.
- "sync", "동기화", "bump", "regenerate" 류의 chore 커밋을 스크립트가 만들게 하지 말 것.
- 메모리/자동 생성 파일 갱신은 워킹 트리에만 두고, 사용자가 feat/fix 커밋에 포함시키도록 유도.
- 자동 생성되던 상태 파일(sync_status.md 등)을 제거했을 때 해당 파일 내용을 참조하는 로직도 함께 제거.
