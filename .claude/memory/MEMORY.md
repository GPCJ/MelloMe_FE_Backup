# Project Memory

## 사용자
- [인증/보안 개념 지식 수준 — 비유적 설명 선호](./user_knowledge_auth.md)
- [개발 스타일 — 기능 구현 우선, 트러블슈팅 강점, 설계/아키텍처 약점 자각](./user_dev_style.md)
- [AI 의존 줄이기 — 직접 코딩 목표, 힌트는 OK 코드 작성은 직접](./user_self_coding_goal.md)

## 프로젝트
멜로미 — 발달장애 아동 치료사 커뮤니티 플랫폼 (MVP 개발 중)
- Frontend: React 19, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand, React Router, MSW
- Backend: Spring Boot (Java), JWT + Google OAuth2 / DB: PostgreSQL 16 / 인프라: Docker Compose
- 배포: **Vercel(프론트) + EC2(백엔드) 확정** / 프론트: `www.melonnetherapists.com` / 백엔드: `api.melonnetherapists.com` (HTTPS 완료 후)

## MVP 요구사항 & 핵심지표
- [MVP 요구사항 상세 및 핵심지표 (2026-03-30 업데이트)](./project_mvp_requirements.md) — REQ-001~012 MVP, REQ-013~019 Post-MVP / 팔로우·인증전용게시글블러·스크랩·마이페이지 MVP 편입

## 다음 작업 (우선순위 순)
- **[완료]** OAuthCallbackPage 구현 ✅ — `/auth/callback` 라우트, code → exchange → setAuth + 리다이렉트 (2026-03-25)
- **[완료]** 배포 마무리 ✅ — Vercel 재배포 + 로그인 테스트 통과 (2026-03-24)
- **[완료]** 치료사 인증 페이지 + 환영 화면 UI ([상세](./project_verification_page_done.md))
- **[완료]** 댓글 삭제 URL 수정 ✅ — `/comments/${commentId}` (2026-03-25)
- **[완료]** 중복 코드 모듈화 ✅ — `constants/post.ts`, `utils/formatDate.ts` 분리 (2026-03-27)
- **[완료]** 401 인터셉터 ✅ — `/auth/refresh` 호출, isRefreshing 큐 방식, `_retry` 무한루프 방지 (2026-03-28 구현 확정)
- **[완료]** 환영 페이지 리다이렉트 버그 ✅ — location state 패턴으로 해결, 노션 #004 작성 (2026-03-27)
- **[완료]** 전체 코드 점검 ✅ — API 연동·상태관리·UI엣지케이스·타입안전성·인증보안 5개 카테고리 점검 완료 (2026-03-29)
- **[완료]** `authorId` + `canEdit` + `canDelete` ✅ — `GET /posts/{postId}` 응답에 추가됨, 프론트 이미 구현 완료 (2026-03-30)
- **[완료]** 치료사 인증 store 즉시 업데이트 ✅ — POST 성공 후 getMe() 호출, LandingPage 마운트 시 getMe() 추가 (2026-03-30)
- **[완료]** VerificationCompletePage PENDING/APPROVED 분기 처리 ✅ — 임시 UI, 디자이너 확정 후 교체 필요 (2026-03-30)
- **[백엔드 대기]** `GET /posts` therapyArea 필터 파라미터 추가 요청 — `GET /posts?therapyArea=` 옵셔널 파라미터로 추가 요청 방식 확정 (2026-03-31)
- **[백엔드 대기]** 치료사 인증 즉시 승인 로직 미구현 — 신청 시 자동 승인 합의됐으나 미반영
- **[완료]** 대댓글 구조 확인 + FNC-038 보완 ✅ — 대댓글에 답글 버튼 추가 완료 (2026-03-31, 직접 코딩)
- **[계획]** [MSW 기반 선구현](./project_msw_preimpl_plan.md) — FNC-022/031/033/034/035/039, 백엔드 연결 전 프론트 완성 전략
- **[완료]** [피그마 UI 리디자인](./project_figma_ui_redesign_spec.md) ✅ — ReactionBar·VerifiedBadge·SimpleTextEditor, SearchPage 신설, ProfilePage 교체, 라우팅 가드 변경, TipTap/MyPage 삭제 (2026-04-02)
- **[백엔드 대기]** [게시글 title 필드 optional/삭제 요청](./project_post_title_removal.md) — 프론트는 빈 문자열 임시 전송
- **[완료]** 치료사 인증 API 연결 ✅ — Vercel 배포 후 테스트 성공, 409 에러 메시지 분기 처리 완료 (2026-03-30)
- **[완료]** 코드 품질 잔여 이슈 ✅ — isAuthor 닉네임 비교 → canEdit/canDelete로 해결 (2026-03-30)
- **[MVP — 백엔드 대기]** 팔로우 시스템 — REQ-005/011, 백엔드 설계 논의 필요 (복귀 후 최우선 논의)
- **[MVP — 백엔드 대기]** 인증 전용 게시글 블러 — REQ-003, postType 또는 별도 필드 필요, 기존 postType:'COMMUNITY' 고정과 충돌 가능
- **[MVP — 백엔드 대기]** 스크랩/마이페이지 API — REQ-010~012, 요구사항 업데이트로 MVP 편입
- **[Post-MVP]** 신고/알림/DM/어드민/AI — REQ-015~019
- **[MVP 이후]** [유저 행동 데이터 수집 — GA4+Clarity 조합 학습 완료, 도입 시 바로 참고](./project_future_analytics.md)
- **[MVP 이후]** 회원가입 응답에 토큰 포함 요청 ([상세](./project_signup_token.md))

## 디자이너 협업 대기
- [디자이너 확인 필요 UI 항목](./project_designer_pending.md) — 리액션·블러·팔로우·마이페이지·스크랩·인증완료페이지·데스크탑 헤더 글쓰기 등 9개
- [디자이너 협업 워크플로우](./project_designer_workflow.md) — 데일리 확정 UI → 구현 → 보고 사이클, 확정 기준 레벨 사전 합의 필요
- [디자이너 모바일 퍼스트 작업 방식](./project_designer_mobile_first.md) — 모바일 먼저 구현, 데스크탑은 디자인 확정 후

## 댓글 시스템
- [유튜브 스타일 댓글 설계 — flat 2레벨, @멘션, parentCommentId 백엔드 논의 필요](./project_comment_system.md)

## 기능명세
- [프론트 기능명세 체계 변경 (2026-04-01)](./project_feature_spec_frontend.md) — 도메인별 순차 작성, FNC-001~, `docs/feature-spec/{도메인}.md`
- 현재 작성 완료: `docs/feature-spec/auth.md` (인증+인증/인가+관리자, FNC-001~009)
- 기존 명세 `docs/feature-spec-frontend.md`는 다음 도메인 참조용으로 보존

## 백엔드 스펙
- [페이지네이션 0-based — 프론트에서 currentPage - 1 변환 필요](./project_pagination_spec.md)
- [Swagger UI 및 OpenAPI 접근 정보](./reference_swagger_endpoint.md) — EC2 `43.203.40.3:8080`, JSON 저장 명령어

## 정책 변경
- [치료사 인증 정책 대폭 변경 (2026-04-01)](./project_auth_policy_change.md) — 즉시 THERAPIST + UNDER_REVIEW 사후 검토, 관리자 MVP 격상, Google OAuth 부활

## API 스펙 불일치
- [백엔드 openapi JSON vs 프론트 코드 불일치 — 와이어프레임 공유 후 재논의](./project_api_spec_discrepancies.md)
- [치료사 인증 페이지 백엔드 논의 필요 항목 (2026-03-22)](./project_verification_api_pending.md) — licenseCode 필드, therapyAreas API 미반영, 치료영역 enum 정의 방식
- [API 전수 비교 불일치 리스트 (2026-03-24)](./project_api_issues_2026_03_24.md) — 댓글삭제URL, 좋아요enum, 게시글필터, 마이페이지API 3개, OAuth callback 등 12개 항목

## 백엔드 대기 중 (2026-03-24 기준)
CORS 완료 ✅, Vercel 재배포 + 로그인 테스트 통과 ✅, OAuthCallbackPage 구현 완료 ✅ → **다음: 백엔드에 API 이슈 리스트 공유 → 전체 기능 테스트**
- **[완료]** 로그인 응답 구조 — yaml 기준 `{ isNewUser, user, tokens }` 형태 확인 완료, Refresh Token httpOnly Cookie 완료
- **[완료]** `GET /me` 엔드포인트 — yaml에 추가됨 (CurrentUserResponse 반환)
- **[재정의 필요]** 프로필 탭 API — 탭 구성(내가 쓴 글/답글 단 글/스크랩) 기준으로 `GET /me/posts`, `GET /me/comments`, `GET /me/scraps`로 재정의 요청 필요. 기존 `/me/dashboard`, `/me/activity`는 탭과 맞지 않음
- **[완료]** CORS + circular reference 서버 이슈 — CORS 반영 완료 확인 (2026-03-22) ✅

## 로컬 개발 환경
- **[미완료]** 루트 `.env` 미생성 — docker-compose 실행 불가 ([상세](./project_local_env_setup.md)) / GOOGLE_CLIENT_ID/SECRET만 받으면 바로 생성 가능
- [루트 .env → .env.docker 이름 변경 (2026-03-20)](./project_env_docker_rename.md) — Docker 실행 시 `--env-file .env.docker` 필수

## 미해결 이슈
- **[백엔드 연결 시]** MSW `/me` 핸들러가 401 반환 중 → 백엔드 연결 시점에 정리 필요

## 환경변수
- [Vercel 환경변수 확정값 — VITE_API_BASE_URL 등](./project_env_vars.md)

## UI만 구현된 기능
- [로그인 상태 유지 체크박스, 비밀번호 찾기 링크 — 동작 안 함](./project_ui_only_features.md)

## 정책 결정
- [게시물 열람 권한 — 로그인만 필요, 공개 게시물은 미인증도 열람 가능](./project_post_visibility.md)
- [테스트 데이터 삽입 — 백엔드에 요청, 프론트에서 직접 삽입 안 함](./project_test_data_policy.md)
- [모바일 앱 확장 ADR (2026-03-26)](./project_mobile_expansion_adr.md) — MVP 웹 우선, RN 제외, PWA/Capacitor 유저테스트 후 결정
- [Next.js 도입 보류 (2026-03-27)](./project_nextjs_decision.md) — 해결할 문제 없음, 콘텐츠 비로그인 공개 시점에 재검토
- [MVP 단일 게시판 정책](./project_mvp_single_board.md) — board 파라미터 미사용, 다중 게시판은 MVP 이후 검토

## Notion 페이지
- [Notion 진행 상황 페이지 운영 방침](./project_notion_page_policy.md) — PM 주요 독자, 백엔드 논의 제외, 토글 구조
- [/update-notion 초안 확인 방식](./feedback_update_notion_confirm.md) — 업로드 전 채팅창에 초안 보여주고 승인 후 업로드
- [Notion 업로드 후 페이지 경로 안내](./feedback_notion_upload_page_path.md) — 링크 대신 "부모 > 현재 페이지" 상속 경로로 안내

## 개발 규칙 / 피드백
- **[최우선]** [코드 작업 전 트레이드오프 설명 필수](./feedback_tradeoff_before_code.md) — 매 코드 수정/삭제/생성 시 트레이드오프 먼저 짚기
- [MVP 단계 코드 수정 기준 이분법](./feedback_mvp_fix_criteria.md) — 방어 코드는 즉시, 기획 의존적인 것은 보류
- [UI 위치/디자인은 디자이너 확인 후 구현](./feedback_ui_designer_confirm.md) — 임의 구현 금지, 타입/로직만 먼저
- [navigate(-1) fallback 금지](./feedback_navigate_back.md) — 뒤로가기에 강제 경로 넣지 말 것
- [질문 방식 — 막막할 땐 객관식, 의사결정 도출엔 주관식](./feedback_question_style.md)
- [session-bridge 사용 중단 — /wrap-up으로 대체](./feedback_session_bridge_removed.md)
- [세션 브릿지 실행 시 중요 내용 장기 메모리 저장 제안 — 정책결정/대규모변경/복잡작업 기준](./feedback_session_bridge_longterm.md)
- [Notion 날짜별 페이지 방식 — TIL 등 일자별 기록은 서브페이지로 생성](./feedback_notion_daily_pages.md)
- [와이어프레임 색상 보수적 적용 — 강한 색은 질문 먼저](./feedback_wireframe_color.md)
- [서버 통신 에러 시 프론트 먼저 점검 — 백엔드 탓은 마지막 수단](./feedback_backend_blame.md)
- [불확실할 때 추측 말고 질문 먼저](./feedback_ask_when_uncertain.md)
- [figma.com 링크 단독으로 오면 MVP 요구사항 피그마로 인지하고 바로 메모리 저장](./feedback_figma_link_recognition.md)
- [취업용 경험 생기면 Notion 정리 제안할 것](./feedback_career_documentation.md)
- [compact/clear 타이밍 — 매 답변마다 proactive하게 추천](./feedback_compact_timing.md)
- [코드 생성 승인 요청 방식](./feedback_code_approval.md)
- [TS 타입 에러 CLI 확인 — `npx tsc -b` (Vercel 빌드와 동일)](./feedback_ts_type_check.md)
- [shadcn Button asChild 미지원 — buttonVariants + Link 패턴 사용](./feedback_shadcn_button_aschild.md)
- [GitHub 토큰 채팅에 직접 붙여넣지 말 것](./feedback_github_token.md) ← 토큰 만료 예상일: 2026-04-12
- [브랜치는 항상 main 사용 (master 금지)](./feedback_branch_preference.md)
- [슬래시 커맨드 요청 시 스크립트 파일 별도 생성 금지](./feedback_no_scripts_for_commands.md)
- [외부 레포 push 전 사용자 최종 승인 필수](./feedback_push_requires_approval.md)
- [push-airo 시 .claude/ 등 Claude 파일 누락 방지 — reset --hard 방식만 사용](./feedback_push_airo_claude_files.md)
- [피그마 스크린샷이 코드 추출보다 효율적](./feedback_figma_screenshot_preferred.md) — to-code 추출은 토큰 낭비, 스크린샷+설명 선호
- [피그마 프레임 일괄 Export 방법](./feedback_figma_export_method.md) — PNG 2x로 내보내기, 전체 스크린샷은 해상도 부족

## MSW / API
- [MSW 래퍼 + axios 인터셉터 수정 완료 (2026-03-19)](./project_msw_wrapper.md)

## SSE / 알림
- [SSE 알림 기능 브레인스토밍 진행 중 (2026-04-01)](./project_sse_notification_brainstorm.md) — 옵션B 유력, 토큰 인증 이슈 미결, 내일 이어서
- [SSE 아키텍처 결정 — 옵션B 확정 (2026-04-02)](./project_sse_architecture_decision.md) — 3옵션 비교 근거, 빌더스 리그 🏗설계 결정 소재

## UI 개편
- [피그마 와이어프레임 기반 전체 UI 개편 완료 (2026-03-20)](./project_ui_redesign.md) — Notion 트러블슈팅 #003 미작성
- [홈 피드 리디자인 완료 (2026-04-01)](./project_home_feed_redesign.md) — 탭+필터칩+리스트형 피드, 검색 모드 isSearchMode → 별도 /search 페이지로 변경
- [TipTap 제거 → textarea 통일](./project_tiptap_removal.md) — 모바일 확장 대비, PC/모바일 포맷 통일
- [헤더 검색/글쓰기 버튼 PostListPage로 이동 (2026-04-02)](./project_header_refactor.md) — 데스크탑 전용, 모바일 헤더 유지
- [게시글 공개/비공개 UI 선반영 (2026-04-02)](./project_post_visibility_ui.md) — isPublic 토글 UI만, API 미연동

## 백엔드 이슈
- [로그인 응답 구조 불일치 — 수정 대기 중](./project_backend_login_response.md)

## Google OAuth
- [Google OAuth 코드 삭제 내역 (2026-03-25)](./project_google_oauth_removed.md) — 회원가입+치료사인증 통합 플로우 전환으로 삭제. 재도입 시 git 히스토리 참고

## 프로필 페이지
- [프로필 페이지 명칭 변경 및 탭 구성 확정](./project_mypage_rename.md) — 마이페이지→프로필, 탭: 내가 쓴 글/답글 단 글/스크랩

## UX 설계 논의 아카이브
- [PM/PD 협업 UX 논의 모음](./project_ux_design_decisions.md) — 3~4개 쌓이면 빌더스 리그에 묶어서 정리

## 백엔드 회의
- [회의 결과 + 프론트 개발 현황 (2026-03-15)](./project_backend_meeting.md)
- [토큰 방식 확정 — Access Token: body / Refresh Token: httpOnly Cookie](./project_token_strategy.md)

## 공유 문서
- [팀 요구사항 문서 Google Sheets (2차 업데이트 2026-03-30)](./reference_requirements_doc.md) — REQ-001~012 MVP, REQ-013~019 Post-MVP (실시간 업데이트 중)
- [Notion 진행 상황 페이지](./reference_notion_progress.md)
- [Notion 트러블슈팅 페이지](./reference_notion_troubleshooting.md)
- [Notion TIL 페이지](./reference_notion_til.md) — `/update-til`(학습 위주) + `/update-builders`(작업 위주) + 매일 18:30 KST 자동 실행 (trig_01AhUdgHMLPiEwTuYBRgtExv) / 양식에 포트폴리오 어필 포인트 섹션 포함
- [빌더스 리그 페이지](./reference_notion_builders_league.md) — 취업 포트폴리오/이력서 아카이빙 (🤖AI 협업, 🛠트러블슈팅, 🏗설계 결정, 📈성과/지표)

## 워크트리 / 브랜치 구조
- [워크트리 정리 완료 (2026-03-19) — 현재 main/public 2브랜치 구조](./project_worktree_cleanup.md)
- `/sync-review` 커맨드 삭제됨 (2026-03-22) — 워크트리 정리 후 불필요

## 공개 레포 (airo)
- [airo remote 설정 및 push-airo 커맨드 현황](./project_airo_repo.md) — `https://github.com/AIRO-offical/therapist_community_FE`

## Claude Code 플러그인
- [superpowers + frontend-design 설치, figma 제거 (2026-03-29)](./project_superpowers_plugin.md) — 디버깅 체계화 및 UI 품질 향상 목적
- [버그 감지 자동화 hook (2026-03-29)](./project_debug_hook.md) — UserPromptSubmit hook, 키워드 감지 시 systematic-debugging 스킬 자동 알림

## 인프라 계획
- [Vercel → AWS 이전 예정 + GitHub Actions CI/CD](./project_aws_migration_plan.md) — 시기 미정, 이전 시 YAML 작성 필요

## 환경 / 도구
- [VS Code에서 워크트리 파일이 안 보일 때](./reference_worktree_vscode.md)
- GitHub 인증: `~/.git-credentials`에서 `ghp_...` 토큰 부분만 교체
- 맥북 이전 완료 (2026-03-24) — 현재 맥 환경에서 개발 중
- [Claude Code 바로가기 aliases](./project_bash_aliases.md) — `mel` / `mel-dev` / `mel-review` / `portfolio`
- `/check-designer`, `/check-backend` 슬래시 커맨드 생성 완료 (2026-03-30) — 협업 대기 항목 즉시 조회용
- [포트폴리오 프로젝트 세팅](./project_portfolio_setup.md) — `~/portfolio` 디렉토리, 전용 메모리 구조, 컨텍스트 분리 운영 방침
- [백업 레포 URL (MelloMe_FE_Backup)](./reference_backup_repos.md)
- [메모리 동기화 슬래시 커맨드 — `/push-mello`, `/pull-mello`](./project_memory_sync.md)

## 기술부채 / 보류
- [보류된 리팩토링 항목](./project_pending_refactor.md) — refresh plain axios 교체 등 나중에 처리할 항목

## 학습
- [프론트엔드 코드 학습 전체 완료](./project_code_learning.md)
- [학습 내용 상세 정리 — 복습 요청 시에만 불러올 것](./learning_frontend_code.md)
- [axios interceptor 코드 리뷰 학습 진행 상황 및 다음 후보](./learning_axios_interceptor.md)
- [인지부채 점검 세션 — #004/#005/#006 이해 완료, 남은 항목: multipart/form-data](./project_cognitive_debt_review.md)
- [코딩 드릴 루틴 — AI 의존성 해소, 멜로미 코드 기반 데일리 연습](./project_coding_drill.md)

## shadcn/ui
- [디자이너 UI 선개발 방침](./project_shadcn_design.md) — 컴포넌트는 shadcn 기반, 스타일은 CSS 변수로 분리
- [shadcn UI 컴포넌트 기본 사용 원칙](./feedback_shadcn_default.md) — UI 작업 시 항상 shadcn 컴포넌트 우선 사용

## 월별 회고 (프로젝트 종료 후 돌아보기용)
- [2026년 3월 — 배포 인프라 구축 & 인증 플로우 재설계](./monthly_summary_2026_03.md)
