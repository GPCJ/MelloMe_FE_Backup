---
name: feedback-memory-title-scannability
description: 메모리/노트패드/백로그/priority_list 제목은 스캔만으로 맥락이 떠오르도록 작성 + 백엔드 대기 항목은 priority_list에도 반드시 등재
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 45ab3bf3-407f-4867-94d5-34dc4045d3fd
---

메모리/노트패드/백로그/`project_backend_priority_list.md` 항목 제목은 **본문을 열지 않고 제목만 봐도 맥락이 즉시 떠오르도록** 작성한다.

**Why:** 사용자는 `/check-memory`, `/check-backend` 같은 슬래시 커맨드로 우선순위 목록을 빠르게 스캔하는 패턴을 씀. 제목이 모호하면("PostCard 첨부 칩 UI" 같은 식) 매번 본문을 열어봐야 해서 흐름이 끊긴다.

**How to apply:**
- 제목 한 줄에 다음 3요소를 모두 담기:
  1. **WHERE/대상** — 어떤 컴포넌트/페이지/기능인지 (`PostCard`, `ProfilePage` 등)
  2. **WHAT/내용 요점** — 무엇을 표시/구현/수정하는지 (`첨부 개수/파일명`, `회원 탈퇴` 등)
  3. **BLOCKER/상태** — 대기 이유나 현재 상태 (`목록 API attachments 필드 대기`, `백엔드 머지 대기` 등)
- 나쁜 예: "PostCard 첨부 칩 UI" → 무엇을, 왜 대기 중인지 제목만으로 모름
- 좋은 예: "PostCard 첨부 개수/파일명 — 목록 API attachments 필드 대기" → 컴포넌트/표시 요소/블로커 한눈에 들어옴
- 동일 항목이 여러 위치(notepad / MEMORY.md / 본 메모리 파일 description / priority_list)에 있다면 **모든 위치의 제목을 통일**해야 어디서 스캔해도 같은 맥락이 잡힘

**부수 규칙 — 백엔드 대기 항목은 priority_list에도 등재:**
- 프론트 작업이 백엔드 필드/API 머지를 기다리는 상태라면, `project_backend_priority_list.md`의 P0~P2 중 적절한 슬롯에 항목으로 등재
- `/check-backend` 스킬이 priority_list 위주로 읽기 때문에, 누락되면 백엔드 의존 작업이 잡히지 않음
- 항목엔 (1) 필요 필드/엔드포인트 스키마 (2) 프론트 사용 방식 (3) 상세 메모 파일 링크를 포함

**관련:**
- [[feedback-memory-vs-backlog-split]] — 진행 상황은 backlog, 메모리는 결정만
- [[feedback-memory-optimization-process]] — 메모리 최적화 일반 규칙
