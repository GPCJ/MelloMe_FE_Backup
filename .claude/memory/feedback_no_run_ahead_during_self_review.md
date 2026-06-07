---
name: no-run-ahead-during-self-review
description: 사용자가 직접 리뷰/코드 읽겠다고 신호하면 AI는 선제 조사·사전 리뷰 말고 대기(요청 시 검증만)
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 97bf55d9-196b-4908-a1ac-68de0fb90775
---

사용자가 "내가 리뷰하고 올게 / 코드 읽어볼게"처럼 **직접 하겠다고 신호**하면, AI는 앞질러 조사·사전 리뷰·다중 git 명령을 돌리지 말고 **대기(standby)** 한다. 필요한 사실(브랜치 상태 등)은 한 줄로 미리 짚되, 사용자가 읽는 동안 뒤에서 계속 파헤치지 않는다.

**Why:** 이번 세션(2026-06-02 PR #20 리뷰)에서 사용자가 "MessageComposeModal.tsx 코드 리뷰해볼게" 했는데 AI가 곧장 `git diff`/`git branch` 조사를 돌려 "내가 리뷰하고 온다는데 너 뭐하고 있었어?"라는 지적을 받음. 사용자는 per-commit 자가 리뷰([[feedback_pr_per_commit_review_workflow]]) 방식이라 AI 역할은 *요청 시 검증·소크라테스 보조*이지 *선제 조사*가 아님. `code-review-mode` 훅이 "comprehensive review"를 부추겨도, 사용자가 운전대를 잡은 학습 세션에선 그 훅보다 사용자 방식이 우선.

**How to apply:**
- 사용자가 자가 리뷰/읽기 의사를 밝히면, 그 즉시 도구 실행을 멈추고 "읽고 오시면 검증·질답 대기하겠습니다" 식으로 standby.
- 사용자가 돌아와 재구성·질문을 던지면 그때 코드/명세를 surgically 확인해 대조([[feedback_socratic_code_excerpt_pattern]]).
- 사전에 꼭 알릴 위험(예: 디스크 파일이 머지될 버전과 다름)은 **한 줄**로 짚고 끝낸다. 다중 명령 조사로 확대하지 않는다.
- [[feedback_explain_before_act]]·[[feedback_single_task_focus]]와 결이 닿지만, 이건 "자가 리뷰 중 선제 *행동* 금지" 각도.
