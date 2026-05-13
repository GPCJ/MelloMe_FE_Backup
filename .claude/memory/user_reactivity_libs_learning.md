---
name: Zustand/RQ 등 reactivity 라이브러리 학습 패턴
description: Zustand/React Query처럼 "언제 무엇이 다시 그려지는가" reactivity 모델 위에 서 있는 라이브러리를 가장 어렵게 느낌. 단편 규칙 누적 학습 선호.
type: user
originSessionId: ae7aa7da-b987-4cb5-af3d-71635929aad2
---
사용자가 본인 입으로 명시한 학습 자세 + 어려운 도메인 자각.

**관찰:**
- 라이브러리 중 **Zustand와 React Query가 가장 어렵게 느껴진다**고 명시.
- 어려움의 핵심은 일반 React 컴포넌트 라이프사이클(props 바뀌면 리렌더)보다 한 층 더 깊은 **reactivity 모델** — 어떤 키를 구독했나, 캐시에 뭐가 있나, 어떤 mutation이 어떤 query를 무효화하나가 얽혀 있어 손에 안 잡힌다는 인식.
- 직접 코딩 모드 시작 이후 **이전 AI 작성 코드와 격차 자각**. "이전 zustand/RQ 코드는 본인이 작성한 게 아니라서" 추가로 어려움. 기존 `feedback_ai_written_code_cognitive_debt.md`와 정합되며 도메인 특정 보강.
- 학습 자세 명시: **"한 번에 큰 그림 잡으려고 안 해도 됨. 단편 규칙 누적이 결국 큰 그림"**.

**How to apply:**
- Zustand/RQ 코드를 가이드할 때 한 번에 reactivity 전체 모델을 설명하지 말 것. **단편 규칙 한 가지 단위**로 끊어 짚을 것. 예: "selector 패턴 — store 통째 destructuring vs `(s) => s.user` selector의 구독 범위 차이" 한 가지만.
- 직접 작성 모드에서도 동일 — 한 규칙씩 가이드한 뒤 사용자가 적용·확인하면 다음 단편으로.
- 사용자가 "이건 됐고 다음" 식으로 진행하면 그 흐름 존중. 한 단편씩 누적이 사용자가 선언한 학습 방식.
- 큰 그림(reactivity 모델 전체, 캐시 키 정책 등)을 한 번에 정리하려는 시도는 사용자 인지부채만 키움.

---

**누적 단편 규칙 (날짜순)**

- **2026-05-13 — Zustand: store 함수가 데이터 속성으로 분기할 땐, 그 데이터가 store에 실제로 있는지 먼저 확인.**
  - 사례: `useNotificationStore.removeNotification`이 store `notifications` 배열에서 `find`로 `read` 여부를 검사하는데, `NotificationPage`가 fetch한 알림은 로컬 `useState`에만 있고 store 배열엔 없음 → `target = undefined` → 분기 실패 → unreadCount 미감소.
  - 해결: 시그니처에 옵셔널 인자(`wasUnread?`) 추가, 호출자가 명시 전달. fallback은 유지 (다른 호출처가 store 배열을 쓸 수도 있음).
  - 메타 규칙: **"store가 알아야 하는 정보를 호출자가 더 잘 안다면, 인자로 넘기는 게 정답."**
  - 자매 함수와의 대비가 진단의 핵심 — `markAsRead`/`markAllAsRead`는 `read` 분기 없이 무조건 카운트만 변경하므로 같은 버그 없음. "왜 이 함수만?"이 단서.
  - 관련: [[project-notification-integration-2026-05-13]]
