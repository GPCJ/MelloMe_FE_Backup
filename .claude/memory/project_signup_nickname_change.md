---
name: 회원가입 닉네임 정책 변경 + 임시 코드 위치
description: 닉네임 입력 제거, 랜덤 부여 방식 전환 — 백엔드 nickname 필드 제거 시 프론트 임시 코드 삭제 필요
type: project
---

회원가입 닉네임 정책 변경 (2026-04-02)

- 소셜 로그인과 이메일 회원가입의 일관성을 위해 가입 시 닉네임 입력 제거
- 랜덤 닉네임 자동 부여 → 유저가 나중에 수동 수정
- 현재: 백엔드가 nickname required라서 프론트에서 `치료사${랜덤6자리}` 생성 후 전송 (400 방지)

## 임시 코드 위치 (백엔드 수정 후 삭제)
- `frontend/src/api/auth.ts` signup 함수 내 TODO 주석 포함 2줄 (`const nickname = ...`, `nickname` 파라미터)

**Why:** 소셜 로그인은 닉네임 입력 불가 → 이메일 가입도 동일하게 맞춤

**How to apply:** 백엔드에서 nickname 필수 해제 또는 서버 자동 생성 로직 구현 시, 프론트 임시 코드 삭제 + signup API에서 nickname 파라미터 제거
