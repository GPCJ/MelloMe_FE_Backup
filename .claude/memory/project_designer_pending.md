---
name: 디자이너 협업 대기 항목
description: 디자이너 확인/공유 후 구현 가능한 UI 항목 목록
type: project
---

디자이너와 상의 없이 임의 구현 금지. 확정 후 구현 진행.

**Why:** 협업 프로젝트에서 디자이너 확인 없이 UI 구현 시 재작업 발생.

**How to apply:** UI 작업 요청 시 이 목록 먼저 확인. 미확정 항목은 타입/로직만 구현하고 UI 보류.

---

## 대기 중

- **첨부파일 UI** — `PostDetailPage` 내 위치/디자인 미확정 (타입 정의는 완료)
- **3종 리액션 UI** — EMPATHY/APPRECIATE/HELPFUL 버튼 3개 디자인 확정 필요. 백엔드는 이미 구현 완료 (`GET /posts/{postId}/reaction` → empathyCount/appreciateCount/helpfulCount + myReactionType 반환). 디자인 확정 후 프론트 구현 가능.

## 완료
(없음)
