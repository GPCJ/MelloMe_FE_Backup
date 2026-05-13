---
name: check-skill-verify-code-first
description: /check-backend 등 메모리 기반 종합 리포트는 출력 전 각 항목을 코드로 검증해서 stale 항목을 거를 것
metadata: 
  node_type: memory
  type: feedback
  originSessionId: eeb2d86e-7376-4e8e-90da-36a1185c4026
---

`/check-backend`, `/check-designer` 같은 **메모리 기반 종합 리포트** 출력 전, 각 🔴/🟡 항목을 grep/Read로 코드 직접 검증해서 stale 항목은 ✅로 옮긴 뒤 제시할 것.

**Why:** 2026-05-13 세션에서 단 한 번의 `/check-backend` 실행으로 5개 항목이 stale로 판명됨 — 첨부 다운로드 S3 CORS / 이미지 업로드 500 `FILE_STORAGE_ERROR` / 로그인 `isNewUser` / 회원가입 nickname+tokens / `POST /posts` title optional. 일부는 일주일도 안 된 메모리였지만 코드/운영 환경은 이미 해소된 상태였음. 사용자가 "왜 아직도 있는거야?", "현재 운영, 개발 환경 모두 정상 작동하는데?" 류 푸시백을 4회 반복 — 검증 없이 메모리만 읽고 보고한 게 신뢰 손실 + 작업 흐름 끊김으로 이어짐.

**How to apply:**
- check-* 스킬은 메모리 로드 후 곧장 출력하지 말고, 각 항목별로 1차 검증 (1~2개 grep/Read).
  - API 호출 누락 의심 → `grep` 으로 호출부 존재 확인
  - 타입/필드 변경 의심 → `types/*` 또는 API 요청 페이로드 확인
  - 운영 동작 의심 → 사용자에게 "prod에서 동작 확인되나요?" 한 줄 질문
- 자명하게 ✅로 이동 가능한 건 보고 단계에서 자체 거름.
- 검증 후에도 모호하면 🟡로 표시하고 검증 방법을 함께 제시.
- 기존 [[feedback-backend-field-request-check]]는 *백엔드에 요청 전* 검증, 이 규칙은 *리포트 출력 전* 검증으로 결이 다름.
