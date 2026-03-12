# Claude 컨텍스트 복원 파일

> 맥북 등 새 환경에서 개발 시작 시, Claude에게 이 파일을 읽히고
> "이 파일 기반으로 메모리 복원해줘"라고 하면 빠르게 컨텍스트를 복원합니다.

---

## 프로젝트 기본 정보

- **서비스명**: 멜로미
- **목적**: 발달장애 아동 치료사 커뮤니티 플랫폼 (정보공유, 심적호소 등 치료사 간 소통)
- **현재 단계**: MVP 개발 중
- **MVP 범위**: 회원가입/로그인 (JWT + Google OAuth) + 게시물 CRUD

---

## 기술 스택

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Zustand, React Router, MSW
- **Backend**: Spring Boot (Java), JWT Access/Refresh Token + Google OAuth2
- **DB**: PostgreSQL 16
- **인프라**: Docker Compose

---

## 현재 구현 완료 상태 (2026-03-12 기준)

| 파일 | 내용 |
|------|------|
| `types/auth.ts` | MeResponse, Tokens, AuthResponse, UserRole 타입 |
| `api/auth.ts` | `login()`, `googleLogin()` 함수 |
| `stores/useAuthStore.ts` | Zustand 인증 스토어 (setAuth, clearAuth) |
| `pages/LoginPage.tsx` | 이메일/비밀번호 폼 + Google OAuth 버튼 |
| `pages/HomePage.tsx` | Hero, 공지사항, 인기 게시글, 피처 카드 |
| `components/Layout.tsx` | 헤더 + 모바일 하단 탭바 (인증 상태 반응형) |
| `App.tsx` | Layout 중첩 라우트 구조 (/, /login) |
| `mocks/handlers.ts` | MSW 핸들러 (auth/login, auth/oauth/google, meta/options, home, me) |
| `main.tsx` | MSW 조건부 부트스트랩 |

---

## 다음 작업 예정 (미완료)

1. **회원가입 페이지** (`/signup`) — LoginPage에서 링크 연결되어 있으나 페이지 미존재
2. **Protected Route** — `<PrivateRoute>` 컴포넌트 구현 필요
3. **게시물 CRUD** — 목록, 상세, 작성, 수정 페이지

---

## 미해결 이슈 (코드 리뷰 결과)

### 🔴 Critical
1. **토큰 지속성 없음** (`stores/useAuthStore.ts`) — 새로고침 시 로그인 풀림. accessToken은 메모리, refreshToken은 httpOnly 쿠키로 분리 필요
2. **공통 fetch 래퍼 없음** (`api/auth.ts`) — Authorization 헤더 자동 주입 로직 없음. `apiFetch()` 유틸 필요
3. **Protected Route 없음** (`App.tsx`) — 로그인 여부 확인 없이 모든 라우트 접근 가능

### 🟡 Warning
4. `.env.example` 불완전 — `VITE_GOOGLE_CLIENT_ID`, `VITE_MSW_ENABLED` 누락
5. `LoginPage.tsx` — `<a href="/signup">` → `<Link to="/signup">` 교체 필요 (SPA 내비게이션)
6. `App.tsx` — 홈 Route 인라인 JSX → `HomePage.tsx`로 분리 필요

### 🟢 Info (낮은 우선순위)
7. `index.html` — `lang="en"` → `"ko"`, `<title>` → "멜로미"로 변경
8. `docker-compose.yml` 백엔드 — Spring Boot 구현 시 Node → Java 이미지로 교체 필요

---

## 협업 규칙 (Claude 행동 지침)

코드를 생성/수정하기 전 승인을 요청할 때는 반드시 아래 내용을 포함해야 함:
- 어떤 파일을 만들거나 수정하는지
- 그 파일이 어떤 역할을 하는지
- 주요 로직이나 구조
- 왜 이렇게 설계했는지 (필요 시)

---

## 환경 관련 참고

- 백엔드 API가 이미 동작 중 — 실제 서버로 요청/응답 가능한 상태
- MSW는 백업/폴백용으로 코드만 남겨둔 것이며 기본 개발은 실제 API 사용
- **맥북에서 개발 시작 시 `.env` 파일 필수** — WSL 환경의 `.env` 내용을 그대로 복사해야 함
- `.env.example`에 정의된 변수: `VITE_API_BASE_URL`
- 추가로 필요한 환경변수: `VITE_GOOGLE_CLIENT_ID`, `VITE_MSW_ENABLED`
- **워크트리**: `.claude/worktrees/feature-codegen` (개발용), `.claude/worktrees/code-review` (리뷰용)
- VS Code에서 워크트리 파일이 안 보이면 `code .claude/worktrees/feature-codegen` 으로 열 것
