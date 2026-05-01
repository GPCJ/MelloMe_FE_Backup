---
name: Jira 업로드 대기 초안
description: 다른 계정에서 Jira MCP로 생성할 에픽/스토리/태스크 초안 모음. 최상단이 가장 최근.
type: project
updated: 2026-04-29
originSessionId: f611174e-26dc-4189-9e23-de39c771cab9
---
# Jira 업로드 대기 초안

> 다른 계정에서 Jira MCP 접근 후 생성 예정
> 프로젝트 키: **MEL** (멜로미) — 생성 전 `getVisibleJiraProjects`로 재확인 필수

---

## [업로드 대기] 이벤트 4종 삽입 (Story)

- **타입:** Story
- **담당:** 프론트
- **Summary:** PM 확정 이벤트 4종 코드 삽입
- **Description:**
  - `SignupPage.tsx` — `signup()` 직후 → `signup_completed`
  - `LoginPage.tsx` — `login()` 직후, navigate 전 → `login_completed`
  - `TherapistVerificationPage.tsx` — 신청 직후 → `verification_requested`
  - `PostCreatePage.tsx` — 성공 후 → `first_post_created` (`/me.postCount === 0` 프론트 단독 판별)
- **Acceptance:** GA4 실시간 리포트에서 4종 이벤트 집계 확인
- **비고:** 백엔드 의존성 없음, 즉시 착수 가능

---

## [ARCHIVED] 유저 행동 분석용 Pseudonymous 식별자(`analyticsId`) 도입

> **드롭 사유 (2026-04-24):** PM 결정 — GA4에서 유저 단위 추적 안 함. Looker Studio/Firebase Console 로우데이터로 대체. Clarity `identify()`도 미사용. `analyticsId` 백엔드 작업 불필요. 이벤트 4종은 익명(client_id only)으로 발송.

---

### [EPIC] 원본 초안 (참고용 보존)

**프로젝트:** MEL
**이슈 타입:** Epic
**우선순위:** High (MVP 행동 분석 개시 전 필수)
**라벨:** `analytics`, `privacy`, `backend-blocker`
**생성 시점 메모:** 2026-04-24 (백엔드 배포 freeze는 2026-05-01 해제 확인됨)

---

### Summary (에픽 제목)

GA4/Clarity 유저 단위 분석을 위한 pseudonymous 식별자 `analyticsId` 도입

---

### Description (에픽 설명)

#### 배경

MVP 사용자 행동 데이터 수집을 위해 GA4 커스텀 이벤트(`signup_completed`, `login_completed`, `verification_requested`, `first_post_created`)를 프론트에 삽입할 예정입니다. PM 설계상 이 이벤트들은 유저 단위 크로스 디바이스 추적이 가능해야 의미가 있으나, 현재 응답 스펙에는 GA4/Clarity에 안전하게 보낼 수 있는 식별자가 존재하지 않아 삽입 작업 전체가 보류된 상태입니다.

#### 왜 프론트 단독으로 해결 불가한가

1. **프론트 해시 무의미**
   - `user.id`가 순차 정수(1, 2, 3, …)라 프론트에서 `sha256(user.id)`만 돌리면 rainbow table로 1~N까지 전수 해싱 1~2분이면 즉시 역산 가능합니다.
   - Salt를 쓰려면 비밀 보관이 필수인데, 프론트 번들에 심으면 DevTools로 노출되어 salt 의미가 사라집니다.
   - 결론: 해시는 반드시 서버 측에서 비밀 salt와 함께 수행되어야 합니다.

2. **평문 `user.id` 직접 전송 불가**
   - 네트워크 탭에 내부 PK 노출 → 회원 수 enumeration 단서 제공
   - GA4 약관상 식별자는 "비식별·고유·안정" 3조건 권장. 순차 정수는 비식별 조건 위반
   - 수집된 데이터는 소급 비식별화가 어려워 초기부터 안전 포맷 필요

3. **email/nickname 전송 절대 불가**
   - GA4 약관상 PII를 `user_id`로 전송 금지. 적발 시 속성/계정 데이터 삭제 리스크.

4. **로컬 UUID 무의미**
   - 브라우저 단위 UUID는 client_id와 실질 동일 → 크로스 디바이스 추적 불가, user_id 부착 목적 상실

#### 영향 범위

- 영향받는 백로그 항목: 이벤트 4종 삽입(SignupPage, LoginPage, TherapistVerificationPage, PostCreatePage)
- 영향받는 정책 문서: 개인정보처리방침(`/privacy`) — 분석 식별자 전송 고지 문구 필요
- 영향받는 인프라: EC2 환경변수에 `ANALYTICS_SECRET_SALT` 신규 주입

---

### Acceptance Criteria (에픽 완료 조건)

- [ ] 백엔드: `/api/v1/me`, `/api/v1/auth/login`, `/api/v1/auth/signup` 응답에 `analyticsId` 필드 포함
- [ ] `analyticsId`는 동일 유저 재로그인 시 동일값 반환
- [ ] 서로 다른 유저 간 값 충돌 없음 (HMAC-SHA256 기반)
- [ ] Salt 원문은 로그/DB에 저장되지 않음 (환경변수만)
- [ ] Swagger 스키마에 필드 반영
- [ ] 프론트: 로그인 직후 `gtag('config', GA_ID, { user_id })` + `clarity('identify', ...)` 1회 호출
- [ ] 프론트: 로그아웃 시 `gtag('config', GA_ID, { user_id: null })` 해제
- [ ] 프론트: 4종 커스텀 이벤트(`signup_completed`, `login_completed`, `verification_requested`, `first_post_created`) 정상 발송
- [ ] 개인정보처리방침에 분석 목적 내부 식별자 해시값 전송 고지 추가
- [ ] GA4 DebugView에서 user_id가 이벤트에 부착되어 수집되는지 확인

---

### 제안 Stories (자식 이슈 분해안)

에픽 생성 시 아래 구조로 하위 스토리 분할을 권장합니다.

#### Story 1. [Backend] `analyticsId` 필드 추가

- **타입:** Story
- **담당:** 백엔드
- **Summary:** `analyticsId` 필드 및 생성 로직 구현
- **Description:**
  - `HMAC_SHA256(user.id, ANALYTICS_SECRET_SALT)` hex 32자 인코딩
  - 응답 포함 엔드포인트: `/me`, `/auth/login`, `/auth/signup`
  - 환경변수 `ANALYTICS_SECRET_SALT`를 EC2에 주입 (로테이션 정책: 유출 시에만 교체 — 변경 시 과거 GA4 데이터와 매칭이 끊어짐)
  - Swagger 스키마 반영
- **Acceptance:** 동일 유저 반복 로그인 시 동일값, 서로 다른 유저 간 충돌 없음, 로그에 salt 원문 노출 안 됨

#### Story 2. [Frontend] GA4/Clarity에 `user_id` 부착

- **타입:** Story
- **담당:** 프론트
- **Summary:** 로그인 상태에 따른 분석 식별자 부착 및 해제 로직
- **Description:**
  - 로그인 성공 직후: `window.gtag('config', GA_ID, { user_id: user.analyticsId })` + `window.clarity('identify', user.analyticsId)`
  - 앱 부트스트랩 시 Zustand에서 유저 복원되면 재설정
  - 로그아웃 시: `window.gtag('config', GA_ID, { user_id: null })` 해제 + Clarity 세션 초기화
- **Acceptance:** GA4 DebugView에서 로그인 후 이벤트에 `user_id` 자동 첨부 확인, 로그아웃 후 발생 이벤트에는 미첨부 확인
- **Blocked by:** Story 1

#### Story 3. [Frontend] 행동 분석 커스텀 이벤트 4종 삽입

- **타입:** Story
- **담당:** 프론트
- **Summary:** PM 확정 이벤트 4종(`signup_completed`, `login_completed`, `verification_requested`, `first_post_created`) 코드 삽입
- **Description:**
  - `SignupPage.tsx` — `await signup(...)` 직후 `signup_completed`
  - `LoginPage.tsx` — `await login(...)` 직후, navigate 전 `login_completed`
  - `TherapistVerificationPage.tsx` — `await applyTherapistVerification(...)` 직후 `verification_requested`
  - `PostCreatePage.tsx` — `await createPost(...)` 성공 후 `first_post_created` (판별: 백엔드가 응답에 `isFirstPost` 플래그를 추가로 내려주면 가장 깔끔. 대안으로 `/me`의 `postCount === 0` 체크 방식도 검토)
- **Acceptance:** GA4 실시간 리포트에서 4종 이벤트 집계 확인
- **Blocked by:** Story 2

#### Story 4. [Backend] `first_post_created` 판별 플래그 (선택)

- **타입:** Story
- **담당:** 백엔드
- **Summary:** `POST /posts` 응답에 `isFirstPost: boolean` 추가 (선택적)
- **Description:** Story 3의 `first_post_created` 정확 판별용. 대안으로 `/me.postCount` 사용 가능하면 이 스토리 생략 가능.
- **Acceptance:** 첫 글 생성 시에만 `isFirstPost: true`, 이후 글부터는 `false`

#### Story 5. [PM/법무] 개인정보처리방침 문구 갱신

- **타입:** Story
- **담당:** PM
- **Summary:** `/privacy` 페이지에 분석 식별자 전송 고지 추가
- **Description:**
  - 분석 목적 내부 식별자(해시값)를 Google Analytics, Microsoft Clarity에 전송한다는 고지 문구 추가
  - 국외이전 고지 필요 여부 법적 자문 확인
- **Acceptance:** 법적 검토 통과 후 `PrivacyPage.tsx` 초안 배너 제거 시점에 함께 반영

---

### 비고

- **현재 상태:** 프론트 이벤트 삽입은 이 에픽 완료 전까지 전면 보류. 2026-04-24 기준 익명(client_id only) 임시 삽입도 하지 않고 대기하는 방향으로 결정.
- **이유:** MVP 초기 트래픽 양이 적어 4~5일 임시 익명 수집 효용이 낮고, 데이터셋 시작점을 `user_id` 부착 버전으로 통일해야 퍼널/리텐션 분석 일관성이 유지됩니다.
- **트리거:** 백엔드 배포 freeze 해제됨(2026-05-01 확인) → Story 1 착수 가능
