---
name: git 커밋 전 diff --stat 확인 필수
description: 커밋 전 git diff --stat으로 의도하지 않은 파일 삭제/변경 확인 — ui 폴더 삭제 사고 교훈
type: feedback
---

git 커밋 전 `git diff --stat`으로 변경/삭제된 파일 목록을 반드시 확인할 것.

**Why:** 2026-04-03 연습.tsx 삭제 커밋에서 ui 폴더 전체(10개 파일)가 함께 삭제되어 Vercel 빌드 실패 발생. `git ls-tree`로 이전 상태 확인 후 `git checkout <hash> -- <path>`로 복원.

**How to apply:** 커밋 생성 전 `git diff --stat`으로 삭제/변경 파일 수가 예상과 일치하는지 확인. 특히 폴더 내 파일 삭제 시 같은 폴더의 다른 파일이 영향받지 않았는지 체크.
