---
name: 치료사 인증 정책 대폭 변경 (2026-04-01 주간 회의)
description: 즉시 THERAPIST 부여 + 사후 검토 방식, 상태값 변경, 관리자 MVP 격상, Google OAuth 부활
type: project
---

주간 회의(2026-04-01) 결정사항

**Why:** 초기 진입 장벽을 낮추기 위해 즉시 권한 부여 후 사후 검토 방식으로 전환

**How to apply:** 인증 관련 코드 수정 시 아래 정책 기준으로 판단

## 정책 변경
- **기존**: 제출 → PENDING → 관리자 승인 후 THERAPIST
- **변경**: 제출 → 즉시 role=THERAPIST + reviewStatus=UNDER_REVIEW (사후 검토)

## 상태값 변경
- **폐기**: PENDING
- **신규**: NOT_REQUESTED / UNDER_REVIEW / APPROVED / REJECTED
- REJECTED 시 role=USER 강등, 새 글/댓글/자료 업로드 차단

## 기타 변경
- 관리자 인증 검토: Post-MVP → **P0 MVP 격상**
- Google OAuth: 삭제 → **MVP+로 부활** (P1)
- 신규 기능: 치료사 인증 입력 임시 저장/복원
- 회원가입 직후 치료사 인증 안내 페이지로 연결 (온보딩 플로우)
- 이미지 형식: JPG/JPEG/PNG/WEBP, 최대 5MB
