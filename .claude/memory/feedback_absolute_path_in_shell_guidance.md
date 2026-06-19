---
name: feedback_absolute_path_in_shell_guidance
description: 사용자에게 셸 명령을 안내할 때는 절대경로로 — 상대경로는 cwd 드리프트(frontend 등)로 실패
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 63e114a1-d27c-4231-ae36-e5a6cf92bc1e
---

사용자가 `!`로 직접 실행할 셸 명령을 안내할 때는 **절대경로**로 적을 것. 상대경로(`.claude/deadline-unlock` 등)는 사용자/세션 cwd가 `frontend/` 같은 서브폴더에 있으면 `No such file or directory`로 실패한다 — 실제로 `touch .claude/deadline-unlock`가 반복적으로 이 에러를 냈음(2026-06-10).

**Why:** 이 모노레포는 루트(`/home/jin24/MelloMe_FE_Backup`)와 `frontend/`를 오가며 작업해서 cwd가 자주 바뀜. AI가 cd로 frontend에 들어가 놓으면 사용자의 `!` 명령도 거기서 실행됨. `.claude/`는 레포 루트에만 있어 상대경로가 깨짐.

**How to apply:** 명령 안내 시 `/home/jin24/MelloMe_FE_Backup/...` 절대경로 사용. 특히 deadline 가드 해제는 `touch /home/jin24/MelloMe_FE_Backup/.claude/deadline-unlock` (또는 등록한 `mel-unlock` alias = 절대경로 기반). 관련 [[feedback_direct_coding_default]](unlock 규칙), [[project_bash_aliases]].
