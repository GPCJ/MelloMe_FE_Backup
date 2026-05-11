---
name: 다른 세션이 만진 변경은 건드리지 말기 (병행 작업 중 lint auto-fix 등)
description: 같은 파일을 다른 세션이 병행 작업할 때, 내가 추가하지 않은 변경(특히 lint auto-fix가 박은 import)은 제거하지 말고 그대로 두고 본인 작업분만 commit
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
