---
name: OpenAPI 명세 업데이트 수령 대기 (2026-04-03)
description: 백엔드 개발자가 04-03 중 OpenAPI 명세 새로 뽑아줄 예정 — 수령 후 백엔드 공유 사항 재검토
type: project
---

백엔드 개발자가 자잘한 수정사항 반영 후 OpenAPI 명세 다시 뽑아줄 예정 (2026-04-03).

**수령 후 검토할 항목:**
1. 약관 API 존재 여부
2. 비밀번호 찾기 API 존재 여부
3. `POST /therapist-verifications`에 therapyAreas 필드 추가 여부
4. 치료사 인증 즉시 승인 반영 여부
5. `GET /posts?therapyArea=` 필터 파라미터 추가 여부
6. 게시글 title 필드 optional/삭제 여부

**Why:** 이미 반영된 항목을 중복 요청하지 않기 위해 명세 먼저 확인 후 실제 누락분만 공유.

**How to apply:** OpenAPI 명세 받으면 위 6개 항목 비교 검토 → 없는 것만 백엔드에 공유.
