---
name: feedback-verify-merge-status-against-origin
description: "브랜치 머지 여부 판단·보고는 로컬 develop 기준 단정 금지, fetch 후 origin/PR 상태로 확인"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: bb9cf6bb-23da-4c13-a3d0-8319ed1cf284
---

브랜치가 머지됐는지/안 됐는지 판단하고 사용자에게 보고할 때 **로컬 `develop` 기준으로 단정하지 말 것**.

**사례 (2026-06-04)**: 쪽지 slice 3 시작 시 linkify 브랜치(`446aa50`)를 "미머지"로 보고했으나 실제로는 이미 머지됨(PR #22 MERGED, 머지커밋 `e841427`). 로컬 develop이 stale(`49672f2`)해서 `git merge-base --is-ancestor HEAD develop`가 NO로 나온 것을 미머지로 오판. 사용자가 "이미 merge했던 것 같은데, 확인해봐"로 교정.

**올바른 절차**:
1. `git fetch origin` 먼저.
2. `git merge-base --is-ancestor <sha> origin/develop` — 로컬 develop 아닌 **origin/develop** 기준.
3. `gh pr list --state all --head <branch>` — PR 상태(MERGED 여부) 확인.
4. squash 머지면 SHA가 안 맞으니 파일/내용 존재(`git ls-tree origin/develop <path>`)로 교차 확인.

**Why**: 다른 세션이 머지·push하면 로컬 develop은 stale해진다. stale 기준 단정이 잘못된 "브랜치 그대로 둠 / 삭제" 판단으로 이어진다. [[feedback_dont_touch_other_session_changes]]·"verify before assert" 가치와 정합.

**How to apply**: 머지 여부를 보고/행동 근거로 쓰기 전 항상 fetch + origin 기준 확인. 작업 시작 시 로컬 develop을 `git branch -f develop origin/develop`로 동기화해두면 오판 예방. [[feedback_git_workflow]] 연계.
