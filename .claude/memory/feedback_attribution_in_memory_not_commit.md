---
name: attribution-in-memory-not-commit
description: AI/사용자 작성 코드 attribution은 커밋 메시지가 아닌 메모리(인지부채 박제)로 추적. 커밋은 변경 단위로만 분리.
metadata: 
  node_type: memory
  type: feedback
  originSessionId: e53c02b0-a765-4e47-b751-2059fdf30cca
---

**규칙**: AI가 작성한 코드와 사용자가 직접 작성한 코드의 **작업 분담(attribution)** 정보는 커밋 메시지에 박지 않는다. 대신 해당 작업의 인지부채 메모리에 "작업 분담표"를 행 단위로 박아 추적한다.

**Why**: 2026-05-13 알림 기능 통합 세션에서 본 규칙 확정. 13파일 변경 중 일부는 본 세션 AI 작성(Swagger 정합 fix + 통합 4파일), 일부는 이전 세션 AI cherry-pick(코어 9파일), 일부는 사용자 직접 입력(`removeNotification` 시그니처 확장 + `some()` 변환)으로 섞임. 사용자에게 두 옵션 제시 — (a) 커밋 그대로 분리 + 메모리로 추적 / (b) 사용자 작성분만 별 커밋 분리 → 사용자가 (a) 선택. 이유: 커밋 히스토리는 "변경 단위"로 깨끗하게 유지하면서 학습 추적은 별도 채널로 분리하는 게 두 목적을 동시에 만족.

**How to apply**:
- 한 커밋 안에 AI 작성분과 사용자 작성분이 섞여도 그대로 묶는다. 커밋 분리 기준은 attribution이 아니라 **변경의 종류**(feat/fix/refactor 등).
- 인지부채 HIGH 작업의 결과 메모리에는 다음 표를 반드시 포함:
  | 작업 | 작성자 | 인지부채 |
  |---|---|---|
  | (행 단위로 작업 분담) | (이전 세션 AI / 본 세션 AI / 사용자 직접) | (HIGH / 낮음) |
- 후속 학습 보강 필요 영역(특히 사용자가 직접 안 쓴 코드)도 같은 메모리에 명시. `feedback_ai_written_code_cognitive_debt`에서 회기 학습 트리거.
- 커밋 메시지엔 "AI 작성"/"사용자 직접" 같은 표기 금지. 한국어 + 변경 사실만 (메모리 `feedback_git_workflow` 따름).

**관련**:
- [[feedback-ai-written-code-cognitive-debt]] — AI 작성 코드 인지부채 HIGH 박제 의무
- [[feedback-clean-commit-history]] — 커밋 히스토리 깨끗하게 유지
- [[feedback-git-workflow]] — 커밋 메시지 한국어/서명금지/섞인 커밋 분리
- [[project-notification-integration-2026-05-13]] — 본 규칙 확정의 첫 사례 (작업 분담표 포함)
