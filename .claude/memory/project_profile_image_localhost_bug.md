---
name: 프로필 이미지 URL localhost 저장 버그
description: GET /me 응답의 profileImageUrl이 http://localhost:8080/api/v1/me/profile-image/... 절대 URL로 내려옴 — DB 저장값 문제
type: project
originSessionId: f42617ce-54f8-4206-adaf-71ad712d80bc
---
## 증상
- `GET /me` 응답의 `profileImageUrl`이 `http://localhost:8080/api/v1/me/profile-image/profile-images/<uuid>.jpg` 형태로 내려옴
- 프론트 `resolveImageUrl`은 `http`로 시작하면 그대로 반환 → `<img src>`에 localhost 절대 URL 그대로 주입 → 브라우저가 localhost로 이미지 요청 → 실패
- 프론트 환경변수(`VITE_API_BASE_URL`)나 Vercel 배포 URL과 무관 (axios 요청이 아니라 img 리소스 fetch)

## 근본 원인 (추정)
1. 업로드 엔드포인트(`POST /api/v1/me/profile-image`)에서 `ServletUriComponentsBuilder.fromCurrentRequest()` 류로 절대 URL 생성
2. 해당 요청이 과거에 로컬 백엔드(`localhost:8080`)에서 실행되었고, 생성된 절대 URL이 DB `profile_image_url` 컬럼에 그대로 persist됨
3. 추가로 업로드 엔드포인트 경로가 파일 경로 prefix로 붙는 이중 경로 문제도 존재 (`/me/profile-image/profile-images/...`)

## 검증 방법
- DevTools Network 탭 → `GET /me` 응답 JSON의 `profileImageUrl` 필드 값 확인
- Swagger UI(`http://43.203.40.3:8080`)에서 `GET /me` 직접 호출해도 동일값 내려오는지 확인
- Network에서 해당 localhost 요청의 Initiator가 `img`로 찍히는지 확인 (axios 아님)

## 백엔드 요청 사항
1. 저장 로직 변경: 절대 URL 대신 **상대 경로**(`/profile-images/<uuid>.jpg`) 또는 S3 key만 저장
2. 응답 시점에 public base URL과 조합해서 내려주기 (또는 프론트가 조합)
3. **기존 DB 데이터 마이그레이션**: 이미 저장된 localhost 절대 URL 치환/NULL 처리
4. 이중 경로(`/me/profile-image/profile-images/...`) 원인 확인 — 업로드 컨트롤러 경로가 파일 URL에 prepend되는지 점검

## 프론트 핫픽스 (비권장)
`resolveImageUrl`에서 localhost 패턴 감지 후 `backendOrigin`으로 교체 가능하나 근본 해결 아님.

**Why:** 프로필 이미지가 모든 환경에서 깨져 보임 — 배포본/로컬 무관. 마이페이지/헤더/댓글 등 UserAvatar 사용처 전체 영향.

**How to apply:** `/check-backend` 실행 시 P0로 분류. 백엔드 이슈 등록할 때 이 문서 내용 그대로 전달.
