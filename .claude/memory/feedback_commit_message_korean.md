---
name: 커밋 메시지 한국어 통일 — forward-only 원칙
description: 앞으로 작성할 커밋 메시지는 전부 한국어로. 과거 영어 커밋은 rewrite 없이 그대로 둠
type: feedback
originSessionId: d12295c1-2860-4023-84f6-43c8ab8c5586
---
모든 신규 커밋 메시지는 **한국어**로 작성한다.

**Why:** 2026-04-14 세션에서 main + feat/infinite-scroll에 과거 영어 커밋 13개가 이미 push된 상태가 드러남. 사용자가 "영어 커밋을 한국어로 수정하고 싶다"고 했지만, 히스토리 rewrite(`rebase -i` + `force push`)는 (1) 이미 push된 main 브랜치 force push 리스크, (2) 백업 레포(MelloMe_FE_Backup, airo)와의 충돌, (3) 팀원이 이미 pull했을 가능성 때문에 **forward-only 원칙**으로 합의함.

**How to apply:**
- 신규 커밋은 무조건 한국어로. 예: `fix(mock): 게시글 핸들러 visibility/블러 마스킹 로직 복원`
- 과거 영어 커밋(`feat(post): show PRIVATE badge...` 등)은 그대로 두고 건드리지 않는다
- 사용자가 "과거 커밋 수정" 요청 시 force push 위험을 다시 설명하고 승인 재확인
