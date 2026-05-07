---
name: develop → main 분할 머지 vs 일괄 머지 판단 기준
description: develop이 main 대비 같은 파일에 누적 수정이 있을 때 분할 머지가 충돌을 부른다. 일괄 머지 + 사후 git revert로 격리가 더 깔끔
type: feedback
originSessionId: 58fd823a-c492-423e-ab30-86203a8c2d78
---
develop을 main에 동기화할 때, **develop이 같은 핵심 파일(api/, hooks/, types/)에 며칠간 누적 수정이 있으면 분할 cherry-pick보다 develop tip 일괄 머지가 더 깔끔하다.** 회귀 격리는 사후 `git revert`로 처리.

**Why:** 분할 순서가 develop history의 의존 흐름과 어긋나면, 같은 파일에서의 함수 rename·시그니처 변경이 충돌을 만든다. 2026-05-07 main 동기화 사례:
- develop 의존 흐름: `c0db39a (toggleReaction → togglePostReaction rename) → 8e1c30c (Promise<void> → Promise<PostReaction> 응답 반환) → bdb4586 (캐시 reconcile)`
- 우리 분할 순서: D(8e1c30c, bdb4586) → C(c0db39a) → develop의 C→D를 거꾸로 가져와서 c0db39a가 옛 시그니처로 되돌리려다 충돌 2건
- develop tip 일괄 머지였다면 충돌 0

또한 분할의 "회귀 격리" 가치도 부분적: Stage 단독 revert 시 의존된 다른 stage의 rename·시그니처 변경이 어긋나서 깔끔히 안 떨어진다.

**How to apply:**
- 일괄 머지 우선 조건: develop이 main 대비 1주일+ 누적 + 같은 핵심 파일 수정 3건+
- 분할이 가치 있는 조건: 영역이 깔끔히 분리(예: 댓글 vs 라우팅) + 같은 파일 수정 충돌 없음
- 충돌 회피 분할 시: develop 시간순(오래된 → 최신) 따르기, 거꾸로 가지 말 것
- 회귀 격리: 분할 머지가 아닌 사후 develop의 src 커밋 단위 `git revert` (stage 단위 revert는 의존성 때문에 어차피 깔끔히 안 됨)
- "혼자 개발이라 분할 안 해도 됐다"는 진단은 빗나감 — 충돌은 인원수보다 "같은 파일 누적 수정 횟수"에 비례
