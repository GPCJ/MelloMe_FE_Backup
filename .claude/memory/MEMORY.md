# Project Memory

## 사용자
- [인증/보안 개념 — 비유적 설명 선호](./user_knowledge_auth.md)
- [개발 스타일 — 기능 구현 강, 설계 약 자각](./user_dev_style.md)
- [AI 의존 줄이기 — 코드 직접 작성](./user_self_coding_goal.md)
- [협업 스타일 — AI 행동 규약 공동 설계형](./user_collab_style_meta.md)
- [지식 흡수 — 이미지/구조 떠올라야 흡수](./user_comprehension_criterion.md)
- [작업 집중 — 싱글태스크 + 스쳐가는 생각 캡처](./user_work_focus_pattern.md)
- [코드 추적 — outside-in (호출부→선언부)](./user_code_navigation_style.md)
- [Zustand/RQ 학습 — 단편 규칙 누적](./user_reactivity_libs_learning.md)
- [AI 의존 불안 패턴 — 주기적 재출현, 4프레임 응답](./user_ai_dependency_anxiety.md)
- **[코드 읽기 진단 — WHAT은 읽고 WHY는 건너뜀 (2026-06-02)](./user_code_reading_what_vs_why.md)** — 못 읽는 게 아니라 습관, risk 줄에만 "지우면 뭐 깨지지?", PR 부담=착시
- **[React 내부 모델 학습 (2026-05-19~20)](./user_react_internals_learning.md)** — 렌더 4단계/fiber=인스턴스/StrictMode 가짜언마운트/useEffect=동기화/race 도달성 잡힘, Component·Element 층 미정리
- 문서화 역량 면접 Q&A 7항목 → wiki `q-a-7` (reference)

## 작업 관리
- **[개발 단계 = Post-MVP (MVP 2026-05-15 발표 완료)](./project_mvp_launch_2026_05_15.md)** — MVP 데드라인 제약 해제, 기능 확장기. CLAUDE.md도 Post-MVP 갱신
- **[프론트 작업 백로그](./backlog.md)** — 데일리 태스크 선택용 단일 참조
- **[★ Google OAuth 재도입 (옵션 D 합의, 백엔드 대기, 2026-05-19)](./project_google_oauth_reimplementation.md)** — Jira Story 박제 완료, 재개 트리거 「구글 OAuth 이어가자」
- **[★ 쪽지(DM) 기능 — API 존재 확정 + 설계 스펙 (2026-05-26)](./project_messaging_feature.md)** — mailbox 모델, 스펙 `docs/superpowers/specs/2026-05-26-...`, slice 0 완료/1 진행, 백엔드 Q1·Q2 대기. **PR #20 리뷰 6파일 완료/남은 App·게이트 + ⚠️ 작업 브랜치에 bcea18e 없어 디스크 모달=폐기 버전 (2026-06-02)**
- **[고민 카드 — prod 머지/배포 완료, GA4 `post_created{postType:CONCERN_CARD}` 발사 ✓ (2026-05-29)](./project_concern_card_feature.md)** — develop→main merge `b1e944d`, GA4 prod 실측 ✓. PM Custom Dimension 등록 대기. 재개 「고민 카드 이어가자」
  - [자동완성 UX = 드롭다운 카드형(세로), 고스트 텍스트 폐기](./project_concern_autocomplete_dropdown_card.md)
  - **[Task 6~9 구현 박제 (인지부채 HIGH, 2026-05-29)](./project_concern_card_implementation_2026_05_29.md)** — 다음 만지기 전 필독, 메커니즘 7개 + 자기점검 질문 5개
  - **[prod 후속 트리거 박제 (2026-05-30) + UT 피드백 반영 (2026-06-01, 06-02)](./project_concern_card_prod_followup_2026_05_30.md)** — 회귀 롤백/PM 핸드오프 + 모바일 UT 「작성완료 버튼」 푸터(develop `c7f9f10`) + UT2차 폼 입력 순서 View 일치(연령대→치료영역→진단명→본문)·기타 입력 삭제(브랜치 `feat/concern-form-reorder` 승인 전)

## 프로젝트
멜로미 — 발달장애 아동 치료사 커뮤니티 (MVP)
- Frontend: React 19, TypeScript, Vite, Tailwind, shadcn/ui, Zustand, React Router, MSW
- Backend: Spring Boot, JWT + Google OAuth2 / DB: PostgreSQL 16 / Docker Compose
- 배포: Vercel(프론트) + EC2(백엔드) / 프론트 `www.melonnetherapists.com` / 백엔드 `api.melonnetherapists.com`
- MVP 요구사항 + KPI → wiki `mvp-req-001-019` (reference)

## 핵심 정책
- [USER 롤 게시글 작성 — 공개글만](./project_user_role_post_create_policy.md) — 04-14 main 머지, 백엔드 권한 필드 이관 대기
- 게시물 열람: 로그인 필요, 공개글 미인증 열람 가능, 인증 전용은 블러
- 토큰: AT=body(localStorage ~15분), RT=httpOnly Cookie / 페이지네이션 0-based / MVP 단일 게시판
- **[MVP 치료사 인증 = 즉시 승인](./project_auth_policy_mvp_immediate_approval.md)** — UNDER_REVIEW 생략
- [댓글 시스템 — flat 2레벨, @멘션](./project_comment_system.md)
- **[댓글 줄바꿈 정책 (2026-05-02)](./project_comment_linebreak_policy.md)** — textarea + `whitespace-pre-wrap`, 후속 backlog R-07
- **[CH-09 답글 동선 — PC 모달 / 모바일 라우트 (2026-05-11)](./project_ch09_reply_modal_pc_decision_2026_05_11.md)** — `matchMedia(min-width:768px)` 분기
- **[랜딩페이지 폐기 (2026-05-06)](./project_landing_page_deprecation.md)** — `/`→비로그인 `/signup`/로그인 `/posts`
- **[회원가입 환영 모달 (2026-05-06)](./project_welcome_modal_implementation.md)** — /posts navigate + 모달 1회
- **[댓글 중복 POST 방어 (2026-05-11, PR #13)](./project_comment_duplicate_post_fix_2026_05_11.md)** — in-flight + IME `isComposing` 가드

## 공통 컴포넌트
- [UserAvatar 공통 컴포넌트](./project_user_avatar_component.md) — 6곳 통합
- **[Chrome 통일 정책 (2026-05-08)](./project_chrome_unification_policy.md)** — Layout 헤더 폐기 + PageHeader 단일 + SideNav 6슬롯 + BottomNav 5
- **[UserMenu 패턴](./project_user_menu_component.md)** — PC 케밥 + 모바일 햄버거 공유
- **[FilterChips 드래그 스크롤 — 인지부채 HIGH (2026-05-21)](./project_filterchips_drag_scroll_cognitive_debt.md)** — AI 작성·이해 미완 커밋 `ec36f5f`, 회복 후 손재작성 학습과제
- **[ProfilePage 시그널 시안 정합 (2026-05-11)](./project_profile_page_signal_chrome_2026_05_11.md)** — 헤더 Search+UserPen, 회원 탈퇴 MVP 제외
- **[피그마 아이콘 점진 교체 (2026-05-11~)](./project_figma_icon_migration.md)** — 사이드바 5개 완료, `components/icons/` SVG path 인라인
- **[프사/닉네임 변경 시 마이페이지 RQ 캐시 무효화 (2026-05-12)](./project_my_page_cache_invalidation_on_profile_edit.md)** — `invalidateMyPageTabs()`, `ee07728`

## 게시글 첨부파일
- [프론트 구현 완료](./project_post_attachment_feature.md) — 이미지/PDF 엔드포인트 분리 완료(04-21)
- **[✅ 첨부 다운로드 + S3 CORS 해결 (2026-05-26)](./project_post_attachment_download_s3_cors_pending.md)** — dev/prod CORS 인프라 조치 완료, 다운로드 정상
- **[⚠️ 이미지 업로드 재시도 — 2단계 진행 (2026-05-28~, 안 B)](./project_image_upload_retry_idempotency_design.md)** — 1단계(`e7ea9bb` 자동 재시도+헬퍼) 완료. 백엔드 핸드오프 이슈 #11로 **만료 폴백 배제 결정 뒤집힘** → PUT/confirm 분리+PUT 403 한정 init 1회 재발급+confirm 409 race 처리 추가 예정. 본인 직접 작성
- **[✅ 이미지 업로드 500 해결 (2026-05-26)](./project_image_upload_500_file_storage_error.md)** — 백엔드 인프라 회귀 해소, 진단 이력 보존
- **[⚠️ prod 전용 init 업로드 500 (2026-05-28)](./project_prod_init_upload_500_2026_05_28.md)** — `/uploads/init` INTERNAL_SERVER_ERROR, staging 정상=prod presigned 인프라 회귀, FE 무책임, 백엔드 대기 (04-29건과 별개)
- **[⚠️ 이미지 첨부 통신 실패 로깅 AI 작성 9곳 (2026-05-28)](./project_image_attach_logging_ai_written_2026_05_28.md)** — 옵션 C 적용(axios 인터셉터+image-attach), 워킹트리만, 본인 검토·인지부채 4단계 후 커밋
- **[API 통신 실패 로깅 prefix 컨벤션 (2026-05-28, `fd39c11`)](./project_image_attach_log_prefix_convention.md)** — `[api-error]` 광역 / `[image-attach]` 도메인, 단일 실패 2줄 의도적 중복, 새 도메인 추가 시 규칙
- 8층 학습 노트 + unwrap 버그 → wiki `unwrap` (debugging)
- 다운로드 3-layer 진단(presigned×axios×S3 CORS) → wiki `presigned-url-axiosinstance-s3-cors-3-layer` (debugging)
- **[presigned 재시도/실패 검증 기법 (DevTools)](./reference_devtools_presigned_retry_verification.md)** — S3 PUT만 URLPattern(`https://host/*`)으로 차단, 전체URL·`*host*` 함정

## 리액션
- [R-08 게시글 캐시 패치 옵션 A/B/C — B 채택](./project_post_reaction_cache_patch_options.md)
- **[댓글 리액션 3종 확정 (2026-05-03)](./project_comment_reaction_3type_decision.md)** — LIKE/CURIOUS/USEFUL, 응답 4필드 동봉
- **[댓글 리액션 hook B 패턴 + PUT reconcile](./project_comment_reaction_hook_b_pattern.md)** — 페이지 레벨 단일 hook

## 협업 프로세스
- [백엔드 전달 전략](./project_backend_communication.md) — Swagger, GitHub Issues, 멜로미↔아이로
- **[백엔드 dev/prod 분리 + Vercel 2브랜치](./project_backend_dev_prod_split.md)** — main→prod / develop→staging
- **분석 이벤트 오너=PM, 프론트 삽입만** — [오너](./project_analytics_event_ownership.md) / [정식 스펙 v1 24종](./project_analytics_event_spec_pm_v1.md) / [B1 매핑](./project_analytics_b1_mapping.md) / [매개변수+CustomDim 패턴](./project_ga4_event_naming_pattern_2026_05_29.md)
- **⚠️ 디자이너 부재 (2026-05-22~)** — [정책+포인터, 항목 목록은 backlog로 일원화 (2026-05-25 검증)](./project_designer_pending.md) / [UI 결정 정책](./feedback_ui_designer_confirm.md)

## 진행 중 이슈
- **[이미지 첨부 누락 — 디코드 가드 추가, 원인 미확정 관측 중 (2026-05-23)](./project_image_attach_decode_guard_2026_05_23.md)** — 모바일 빈 File 추정, `img.decode()` 가드(`14ac498`/`026f302`), 백엔드 confirm 영속화 트랙 별개
- **[피드 contentPreview 줄바꿈 보존 — ✅ 해소 (2026-05-20)](./project_post_content_preview_newline_pending.md)** — 백엔드 \n 보존 확인 + develop 배포 정상. MSW 환원은 선택(무해)
- **[더보기 버튼 임시 파란색 (2026-05-20)](./project_more_button_color_temp.md)** — 본문 회색과 구분용 placeholder, 자체 결정 예정 (`PostCard.tsx:144`)
- **[PostListPage ref 렌더 중 접근](./project_postlistpage_ref_render_issue.md)** — React 19 에러, initialSnapshot 타이밍 미해결 (MVP 후 재개)
- [sticky offset 잔재 — ProfilePage:306](./project_sticky_offset_legacy_cleanup.md) — `(md:)?top-14` grep
- **PostWriteForm 잠재 flex 회귀 (모달 미발현)** — ConcernForm와 동일 모달 variant 패턴이나 콘텐츠 짧아 우연히 안 깨짐. 본문 길어지거나 viewport 축소 시 동일 스크롤 데드락. `flex-1 min-h-0` 선제 패치 검토 → wiki `modal-max-h-form-flex-1-min-h-0-...` (debugging, 2026-05-29)
- **[main↔develop 강제 동기화 (2026-05-11)](./project_main_develop_force_sync_2026_05_11.md)** — 백업 `main-backup-2026-05-11`, MVP 후 삭제
- **[이미지 업로드 재시도+로깅 cherry-pick → main (2026-05-28)](./project_cherry_pick_retry_logging_to_main_2026_05_28.md)** — e7ea9bb→477b68c(새 SHA), 추후 develop→main 머지 시 동일패치 중복 충돌 주의(develop본 채택=무손실)

## 기능명세
- [프론트 기능명세 FNC-001~009](./project_feature_spec_frontend.md)
- [프로필 편집 잔여 — 이미지 캐시 버스팅](./project_profile_edit_cleanup.md) — presigned URL 결정 대기
- [UX 설계 논의 아카이브](./project_ux_design_decisions.md)

## 정책 결정 (Post-MVP)
- 모바일 앱 ADR(PWA/Capacitor) → wiki `adr-pwa-vs-capacitor-2026-03-26` (decision)
- Next.js 도입 보류 → wiki `next-js-2026-03-27-2026-04-27` (decision)
- SEO 옵션 2 vite-prerender-plugin 완료 → wiki `seo-2-vite-prerender-plugin-2026-04-27` (decision)
- prerender 빌드 hang 해소 → wiki `vite-prerender-plugin-react-19-hang` (debugging)
- 프로필 이미지 localhost 버그(APP_BASE_URL) → wiki `url-localhost-app-base-url-2026-04-22` (debugging)
- SSE 아키텍처(옵션B, fetch-event-source) → wiki `sse-b-zustand-fetch-event-source` (decision)
- Google OAuth 삭제 → wiki `google-oauth-2026-03-25` (session-log)

## 개발 규칙 / 피드백
- **[최우선]** [구현 방식 = 하이브리드 (작업유형별 분담, 2026-05-26)](./feedback_direct_coding_default.md) — 기계적=AI작성+리뷰 / 새 로직=본인작성 / 항상 "왜" 재구성. AI작성은 `.claude/deadline-unlock`(4h) 필요, 위임 시 본인 touch
- **[Speed mode — 시간 압박 새 로직 = AI 우선 + Task 분할 (2026-05-29)](./feedback_speed_mode_ai_first_task_split.md)** — 학습 모드 보류, 사전 paste-ready 컨텍스트 → 수동 코드생성 → 사후 정정. direct_coding_default 예외
- **[최우선]** [pseudocode 의무화 + 막막함 프로토콜](./feedback_pseudocode_first_protocol.md)
- **[최우선]** [추상→코드 해상도 4단계 (학습 모드)](./feedback_abstract_to_code_resolution_levels.md) — 추상1 화면·행동 → 추상2 데이터모델·소유권 → 의사코드 → 코드. 사용자 직답 우선, AI 코드 선구상 금지
- **[최우선]** [큰 UI 변경 시 이해 컨펌 후 실행](./feedback_confirm_understanding_before_implement.md) — bullet+대조표
- **[최우선]** [트레이드오프 설명 필수](./feedback_tradeoff_before_code.md) / [클린 커밋 히스토리](./feedback_clean_commit_history.md)
- **[최우선]** [진단→이해→지시→조치 (과잉설명 금지)](./feedback_explain_before_act.md)
- **[최우선]** [단계 단위 가이드 제시](./feedback_step_by_step_guidance.md)
- **[Cursor 새 로직 가이드 = 복붙 가능한 작은 단위 평문 지시문](./feedback_cursor_paste_ready_units.md)** — blockquote/메타섹션 금지, diff 확인 후 다음 단위
- **[최우선]** [workaround 전 스펙 재확인](./feedback_verify_spec_before_workaround.md)
- **[백엔드 미확정 기능 = 뷰모델+로컬목으로 UI 선행, 추측계약 MSW 회피](./feedback_fe_ahead_of_backend_strategy.md)** — 와이어/통신부는 명세 후, 어댑터 격리
- **[최우선]** [단일 작업 집중 존중](./feedback_single_task_focus.md) — 곁가지는 notepad
- **[자가 리뷰 중 선제 행동 금지 (2026-06-02)](./feedback_no_run_ahead_during_self_review.md)** — "내가 리뷰할게" 신호 시 조사 멈추고 대기, 요청 시 검증만
- **[최우선]** [기능 작업 중 번들러/인프라 미수정](./feedback_scope_discipline_no_bundler_drift.md)
- **[최우선]** [UI 통일은 명시 항목만](./feedback_ui_unification_scope.md) — 주변 UI 추론 확장 금지
- [worktree base + gitignore 확인](./feedback_worktree_base_check.md)
- **[AI 작성 코드 → 인지부채 HIGH 메모리 의무](./feedback_ai_written_code_cognitive_debt.md)**
- [AI 코드 학습용 주석 워크플로우](./feedback_ai_code_learning_comments.md)
- **[AI 50%+ 작업 후 소크라테스식 Q&A](./feedback_learning_gap_socratic_checkin.md)**
- **[소크라테스 체크 형식 — 구체 API는 코드 발췌+키워드+변형 질문, React 모델은 추상 설명](./feedback_socratic_code_excerpt_pattern.md)**
- **[AI 응답 대기 10초+ 시 집중력 흐트러져 — 소크라테스 Q&A default ❌, 배치 모드 우선 (2026-05-28)](./feedback_ai_response_latency_focus.md)**
- **[React 개념 = 단일 비유 체계 누적 확장](./feedback_react_concept_layered_analogy.md)** — 집/우편함/메모/거주자 한 체계로 fiber·effect 전반, 재진술로 닫기
- **[학습 중에는 산출물보다 본인 이해 우선](./feedback_learning_mode_understanding_over_drafts.md)** — "잘 안 들어온다" 신호 시 줄 단위 검증+비유로 전환
- **[이해 안 된 표시 컴포넌트 = 임시 강제 렌더 시각 확인 패턴](./feedback_visual_check_temp_render_pattern.md)** — 호출부 없을 때 더미 props로 단독 렌더 → dev 확인 → `git restore` 원복(커밋 X)
- **[AI 산문 패턴 체크리스트](./feedback_ai_prose_patterns.md)** — em-dash·3의법칙·볼드콜론 등
- **[코드 설명은 파일:줄번호만, 본문에 코드 인라인 금지](./feedback_code_reference_path_line_only.md)** — 사용자가 IDE에서 직접 열어 보게
- **[이원 독자 문서 파일 분리](./feedback_audience_split_docs.md)** — PM/개발자 하이브리드 X
- **[한국어 ~합니다 통일](./feedback_korean_formal_tone_docs.md)**
- [MVP 코드 수정 기준](./feedback_mvp_fix_criteria.md) / [UI 자체 결정 정책 — 디자이너 부재 (2026-05-22)](./feedback_ui_designer_confirm.md)
- [grep 선행](./feedback_code_change_process.md) / [코드 생성 승인](./feedback_code_approval.md)
- [MSW는 백엔드 권한 시뮬레이션](./feedback_msw_simulates_backend_policy.md)
- **[Git 커밋 워크플로우 통합 — 한국어/서명금지/sync chore 금지/diff --stat/섞인 커밋 분리](./feedback_git_workflow.md)**
- [단계별 체크포인트 마이그레이션](./feedback_phased_migration_checkpoints.md) / [CSV 그때그때 수정](./feedback_api_review_approach.md)
- [navigate(-1) 금지](./feedback_navigate_back.md) / [모바일/데스크탑 UX 분기](./feedback_mobile_desktop_ux.md)
- [질문 객관식 vs 주관식](./feedback_question_style.md) / [불확실하면 질문](./feedback_ask_when_uncertain.md)
- [/wrap-up 세션 마무리](./feedback_session_bridge_removed.md) / [집중력↓ 간결](./feedback_concise_when_tired.md) / [notepad 자동 기록](./feedback_notepad_session_logging.md)
- **[피그마 협업 워크플로우 통합 — 스크린샷·PNG 2x / 링크=요구사항 / React export semantic 변환 / 아이콘 SVG 추출+트랩 4종](./feedback_figma_workflow.md)**
- **[노션 워크플로우 통합 — 업로드 승인·경로 / 날짜별 서브페이지 / 번호 fetch 확인 / 서브페이지 자기평가 / draft VSCode / /report-notion 재질문](./feedback_notion_workflow.md)** + [Notion 운영](./project_notion_page_policy.md)
- 노션 스킬 정리 → wiki `2026-04-15-report-notion` (session-log)
- [와이어프레임 색상 보수적](./feedback_wireframe_color.md) / [서버 에러 시 프론트 먼저](./feedback_backend_blame.md)
- **[백엔드 자기수정 후 FE 톤 — 결백 변론 빼고 검증 자청](./feedback_team_chat_no_defensive_framing.md)** — 협업 채널에서 blame 공방 회피, forward-looking 한 줄
- **[백엔드 "로깅 추가" 요청 = console-only vs 원격 수집(Sentry) 의도 먼저 확인](./feedback_clarify_logging_intent_console_vs_remote.md)** — 작업 규모 가르는 한 줄 확인 문구
- [compact/clear 타이밍](./feedback_compact_timing.md) / [TS tsc -b](./feedback_ts_type_check.md)
- [shadcn asChild 미지원](./feedback_shadcn_button_aschild.md) / [shadcn/ui 기본 사용](./feedback_shadcn_default.md)
- [브랜치 main/develop](./feedback_branch_preference.md) / [credentials 갱신](./feedback_github_credentials_renewal.md)
- [백엔드 이슈에 LLM 프롬프트](./feedback_backend_llm_prompt.md) / [슬래시 커맨드 스크립트 금지](./feedback_no_scripts_for_commands.md)
- [외부 push 전 승인](./feedback_push_requires_approval.md) / [push-airo reset --hard](./feedback_push_airo_claude_files.md)
- **[force-push 안전 프로토콜](./feedback_force_push_safety_protocol.md)** — 백업→양쪽 push→`--force-with-lease`
- **[다른 세션 변경은 건드리지 말기](./feedback_dont_touch_other_session_changes.md)**
- [규칙은 근본 원인 확인 후](./feedback_verify_rules_root_cause.md)
- **[fix 검증 시 baseline 측정 우선](./feedback_verify_fix_with_baseline.md)** — after-only 검증 금지
- **[분석 도구 환경 가드 grep 우선](./feedback_verify_analytics_env_gate_first.md)** — GA4/Clarity hostname/env 가드 추측 답변 금지, 사용자 자기 코드 기억이 우선
- **[권장 전 사용자 컨디션 평가](./feedback_assess_user_state_before_rule.md)**
- **[정체는 대부분 의욕 문제 — 떠먹이지 말고 설득+잘게 쪼개 추진력 (2026-06-02)](./feedback_unblock_by_persuasion.md)**
- **[보조 기능이 핵심 의존성 메이저 업 끌면 회피](./feedback_dependency_blast_radius.md)**
- [코드 리뷰 severity triage — HIGH만 즉시](./feedback_review_triage_workflow.md) / [/code-review high — 큰 변경 누적 후 검증](./feedback_code_review_ultra_high_usage.md)
- [가드/임시대응 주석 스타일](./feedback_guard_comment_style.md)
- **[vite plugin closeBundle 작업 전 wiki 검토](./feedback_vite_plugin_closeBundle_check.md)**
- **[브랜치별 스크립트 테스트 함정](./feedback_branch_aware_script_test.md)**
- [커맨드 범용 네이밍](./feedback_draft_notion_naming.md)
- **[API 에러 처리 통합 — 에러 삼키지 말기 + 원인별 분기(401 인터셉터/500/네트워크)](./feedback_error_handling.md)**
- [백엔드 필드 요청 전 스펙 확인](./feedback_backend_field_request_check.md) / [Explore 결과 검증](./feedback_explore_result_verification.md)
- [GitHub Issues 기술부채](./feedback_github_issues.md) / **[이슈 채널 Jira로 전환 (구 airo GitHub 이슈)](./feedback_airo_issues_only.md)** — 2026-05-19~
- [취업 경험 Notion](./feedback_career_documentation.md) / [Vercel SPA 라우팅](./feedback_vercel_spa_routing.md)
- **[다른 직군 영향 작업 먼저](./feedback_cross_role_impact_priority.md)**
- **[진행 상황은 backlog, memory엔 결정만](./feedback_memory_vs_backlog_split.md)**
- **[결정/구현 문서엔 한계점도 박제](./feedback_document_limitations_with_benefits.md)**
- **[블로그 전략 — Velog 주1+ Notion 재가공](./feedback_blog_writing_strategy.md)** / [쓰기/편집 모드 분리](./feedback_blog_editing_mode.md)
- **[Jira 이슈 생성 전 프로젝트 조회](./feedback_jira_project_query_first.md)**

## 공유 문서 / 레퍼런스
- **[분석 대시보드 (Search Console/GA4/Clarity)](./reference_analytics_dashboards.md)** — GA4 `G-7VPMPFL76M`, Clarity `wg3vefhmgy`
- **[피그마 디자인 시스템 페이지](./reference_figma_design_system_page.md)** — 노드 `1321:5320`, Education plan MCP rate limit
- **[Jira 프로젝트 — MEL=멜로미, BUR=burst!(별개)](./reference_jira_project_structure.md)**
- [팀 요구사항 Sheets](./reference_requirements_doc.md) / [Swagger UI](./reference_swagger_endpoint.md)
- [Swagger enum 전체 값 확인](./reference_swagger_enum_verification.md) / [백엔드 OpenAPI 엔드포인트](./reference_backend_swagger.md) / [백엔드 schema 명명(Therapy prefix)](./reference_backend_openapi_schema_naming.md)
- [Notion TIL](./reference_notion_til.md) / [빌더스 리그](./reference_notion_builders_league.md) / [트러블슈팅](./reference_notion_troubleshooting.md)

## 환경 / 도구
- [Claude Code aliases](./project_bash_aliases.md) / [플러그인+hook](./project_superpowers_plugin.md)
- [airo remote](./project_airo_repo.md) / [백업 레포](./reference_backup_repos.md) / [push-airo 스크립트](./project_push_airo_script.md)
- [메모리 동기화](./project_memory_sync.md) — `/push-mello`, `/pull-mello`, develop sync + 대량 삭제 가드
- [새 환경은 pull-mello 먼저](./feedback_new_env_pull_first.md)
- [포트폴리오](./project_portfolio_setup.md) / [Vercel 환경변수](./project_env_vars.md) / [.env.docker 이름](./project_env_docker_rename.md)
- [로컬 CORS 허용](./project_cors_local_suggestion.md) / [Vercel→AWS 이전 계획](./project_aws_migration_plan.md)
- [gh CLI 계정 GPCJ](./reference_gh_cli.md) / [MSW 래퍼](./project_msw_wrapper.md)
- .git object 손상 복구 → wiki `git-object-push-mello` (debugging)
- [Stop Hook 터미널 벨](./hook_bell_on_stop.md) — WSL, Mac 미동기화

## 학습 / 성장
- 프론트엔드 학습 19항목 → wiki `19` (reference) / [코딩 드릴](./project_coding_drill.md)
- **[블로그 초기 글 4편 로드맵](./project_blog_first_series.md)** — 바이브 코더 5규칙 / requestIdRef / RQ / AI 메모리
- GA4 + Clarity 학습 노트(인지부채 HIGH) → wiki `ga4-clarity-high-ai` (decision)
- **[RQ 마이그레이션 구현 로그 — 인지부채 HIGH](./project_rq_migration_implementation.md)** — R-01a/b 완료, R-05 미착수
- 유저 행동 수집 맥락 (개발자/PM) → wiki `ga4-clarity-dev` / `ga4-clarity-pm` (decision)
- **[GA4 user_id 정책 — analyticsId 드롭](./project_analytics_user_id_decision.md)** — 익명 유지(client_id only)
- **[/privacy 라우트 설계](./project_privacy_policy_page.md)** — Layout 밖 독립
- [README MVP 후](./project_readme_plan.md)

## 폴더 / 초안
- [프론트 폴더 구조 04-07](./project_folder_restructure.md) — components/pages 도메인별 하위
- [노션 업로드 대기 초안](./notion_draft.md) — `/pull-mello` 후 확인
- [Jira 에픽/스토리 초안](./jira_draft.md) — 프로젝트 키 `MEL` 재확인

## 메모리 관리
- [최적화 프로세스 — 토큰 절약형](./feedback_memory_optimization_process.md)
- [최근 push 시간은 git log로](./feedback_last_push_time.md)
- 2026-03 월별 회고 → wiki `2026-3-mvp` (session-log)
- **[장기 참고는 OMC wiki, auto-memory는 hot index만](./feedback_wiki_for_longform.md)** — `→ wiki <slug>` 표기 시 `wiki_query`로만 로드
