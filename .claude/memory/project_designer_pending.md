---
name: ui-2026-05-22
description: "디자이너 부재로 기존 \"대기 중\" 항목들이 개발자 직접 결정으로 전환됨. Figma 시안 있는 항목과 없는 항목 구분."
metadata: 
  node_type: memory
  type: project
  originSessionId: 9ff744f7-a0a4-44e9-a57d-ab18681a9ce3
---

디자이너가 **2026-05-22** 팀을 떠남. 기존 "디자이너 확인 대기" 항목 전체가 개발자 직접 결정으로 전환.

**How to apply:** 아래 항목 착수 시 기존 Figma 시안 참조 → 없으면 AI와 옵션 논의 후 자체 결정.

---

## Figma 시안 있음 (참조 후 구현 가능)

- **VerificationCompletePage** — PENDING/APPROVED 상태 화면. 시안 `1321:5251`.
- **CH-06 인증완료 모달** — 시안 `1321:5251`.
- **B-09 타인 프로필** — 시안 노드 `1444:24270`.
- **치료사 인증 페이지** (`TherapistVerificationPage`) — 기존 Figma에서 시안 확인 후 구현.

## 시안 없거나 미확인 — 자체 결정 필요

- **MEL-47 정렬 토글 UI** (LATEST/POPULAR) — 단순 탭 또는 드롭다운. 자체 결정 가능.
- **치료영역 배지** (FNC-025) — 인증 치료사 닉네임 옆 태그/배지. 백엔드 완료. 배지 스타일 자체 결정.
- **3종 리액션 UI** — 좋아요·궁금해요·유용해요 버튼. 백엔드 완료. 아이콘+카운트 배치 자체 결정.
- **팔로우/언팔로우 버튼** — B-04(팔로우 API) 해소 후 자체 결정.
- **데스크탑 헤더 글쓰기 버튼** — 알림 아이콘 왼쪽 위치 자체 결정 가능.
- **치료사 인증 상세 정보 UI** — 거절 사유, 신청 일시 등. `TherapistVerificationPage`.
- **D-03 모바일/PC 헤더** — `project_mobile_header_refactor.md` 참조, 자체 결정.
- **D-02 fallback 안내 메시지 문구** — 자체 결정.
- **첨부파일 UI** — `PostDetailPage` 내 위치/디자인. Figma 잔존 시안 있으면 참조.

## 완료
(없음)
