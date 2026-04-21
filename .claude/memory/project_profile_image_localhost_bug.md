---
name: 프로필 이미지 URL localhost 버그 — 해소 완료 (2026-04-22)
description: 백엔드 APP_BASE_URL 배포 누락이 진범. 백엔드 환경변수 주입 완료 → 프론트 임시대응 제거 완료.
type: project
originSessionId: 04d583e8-b161-4f24-8f97-bf07ccfae50d
---
## 상태: 해소 (2026-04-22)
- 백엔드: EC2에 `APP_BASE_URL=https://api.melonnetherapists.com` 주입 완료, 응답 URL 정상화 확인
- 프론트: `resolveImageUrl.ts`에서 localhost regex 치환 2줄 제거
- backlog B-01 close

## 증상
- 배포 환경에서 `POST /me/profile-image` / `GET /me` 응답의 `profileImageUrl`이 `http://localhost:8080/api/v1/me/profile-image/<uuid>.jpg`로 내려옴
- 프론트 `resolveImageUrl`이 `startsWith('http')` 분기로 해당 URL을 그대로 통과 → `<img src>`에 localhost 절대 URL 주입 → 브라우저가 자기 localhost로 이미지 요청 → 실패
- UserAvatar 사용처 6곳(마이페이지·헤더·댓글 등) 전역 영향

## 진짜 원인 (확정, 2026-04-17 백엔드 코드 직접 확인)

**범인: 배포 환경에 `APP_BASE_URL` 환경변수 주입 누락**

- `application.yaml`: `app.base-url: ${APP_BASE_URL:http://localhost:8080}` — 환경변수 없으면 localhost fallback
- `application-prod.yaml`: `app.base-url` **오버라이드 없음**
- 배포 EC2에 `APP_BASE_URL` 누락 → Spring이 default fallback 사용
- `ProfileImageUrlAssembler.toFullUrl()`에서 `baseUrl + "/api/v1/me/profile-image/" + storageKey`로 조립 → localhost URL 생성

**기존 설계 자체는 올바름** (과거 추측 가설 전부 틀림):
- DB는 이미 파일명만 저장 (V26 마이그레이션 완료)
- `ServletUriComponentsBuilder.fromCurrentRequest()` 안 씀 (Host Header Injection 방어 패턴 적용됨)
- `forward-headers-strategy: framework` 이미 설정됨

## 해결

**백엔드 (근본 해결, 대기 중)**: EC2 배포 환경에 `APP_BASE_URL=https://api.melonnetherapists.com` 주입 + Spring 재시작. 코드/DB 수정 불필요.

**프론트 임시대응 (2026-04-17, 커밋 `b66aefd`)**: `frontend/src/utils/resolveImageUrl.ts`에 localhost 패턴 regex 치환 추가.
```ts
const normalized = url.replace(/^http:\/\/localhost:8080/, backendOrigin)
```
주석에 `backlog B-01` 표시 → 백엔드 수정 확인 시 조건부 제거.

## 보안 주장 반박 (백엔드 개발자 "api.도메인으로 응답하면 보안 이슈")

- 해당 도메인은 이미 프론트 `VITE_API_BASE_URL`로 공개 상태, secret 아님
- "응답 body 공개 도메인 노출 = 보안 이슈"는 security through obscurity 안티패턴
- 관련된 정당한 우려(Host Header Injection)는 `fromCurrentRequest()` 패턴의 문제이며, 현재 코드는 `@Value("${app.base-url}")` 설정 기반 = 이미 표준 방어 패턴
- `api.melonnetherapists.com`으로 고정 주입이 **보안적으로도 가장 안전한 방식**

## 검증 방법
- DevTools Network → `POST /me/profile-image` 응답의 `profileImageUrl` 필드에 `localhost` 포함 여부 (포함이면 백엔드 미수정 상태)
- `grep "localhost:8080" frontend/src/utils/resolveImageUrl.ts` — 2건 있으면 프론트 임시대응 남아있음 = B-01 미해결
- 백엔드 수정 완료 시 `profileImageUrl`이 `https://api.melonnetherapists.com/api/v1/me/profile-image/<uuid>.jpg` 형태로 내려옴 → 프론트 임시대응 제거 트리거

**Why:** P0 블로킹 이슈, 배포본 전역 프로필 이미지 깨짐. 원인이 수차례 뒤집혀 기록 없으면 재조사 필요.

**How to apply:** B-01 상태 확인 시 이 문서 참조. 백엔드 수정 후 `resolveImageUrl.ts`의 localhost 치환 2줄 제거 + backlog B-01 close.
