---
name: 마이페이지 Swagger 확정 엔드포인트 (2026-04-04)
description: 04-04 Swagger 확인 — 마이페이지 5개 엔드포인트 확정 + ProfilePage 구현 완료
type: project
---

## 확정 엔드포인트 (2026-04-04 Swagger 확인)

| 엔드포인트 | 설명 | 상태 |
|---|---|---|
| `GET /api/v1/me` | 내 정보 조회 | 프론트 연결됨 |
| `PATCH /api/v1/me` | 프로필 수정 | 이미지 multipart 방식 백엔드 논의 필요 |
| `DELETE /api/v1/me` | 회원 탈퇴 | **✅ 프론트 구현 완료 (04-04)** |
| `GET /api/v1/me/posts` | 내가 쓴 게시글 목록 | **✅ 페이지네이션 구현 완료 (04-04)** |
| `GET /api/v1/me/comments` | 내가 쓴 댓글 목록 | **✅ 구현 완료 (04-04)** |

## ✅ 해결 완료 — /me/activity 분리 (04-04)

- `fetchMyActivity()` 제거 → `fetchMyComments()` + `fetchMyScraps()` 분리
- `MyActivity` 타입 제거
- 3탭 독립 페이지네이션 적용
