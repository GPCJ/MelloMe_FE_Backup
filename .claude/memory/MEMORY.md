# Project Memory

## 사용자
- [인증/보안 개념 지식 수준 — 비유적 설명 선호](./user_knowledge_auth.md)
- [개발 스타일 — 기능 구현 우선, 트러블슈팅 강점, 설계/아키텍처 약점 자각](./user_dev_style.md)
- [AI 의존 줄이기 — 직접 코딩 목표, 힌트는 OK 코드 작성은 직접](./user_self_coding_goal.md)
- [문서화 역량 면접 Q&A — 7개 항목별 심화 질문+답변 소재](./career_documentation_qa.md)

## 프로젝트
멜로미 — 발달장애 아동 치료사 커뮤니티 플랫폼 (MVP 개발 중)
- Frontend: React 19, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand, React Router, MSW
- Backend: Spring Boot (Java), JWT + Google OAuth2 / DB: PostgreSQL 16 / 인프라: Docker Compose
- 배포: **Vercel(프론트) + EC2(백엔드)** / 프론트: `www.melonnetherapists.com` / 백엔드: `api.melonnetherapists.com`
- [MVP 요구사항 상세 및 핵심지표](./project_mvp_requirements.md) — REQ-001~012 MVP, REQ-013~019 Post-MVP

## 핵심 정책
- 게시물 열람: 로그인만 필요, 공개 게시물 미인증 열람 가능, 인증 전용은 블러
- 토큰: AT=body(localStorage ~15분), RT=httpOnly Cookie / 페이지네이션: 0-based (프론트 currentPage-1)
- MVP 단일 게시판 (board 파라미터 미사용)
- [치료사 인증 정책 + 닉네임/title 변경](./project_auth_policy_change.md) — 즉시 THERAPIST + UNDER_REVIEW
- [댓글 시스템 — flat 2레벨, @멘션](./project_comment_system.md)

## 백엔드 대기 항목
- **→ [통합 우선순위 P0/P1/P2](./project_backend_priority_list.md)** ← `/check-backend` 참조
- **→ [추가 개발 요청 20개](./project_backend_additional_requests.md)**
- **⚠️ P0**: [탈퇴 유저 에러코드 분리](./project_soft_delete_login_workaround.md) — DELETED_ACCOUNT 요청 (이슈 #3)
- **❌ P0 잔존**: title optional (여전히 required)
- **❌ P1 잔존**: 팔로우 / 블러
- **❓**: isNewUser 실제 값
- [API 명세 Swagger 통일](./project_api_spec_platform.md)
- [마이페이지 Swagger 확정](./project_mypage_swagger_confirmed.md) — /me/comments+/me/scraps 분리

## 공통 컴포넌트
- [UserAvatar 공통 컴포넌트 통합](./project_user_avatar_component.md) — 6곳 아바타 통합, PostDetail/CommentResponse 타입 확장
- [MobilePageHeader rightAction slot 패턴](./project_mobile_header_slot_pattern.md) — rightAction ReactNode로 페이지별 헤더 UI 주입, 리팩토링 기준 포함

## 프론트 보류/기술부채
- [보류된 리팩토링 + 인지부채](./project_pending_refactor.md) — AbortController, refresh plain axios, 이해도 점검
- [403→공개게시물없음 표시 한계](./project_403_public_post_tradeoff.md)
- [게시글 공개/비공개 UI 선반영](./project_post_visibility_ui.md) — isPublic 토글 UI만, API 미연동
- [Paginated 프로퍼티 fallback 매핑](./project_paginated_type_fix.md)
- [스크랩 토글 + isScrapped 합의 완료](./project_scrap_toggle_feature.md) — 이슈 #7
- 환영 페이지 버그 v2 — 백엔드 isNewUser 하드코딩 수정 대기
- [이미지 public 접근 + 절대 경로](./project_image_public_absolute_path.md) — 프론트 검증 미완
- [UI만 구현된 기능](./project_ui_only_features.md) — 체크박스, 비밀번호 찾기, 검색바, 배너 통계

## 게시글 첨부파일
- [프론트 구현 완료, 백엔드 400 버그 대기](./project_post_attachment_feature.md) — airo 이슈 #8
- [첨부파일 업로드 400 에러](./project_attachment_upload_400_bug.md) — airo 이슈 #9

## 협업
- [백엔드 전달 전략 + 이슈 동기화](./project_backend_communication.md) — Swagger 공식, GitHub Issues, 멜로미↔아이로
- [디자이너 대기 항목 + 모바일 퍼스트](./project_designer_pending.md)
- [주간회의 안건 04-07~08](./project_weekly_meeting_agenda.md) — rememberMe, FNC-004, Google OAuth

## 기능명세 / 아키텍처
- [프론트 기능명세 체계](./project_feature_spec_frontend.md) — FNC-001~007 인증 완료
- [인증 도메인 점검 완료](./project_auth_spec_review_0403.md) — 다음: 게시글/피드
- [프론트 아키텍처 점검 Before](./project_architecture_review_0403.md)
- [CSV API 검토 현황](./project_csv_api_review_progress.md) — 27번부터 재개
- [/home 엔드포인트 관심사 분리](./project_home_endpoint_redesign.md)
- [PATCH /me 이미지 업로드 방식](./project_patch_me_image_discussion.md)

## UI 설계
- [피그마 UI 리디자인 스펙](./project_figma_ui_redesign_spec.md) — 04-02 구현 완료
- [UX 설계 논의 아카이브](./project_ux_design_decisions.md)

## 정책 결정 (Post-MVP)
- [모바일 앱 확장 ADR](./project_mobile_expansion_adr.md) — PWA/Capacitor 유저테스트 후 결정
- [Next.js 도입 보류](./project_nextjs_decision.md) — 콘텐츠 비로그인 공개 시점에 재검토
- [SSE 아키텍처 결정](./project_sse_architecture_decision.md) — 옵션B, fetch-event-source
- [Google OAuth 삭제 내역](./project_google_oauth_removed.md) — 재도입 시 git 참고

## 개발 규칙 / 피드백
- **[최우선]** [코드 작업 전 트레이드오프 설명 필수](./feedback_tradeoff_before_code.md) / [클린 커밋 히스토리 관리](./feedback_clean_commit_history.md)
- [MVP 코드 수정 기준](./feedback_mvp_fix_criteria.md) / [UI는 디자이너 확인 후](./feedback_ui_designer_confirm.md)
- [코드 수정 프로세스 — grep 선행](./feedback_code_change_process.md) / [코드 생성 승인 요청](./feedback_code_approval.md)
- [노션 항목 번호 — fetch로 실제 상태 확인 후 결정](./feedback_notion_page_number_check.md)
- [CSV 검토 시 그때그때 수정](./feedback_api_review_approach.md) / [navigate(-1) 금지](./feedback_navigate_back.md) / [모바일/데스크탑 UX 분기](./feedback_mobile_desktop_ux.md)
- [질문 방식 — 객관식 vs 주관식](./feedback_question_style.md) / [불확실하면 질문](./feedback_ask_when_uncertain.md)
- [/wrap-up으로 세션 마무리](./feedback_session_bridge_removed.md) / [집중력↓ 시 간결하게](./feedback_concise_when_tired.md)
- [피그마 공유 — 스크린샷+Export PNG 2x](./feedback_figma_sharing.md) / [figma 링크→메모리 저장](./feedback_figma_link_recognition.md)
- [노션 업로드 워크플로우](./feedback_notion_upload_workflow.md) / [노션 날짜별 서브페이지](./feedback_notion_daily_pages.md) / [Notion 운영 방침](./project_notion_page_policy.md)
- [와이어프레임 색상 보수적](./feedback_wireframe_color.md) / [서버 에러 시 프론트 먼저](./feedback_backend_blame.md)
- [compact/clear 타이밍](./feedback_compact_timing.md) / [TS 타입 체크 tsc -b](./feedback_ts_type_check.md)
- [shadcn asChild 미지원](./feedback_shadcn_button_aschild.md) / [shadcn/ui 기본 사용 원칙](./feedback_shadcn_default.md)
- [GitHub 토큰 채팅 금지](./feedback_github_token.md) / [브랜치 main만](./feedback_branch_preference.md) / [credentials 갱신 방법](./feedback_github_credentials_renewal.md)
- [백엔드 이슈에 LLM 프롬프트](./feedback_backend_llm_prompt.md) / [슬래시 커맨드 스크립트 금지](./feedback_no_scripts_for_commands.md)
- [외부 push 전 승인 필수](./feedback_push_requires_approval.md) / [push-airo reset --hard](./feedback_push_airo_claude_files.md)
- [git 커밋 전 diff --stat](./feedback_git_diff_stat_check.md) / [커맨드 네이밍 — 범용 이름](./feedback_draft_notion_naming.md)
- [에러 삼키지 말고 실패 표시](./feedback_error_handling_visible.md) / [API 에러 원인별 분기](./feedback_error_handling_by_cause.md)
- [GitHub Issues 기술부채 관리](./feedback_github_issues.md) / [두 레포 동시 생성](./feedback_github_issues_dual_repo.md)
- [토큰 사용량 최소화](./feedback_token_usage_awareness.md) / [취업 경험 Notion 정리](./feedback_career_documentation.md)
- [Vercel SPA 라우팅](./feedback_vercel_spa_routing.md)

## 공유 문서 / 레퍼런스
- [팀 요구사항 Google Sheets](./reference_requirements_doc.md) / [Swagger UI](./reference_swagger_endpoint.md) — EC2 `43.203.40.3:8080`
- [Notion TIL](./reference_notion_til.md) (18:30 KST) / [빌더스 리그](./reference_notion_builders_league.md) / [트러블슈팅](./reference_notion_troubleshooting.md)

## 환경 / 도구
- [Claude Code aliases](./project_bash_aliases.md) / [플러그인+hook 설정](./project_superpowers_plugin.md)
- [airo remote](./project_airo_repo.md) / [백업 레포 URL](./reference_backup_repos.md) / [push-airo 스크립트](./project_push_airo_script.md)
- [메모리 동기화](./project_memory_sync.md) — `/push-mello`, `/pull-mello`
- [포트폴리오 프로젝트](./project_portfolio_setup.md) — `~/portfolio`
- [Vercel 환경변수](./project_env_vars.md) / [.env.docker 이름 변경](./project_env_docker_rename.md)
- [CORS localhost:5173 요청 검토 중](./project_cors_local_suggestion.md) / [Vercel→AWS 이전 예정](./project_aws_migration_plan.md)
- [gh CLI 설치 완료](./reference_gh_cli.md) — 계정 GPCJ
- [MSW 래퍼 + axios 인터셉터](./project_msw_wrapper.md)

## 학습 / 성장
- [프론트엔드 코드 학습 상세](./learning_frontend_code.md) / [코딩 드릴 루틴](./project_coding_drill.md)
- [유저 행동 데이터 GA4+Clarity](./project_future_analytics.md) — MVP 이후
- [회원가입 토큰 반환 요청](./project_signup_token.md) — MVP 이후
- [README 작성 계획](./project_readme_plan.md) — MVP 완성 후

## 폴더 구조
- [프론트 폴더 구조 리팩토링 04-07](./project_folder_restructure.md) — components/pages 도메인별 하위 폴더 재구성, import 경로 변경됨

## ⭐ 진행 중
- [댓글 UI 코드 리뷰 — 04-09 전부 해결, MobileFixedBottom 도입](./project_comment_ui_review_0409.md)
- [모바일 상단 헤더 리팩토링 — MobilePageHeader 추출, 디자이너 시안 대기](./project_mobile_header_refactor.md)

## 단기 메모
- [무한 스크롤 3단계 로드맵](./project_infinite_scroll_roadmap.md) — MVP/MVP+/장기, 팀 공유용
- [검색 코드 리뷰 + C+A 개선 전략](./project_search_code_review.md) — Pagination 완료, FilterChips 미진행
- [Pagination 추출 완료](./project_pagination_extraction.md) — 04-07 커밋 32ac85a
- [댓글 UI 리디자인](./project_comment_ui_redesign.md) — 3페이지 구조, 모바일/데스크탑 분기, 04-07 완료

## 노션 초안
- [업로드 대기 초안](./notion_draft.md) — `/pull-mello` 후 확인

## 메모리 관리
- [최적화 다이제스트 04-06](./project_cleanup_digest_0406.md) — 31개 삭제/통합, 삭제 파일 핵심 사실 압축
- [최적화 프로세스 — 토큰 절약형](./feedback_memory_optimization_process.md) — 에이전트 전수조사 금지, 인덱스 기반 판단
- [2026년 3월 회고](./monthly_summary_2026_03.md)
