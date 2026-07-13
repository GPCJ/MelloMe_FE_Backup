---
name: 다른 세션이 만진 변경은 건드리지 말기 (병행 작업 중 lint auto-fix 등)
description: 같은 파일/레포를 다른 세션이 병행 작업할 때 대응 — 내가 추가 안 한 변경(lint auto-fix import 등) 제거 금지 + 워킹트리 공유로 브랜치/HEAD 엉킬 때 읽기전용 진단·git 쓰기 금지
type: feedback
originSessionId: 2cffd4f0-2c2e-46a8-ac47-b28072449871
---
같은 파일을 다른 세션이 동시에 작업 중일 수 있을 때, 내가 추가하지 않은 변경(특히 lint auto-fix가 박은 미사용 import, 사용처 없는 신규 코드 등)을 임의로 제거하지 않습니다. 본인이 추가한 라인만 staging + commit하고 출처 불명 변경은 working tree에 그대로 둔 채 push합니다.

**Why:**
2026-05-11 PostDetailPage 답글 모달 작업 중, lint auto-fix가 `Image as ImageIcon` 미사용 import를 반복적으로 박았습니다. 미사용 경고를 보고 두 번 제거했으나 user 측에서 "다른 세션에서 작업 중인 것일 수 있으니 건드리지 말고 이번 세션 작업분만 커밋, push해"라고 명시했습니다. worktree나 동시 세션 환경에서 본인이 모르는 다른 세션의 in-progress 변경을 임의로 되돌리면 그 세션 작업이 깨집니다.

**How to apply:**
- 작업 중인 파일에서 본인이 추가하지 않은 변경이 보이면 (특히 자동화·lint이 박은 것) 그대로 두기
- `git add <특정 파일>` 으로만 staging, `git add -A` / `git add .` 금지 (이미 메모리에 있는 규칙과 동일 맥락)
- 미사용 import 경고가 떠도 본인이 만든 import가 아니면 무시하고 진행
- "이번 세션 작업분만 커밋"이라는 user 발언이 나오면 즉시 working tree에 남은 다른 변경은 staging에서 빼고 자기 작업만 push

## 추가 사례 (2026-07-06) — 워킹트리 공유로 브랜치/HEAD 엉킴 재발
같은 worktree(`git worktree list`가 1개)를 두 Claude 세션이 공유하면 HEAD·브랜치 포인터가 공유되어 **다른 세션의 checkout/commit/merge가 내 세션 HEAD를 발밑에서 움직임**. 이번엔 내가 `feat/feed-tab-affordance`를 파 커밋하려는 사이 다른 세션이 같은 이름을 선점(그쪽 wip `27a14e7`)하고 checkout을 반복 → **내 최종 커밋(`821c307`)이 의도한 피처 브랜치 대신 `develop`에 얹힘**. 게다가 두 세션이 같은 홈피드 탭 UI를 병렬 중복 작업(backlog 교훈 "브랜치가 발밑에서 바뀐다"와 동일 재발).

**진단(읽기 전용 먼저, 단정 X):**
- `git worktree list` — 세션들이 같은 폴더/HEAD를 공유하는지
- `git reflog` — checkout/commit/reset/merge 조작 이력으로 누가 뭘 했는지 재구성
- `git branch -a --contains <내 커밋SHA>` — 내 커밋이 어느 로컬/원격 브랜치에 살아있는지

**대응:**
- 다른 세션이 **mid-operation**(대량 staged 변경·병합 중, `git status`로 확인)이면 git 쓰기(commit/checkout/reset/`branch -f`) **금지** — 그쪽 인덱스/워킹트리가 깨짐. ref만 추가하는 `git branch <name> <sha>`는 인덱스·HEAD·워킹트리를 안 건드려 상대적으로 안전.
- **내 커밋이 origin(develop/main)에 올라가면 유실 위험 없음** → 별도 백업 브랜치 불필요. 이번엔 다른 세션이 develop→main 병합·push하며 내 커밋까지 prod 배포함([[project_job_posting_feature]] 07-06 항목).
- 근본 예방: **처음부터 세션당 worktree 분리**(공유 worktree가 원인).
