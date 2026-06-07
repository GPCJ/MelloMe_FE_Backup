---
name: ui-2026-05-22
description: "디자이너 부재로 기존 \"대기 중\" 항목들이 개발자 직접 결정으로 전환됨. Figma 시안 있는 항목과 없는 항목 구분."
metadata: 
  node_type: memory
  type: project
  originSessionId: 9ff744f7-a0a4-44e9-a57d-ab18681a9ce3
---

디자이너가 **2026-05-22** 팀을 떠남. 기존 "디자이너 확인 대기" 항목 전체가 개발자 직접 결정으로 전환.

**How to apply:** 착수 시 기존 Figma 시안 참조 → 없으면 AI와 옵션 논의 후 자체 결정. UI 결정 정책은 [[feedback_ui_designer_confirm]].

---

## 항목 목록은 backlog로 일원화 (2026-05-25)

중복 방지를 위해 풀린 항목 전체 목록 + 착수 순서는 **[[backlog]]** 의
`### 디자이너 부재(2026-05-22) 후 정리 — 내일 단일 참조` 섹션으로 이동.

2026-05-25 검증으로 확정된 핵심:
- **이미 구현돼 있던 것**: D-04 첨부파일 UI, D-06 3종 리액션(`ReactionBar`). 재착수 불필요.
- **디자이너 무관·백엔드 블로킹("풀린 거 아님")**: 🔔 쪽지(DM, Swagger 엔드포인트 부재), B-09 타인프로필(`GET /users/{id}` 부재), B-04 팔로우(`/follow` 부재).
- **디자이너 무관·백엔드 ready로 바로 가능**: CH-05 알림 페이지(`/api/v1/notifications` 존재).

→ 데일리 태스크 선택은 backlog 한 곳만 보면 됨.
