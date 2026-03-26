# Project Memory

## 사용자
- [인증/보안 개념 지식 수준 — 비유적 설명 선호](./user_knowledge_auth.md)
- [개발 스타일 — 기능 구현 우선, 트러블슈팅 강점, 설계/아키텍처 약점 자각](./user_dev_style.md)

## 프로젝트
멜로미 — 발달장애 아동 치료사 커뮤니티 플랫폼 (MVP 개발 중)
- Frontend: React 19, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand, React Router, MSW
- Backend: Spring Boot (Java), JWT + Google OAuth2 / DB: PostgreSQL 16 / 인프라: Docker Compose
- 배포: **Vercel(프론트) + EC2(백엔드) 확정** / 프론트: `www.melonnetherapists.com` / 백엔드: `api.melonnetherapists.com` (HTTPS 완료 후)

## MVP 요구사항 & 핵심지표
- [MVP 요구사항 상세 및 핵심지표 (2026-03-24)](./project_mvp_requirements.md) — 게시판/글쓰기/관리자페이지/랜딩페이지 + WAU/MAU/리텐션 등 KPI

## 다음 작업 (우선순위 순)
- **[완료]** OAuthCallbackPage 구현 ✅ — `/auth/callback` 라우트, code → exchange → setAuth + 리다이렉트 (2026-03-25)
- **[완료]** 배포 마무리 ✅ — Vercel 재배포 + 로그인 테스트 통과 (2026-03-24)
- **[완료]** 치료사 인증 페이지 + 환영 화면 UI ([상세](./project_verification_page_done.md))
- **[1순위]** 댓글 삭제 URL 프론트 수정 — `deleteComment` postId 제거, URL `/comments/${commentId}`로 변경
- **[2순위]** 좋아요 UI 3종 리액션 구현 — EMPATHY/APPRECIATE/HELPFUL, PUT 토글 방식 (백엔드 enum 확정 후)
- **[백엔드 논의 후]** 치료사 인증 API 연결 ([상세](./project_verification_api_pending.md))
- **[정리 필요]** 코드 품질 이슈 — 중복 상수/함수, isAuthor, 401 인터셉터 ([상세](./project_code_quality_issues.md))
- **[MVP 이후]** 사용자 데이터 수집 로직 — 공부 선행 필요 ([상세](./project_future_analytics.md))
- **[MVP 이후]** 회원가입 응답에 토큰 포함 요청 ([상세](./project_signup_token.md))

## 댓글 시스템
- [유튜브 스타일 댓글 설계 — flat 2레벨, @멘션, parentCommentId 백엔드 논의 필요](./project_comment_system.md)

## 백엔드 스펙
- [페이지네이션 0-based — 프론트에서 currentPage - 1 변환 필요](./project_pagination_spec.md)

## API 스펙 불일치
- [백엔드 openapi JSON vs 프론트 코드 불일치 — 와이어프레임 공유 후 재논의](./project_api_spec_discrepancies.md)
- [치료사 인증 페이지 백엔드 논의 필요 항목 (2026-03-22)](./project_verification_api_pending.md) — licenseCode 필드, therapyAreas API 미반영, 치료영역 enum 정의 방식
- [API 전수 비교 불일치 리스트 (2026-03-24)](./project_api_issues_2026_03_24.md) — 댓글삭제URL, 좋아요enum, 게시글필터, 마이페이지API 3개, OAuth callback 등 12개 항목

## 백엔드 대기 중 (2026-03-24 기준)
CORS 완료 ✅, Vercel 재배포 + 로그인 테스트 통과 ✅, OAuthCallbackPage 구현 완료 ✅ → **다음: 백엔드에 API 이슈 리스트 공유 → 전체 기능 테스트**
- **[완료]** 로그인 응답 구조 — yaml 기준 `{ isNewUser, user, tokens }` 형태 확인 완료, Refresh Token httpOnly Cookie 완료
- **[완료]** `GET /me` 엔드포인트 — yaml에 추가됨 (CurrentUserResponse 반환)
- **[미구현]** 마이페이지 API — `GET /me/dashboard`, `GET /me/posts`, `GET /me/activity` yaml에 없음
- **[완료]** CORS + circular reference 서버 이슈 — CORS 반영 완료 확인 (2026-03-22) ✅

## 로컬 개발 환경
- **[미완료]** 루트 `.env` 미생성 — docker-compose 실행 불가 ([상세](./project_local_env_setup.md)) / GOOGLE_CLIENT_ID/SECRET만 받으면 바로 생성 가능
- [루트 .env → .env.docker 이름 변경 (2026-03-20)](./project_env_docker_rename.md) — Docker 실행 시 `--env-file .env.docker` 필수

## 미해결 이슈
- **[백엔드 대기]** CORS OPTIONS 403 재발 — Spring Security가 preflight 차단, 백엔드 수정 요청 완료 ([상세](./project_cors_current_issue.md))
- **[CRUD 완료 후]** Notion 트러블슈팅 #002 작성 예정 — axios interceptor 토큰 자동 주입 ([상세](./project_notion_crud_axios.md))
- **[백엔드 연결 시]** MSW `/me` 핸들러가 401 반환 중 → 백엔드 연결 시점에 정리 필요

## 환경변수
- [Vercel 환경변수 확정값 — VITE_API_BASE_URL 등](./project_env_vars.md)

## UI만 구현된 기능
- [로그인 상태 유지 체크박스, 비밀번호 찾기 링크 — 동작 안 함](./project_ui_only_features.md)

## 정책 결정
- [게시물 열람 권한 — 비로그인 접근 불가, ProtectedRoute 적용](./project_post_visibility.md)
- [테스트 데이터 삽입 — 백엔드에 요청, 프론트에서 직접 삽입 안 함](./project_test_data_policy.md)

## Notion 페이지
- [Notion 진행 상황 페이지 운영 방침](./project_notion_page_policy.md) — PM 주요 독자, 백엔드 논의 제외, 토글 구조
- [/update-notion 초안 확인 방식](./feedback_update_notion_confirm.md) — 업로드 전 채팅창에 초안 보여주고 승인 후 업로드

## 개발 규칙 / 피드백
- **[최우선]** [코드 작업 전 트레이드오프 설명 필수](./feedback_tradeoff_before_code.md) — 매 코드 수정/삭제/생성 시 트레이드오프 먼저 짚기
- [질문 방식 — 막막할 땐 객관식, 의사결정 도출엔 주관식](./feedback_question_style.md)
- [session-bridge 사용 중단 — /wrap-up으로 대체](./feedback_session_bridge_removed.md)
- [세션 브릿지 실행 시 중요 내용 장기 메모리 저장 제안 — 정책결정/대규모변경/복잡작업 기준](./feedback_session_bridge_longterm.md)
- [Notion 날짜별 페이지 방식 — TIL 등 일자별 기록은 서브페이지로 생성](./feedback_notion_daily_pages.md)
- [와이어프레임 색상 보수적 적용 — 강한 색은 질문 먼저](./feedback_wireframe_color.md)
- [서버 통신 에러 시 프론트 먼저 점검 — 백엔드 탓은 마지막 수단](./feedback_backend_blame.md)
- [불확실할 때 추측 말고 질문 먼저](./feedback_ask_when_uncertain.md)
- [figma.com 링크 단독으로 오면 MVP 요구사항 피그마로 인지하고 바로 메모리 저장](./feedback_figma_link_recognition.md)
- [취업용 경험 생기면 Notion 정리 제안할 것](./feedback_career_documentation.md)
- [코드 생성 승인 요청 방식](./feedback_code_approval.md)
- [TS 타입 에러 CLI 확인 — `npx tsc -b` (Vercel 빌드와 동일)](./feedback_ts_type_check.md)
- [shadcn Button asChild 미지원 — buttonVariants + Link 패턴 사용](./feedback_shadcn_button_aschild.md)
- [GitHub 토큰 채팅에 직접 붙여넣지 말 것](./feedback_github_token.md) ← 토큰 만료 예상일: 2026-04-12
- [브랜치는 항상 main 사용 (master 금지)](./feedback_branch_preference.md)
- [슬래시 커맨드 요청 시 스크립트 파일 별도 생성 금지](./feedback_no_scripts_for_commands.md)
- [외부 레포 push 전 사용자 최종 승인 필수](./feedback_push_requires_approval.md)
- [push-airo 시 .claude/ 등 Claude 파일 누락 방지 — reset --hard 방식만 사용](./feedback_push_airo_claude_files.md)

## MSW / API
- [MSW 래퍼 + axios 인터셉터 수정 완료 (2026-03-19)](./project_msw_wrapper.md)

## UI 개편
- [피그마 와이어프레임 기반 전체 UI 개편 완료 (2026-03-20)](./project_ui_redesign.md) — Notion 트러블슈팅 #003 미작성

## 백엔드 이슈
- [로그인 응답 구조 불일치 — 수정 대기 중](./project_backend_login_response.md)

## Google OAuth
- [Google OAuth 코드 삭제 내역 (2026-03-25)](./project_google_oauth_removed.md) — 회원가입+치료사인증 통합 플로우 전환으로 삭제. 재도입 시 git 히스토리 참고

## UX 설계 논의 아카이브
- [PM/PD 협업 UX 논의 모음](./project_ux_design_decisions.md) — 3~4개 쌓이면 빌더스 리그에 묶어서 정리

## 백엔드 회의
- [회의 결과 + 프론트 개발 현황 (2026-03-15)](./project_backend_meeting.md)
- [토큰 방식 확정 — Access Token: body / Refresh Token: httpOnly Cookie](./project_token_strategy.md)

## 공유 문서
- [Notion 진행 상황 페이지](./reference_notion_progress.md)
- [Notion 트러블슈팅 페이지](./reference_notion_troubleshooting.md)
- [Notion TIL 페이지](./reference_notion_til.md) — `/update-til`(학습 위주) + `/update-builders`(작업 위주) + 매일 18:30 KST 자동 실행 (trig_01AhUdgHMLPiEwTuYBRgtExv) / 양식에 포트폴리오 어필 포인트 섹션 포함
- [빌더스 리그 페이지](./reference_notion_builders_league.md) — 취업 포트폴리오/이력서 아카이빙 (🤖AI 협업, 🛠트러블슈팅, 🏗설계 결정, 📈성과/지표)

## 워크트리 / 브랜치 구조
- [워크트리 정리 완료 (2026-03-19) — 현재 main/public 2브랜치 구조](./project_worktree_cleanup.md)
- `/sync-review` 커맨드 삭제됨 (2026-03-22) — 워크트리 정리 후 불필요

## 공개 레포 (airo)
- [airo remote 설정 및 push-airo 커맨드 현황](./project_airo_repo.md) — `https://github.com/AIRO-offical/therapist_community_FE`

## 환경 / 도구
- [VS Code에서 워크트리 파일이 안 보일 때](./reference_worktree_vscode.md)
- GitHub 인증: `~/.git-credentials`에서 `ghp_...` 토큰 부분만 교체
- 맥북 이전 완료 (2026-03-24) — 현재 맥 환경에서 개발 중
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
