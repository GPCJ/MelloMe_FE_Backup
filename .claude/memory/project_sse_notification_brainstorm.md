---
name: SSE 알림 기능 설계 현황
description: SSE 알림 기능 착수 시 바로 참고할 설계 결정 요약 및 남은 작업 — MVP 범위 밖, 학습 목적으로 선행 설계
type: project
---

## 설계 완료 사항 (2026-04-02)

### 확정된 아키텍처 (3단계)

1. **실시간 기술**: SSE (서버→클라이언트 단방향, Polling/WebSocket 대비 적합)
2. **프론트 구조**: 옵션 B — Zustand store에 SSE 연결 + 알림 상태 통합 (`connect()`/`disconnect()` + `notifications`/`unreadCount`)
3. **토큰 인증**: `@microsoft/fetch-event-source` 라이브러리 — Authorization 헤더로 Access Token 전달 (EventSource는 헤더 미지원이라 우회)

상세 트레이드오프 비교: [project_sse_architecture_decision.md](./project_sse_architecture_decision.md) 참고

### 알림 이벤트 범위
A(게시글 댓글), B(대댓글), C(팔로우), D(리액션), E(공지사항)

---

## 착수 시 해야 할 일

### 1. 백엔드 확인 (먼저)
- SSE 엔드포인트 경로
- Authorization 헤더 인증 가능 여부
- 이벤트 타입/데이터 JSON 형식
- 기존 알림 목록 조회 API 유무
- 읽음 처리 API 유무

### 2. 프론트 구현 (백엔드 확인 후)
- `@microsoft/fetch-event-source` 설치
- `useNotificationStore.ts` 작성 (connect/disconnect + 알림 상태)
- 알림 관련 TypeScript 타입 정의
- 로그인 시 connect, 로그아웃 시 disconnect 연결
- UI는 디자이너 확정 후

---

**Why:** Post-MVP 기능이지만 백엔드가 구현 중이라 프론트 설계를 선행. 학습 목적 겸용.
**How to apply:** 실제 구현 착수 시 이 파일 + architecture_decision 파일 읽고 바로 시작.
