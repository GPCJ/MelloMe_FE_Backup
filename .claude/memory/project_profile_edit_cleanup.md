---
name: 프로필 편집 코드 리뷰 TODO (HIGH 외 잔여)
description: 2026-04-22 T1/T2/T3 + HIGH 가드 제거 + 에러 분기/토스트 전환 + setUser 타입 단일화 완료. 이미지 캐시 버스팅만 잔여 (presigned URL 결정 대기)
type: project
originSessionId: b6f844ce-ccb5-4c47-a5ba-95c70db3b21d
---
2026-04-20 프로필 이미지/닉네임 편집 플로우 리뷰 후 남은 정리 항목.

**Why:** HIGH 레이스 컨디션만 즉시 픽스(ProfilePage.tsx 가드 3곳 추가). 나머지는 백엔드 의존/리팩터라 미루고, "오늘 뭐하지" 목록으로 따로 추적.
**How to apply:** 프로필 편집/내 정보 API 관련 작업을 다시 열 때 이 파일을 먼저 확인.

**2026-04-21 진행 — T1/T2 + HIGH 가드 일괄 제거 완료**
- Swagger 재확인: `PATCH /api/v1/me` 요청 바디가 `{ nickname?: string }`으로 단일화, `profileImageUrl` 필드 자체가 요청 스키마에서 사라짐
- 조치:
  - `api/auth.ts:updateMyProfile` 시그니처에서 `profileImageUrl` 파라미터 제거
  - `ProfilePage.handleSaveNickname`에서 두번째 인자 제거
  - 레이스 가드 3곳 제거 (`handleImageChange`의 savingNickname, `startEditNickname`의 uploadingImage, `handleSaveNickname`의 uploadingImage)
  - 아바타 버튼/저장 버튼 disabled에서 cross-condition 제거
  - 관련 한국어 가드 주석 전부 삭제

### 완료 (2026-04-21 ~ 2026-04-22)

- **T3 `resolveImageUrl` `new URL` 기반 안전화** — `a1b7532` + `d604418`. `backendOrigin`은 `apiBase`에서 `.origin` 추출, `new URL(url, base)`로 절대/상대/프로토콜상대 모두 브라우저 표준으로 처리.
- **에러 로깅 + 상태코드 분기 + 토스트 전환 (Medium 1+2)** — 커밋 `4dec45f` (+ 사전 준비 `4698830` prettier 도입, `03d946c` 일괄 포맷). `getAxiosErrorMessage(err, context)` 유틸 신설, context별(`image`/`nickname`/`delete`) status 매핑 lookup table. `alert` 전부 sonner `toast.error`로 교체. `console.error` 추가.
- **setUser 유니온 타입 단일화 (Medium 3)** — 커밋 `083322c`. `LoginUser` 인터페이스 삭제, `LoginResponse.user`와 store `user` 타입 모두 `MeResponse`로 통합. 소비자 코드 영향 0 (해당 구분 필드 직접 읽는 곳 없음).

### 잔여 Medium

1. **이미지 캐시 버스팅**
   - 업로드 응답 URL이 경로 동일 + 덮어쓰기면 브라우저 캐시로 갱신 안 보임
   - 액션: 스토어 저장 시 `?v=${Date.now()}` 쿼리 추가, 또는 백엔드 파일명 버저닝 확인
   - **대기 사유**: 게시글 이미지 presigned URL 결정(`project_post_image_presigned_url.md`) 후 재검토. presigned 방식이면 URL 자체가 매번 달라져 이 이슈 자동 해소 가능.

### 잔여 Low

- `ALLOWED_TYPES`/`MAX_SIZE` 상수가 컴포넌트 내부에 중복 — `useFileAttachment`와 공통 상수로 통합
- `accept` 문자열과 `ALLOWED_TYPES` 배열 동기화 누락 위험 — 하나에서 파생
- `user?.nickname` vs `user!` 혼용 — `if (!user) return;` 가드로 정리
- `/me/profile-image` MSW 핸들러 부재 — 회귀 테스트 근거로 최소 목업 추가

### HIGH 조치 내역 (완료)

- `frontend/src/pages/profile/ProfilePage.tsx`
  - `handleImageChange` 진입 시 `savingNickname` 체크 가드 추가
  - `startEditNickname` 진입 시 `uploadingImage` 체크 가드 추가
  - `handleSaveNickname` 진입 시 `uploadingImage` 체크 가드 추가
  - 아바타 버튼 `disabled`에 `savingNickname` 추가
  - 닉네임 저장 버튼 `disabled`에 `uploadingImage` 추가
