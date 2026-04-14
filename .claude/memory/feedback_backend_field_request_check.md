---
name: 백엔드 필드 추가 요청 전 기존 응답 스펙 확인
description: 프론트가 하드코딩 중인 값을 백엔드에 요청하기 전에, 기존 페이지네이션/메타 필드로 이미 해결 가능한지 먼저 확인
type: feedback
originSessionId: fa4a79a3-3bd8-4345-83ef-12424170ca09
---
백엔드에 새 응답 필드를 추가 요청하기 전에, 현재 응답 스펙(특히 페이지네이션 메타 `totalElements` 같은)에서 이미 해결 가능한지 먼저 확인할 것.

**Why:** 2026-04-14 UI 싱크 회의 준비 중 B-2 안건(`/me`에 postCount/commentCount/followerCount 필드 추가 요청)을 거의 확정 직전, 사용자가 "`/me/comments` 엔드포인트에 이미 totalElements 필드가 있지 않아?"라고 지적. 확인 결과 `PaginatedPosts`, `PaginatedComments`, `PaginatedScraps` 타입에 모두 `totalElements`가 있어 프론트 헤더 숫자를 집계할 수 있음 → 요청 자체가 불필요. ProfilePage가 0으로 하드코딩하는 것만 보고 "필드 없음 → 백엔드 요청"으로 단정한 오판이었음. 결국 B-2는 삭제하고 공유 사항으로 격하, followerCount만 팔로우 기능 대기로 각주 처리.

**How to apply:** "없어서 하드코딩 중"으로 보이는 필드를 발견하면 바로 백엔드 요청 목록에 올리지 말고, 그 값의 소스가 될 수 있는 관련 API 응답 타입(특히 `Paginated*` 계열, 페이지네이션 메타)을 먼저 grep. 하드코딩 원인이 "백엔드에 필드가 없어서"가 아니라 "프론트가 현재 방식으로 집계 안 해서"일 수 있음. 기존 스펙으로 해결 가능하면 프론트 구현 변경이 백엔드 요청보다 우선.
