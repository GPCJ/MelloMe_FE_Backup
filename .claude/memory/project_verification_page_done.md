---
name: 치료사 인증 페이지 구현 완료 (2026-03-22)
description: TherapistVerificationPage 생성, 환영 화면 버그 수정 및 UI 개선 완료
type: project
---

치료사 인증 관련 프론트엔드 작업 완료 (2026-03-22).

**Why:** 로그인 후 신규 유저를 치료사 인증으로 유도하는 온보딩 흐름 구현.

**How to apply:** 이후 백엔드 API 연결 시 `TherapistVerificationPage`의 `handleSubmit` 내 TODO 주석 부분 채우면 됨.

---

## 구현 내용

### TherapistVerificationPage (`/therapist-verifications`)
- 파일 업로드 (드래그 앤 드롭 + 클릭, 선택 시 초록색 피드백)
- 치료영역 3×3 그리드 다중 선택 (9개, 와이어프레임 기준 임시 정의)
- 안내사항 `bg-blue-50` 배경
- 파일 + 치료영역 모두 선택 시 제출 버튼 활성화
- API 연결은 TODO로 표시 (백엔드 논의 후 연결 예정)
- `App.tsx` ProtectedRoute 내 `/therapist-verifications` 라우트 추가

### 환영 화면 버그 수정 (LoginPage.tsx)
- **버그**: `setAuth` 호출 → GuestRoute가 user 감지 → 환영 화면 렌더링 전 리다이렉트
- **해결**: `isNewUser: true`일 때 `pendingAuth` state에 임시 보관, 버튼 클릭 시 `setAuth` 호출

### 환영 화면 UI 개선 (피그마 기반)
- `fixed inset-0 z-50` — 헤더까지 덮는 전용 전체화면
- `bg-violet-100` 연보라 배경
- "치료사 인증하러 가기" 강조 CTA (상단 배치, `py-6`, bold, violet shadow)
- "나중에 하기" 텍스트 링크로 격하
