---
name: Paginated 타입 items 프로퍼티 — API 함수 fallback 매핑
description: 백엔드 페이지네이션 리스트 프로퍼티명이 엔드포인트마다 다름, API 함수에서 items로 매핑
type: project
---

백엔드 페이지네이션 응답의 리스트 프로퍼티명이 엔드포인트마다 다름 (04-05 확인):
- `/me/posts` → `posts` (네트워크 탭 확인 완료)
- `/me/comments` → 미확인 (`comments` 추정)
- `/me/scraps` → 미확인 (`scraps` 추정)

프론트 대응: `api/mypage.ts`에서 `res.data.posts ?? res.data.items ?? []` 형태로 fallback 매핑.
→ 에러는 방지되지만, 프로퍼티명이 추정과 다르면 빈 목록 표시될 수 있음.

**Why:** ProfilePage에서 `Cannot read properties of undefined (reading 'length')` 에러 발생. 백엔드 API 명세서/Swagger가 실제 응답과 불일치.
**How to apply:** comments/scraps 탭 배포 후 네트워크 탭으로 실제 프로퍼티명 확인 필요. 확인 완료 시 fallback 정리 + 백엔드 통일 요청 이슈 작성 가능.
