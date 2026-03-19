# Project Memory

## 프로젝트
멜로미 — 발달장애 아동 치료사 커뮤니티 플랫폼 (MVP 개발 중)
- Frontend: React 19, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand, React Router, MSW
- Backend: Spring Boot (Java), JWT + Google OAuth2 / DB: PostgreSQL 16 / 인프라: Docker Compose
- 배포: **Vercel(프론트) + EC2(백엔드) 확정** / 프론트: `www.melonnetherapists.com` / 백엔드: `api.melonnetherapists.com` (HTTPS 완료 후)

## 내일 확인할 것 ⚠️
- [내일 리마인드 항목](./project_next_session_reminder.md) — GET /me 실제 동작, 로그인 인터셉터 수정, CORS 확인, 마이페이지 API

## 다음 작업 (우선순위 순)
- **[1순위]** 배포 마무리 ([상세](./project_deployment_status.md)) — CORS 반영 대기 중 (HTTPS 완료)
- **[보류]** 치료사 인증 기능
- **[MVP 이후]** 사용자 데이터 수집 로직 — 공부 선행 필요 ([상세](./project_future_analytics.md))
- **[MVP 이후]** 이메일 로그인 isNewUser 환영 화면 ([상세](./project_deferred_welcome_message.md))
- **[MVP 이후]** 회원가입 응답에 토큰 포함 요청 ([상세](./project_signup_token.md))

## API 스펙 불일치
- [백엔드 openapi JSON vs 프론트 코드 불일치 — 와이어프레임 공유 후 재논의](./project_api_spec_discrepancies.md)

## 백엔드 대기 중 (2026-03-20 기준)
CORS 반영되면 → 로그인 테스트 → 콘솔 스크립트로 게시글 19개 일괄 삽입 → 전체 기능 테스트
- **[완료]** 로그인 응답 구조 — yaml 기준 `{ isNewUser, user, tokens }` 형태 확인 완료, Refresh Token httpOnly Cookie 완료
- **[완료]** `GET /me` 엔드포인트 — yaml에 추가됨 (CurrentUserResponse 반환)
- **[미구현]** 마이페이지 API — `GET /me/dashboard`, `GET /me/posts`, `GET /me/activity` yaml에 없음
- **[대기 중]** CORS — `https://www.melonnetherapists.com` 허용 요청 완료, 반영 대기

## 로컬 개발 환경
- **[미완료]** 루트 `.env` 미생성 — docker-compose 실행 불가 ([상세](./project_local_env_setup.md)) / GOOGLE_CLIENT_ID/SECRET만 받으면 바로 생성 가능

## 미해결 이슈
- **[백엔드 답변 대기]** CORS — `https://www.melonnetherapists.com` 허용 문의 완료. 완료되면 vercel.json 프록시 제거 + VITE_API_BASE_URL 직접 주소로 변경 ([상세](./project_cors_proxy.md))
- **[백엔드 수정 대기 중]** CORS 미설정 — `https://www.melonnetherapists.com` 허용 요청 완료, 백엔드 반영 대기 중
- **[CRUD 완료 후]** Notion 트러블슈팅 #002 작성 예정 — axios interceptor 토큰 자동 주입 ([상세](./project_notion_crud_axios.md))
- **[백엔드 연결 시]** MSW `/me` 핸들러가 401 반환 중 → 백엔드 연결 시점에 정리 필요

## 환경변수
- [Vercel 환경변수 확정값 — VITE_API_BASE_URL 등](./project_env_vars.md)

## UI만 구현된 기능
- [로그인 상태 유지 체크박스, 비밀번호 찾기 링크 — 동작 안 함](./project_ui_only_features.md)

## 정책 결정
- [게시물 열람 권한 — 비로그인 접근 불가, ProtectedRoute 적용](./project_post_visibility.md)

## 개발 규칙 / 피드백
- [와이어프레임 색상 보수적 적용 — 강한 색은 질문 먼저](./feedback_wireframe_color.md)
- [서버 통신 에러 시 프론트 먼저 점검 — 백엔드 탓은 마지막 수단](./feedback_backend_blame.md)
- [불확실할 때 추측 말고 질문 먼저](./feedback_ask_when_uncertain.md)
- [취업용 경험 생기면 Notion 정리 제안할 것](./feedback_career_documentation.md)
- [코드 생성 승인 요청 방식](./feedback_code_approval.md)
- [TS 타입 에러 CLI 확인 — `npx tsc -b` (Vercel 빌드와 동일)](./feedback_ts_type_check.md)
- [shadcn Button asChild 미지원 — buttonVariants + Link 패턴 사용](./feedback_shadcn_button_aschild.md)
- [GitHub 토큰 채팅에 직접 붙여넣지 말 것](./feedback_github_token.md) ← 토큰 만료 예상일: 2026-04-12
- [브랜치는 항상 main 사용 (master 금지)](./feedback_branch_preference.md)
- [슬래시 커맨드 요청 시 스크립트 파일 별도 생성 금지](./feedback_no_scripts_for_commands.md)
- [외부 레포 push 전 사용자 최종 승인 필수](./feedback_push_requires_approval.md)
- [push-airo 시 .claude/ 등 Claude 파일 누락 방지 — reset --hard 방식만 사용](./feedback_push_airo_claude_files.md)

## 코드 이슈 이력
- [Layout.tsx import 위치 수정 (2026-03-17)](./project_layout_import_fix.md)

## MSW / API
- [MSW 래퍼 + axios 인터셉터 수정 완료 (2026-03-19)](./project_msw_wrapper.md)

## UI 개편
- [피그마 와이어프레임 기반 전체 UI 개편 완료 (2026-03-20)](./project_ui_redesign.md) — Notion 트러블슈팅 #003 미작성

## 백엔드 이슈
- [로그인 응답 구조 불일치 — 수정 대기 중](./project_backend_login_response.md)
- [DB 시딩 콘솔 스크립트 — 로그인 수정 완료 후 실행](./project_seed_script.md)

## 백엔드 회의
- [회의 결과 + 프론트 개발 현황 (2026-03-15)](./project_backend_meeting.md)
- [토큰 방식 확정 — Access Token: body / Refresh Token: httpOnly Cookie](./project_token_strategy.md)

## 공유 문서
- [Notion 진행 상황 페이지](./reference_notion_progress.md)
- [Notion 트러블슈팅 페이지](./reference_notion_troubleshooting.md)

## 워크트리 / 브랜치 구조
- [워크트리 정리 완료 (2026-03-19) — 현재 main/public 2브랜치 구조](./project_worktree_cleanup.md)

## 공개 레포 (airo)
- [airo remote 설정 및 push-airo 커맨드 현황](./project_airo_repo.md) — `https://github.com/AIRO-offical/therapist_community_FE`

## 환경 / 도구
- [VS Code에서 워크트리 파일이 안 보일 때](./reference_worktree_vscode.md)
- GitHub 인증: `~/.git-credentials`에서 `ghp_...` 토큰 부분만 교체
- 맥북 이전 예정 — 이전 시 `git clone`, `~/.claude/` 복사, `.env` 백업, Homebrew로 Node/Java/Docker 설치
- [Claude Code 워크트리 바로가기 aliases](./project_bash_aliases.md) — `mel` / `mel-dev` / `mel-review`
- [백업 레포 URL (MelloMe_FE_Backup)](./reference_backup_repos.md)
- [메모리 동기화 슬래시 커맨드 — `/push-mello`, `/pull-mello`](./project_memory_sync.md)

## 학습
- [프론트엔드 코드 학습 전체 완료](./project_code_learning.md)
- [학습 내용 상세 정리 — 복습 요청 시에만 불러올 것](./learning_frontend_code.md)
- [axios interceptor 코드 리뷰 학습 진행 상황 및 다음 후보](./learning_axios_interceptor.md)

## shadcn/ui
- [디자이너 UI 선개발 방침](./project_shadcn_design.md) — 컴포넌트는 shadcn 기반, 스타일은 CSS 변수로 분리
- [shadcn UI 컴포넌트 기본 사용 원칙](./feedback_shadcn_default.md) — UI 작업 시 항상 shadcn 컴포넌트 우선 사용
