---
name: Paginated 타입 items 프로퍼티 — API 함수 fallback 매핑
description: 백엔드 페이지네이션 리스트 프로퍼티명이 엔드포인트마다 다름, API 함수에서 items로 매핑
type: project
originSessionId: 8118eb5a-4e0d-4408-8299-dee47db42d5b
---
04-16 검증 완료: 세 엔드포인트 모두 `items`로 통일됨.
- `/me/posts` → `data.items` ✓
- `/me/comments` → `data.items` ✓
- `/me/scraps` → `data.items` ✓

프론트 타입(`PaginatedPosts`, `PaginatedComments`, `PaginatedScraps`) 모두 `items` 프로퍼티 사용 → 일치. 배포 환경 정상 동작 확인.
