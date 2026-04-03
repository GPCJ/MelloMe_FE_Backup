---
name: 회원가입 임시 랜덤 닉네임 코드
description: api/auth.ts signup에 임시 닉네임 자동 생성 — 백엔드 nickname 필드 제거 시 삭제 필요
type: project
---

`frontend/src/api/auth.ts`의 signup 함수에 `user_` + 랜덤 6자리 닉네임을 자동 생성하는 코드가 있음.

**Why:** 백엔드에서 회원가입 API의 nickname 필수 필드를 아직 제거하지 않아 테스트 불가. 임시 대응.

**How to apply:** 백엔드에서 nickname 필수 필드 제거 확인 후, TODO 주석 포함 2줄(`const nickname = ...`, `nickname` 파라미터) 삭제할 것.
