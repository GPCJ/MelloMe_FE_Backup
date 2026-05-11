---
name: 병렬 편집 충돌 대응
description: 사용자가 동시에 같은 파일을 직접 코딩 중일 때 Edit이 revert되거나 다른 세션 커밋에 흡수되는 사고 방지
type: feedback
originSessionId: 682625bd-b46f-4d5e-8a3e-0a0965677c91
---
사용자가 동시에 같은 파일을 직접 코딩 중이거나 다른 Claude 세션이 병렬로 돌고 있을 때, Edit이 자꾸 revert되거나 "File has been modified since read" 에러가 발생할 수 있다. 큰 코드 변경이 다른 세션의 커밋에 흡수되어 내 commit엔 일부 줄만 남는 사고가 발생할 수 있다.

**Why**: 직접 작성 모드 + 다중 세션/사용자 동시 코딩 환경에서 두 주체가 같은 파일을 만지면 mtime이 빈번히 바뀌어 Edit 직전 read와 disk 상태가 불일치하게 된다. 2026-05-11 PostDetailPage 작업에서 발생: ImageIcon import가 두 번 사라지고, 플로팅 패널 chip 블록 변경(panelItems, downloadAll 등)이 다른 세션의 commit `a6bbca3`(CommentReplyModal 추가)에 함께 staged·committed되어, 내 commit `cba9d21`엔 ImageIcon 분기 5줄만 남음. 커밋 메시지는 큰 변경을 다 포함한 것처럼 작성했다가 amend로 정정해야 했음.

**How to apply**:
- 큰 변경이 필요한 Edit은 **Read → Edit → 즉시 tsc → 즉시 commit**까지 단일 흐름으로 묶고 중간에 다른 작업을 끼우지 않는다.
- "File has been modified since read" 에러가 2회 이상 반복되면 즉시 멈추고 **사용자에게 동시 작업 여부를 확인**한다. 무리하게 재시도하지 않는다.
- commit 직후 `git show --stat HEAD`로 실제 diff 크기를 확인하고, **커밋 메시지가 실제 diff와 정합하는지 검증**한다. 메시지가 부풀려져 있으면 push 전에 amend로 정정.
- 다른 세션의 commit이 이미 들어와 내 변경이 흡수됐다면 인지하고 사용자에게 보고. 내 메시지를 실제 잔여 변경(예: ImageIcon 분기)만으로 줄인다.
- 작업 시작 시 `git status`로 unstaged·staged·untracked가 있는지 확인 — 사용자 WIP가 있으면 그 파일 영역은 건드리지 않거나 사용자 confirm 후 진행.
