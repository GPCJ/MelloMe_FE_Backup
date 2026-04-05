---
name: 프로필 이미지 표시 블로커
description: 프로필 이미지 업로드 성공하지만 화면 표시 불가 — 백엔드 응답 형식 + 이미지 조회 인증 이슈
type: project
---

프로필 이미지 업로드(`POST /me/profile-image`)는 정상 동작하지만, 업로드한 이미지가 화면에 표시되지 않음.

**원인 1: 응답이 상대 경로**
- 백엔드 응답: `"/api/v1/me/profile-image/profile-images/uuid.png"`
- 프론트 도메인(`www.`)에서 상대 경로 → 프론트 서버로 요청 → 404
- 프론트 임시 대응: `resolveImageUrl()` 유틸 — `VITE_API_BASE_URL`에서 origin 추출 후 prefix 추가

**원인 2: 이미지 GET 엔드포인트 인증 필요 (401)**
- `<img>` 태그는 브라우저 동작 방식상 Authorization 헤더 포함 불가
- 인증 필요한 이미지는 `<img src>`로 로드 자체가 불가능
- 프론트 대응 불가 → 백엔드에서 이미지 GET을 public으로 열어야 함

**디버깅 추가 발견:** Authorization 헤더 포함 시 같은 URL에서 404 반환 (백엔드 라우팅 이슈)

**Why:** MVP 프로필 이미지 기능 완성에 필수
**How to apply:** 백엔드 수정 완료 시 `resolveImageUrl` 유틸 제거 가능 (절대 URL 반환 시). 이미지 GET public 전환 필수.

이슈: MelloMe_FE_Backup#6, therapist_community_FE#6 (기존 #4, #5 병합)
