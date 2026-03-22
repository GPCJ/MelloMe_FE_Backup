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

### 1. `licenseCode` 필드 누락 (API vs 와이어프레임 불일치)
- **API 스펙**: `POST /api/v1/therapist-verifications` 요청에 `licenseCode` (string, 필수) + `licenseImage` (binary, 필수)
- **와이어프레임**: 파일 업로드 영역만 있고 면허번호 텍스트 입력 필드 없음
- **질문**: 면허번호 입력 필드를 UI에 추가해야 하는지? 아니면 API에서 제거할지?

### 2. 치료영역 (`therapyAreas`) API 미반영
- **와이어프레임**: 치료영역 다중 선택 (9개 항목) 있음
- **API 스펙**: `ApplyTherapistVerificationRequest`에 `therapyAreas` 필드 없음
- **질문**: 인증 신청 시 치료영역 정보도 서버에 저장할 건지? 저장한다면 API에 필드 추가 필요.

### 3. 치료영역 항목 수 불일치
- **와이어프레임 (인증 페이지)**: 9개 — 감각통합, 언어치료, 작업치료, 인지치료, 물리치료, 미술치료, 음악치료, 놀이치료, 행동치료
- **현재 `TherapyArea` 타입 (게시글 필터용)**: 5개 — OCCUPATIONAL, SPEECH, COGNITIVE, PLAY, UNSPECIFIED
- **질문**: 인증용 치료영역 enum을 별도로 정의할 건지, 게시글 필터용과 통합할 건지? 백엔드 enum 값 확정 필요.
