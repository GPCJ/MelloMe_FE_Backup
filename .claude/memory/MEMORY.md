# Project Memory

## 사용자
- [인증/보안 개념 지식 수준 — 비유적 설명 선호](./user_knowledge_auth.md)
- [개발 스타일 — 기능 구현 우선, 트러블슈팅 강점, 설계/아키텍처 약점 자각](./user_dev_style.md)
- [AI 의존 줄이기 — 직접 코딩 목표, 힌트는 OK 코드 작성은 직접](./user_self_coding_goal.md)

## 프로젝트
멜로미 — 발달장애 아동 치료사 커뮤니티 플랫폼 (MVP 개발 중)
- Frontend: React 19, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand, React Router, MSW
- Backend: Spring Boot (Java), JWT + Google OAuth2 / DB: PostgreSQL 16 / 인프라: Docker Compose
- 배포: **Vercel(프론트) + EC2(백엔드) 확정** / 프론트: `www.melonnetherapists.com` / 백엔드: `api.melonnetherapists.com`

## MVP 요구사항
- [MVP 요구사항 상세 및 핵심지표](./project_mvp_requirements.md) — REQ-001~012 MVP, REQ-013~019 Post-MVP

## 백엔드 대기 항목 (04-04 업데이트)
- **→ [통합 우선순위 리스트 P0/P1/P2/Post-MVP](./project_backend_priority_list.md)** ← `/check-backend` 참조 파일
- **→ [추가 개발 요청 20개](./project_backend_additional_requests.md)** — P0~PostMVP 신규 API 목록
- **✅ 해소**: therapyArea 필터 / 즉시 승인 / 스크랩 API / GET /me/posts / 파일 업로드 / **GET /me/comments** (답글 단 글)
- **✅ 추가 확정**: DELETE /me (회원탈퇴) / PATCH /me (프로필수정)
- **✅ 해소**: PATCH /me 프로필 수정 → [구현 완료 + 임시 대응 이슈](./project_profile_edit_feature.md)
- **✅ 해소**: POST /me/profile-image 이미지 업로드 구현 완료
- **⚠️ P0 에러코드 분리 대기**: [탈퇴 유저 로그인](./project_soft_delete_login_workaround.md) — INVALID_CREDENTIALS 통일 문제, DELETED_ACCOUNT 요청 (이슈 #3) + 프론트 인터셉터/catch 버그 미수정
- [API 명세 Swagger 통일](./project_api_spec_platform.md) — 구글 시트 폐기
- **❌ P0 잔존**: title optional (여전히 required)
- **❌ P1 잔존**: 팔로우 / 블러
- **✅ 해소**: 로그인/회원가입 응답 → [프론트 대응 완료 (04-04)](./project_login_signup_response_update.md) / 환영페이지 리다이렉트 버그 미해결
- **⚠️ 백엔드 응답 대격변**: [응답 형식 전면 통일 진행 중](./project_backend_response_format_flux.md) — 프론트 연동 일시 중단
- **❓ 확인 필요**: isNewUser 실제 값
- 상세: [API 이슈 #1~#21](./project_api_issues_2026_03_24.md) / [API 스펙 불일치](./project_api_spec_discrepancies.md)
- [OpenAPI 업데이트 수령 대기](./project_openapi_update_pending.md) — 수령 후 6개 항목 비교 검토
- [마이페이지 Swagger 확정 + ProfilePage 버그](./project_mypage_swagger_confirmed.md) — /me/activity → /me/comments+/me/scraps 분리 필요

## README
- [README 작성 계획 — MVP 완성 후 작성](./project_readme_plan.md) — 9개 섹션 구성 확정, 포트폴리오/채용 목적

## 아키텍처 점검
- [프론트 아키텍처 점검 Before (04-03)](./project_architecture_review_0403.md) — 4개 개선 포인트, 기능 추가 시 After 적용

## 게시글 첨부파일 업로드
- [프론트 구현 완료, 백엔드 400 버그 대기](./project_post_attachment_feature.md) — airo 이슈 #8 등록
- [axiosInstance FormData Content-Type 버그 수정](./project_axios_formdata_fix.md) — 인터셉터로 일괄 해결

## 프론트 보류/기술부채
- [MSW 선구현 보류](./project_msw_preimpl_hold.md) — 백엔드 직접 연동 전환
- [보류된 리팩토링 항목](./project_pending_refactor.md) — refresh plain axios 교체 등
- [403→공개게시물없음 표시 한계](./project_403_public_post_tradeoff.md) — 공개/비공개 API 지원 시 교체
- [게시글 공개/비공개 UI 선반영](./project_post_visibility_ui.md) — isPublic 토글 UI만, API 미연동
- [게시글 title 필드 제거](./project_post_title_removal.md) — 빈 문자열 임시 전송, 백엔드 optional 요청 대기
- [닉네임 정책 변경 + 임시 코드](./project_signup_nickname_change.md) — 백엔드 nickname 제거 시 프론트 코드 삭제
- 환영 페이지 버그 v2 — 프론트 isNewUser 방식 재설계 완료(04-03), 백엔드 isNewUser 하드코딩 수정 대기
- [랜딩 /me 호출 정책](./project_landing_me_call_decision.md) — MVP 매번 호출, React Query 도입 시 캐싱 전환
- [Paginated 프로퍼티 fallback 매핑](./project_paginated_type_fix.md) — 백엔드 `posts`/`comments`/`scraps` → API 함수에서 `items` 매핑
- [내 댓글 탭 응답 형식 수정 완료](./project_my_comments_fix.md) — MyComment 타입 + CommentItem UI, 백엔드 응답에 프론트 맞춤
- [스크랩 토글 구현 + isScrapped 합의 완료](./project_scrap_toggle_feature.md) — 로컬 state 임시, 백엔드 필드 추가 대기 (이슈 #7)

## 디자이너 협업
- [대기 항목 + 워크플로우 + 모바일 퍼스트](./project_designer_pending.md) — 10개 UI 항목, 데일리 사이클

## 기능명세
- [프론트 기능명세 체계](./project_feature_spec_frontend.md) — 도메인별 순차 작성, FNC-001~
- 인증 도메인: FNC-001~007 (FNC-008/009 삭제, FNC-004 P2 하향)
- [인증 도메인 점검 완료](./project_auth_spec_review_0403.md) — 다음 도메인: 게시글/피드

## 정책 결정
- [치료사 인증 정책 변경](./project_auth_policy_change.md) — 즉시 THERAPIST + UNDER_REVIEW, Google OAuth MVP+ 부활
- [게시물 열람 권한](./project_post_visibility.md) — 로그인만 필요, 공개 게시물 미인증 열람 가능
- [MVP 단일 게시판](./project_mvp_single_board.md) — board 파라미터 미사용
- [테스트 데이터 — 백엔드에 요청](./project_test_data_policy.md)
- [모바일 앱 확장 ADR](./project_mobile_expansion_adr.md) — MVP 웹 우선, PWA/Capacitor 유저테스트 후 결정
- [Next.js 도입 보류](./project_nextjs_decision.md) — 콘텐츠 비로그인 공개 시점에 재검토
- [토큰 방식 확정](./project_token_strategy.md) — AT: body / RT: httpOnly Cookie

## 주간회의 안건 (04-07~08)
- [rememberMe 정책 + FNC-004 + Google OAuth](./project_weekly_meeting_agenda.md)

## 백엔드 스펙
- [페이지네이션 0-based](./project_pagination_spec.md) — 프론트에서 currentPage - 1 변환
- [Swagger UI 접근 정보](./reference_swagger_endpoint.md) — EC2 `43.203.40.3:8080`
- [로그인 응답 구조](./project_backend_login_response.md) — yaml 확인 완료, isNewUser 수정 대기
- [치료사 인증 API 논의 항목](./project_verification_api_pending.md) — licenseCode, therapyAreas 확정 완료

## 댓글 시스템
- [유튜브 스타일 — flat 2레벨, @멘션, parentCommentId 확정](./project_comment_system.md)

## SSE / 알림 (Post-MVP)
- [SSE 아키텍처 결정 + 착수 체크리스트](./project_sse_architecture_decision.md) — 옵션B 확정, fetch-event-source

## UI 설계
- [TipTap 제거 → textarea 통일](./project_tiptap_removal.md)
- [헤더 검색/글쓰기 → PostListPage 이동](./project_header_refactor.md) — 데스크탑 전용
- [피그마 UI 리디자인 스펙](./project_figma_ui_redesign_spec.md) — 04-02 구현 완료
- [프로필 페이지 명칭 변경 + 3탭](./project_mypage_rename.md)
- [UX 설계 논의 아카이브](./project_ux_design_decisions.md)
- [UI만 구현된 기능](./project_ui_only_features.md) — 체크박스, 비밀번호 찾기, 검색바, 배너 통계

## CSV API 검토 진행
- [시트8.csv 38개 항목 검토 현황](./project_csv_api_review_progress.md) — 1~26번 완료, **27번(GET /posts/{postId}/scrap)부터 재개**
- [/home 엔드포인트 관심사 분리](./project_home_endpoint_redesign.md) — /home 경량화 + 확장 설계, 백엔드 요청 필요
- [PATCH /me 이미지 업로드 방식](./project_patch_me_image_discussion.md) — multipart 직접 업로드 제안, 백엔드 논의 필요

## 개발 규칙 / 피드백
- **[최우선]** [코드 작업 전 트레이드오프 설명 필수](./feedback_tradeoff_before_code.md)
- [MVP 코드 수정 기준 이분법](./feedback_mvp_fix_criteria.md) — 방어 코드 즉시, 기획 의존 보류
- [UI는 디자이너 확인 후 구현](./feedback_ui_designer_confirm.md)
- [코드 수정 프로세스 — grep 선행 필수](./feedback_code_change_process.md)
- [CSV API 검토 시 그때그때 수정 방식](./feedback_api_review_approach.md)
- [navigate(-1) fallback 금지](./feedback_navigate_back.md)
- [질문 방식 — 객관식 vs 주관식](./feedback_question_style.md)
- [/wrap-up으로 세션 마무리](./feedback_session_bridge_removed.md) + [중요 내용 장기 메모리 저장](./feedback_session_bridge_longterm.md)
- [Notion 날짜별 서브페이지](./feedback_notion_daily_pages.md) / [초안 확인](./feedback_update_notion_confirm.md) / [경로 안내](./feedback_notion_upload_page_path.md)
- [와이어프레임 색상 보수적](./feedback_wireframe_color.md) / [서버 에러 시 프론트 먼저](./feedback_backend_blame.md) / [불확실하면 질문](./feedback_ask_when_uncertain.md)
- [figma 링크 → 메모리 저장](./feedback_figma_link_recognition.md) / [취업 경험 Notion 정리 제안](./feedback_career_documentation.md)
- [compact/clear 타이밍 추천](./feedback_compact_timing.md) / [코드 생성 승인 요청](./feedback_code_approval.md)
- [TS 타입 체크 `npx tsc -b`](./feedback_ts_type_check.md) / [shadcn asChild 미지원](./feedback_shadcn_button_aschild.md)
- [GitHub 토큰 채팅 금지](./feedback_github_token.md) (만료 예상: 04-12) / [브랜치 main만](./feedback_branch_preference.md)
- [슬래시 커맨드 스크립트 파일 금지](./feedback_no_scripts_for_commands.md) / [외부 push 전 승인 필수](./feedback_push_requires_approval.md)
- [커맨드 네이밍 — 범용 목적엔 범용 이름](./feedback_draft_notion_naming.md)
- [push-airo reset --hard 방식](./feedback_push_airo_claude_files.md)
- [피그마 스크린샷 선호](./feedback_figma_screenshot_preferred.md) / [프레임 Export PNG 2x](./feedback_figma_export_method.md)
- [git 커밋 전 diff --stat 필수](./feedback_git_diff_stat_check.md)
- [shadcn/ui 기본 사용 원칙](./feedback_shadcn_default.md) — CSS 변수 기반 스타일링
- [에러 삼키지 말고 실패 표시](./feedback_error_handling_visible.md) — .catch(()=>{}) 금지, QA 친화적 메시지
- [GitHub Issues로 기술부채 관리](./feedback_github_issues.md) — 요청 시에만 gh issue create / [두 레포 동시 생성 — 목적별 판단](./feedback_github_issues_dual_repo.md)
- [백엔드 협업 전달 전략 + 도구](./project_backend_communication.md) — Swagger 공식 명세, GitHub Issues 이슈 관리, 문제+기대결과만 전달
- [이슈 동기화 정책 — 멜로미 ↔ 아이로](./project_issue_sync_policy.md) — 두 레포 이슈 매핑 현황
- [API 에러 원인별 분기](./feedback_error_handling_by_cause.md) — 401은 인터셉터, 500/네트워크는 무시. 무조건 clearAuth() 금지
- [토큰 사용량 최소화](./feedback_token_usage_awareness.md) — 에이전트 남용 금지, 직접 grep/read 우선
- [집중력 떨어질 때 간결하게](./feedback_concise_when_tired.md) — 짧은 문장, 한번에 하나의 정보만
- [Notion 운영 방침](./project_notion_page_policy.md) — PM 주요 독자

## 노션 초안 (다른 기기에서 업로드 대기)
- [노션 업로드 대기 초안](./notion_draft.md) — `/draft-notion`으로 생성, `/pull-mello` 후 확인

## 공유 문서
- [팀 요구사항 Google Sheets](./reference_requirements_doc.md) — REQ-001~012 MVP
- ~~Notion 진행 상황~~ [실효성 없음](./project_notion_progress_deprecated.md) / [트러블슈팅](./reference_notion_troubleshooting.md)
- [Notion TIL](./reference_notion_til.md) — 자동 실행 18:30 KST / [빌더스 리그](./reference_notion_builders_league.md)

## 로컬 개발 환경
- [루트 .env 미생성](./project_local_env_setup.md) — docker-compose 실행 불가
- [.env → .env.docker 이름 변경](./project_env_docker_rename.md)
- [Vercel 환경변수 확정값](./project_env_vars.md)
- [CORS localhost:5173 허용 요청 검토 중](./project_cors_local_suggestion.md)

## 환경 / 도구
- [Claude Code aliases](./project_bash_aliases.md) — `mel` / `mel-dev` / `mel-review` / `portfolio`
- [플러그인 + hook 설정](./project_superpowers_plugin.md) — superpowers, frontend-design, 버그 감지 hook
- [워크트리 정리 완료 — main/public 2브랜치](./project_worktree_cleanup.md)
- [airo remote 설정](./project_airo_repo.md) / [백업 레포 URL](./reference_backup_repos.md) / [push-airo 스크립트화](./project_push_airo_script.md)
- [메모리 동기화 커맨드](./project_memory_sync.md) — `/push-mello`, `/pull-mello`
- [포트폴리오 프로젝트 세팅](./project_portfolio_setup.md) — `~/portfolio`, 컨텍스트 분리
- GitHub 인증: `~/.git-credentials`에서 `ghp_...` 토큰 교체
- [gh CLI 설치 + 인증 완료](./reference_gh_cli.md) — 계정 GPCJ, 이슈 관리용
- [Vercel SPA 라우팅 설정](./feedback_vercel_spa_routing.md)
- [Vercel → AWS 이전 예정](./project_aws_migration_plan.md) — 시기 미정

## Google OAuth
- [삭제 내역 (2026-03-25)](./project_google_oauth_removed.md) — 재도입 시 git 히스토리 참고

## MSW
- [MSW 래퍼 + axios 인터셉터](./project_msw_wrapper.md)

## 학습
- [프론트엔드 코드 학습 상세](./learning_frontend_code.md) — 복습 요청 시 참조
- [인지부채 점검 — multipart/form-data 남음](./project_cognitive_debt_review.md)
- [코딩 드릴 루틴](./project_coding_drill.md) — AI 의존성 해소, 데일리 연습
- [유저 행동 데이터 수집 — GA4+Clarity](./project_future_analytics.md) — MVP 이후 도입
- [회원가입 토큰 반환 요청](./project_signup_token.md) — MVP 이후

## 메모리 관리
- [메모리 최적화 기록 (04-03)](./project_memory_optimization_0403.md) — 21삭제, 6통합, 220→130줄

## 월별 회고
- [2026년 3월](./monthly_summary_2026_03.md) — 배포 인프라 구축 & 인증 플로우 재설계
