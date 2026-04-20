---
name: 섞인 커밋 분리 워크플로우 (reset --mixed + stash -u)
description: 자동 동기화 스크립트가 두 작업을 한 커밋으로 묶었을 때 브랜치별로 분리 재커밋하는 git 절차
type: feedback
originSessionId: 1c5f9820-1e8b-4d01-bbca-a067d9627bb2
---
`push-mello` 같은 자동 동기화 스크립트가 여러 작업 중인 변경을 하나의 chore 커밋으로 묶었을 때, 브랜치별 논리 경계를 되찾는 복구 워크플로우.

**Why:** 커밋 목적 단위를 보존해야 PR/머지/롤백이 깔끔하고, 내일 팀 미팅 등에서 작업 단위로 설명 가능. 섞인 채로 두면 리뷰·되돌리기가 어려워짐.

**How to apply:**

1. **리베이스 중이면 먼저 중단**: `git rebase --abort` (충돌 중이면 워킹트리부터 정리)
2. **섞인 커밋 해제**: `git reset --mixed <이전 커밋>` — 커밋 제거되지만 모든 변경은 워킹트리에 보존됨 (인덱스에선 빠짐)
3. **한 작업 파일만 분리 stash**:
   ```bash
   git stash push -u -m "작업A-temp" -- <작업A에 속하는 파일 경로들>
   ```
   - `-u` 플래그는 **untracked 파일(새 메모리/신규 파일) 포함**에 필수
   - pathspec 뒤에 공백 구분으로 여러 파일 지정 가능 (deleted 파일도 포함됨)
4. **나머지(작업B) 커밋**: `git add -A && git commit -m "..."` — 해당 브랜치에 작업B 완료
5. **다른 브랜치로 전환**: `git checkout <작업A 브랜치>`
6. **stash pop**: `git stash pop` — 충돌 발생 가능 (해당 브랜치가 이미 같은 파일을 건드렸다면)
7. **충돌 해결 후 커밋**: `git add -A && git commit -m "..."` (충돌 해결은 양쪽 변경 보존이 원칙)

**주의:**
- `git stash push -- <files>` 단독은 **untracked 파일을 무시**한다. 신규 파일이 섞여 있으면 반드시 `-u`
- `git reset --mixed` 전에 로컬 전용 커밋인지 `git branch -r --contains <sha>`로 확인 — 원격에 있으면 force push 이슈 발생
- 커밋 삭제 전 해시 메모해두면 안전 (reflog로 복구 가능하지만 예방이 낫다)

**실제 사례:** 2026-04-14 다른 세션의 `push-mello`가 USER 정책 작업과 무한 스크롤 E 패턴 작업을 한 chore 커밋(`d56d4d1`)으로 묶음 → 위 절차로 `feat/infinite-scroll`에 무한스크롤을, `feat/post-visibility`에 USER 정책을 각각 분리 재커밋. `PostEditPage.tsx`에서 `initialIsPublic`(브랜치) + `togglePublic`(stash) 양쪽 보존 충돌이 있었음.
