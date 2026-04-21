# Project Memory

## 사용자
- [인증/보안 개념 지식 수준 — 비유적 설명 선호](./user_knowledge_auth.md)
- [개발 스타일 — 기능 구현 우선, 트러블슈팅 강점, 설계/아키텍처 약점 자각](./user_dev_style.md)
- [AI 의존 줄이기 — 직접 코딩 목표, 힌트는 OK 코드 작성은 직접](./user_self_coding_goal.md)
- [협업 스타일 — AI 행동 규약 공동 설계형](./user_collab_style_meta.md) — 반복 실수 시 즉시 "규칙화할까요?" 제안 OK
- [지식 흡수 기준 — 이미지/구조가 떠올라야 흡수](./user_comprehension_criterion.md) — 텍스트로 읽힌 느낌 ≠ 흡수, 비유/다이어그램/추적 트리거 필요
- 문서화 역량 면접 Q&A 7항목 → wiki `q-a-7` (reference)

## 작업 관리
- **[프론트엔드 작업 백로그](./backlog.md)** — 데일리 태스크 선택용 단일 참조 (할 수 있는 것 / 블로킹 / 검증 방법)

## 프로젝트
멜로미 — 발달장애 아동 치료사 커뮤니티 플랫폼 (MVP 개발 중)
- Frontend: React 19, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand, React Router, MSW
- Backend: Spring Boot (Java), JWT + Google OAuth2 / DB: PostgreSQL 16 / 인프라: Docker Compose
- 배포: **Vercel(프론트) + EC2(백엔드)** / 프론트: `www.melonnetherapists.com` / 백엔드: `api.melonnetherapists.com`
- MVP 요구사항 상세 + KPI → wiki `mvp-req-001-019` (reference, REQ-001~012 MVP)

## 핵심 정책
- [USER 롤도 게시글 작성 가능 — 공개글만](./project_user_role_post_create_policy.md) — 04-14 main 머지 완료(770e7af), 백엔드 권한 필드 이관 대기
- 게시물 열람: 로그인만 필요, 공개 게시물 미인증 열람 가능, 인증 전용은 블러
- 토큰: AT=body(localStorage ~15분), RT=httpOnly Cookie / 페이지네이션: 0-based (프론트 currentPage-1)
- MVP 단일 게시판 (board 파라미터 미사용)
- [치료사 인증 정책 + 닉네임/title 변경](./project_auth_policy_change.md) — 즉시 THERAPIST + UNDER_REVIEW
- **[MVP 치료사 인증 = 즉시 승인](./project_auth_policy_mvp_immediate_approval.md)** — UNDER_REVIEW 생략, 신청→APPROVED 바로
- [댓글 시스템 — flat 2레벨, @멘션](./project_comment_system.md)

## 공통 컴포넌트
- [UserAvatar 공통 컴포넌트 통합](./project_user_avatar_component.md) — 6곳 아바타 통합, PostDetail/CommentResponse 타입 확장
- [MobilePageHeader rightAction slot 패턴 + 데스크탑 회귀 주의](./project_mobile_header_slot_pattern.md) — rightAction은 md:hidden이라 데스크탑에서 사라짐, hidden md:flex 래퍼 중복 렌더 필수
- [모바일 프로필 헤더 구현](./project_mobile_profile_header.md) — ProfilePage ← 내 프로필 ⚙️, 톱니바퀴→로그아웃 임시 구현, 설정 메뉴 확장은 팀 논의 안건


## 게시글 첨부파일
- [프론트 구현 완료 + 400 해결](./project_post_attachment_feature.md) — 백엔드 PDF만 허용, 이미지 허용 여부 미확인
- [첨부파일 400 원인 확정 — MIME 불일치](./project_attachment_upload_400_bug.md) — 한컴 뷰어, Blob 강제 지정으로 해결
- [이미지/PDF 엔드포인트 분리 대응](./project_post_attachment_endpoints_split.md) — 2026-04-21 Swagger 컨펌 + MSW GET/응답 수정, 실서버 테스트 남음
- [이미지 DELETE 엔드포인트 백엔드 대기](./project_post_image_delete_pending.md) — 2026-04-21 Swagger 재확인, 여전히 DELETE 없음
- [게시글 이미지 presigned URL 방식 대기](./project_post_image_presigned_url.md) — 2026-04-22 백엔드 결정, 프론트는 스펙 확정까지 대기

## 게시글 리액션
- [리액션 API 리네임 + 응답 확장 대응 완료](./project_post_reaction_api_rename.md) — 2026-04-21 커밋 3a84a04, 동시 배포/디자이너 추가 컨펌/실서버 테스트 잔여, PostSummary myReactionType 미포함 한계

## 협업 프로세스
- [백엔드 전달 전략 + 이슈 동기화](./project_backend_communication.md) — Swagger 공식, GitHub Issues, 멜로미↔아이로

## 기능명세 / 아키텍처
- [프론트 기능명세 체계](./project_feature_spec_frontend.md) — FNC-001~007 인증 완료
- [CSV API 검토 현황](./project_csv_api_review_progress.md) — 27번부터 재개
- [/home 엔드포인트 관심사 분리](./project_home_endpoint_redesign.md)
- [PATCH /me 이미지 업로드 방식](./project_patch_me_image_discussion.md)
- [프로필 편집 코드 리뷰 TODO](./project_profile_edit_cleanup.md) — 2026-04-21 T1/T2 + HIGH 가드 제거 완료, T3/로깅·토스트/타입·캐시 잔여

## UI 설계
- [UX 설계 논의 아카이브](./project_ux_design_decisions.md)

## 정책 결정 (Post-MVP)
- [모바일 앱 확장 ADR](./project_mobile_expansion_adr.md) — PWA/Capacitor 유저테스트 후 결정
- [Next.js 도입 보류](./project_nextjs_decision.md) — 콘텐츠 비로그인 공개 시점에 재검토
- SSE 아키텍처(옵션B, fetch-event-source) → wiki `sse-b-zustand-fetch-event-source` (decision)
- Google OAuth 삭제 내역(2026-03-25) → wiki `google-oauth-2026-03-25` (session-log)

## 개발 규칙 / 피드백
- **[최우선]** [코드 작업 전 트레이드오프 설명 필수](./feedback_tradeoff_before_code.md) / [클린 커밋 히스토리 관리](./feedback_clean_commit_history.md)
- **[최우선]** [진단→이해→지시→조치 (과잉설명 금지)](./feedback_explain_before_act.md) — 레이블/경쟁가설/1분 검증/최소 정보 제시 5원칙
- **[최우선]** [workaround 추가 전 스펙/상태 재확인](./feedback_verify_spec_before_workaround.md) — 400/감싸기 판단 전에 Swagger·네트워크·실코드 재확인
- **[AI 직접 작성 코드 → 인지부채 HIGH 메모리 의무](./feedback_ai_written_code_cognitive_debt.md)** — Claude 위임 코드는 메커니즘 상세 기록, 04-15 P1이 첫 사례
- [AI 작성 코드 학습용 주석 리뷰 워크플로우](./feedback_ai_code_learning_comments.md) — push 전 교육용 밀도 높은 주석 요청 → 리뷰 후 승인
- [MVP 코드 수정 기준](./feedback_mvp_fix_criteria.md) / [UI는 디자이너 확인 후 + 백엔드 변경의 디자인 영향도 개발 용어 빼고 디자이너 먼저 문의](./feedback_ui_designer_confirm.md)
- [코드 수정 프로세스 — grep 선행](./feedback_code_change_process.md) / [코드 생성 승인 요청](./feedback_code_approval.md)
- [MSW는 백엔드 권한 정책 시뮬레이션](./feedback_msw_simulates_backend_policy.md) — mock이 정책 우회 허용하면 프론트 회귀 숨겨짐
- [섞인 커밋 분리 워크플로우](./feedback_mixed_commit_split_workflow.md) — reset --mixed + stash -u로 브랜치별 분리 재커밋
- [노션 항목 번호 — fetch로 실제 상태 확인 후 결정](./feedback_notion_page_number_check.md)
- [CSV 검토 시 그때그때 수정](./feedback_api_review_approach.md) / [navigate(-1) 금지](./feedback_navigate_back.md) / [모바일/데스크탑 UX 분기](./feedback_mobile_desktop_ux.md)
- [질문 방식 — 객관식 vs 주관식](./feedback_question_style.md) / [불확실하면 질문](./feedback_ask_when_uncertain.md)
- [/wrap-up으로 세션 마무리](./feedback_session_bridge_removed.md) / [집중력↓ 시 간결하게](./feedback_concise_when_tired.md) / [세션 중 notepad 자동 기록](./feedback_notepad_session_logging.md)
- [피그마 공유 — 스크린샷+Export PNG 2x](./feedback_figma_sharing.md) / [figma 링크→메모리 저장](./feedback_figma_link_recognition.md)
- [노션 업로드 워크플로우](./feedback_notion_upload_workflow.md) / [노션 날짜별 서브페이지](./feedback_notion_daily_pages.md) / [Notion 운영 방침](./project_notion_page_policy.md)
- 노션 스킬 정리(2026-04-15, /report-notion 단일화) → wiki `2026-04-15-report-notion` (session-log)
- [/report-notion 재질문 기준](./feedback_report_notion_requery_rule.md) — 날짜/분류/임팩트만, 기술 디테일은 소스코드에서
- [노션 서브페이지 분리 전 양질 자기평가](./feedback_notion_subpage_quality_check.md) — 과포장 지양, 내용 약하면 TIL 1개 통합 + 강조 박스
- [와이어프레임 색상 보수적](./feedback_wireframe_color.md) / [서버 에러 시 프론트 먼저](./feedback_backend_blame.md)
- [compact/clear 타이밍](./feedback_compact_timing.md) / [TS 타입 체크 tsc -b](./feedback_ts_type_check.md)
- [shadcn asChild 미지원](./feedback_shadcn_button_aschild.md) / [shadcn/ui 기본 사용 원칙](./feedback_shadcn_default.md)
- [GitHub 토큰 채팅 금지](./feedback_github_token.md) / [브랜치 main만](./feedback_branch_preference.md) / [credentials 갱신 방법](./feedback_github_credentials_renewal.md)
- [백엔드 이슈에 LLM 프롬프트](./feedback_backend_llm_prompt.md) / [슬래시 커맨드 스크립트 금지](./feedback_no_scripts_for_commands.md)
- [외부 push 전 승인 필수](./feedback_push_requires_approval.md) / [push-airo reset --hard](./feedback_push_airo_claude_files.md)
- [커밋 메시지 한국어 통일 (forward-only)](./feedback_commit_message_korean.md) — 과거 영어 커밋은 rewrite 없이 둠
- [커밋 서명 줄 금지](./feedback_no_co_authored_by.md) — Co-Authored-By/자동 서명 줄 넣지 말 것
- [sync 전용 chore 커밋 금지](./feedback_no_sync_only_commits.md) — 메모리/자동화용 별도 chore 커밋 만들지 말고 feat/fix 커밋에 자연스럽게 포함
- [규칙은 근본 원인 확인 후 적용](./feedback_verify_rules_root_cause.md) — 저장된 규칙 맹목 적용 금지, 실제 실패 원인 확인 후 근본 수정
- [코드 리뷰 severity triage](./feedback_review_triage_workflow.md) — HIGH만 즉시 조치, Medium/Low는 project 메모리 + notepad priority("오늘 뭐하지")
- [가드/임시대응 코드 주석 스타일](./feedback_guard_comment_style.md) — 레이스 가드·workaround에는 상세 한국어 WHY 주석 + 의존 관계 명시
- [git 커밋 전 diff --stat](./feedback_git_diff_stat_check.md) / [커맨드 네이밍 — 범용 이름](./feedback_draft_notion_naming.md)
- [에러 삼키지 말고 실패 표시](./feedback_error_handling_visible.md) / [API 에러 원인별 분기](./feedback_error_handling_by_cause.md)
- [백엔드 필드 요청 전 기존 스펙 확인](./feedback_backend_field_request_check.md) / [Explore 결과 직접 검증](./feedback_explore_result_verification.md)
- [GitHub Issues 기술부채 관리](./feedback_github_issues.md) / [이슈는 airo 레포에만](./feedback_airo_issues_only.md)
- [토큰 사용량 최소화](./feedback_token_usage_awareness.md) / [취업 경험 Notion 정리](./feedback_career_documentation.md)
- [Vercel SPA 라우팅](./feedback_vercel_spa_routing.md)

## 공유 문서 / 레퍼런스
- [팀 요구사항 Google Sheets](./reference_requirements_doc.md) / [Swagger UI](./reference_swagger_endpoint.md) — `api.melonnetherapists.com/swagger-ui/index.html`
- [백엔드 Swagger OpenAPI 엔드포인트](./reference_backend_swagger.md) — `api.melonnetherapists.com/v3/api-docs`, API prefix `/api/v1`, 필요 시 WebFetch로 fresh 조회
- [Notion TIL](./reference_notion_til.md) (18:30 KST) / [빌더스 리그 + 서브페이지 ID + 컨벤션](./reference_notion_builders_league.md) / [트러블슈팅](./reference_notion_troubleshooting.md)

## 환경 / 도구
- [Claude Code aliases](./project_bash_aliases.md) / [플러그인+hook 설정](./project_superpowers_plugin.md)
- [airo remote](./project_airo_repo.md) / [백업 레포 URL](./reference_backup_repos.md) / [push-airo 스크립트](./project_push_airo_script.md)
- [메모리 동기화](./project_memory_sync.md) — `/push-mello`, `/pull-mello` · 2026-04-20 사고 + 대량 삭제 가드(`FORCE_PUSH=1` 우회) 추가
- [새 환경은 pull-mello 먼저](./feedback_new_env_pull_first.md) — SSD 포맷/새 머신에서 push-mello 먼저 돌리면 레포 메모리가 `rsync --delete`로 날아감 (2026-04-20 사고 교훈)
- [포트폴리오 프로젝트](./project_portfolio_setup.md) — `~/portfolio`
- [Vercel 환경변수](./project_env_vars.md) / [.env.docker 이름 변경](./project_env_docker_rename.md)
- [로컬 CORS 허용 완료 (localhost:3000/5173)](./project_cors_local_suggestion.md) / [Vercel→AWS 이전 계획 + 프론트 담당 범위](./project_aws_migration_plan.md)
- [gh CLI 설치 완료](./reference_gh_cli.md) — 계정 GPCJ
- [MSW 래퍼 + axios 인터셉터](./project_msw_wrapper.md)
- .git object 손상 복구 → wiki `git-object-push-mello` (debugging, push/HEAD 파싱 실패 비파괴 복구)
- [Stop Hook — 터미널 벨](./hook_bell_on_stop.md) — 2026-04-20 WSL ~/.claude/settings.json에 답변 완료 시 벨 (user-global, Mac 미동기화)

## 학습 / 성장
- 프론트엔드 코드 학습 19항목 → wiki `19` (reference) / [코딩 드릴 루틴](./project_coding_drill.md)
- [유저 행동 데이터 GA4+Clarity](./project_future_analytics.md) — MVP 이후
- [회원가입 토큰 반환 요청](./project_signup_token.md) — MVP 이후
- [README 작성 계획](./project_readme_plan.md) — MVP 완성 후

## 폴더 구조
- [프론트 폴더 구조 리팩토링 04-07](./project_folder_restructure.md) — components/pages 도메인별 하위 폴더 재구성, import 경로 변경됨

## 노션 초안
- [업로드 대기 초안](./notion_draft.md) — `/pull-mello` 후 확인

## 메모리 관리
- [최적화 프로세스 — 토큰 절약형](./feedback_memory_optimization_process.md) — 에이전트 전수조사 금지, 인덱스 기반 판단
- [최근 push 시간은 git log로](./feedback_last_push_time.md) — sync_status.md 재생성 로직 제거됨
- 2026-03 월별 회고 → wiki `2026-3-mvp` (session-log)
- **[장기 참고문서는 OMC wiki로, auto-memory는 hot index만](./feedback_wiki_for_longform.md)** — 50줄↑ reference/decision/debugging/session-log은 `wiki_ingest`, auto-memory는 hook+규약+활성 상태만. MEMORY.md에 `→ wiki <slug>` 표기 시 `wiki_query`로만 로드
