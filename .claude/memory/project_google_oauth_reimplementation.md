---
name: project-google-oauth-reimplementation
description: "Google OAuth 재도입 — 옵션 D 합의 완료, 백엔드 엔드포인트 재오픈 대기 (2026-05-19)"
metadata: 
  node_type: memory
  type: project
  originSessionId: d82e89cf-0f08-46ed-9f5f-bfa5044cbc5f
---

# Google OAuth 재도입 (재개 트리거: 「구글 OAuth 이어가자」)

**Status:** 옵션 D 합의 완료 (2026-05-19), Jira Story 초안 박제, 백엔드 OAuth 엔드포인트 재오픈 대기
**참고:** Jira 초안 → [[jira_draft]] "Google OAuth 로그인 재도입 (Story)" 섹션
**삭제 커밋:** `2f90593` (2026-03-25)

**Why:** 사용자가 보류해뒀던 Google OAuth 재도입. 2026-03-25 삭제 당시 약관 정책이 없었으나 현재 회원가입은 `SERVICE_TERMS`/`PRIVACY_POLICY` 필수 → 신규 유저 약관 처리 재설계 필요했음.

**How to apply:** 코드 작업 시 본 메모리 + jira_draft 백엔드 Story 참조. 백엔드 합류 트리거 받기 전까지 프론트 작업 보류.

---

## 진단 결과 (2026-05-19)

- staging Swagger(`https://api-staging.melonnetherapists.com/v3/api-docs`) `oauth`/`google` 키워드 0건 → 백엔드 함께 빠짐 확정
- 프론트 깨끗 (`auth.ts`, `LoginPage.tsx`, `App.tsx` OAuth 흔적 없음)
- 옛 구현 인터페이스 (`git show 2f90593^`)
  - `GET /auth/oauth/google/start` — 백엔드가 Google 동의화면 URL 만들어 302 redirect (state 백엔드 관리)
  - `POST /auth/oauth/google/exchange` — 프론트가 code → JWT 교환

---

## 합의된 설계 (옵션 D)

**핵심 원칙: "Google 버튼 클릭 = 약관 동의 간주, 백엔드가 자동 저장"**

| 항목 | 처리 |
|---|---|
| 약관 동의 | 백엔드가 OAuth 첫 가입 시 SERVICE_TERMS/PRIVACY_POLICY 자동 `agreed: true` 저장 |
| 안내 문구 | LoginPage Google 버튼 아래 "로그인 시 이용약관 및 개인정보처리방침에 동의하게 됩니다" |
| 신규 유저 환영 | `isNewUser` 플래그 받아 `localStorage 'mello:welcome-pending'` 세팅 → 기존 [[project_welcome_modal_implementation]] WelcomeModal 그대로 재사용 |
| 백엔드 엔드포인트 | `/start` + `/exchange` 2개 (`/complete` 추가 X) |
| 신규 유저 후속 동선 | 이메일 가입과 동일: `role === 'USER'` → `/therapist-verifications`, 그 외 → `/posts` |

**Why 옵션 D 채택:**
- 약관 개정 처리는 한국 약관규제법 표준 패턴(고지 + 계속 이용 동의 간주)으로 이메일/OAuth 동일 → "OAuth는 재동의 못 받음" 단점 실질 무효
- 프론트 콜백 페이지 단순화 (약관 모달/PATCH 불필요)
- 환영 모달 자연스럽게 재사용

**한계 박제:** 약관 v1 → v2 개정 시 OAuth 유저 명시 재동의 화면 없음. 한국 약관규제법 표준 패턴으로 대응 (백엔드 일괄 적용). 이메일 유저와 동일하므로 실질 차이 없음.

---

## 백엔드 요청 스펙

```
GET /auth/oauth/google/start
- Google 동의화면 URL 생성 + state 저장 → 302 redirect

POST /auth/oauth/google/exchange
- Request: { code: string }
- 처리: code로 Google에 access_token 교환 + userinfo 조회 → 이메일로 DB 분기
  - 있음: 기존 유저 로그인, isNewUser: false
  - 없음: 신규 유저 생성 + SERVICE_TERMS/PRIVACY_POLICY 자동 agreed: true 저장, isNewUser: true
- Response: { user, tokens, isNewUser: boolean }
```

---

## 단계별 진행 가이드 (백엔드 합류 후)

1. pseudocode 작성 (사용자 직접) — [[feedback_pseudocode_first_protocol]]
2. `/auth/callback` 라우트 추가 (App.tsx)
3. `OAuthCallbackPage.tsx` — `code` 꺼내서 `exchangeOAuthCode` 호출, isNewUser면 localStorage 세팅, role 분기 navigate
4. `exchangeOAuthCode` API 함수 (auth.ts)
5. `types/auth.ts`에 `OAuthExchangeResponse` 타입
6. LoginPage Google 버튼 + 약관 안내 문구 (디자인 확인 필요)
7. 환경변수 `VITE_API_BASE_URL` 점검

---

## 옛 코드 참고 위치

- `git show 2f90593^:frontend/src/pages/OAuthCallbackPage.tsx`
- `git show 2f90593^:frontend/src/pages/LoginPage.tsx` (`handleGoogleLogin`)
- `git show 2f90593^:frontend/src/api/auth.ts` (`exchangeOAuthCode`)
