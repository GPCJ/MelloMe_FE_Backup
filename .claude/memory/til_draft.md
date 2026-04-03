# TIL

## 2026-04-03 — React 라우트 가드와 상태 업데이트 경쟁 조건 디버깅

**분류**: React / TypeScript

### 오늘 한 것
- 배포 환경에서 회원가입 후 환영 페이지(`/welcome`)가 표시되지 않는 버그 원인 분석
- 근본 원인 특정: `setAuth()` 호출 시 GuestRoute가 즉시 재렌더링되어 `navigate('/welcome')` 전에 `/`로 리다이렉트
- 해결책으로 `isNewUser` 플래그를 Zustand store에 추가하여 GuestRoute에서 분기 처리
- 백엔드 `isNewUser` 하드코딩(`false`) 문제 발견 → 백엔드에 수정 요청

### 배운 것 / 인사이트
- **Zustand + React Router 경쟁 조건**: `setAuth()`로 외부 store를 업데이트하면, 해당 store를 구독하는 라우트 가드(GuestRoute)가 같은 렌더링 사이클에서 재평가됨. 다음 줄의 `navigate()`가 실행되기 전에 가드의 `<Navigate>` 컴포넌트가 먼저 리다이렉트를 수행할 수 있음
- **프론트 버그라고 생각했지만 백엔드도 관련**: 프론트 수정을 완료했는데도 동작 안 해서 추적했더니, 백엔드 `login()` 메서드에서 `isNewUser`가 항상 `false`로 하드코딩되어 있었음. **증상이 프론트에서 보여도 원인은 백엔드일 수 있다**
- **Swagger로 실제 응답 확인하는 습관**: 프론트 코드의 타입 정의와 실제 백엔드 응답이 일치하는지 Swagger에서 직접 확인하는 것이 디버깅 시간을 크게 줄여줌

### 포트폴리오 어필 포인트
- React Router 가드 컴포넌트와 Zustand 외부 store 간의 렌더링 경쟁 조건을 체계적으로 분석하고 해결한 경험
- 프론트엔드 버그 추적 과정에서 백엔드 코드까지 읽어 근본 원인을 특정한 풀스택 디버깅 역량

---

# 빌더스 리그

## 🛠 트러블슈팅

**문제**: 배포 환경에서 회원가입 완료 후 환영 페이지 대신 랜딩 페이지(`/`)로 이동

**원인 분석 (2단계)**:
1. **프론트**: SignupPage에서 `setAuth()` → GuestRoute 재렌더링 → `user` 존재 + `canAccessCommunity: false` → `<Navigate to="/" />` 실행 → `navigate('/welcome')`보다 먼저 리다이렉트
2. **백엔드**: 해결책으로 `isNewUser` 플래그 도입했으나, `AuthService.login()`에서 `LoginResponse.of(false, ...)` 하드코딩 → 프론트에 항상 `false` 전달

**해결**: 
- Zustand store에 `isNewUser` 필드 추가, GuestRoute에서 `isNewUser: true`면 `/welcome`으로 분기
- WelcomePage 마운트 시 `isNewUser: null`로 초기화 (재진입 방지)
- 백엔드에 `isNewUser` 실제 로직 구현 요청

**핵심 교훈**: 라우트 가드 안에서 외부 store 상태를 참조할 때, 상태 업데이트와 프로그래밍적 네비게이션의 실행 순서를 고려해야 한다
