---
name: 워크트리 vs VS Code 불일치 설명
description: 워크트리에서 작업한 내용이 code .로 열었을 때 보이지 않는 이유와 해결 방법
type: reference
---

사용자가 아래와 같은 말을 할 때 이 설명을 리마인드할 것:
- "변경사항이 적용이 안 된 것 같다"
- "VS Code에서 보이는 파일이 다르다"
- main에서 `npm run dev` 실행 후 기대한 동작이 안 된다고 할 때

**개발 방식**: 신기능은 항상 워크트리(`feature-codegen`)에서 개발 → 완료 후 `main`에 머지하는 방식으로 진행.

**원인:**
Claude Code가 워크트리(`.claude/worktrees/feature-codegen` 등)에서 실행 중일 때, 모든 파일 작업은 해당 워크트리 경로에 저장된다.
사용자가 `code .`로 VS Code를 열면 실제 프로젝트 루트(`/home/jin24/my-project`)가 열리므로 워크트리의 변경사항이 보이지 않는다.

**해결 방법 두 가지:**
1. 워크트리 경로로 VS Code 열기 — `code /home/jin24/my-project/.claude/worktrees/feature-codegen`
2. 변경사항을 main 브랜치로 머지해서 실제 프로젝트에 반영
