---
name: 치료사 인증 정책 MVP 버전 — 즉시 승인으로 단순화
description: MVP 범위에서는 치료사 인증 신청 시 즉시 THERAPIST + APPROVED 부여, UNDER_REVIEW 같은 중간 상태 미사용
type: project
originSessionId: fa4a79a3-3bd8-4345-83ef-12424170ca09
---
멜로미 MVP의 치료사 인증 정책은 **"신청 시 즉시 승인"**. 신청 → `role=THERAPIST` + `verificationStatus=APPROVED`가 바로 적용되며, 중간 상태(UNDER_REVIEW)나 사후 검토 플로우 없음.

**Why:** 2026-04-14 UI 싱크 회의 준비 중 사용자가 명시 확인. 기존 메모리 `project_auth_policy_change.md`(2026-04-01 주간회의 기록)엔 "즉시 THERAPIST + reviewStatus=UNDER_REVIEW 사후 검토 + 관리자 인증 검토 P0" 정책으로 적혀있지만, MVP 범위에선 관리자 인증 검토 프로세스 자체를 생략하고 즉시 승인으로 단순화함. 초기 진입 장벽을 낮추는 취지는 유지하되, 사후 검토 단계까지 구현하기엔 MVP 스코프가 과함.

**How to apply:**
- 인증 관련 코드/스펙 논의 시 UNDER_REVIEW, PENDING, 관리자 승인 플로우를 기본 가정하지 말 것
- 회원가입/인증 응답에 `verificationStatus` 필드가 필요한지 확인할 때도 "즉시 APPROVED 반환"만 검증하면 됨
- 기존 `project_auth_policy_change.md`와 충돌하므로 해당 파일은 "사후 검토 정책은 Post-MVP"로 갱신 필요
- 댓글/게시글 작성자 배지 판정은 `role === 'THERAPIST'`만 체크하면 충분 (APPROVED가 기본값이므로)

**Update 2026-04-21**: 실서버 PATCH /me 응답에 `therapistVerification.status: "PENDING"` 관찰됨 (id=3, requestedAt=2026-04-13 계정). 사용자 예상(미확정): 치료사 인증 로직 구현 완료 후 일괄 심사해서 APPROVED로 변경할 계획. 즉 지금 PENDING은 의도된 과도기 상태이며 회귀/버그 아님. 프론트 배지 미노출도 이 기간엔 용인. 인증 로직 완성 시점에 다시 이 항목 들여다보기.
