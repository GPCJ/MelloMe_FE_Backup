---
name: force-push/reset --hard 안전 프로토콜
description: destructive git 작업 전 백업 브랜치를 모든 remote에 push해 롤백 안전망 확보, --force-with-lease 사용
type: feedback
originSessionId: b9d46f86-253d-482e-b83c-6e026306947d
---
`reset --hard` + force-push 같은 destructive 작업을 진행할 때는 항상 다음 4단계로 진행:

1. 현재 SHA를 가리키는 백업 브랜치 생성 (예: `<branch>-backup-YYYY-MM-DD`).
2. 모든 remote(origin + airo)에 백업 브랜치 push.
3. 본 작업 (reset --hard / force-push).
4. force-push는 무조건 `--force-with-lease` (다른 사람 작업 덮어쓰기 방지).

작업 완료 후 사용자에게 롤백 명령을 함께 제시한다.

**Why:** 사용자가 "강제로 머지", "강제로 push" 등의 의사 표시를 하면 그 자체로는 진행 승인이지만, 사고 시 복구 경로가 분리되어 있어야 안전. 멜로미는 origin/airo 두 remote를 쓰므로 한쪽만 백업하면 다른 쪽 손상 시 복구 불가. 2026-05-11 develop→main 강제 동기화에서 이 절차로 사고 없이 마무리됨.

**How to apply:**
- 사용자가 force-push, reset --hard, branch -D 등의 destructive 작업 의사를 표시하는 즉시 백업 단계를 끼워넣는다 (사용자가 명시하지 않아도).
- 백업 브랜치는 모든 remote에 push 후 본 작업 진행.
- 작업 완료 후 1줄로 "롤백 시: `git reset --hard <backup-branch> && git push --force-with-lease ...`" 형태로 복구 명령 제시.
- 백업 브랜치 삭제 시점은 사용자가 안정화 확인 후 결정하도록 위임 (자동 삭제 X).
