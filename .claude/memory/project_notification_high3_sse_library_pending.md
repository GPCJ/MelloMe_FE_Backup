---
name: project-notification-high3-sse-library-pending
description: 알림 SSE 구현이 결정 wiki(fetch-event-source 라이브러리)와 실제 자가 fetch 파서 사이에서 어긋난 상태 — 별도 세션 결정 대기
metadata: 
  node_type: memory
  type: project
  originSessionId: 149a088b-7989-4d20-bad1-4b8801c86f8f
---

알림 SSE 구현이 결정 메모리와 어긋난 상태입니다.

- **결정 wiki** [[sse-b-zustand-fetch-event-source]]: 옵션 B = `@microsoft/fetch-event-source` 라이브러리 채택.
- **실제 구현** (`frontend/src/lib/sseClient.ts`): `fetch + ReadableStream + TextDecoder`로 SSE 파서를 자가 작성. 라이브러리 미사용.

**Why:** 알림 기능은 다른 협업자가 작성해 cherry-pick으로 머지된 코드이고(메모리 [[project-notification-integration-2026-05-13]]), 결정 wiki와 다른 선택이 들어왔습니다. 두 경로(라이브러리 도입 vs wiki 갱신) 모두 가능하지만 어느 한쪽으로 정렬해야 추후 재발 방지 가능합니다.

**How to apply:**
- 다음 세션에서 라이브러리 비교(자가 구현 vs `@microsoft/fetch-event-source`)와 함께 결정. 사용자가 SSE 아키텍처를 처음부터 학습할 의지가 있는 상태라 비교 설명을 깔고 결정 유도.
- PR #19(알림 리뷰 후속 — H1/H2/H4/H5)에는 포함하지 않았습니다.
- 결정 후 wiki 또는 코드 한쪽 갱신.

관련 파일: `frontend/src/lib/sseClient.ts`, `frontend/src/hooks/useNotificationSSE.ts`.
