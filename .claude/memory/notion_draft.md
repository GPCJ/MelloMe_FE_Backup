---
name: 노션 업로드 대기 초안
description: 다른 기기에서 노션에 올릴 초안 — pull-mello 후 확인. /update-builders 실행 시 참조.
type: project
---

# 노션 업로드 대기 초안

아래 두 주제를 각각 별도로 노션에 기록. `/update-builders` 실행 시 이 파일을 참조할 것.

---

## 주제 1: API 명세 기반 프론트 정비 (04-04)

> 카테고리: 🏗 설계 결정 & 아키텍처

### 핵심 작업 요약

| 작업 | 항목 | 내용 |
|---|---|---|
| /home 관심사 분리 설계 | 5번 | /me 과도한 호출 → /home 경량 엔드포인트 역할 재정의 |
| 회원 탈퇴 구현 | 8번 | DELETE /me + 에러 처리 + 프론트 상태 정리 |
| 마이페이지 3탭 재구현 | 9-11번 | /me/activity 단일 API → /me/posts, /me/comments, /me/scraps 분리 + 각 탭 독립 페이지네이션 |
| 치료사 인증 상세 | 14번 | getMe() → getMyVerification() 교체, PENDING/REJECTED 상세 정보 표시 |
| 게시글 API 정비 | 20-21번 | BoardType→PostType, 서버사이드 검색 전환, postType 스펙 불일치 수정 |
| 에러 처리 전체 개선 | 횡단 | .catch(()=>{}) 에러 삼키기 전면 제거, QA 친화적 메시지로 교체 |

### 역량 어필 포인트

1. **관심사 분리 설계 (5번)**
   - 문제 발견: LandingPage 렌더링마다 /me로 전체 프로필 데이터를 불필요하게 수신
   - 해결: 기존 /home 엔드포인트를 활용한 경량 데이터 분리 제안
   - 확장성: 단순 최적화가 아닌 향후 데이터 추가를 고려한 엔드포인트 역할 설계

2. **API 효율화 제안 (7번)**
   - 프로필 이미지 업로드를 위해 별도 엔드포인트를 만드는 대신 PATCH /me를 multipart로 통합
   - 불필요한 2-step(업로드→URL수신→재요청)을 1-step으로 간소화

3. **에러 처리 QA 관점 (횡단)**
   - .catch(() => {})로 에러가 무시되는 패턴을 UX/QA 관점에서 직접 발견
   - 전체 코드베이스를 검색해서 에러 삼키는 코드 일괄 수정 지시
   - "개발자 친화적 + 비개발자 인지 가능" 에러 메시지 기준 수립

4. **스펙 검증 및 불일치 발견 (20-21번)**
   - Swagger 스펙과 프론트 코드를 대조하며 postType 필드가 요청에 없는 불일치 직접 발견
   - 클라이언트 사이드 필터링의 비효율을 인지하고 서버 사이드 검색으로 전환 판단

5. **API 분리 아키텍처 판단 (9-11번)**
   - 단일 /me/activity 엔드포인트를 3개로 분리하면서 각 탭 독립 상태 관리 구현
   - 탭 전환 시에만 해당 API 호출하는 lazy loading 패턴 적용

### 기술적 의사결정 로그

| 결정 | 근거 |
|---|---|
| /home 경량화 vs /me 유지 | 관심사 분리 + 서버 부하 감소 + 확장성 |
| 이미지 multipart vs 별도 엔드포인트 | API 왕복 감소 + 기존 치료사 인증 패턴 재활용 |
| 서버사이드 검색 vs 클라이언트 필터링 | 데이터 증가 시 성능, 불필요한 전체 데이터 수신 제거 |
| 에러 표시 vs 에러 삼키기 | MVP QA 단계에서 문제 가시성 확보 |
| 페이지네이션 vs 무한 스크롤 | 명시적 탐색 UX + 기존 PostListPage 패턴 통일 |

---

## 주제 2: 인증 API와 유저 정보 API 관심사 분리 (04-04)

> 카테고리: 🏗 설계 결정 & 아키텍처

### 배경 (왜 했는가)

기존 로그인/회원가입 API가 `{ user: 전체프로필, tokens }` 를 한 덩어리로 반환.
유저 스키마가 바뀔 때마다 인증 API도 수정해야 하고, 인증 응답은 캐싱이 불가능한 구조였음.

### 결정 내용

| Before | After |
|---|---|
| POST /auth/login → `{ user, tokens }` | POST /auth/login → `{ accessToken }` |
| POST /auth/signup → `{ user, tokens }` | POST /auth/signup → `{ accessToken }` |
| GET /me → 7개 필드 (canAccessCommunity, therapistVerification 포함) | GET /me → 5개 필드 (id, email, nickname, profileImageUrl, role) |
| 접근 제어: `canAccessCommunity` boolean | 접근 제어: `role` 필드 하나로 통합 |
| 인증 상태: `therapistVerification.status` | 인증 상태: GET /therapist-verifications/me 별도 조회 |

### 트레이드오프 분석 과정

1. **"한 번에 다 주는 게 효율적이지 않나?"**
   - 로그인은 세션당 1회. GET /me는 캐싱 가능. 추가 요청 1회(수십ms)는 무시 가능.
   - 유저 정보 필드가 늘어날수록 인증 API가 무거워지는 것이 더 큰 비용.

2. **"isNewUser 필드도 빼도 되나?"**
   - 회원가입 성공 = 신규유저 확정 → 프론트에서 하드코딩으로 환영페이지 이동 가능.
   - 네트워크 끊김 엣지케이스도 isNewUser 있어도 동일한 문제 → 불필요한 필드.

3. **"canAccessCommunity 제거해도 되나?"**
   - `role !== 'USER'`로 프론트에서 판단 가능. 백엔드가 role에 인증 상태를 이미 반영해서 내려줌.
   - 중복 정보 제거 + 단일 진실 소스(role) 원칙.

4. **"therapistVerification 제거하면 라우팅 분기를 어떻게?"**
   - 기존 4분기 (APPROVED/REJECTED/NOT_REQUESTED/PENDING) → role 기반 2분기로 단순화.
   - 상세 정보(rejectionReason 등)는 해당 페이지에서만 필요 → /therapist-verifications/me로 분리.

### 실제 구현 — 영향 범위 14개 파일

| 레이어 | 파일 | 핵심 변경 |
|---|---|---|
| 타입 | types/auth.ts | MeResponse 간소화, AuthResponse→LoginResponse |
| 상태관리 | useAuthStore.ts | setTokens/setUser 분리, setAuth 제거 |
| API | auth.ts, axiosInstance.ts | 반환 타입 변경, refresh 인터셉터 간소화 |
| 페이지 | Login, Signup, Welcome, Landing, Profile, VerificationComplete, TherapistVerification | role 기반 라우팅, getMe() 호출 타이밍 재설계 |
| 라우트가드 | ProtectedRoute, GuestRoute | canAccessCommunity→role 전환 |
| 테스트 | MSW handlers | 새 응답 구조 반영 |

### 역량 어필 포인트

1. **관심사 분리 원칙 적용**
   - "인증 API는 열쇠(토큰)를 발급하는 것까지, 집 안에 뭐가 있는지 알려주는 건 그 API의 일이 아니다"
   - 인증 ↔ 유저 프로필 ↔ 치료사 인증 상세를 각각 독립된 엔드포인트로 분리

2. **응답 필드 최소화 판단력**
   - "이 값이 없으면 로그인 직후 어디로 보낼지 모르는가?" 기준으로 필드 선별
   - 7개 → 5개 필드, isNewUser/canAccessCommunity/therapistVerification 제거 근거를 각각 분석

3. **타이밍 문제 선제 해결**
   - 회원가입: 환영페이지(정적 UI)에서 getMe() 백그라운드 호출 → 다음 페이지 도착 전 user 정보 준비
   - 로그인: getMe() 완료까지 로딩 → 응답 후 라우팅 (수십ms 체감 없음)

4. **에러 처리 원인별 분기**
   - getMe() 실패 시 무조건 clearAuth() 하지 않고, 401(인터셉터 처리) vs 500/네트워크(무시) 구분
   - "서버 잠깐 죽었다고 로그아웃시키면 안 된다"는 판단

5. **코드 리뷰를 통한 검증**
   - 14개 파일 수정 후 자동 코드 리뷰 실행 → 4건 발견 즉시 수정
   - dead code, 미처리 에러, 빈 문자열 방어, MSW 응답 불일치
