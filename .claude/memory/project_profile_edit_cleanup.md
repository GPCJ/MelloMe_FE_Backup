---
name: 프로필 편집 코드 리뷰 TODO (HIGH 외 잔여)
description: 2026-04-20 ProfilePage/api/auth 리뷰 결과 — HIGH(레이스)만 조치 완료, 나머지 잔여 작업 리스트
type: project
originSessionId: b6f844ce-ccb5-4c47-a5ba-95c70db3b21d
---
2026-04-20 프로필 이미지/닉네임 편집 플로우 리뷰 후 남은 정리 항목.

**Why:** HIGH 레이스 컨디션만 즉시 픽스(ProfilePage.tsx 가드 3곳 추가). 나머지는 백엔드 의존/리팩터라 미루고, "오늘 뭐하지" 목록으로 따로 추적.
**How to apply:** 프로필 편집/내 정보 API 관련 작업을 다시 열 때 이 파일을 먼저 확인. 백엔드 컨펌이 오면 T1~T3을 한 번에 제거하는 PR 구성.

### 잔여 Medium

1. **T1/T2 제거 (PATCH /me `profileImageUrl` optional)**
   - 위치: `frontend/src/api/auth.ts:44-50`, `frontend/src/pages/profile/ProfilePage.tsx:handleSaveNickname`
   - 의존: 백엔드에서 `profileImageUrl` 필드를 optional/생략 가능으로 변경
   - 제거되면 HIGH 가드(레이스)도 같이 제거 가능 — 근본 원인이 T1

2. **T3 `resolveImageUrl` 치환식 안전화**
   - 위치: `frontend/src/utils/resolveImageUrl.ts:6-8`
   - 현재: `http://localhost:8080` 문자열 replace. 스테이징 등 다른 origin이 박혀 내려오면 누출
   - 교체안:
     ```ts
     try { const u = new URL(url); return `${backendOrigin}${u.pathname}${u.search}`; } catch { return url; }
     ```
   - 의존: 백엔드 `APP_BASE_URL` 환경변수 세팅(backlog B-01) 완료 시 줄 자체를 제거

3. **에러 로깅 + 상태코드 분기**
   - 위치: `ProfilePage.tsx` `handleImageChange`, `handleSaveNickname`, `handleDeleteAccount`의 `catch {}`
   - 액션: `console.error(err)` 최소 추가, axios `err.response.status`로 413/415/401/400 분기 alert

4. **알림 UX — alert → toast**
   - shadcn 토스트 이미 사용 중. `handleImageChange` 타입/사이즈 에러 포함 전환

5. **`setUser` 유니온 스프레드 위험**
   - `LoginUser | MeResponse` 섞여 저장되면 소비자 런타임 에러 소지
   - 액션: 스토어 user 타입을 `MeResponse` 단일로 정리하거나, setter를 updater 함수형으로 변경

6. **이미지 캐시 버스팅**
   - 업로드 응답 URL이 경로 동일 + 덮어쓰기면 브라우저 캐시로 갱신 안 보임
   - 액션: 스토어 저장 시 `?v=${Date.now()}` 쿼리 추가, 또는 백엔드 파일명 버저닝 확인

### 잔여 Low

- `api/auth.ts:44` 임시 대응 주석에 실제 이슈 번호 없음 — `// TEMP(B-01)` 류 태그 컨벤션 통일
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
