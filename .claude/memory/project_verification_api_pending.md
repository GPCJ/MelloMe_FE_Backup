---
name: 치료사 인증 페이지 — 백엔드 논의 필요 항목
description: 치료사 인증 페이지 구현 중 발견된 API 스펙 불일치 — 평일 회의 때 논의 필요
type: project
---

치료사 인증 페이지 구현 중 발견된 백엔드 논의 필요 항목 (2026-03-22).

**Why:** 주말이라 백엔드 팀과 바로 논의 불가. 평일 회의 때 종합해서 전달 예정.

**How to apply:** 사용자가 치료사 인증 관련 백엔드 논의 요청 시 이 항목들을 종합해서 알려줄 것.

---

## 논의 항목

### 1. `licenseCode` 필드 — ✅ 확정 (2026-03-25)
- `licenseCode` (string, 필수) + `licenseImage` (binary, 필수) — 스웨거 확인 완료
- 프론트 UI에 면허번호 입력 필드 추가 완료
- `multipart/form-data`로 전송

### 2. 치료영역 (`therapyAreas`) — ✅ 확정 (2026-03-25)
- API에 `therapyAreas` 필드 없음 → 서버에 저장 안 함
- 치료영역 선택 UI는 프론트에서만 사용 (서버 전송 없음)

### 3. 치료영역 항목 수 불일치 — 미해결
- **와이어프레임 (인증 페이지)**: 9개 항목
- **현재 `TherapyArea` 타입 (게시글 필터용)**: 5개 — OCCUPATIONAL, SPEECH, COGNITIVE, PLAY, UNSPECIFIED
- 인증용 enum 별도 정의 여부 미확정
