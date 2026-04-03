---
name: 메모리 대규모 최적화 (2026-04-03)
description: 21개 삭제, 6건 통합, MEMORY.md 220→130줄 — 삭제/통합 내역 참고용
type: project
---

2026-04-03 메모리 최적화 수행.

## 삭제 (21개) — 완료/구식/대체됨
project_deferred_welcome_message, project_code_learning, project_code_review, project_deployment_strategy, learning_axios_interceptor, project_backend_https, project_cors_proxy, project_verification_page_done, project_figma_plugin, project_deployment_status, project_welcome_flow_issue, project_notion_crud_axios, project_code_quality_issues, project_msw_preimpl_plan, project_fnc038_done, session_bridge, project_home_feed_redesign, project_code_detail_fixes, project_qa_improvements_0403, project_ui_redesign, project_backend_meeting

## 통합 (6건)
1. project_sse_notification_brainstorm → project_sse_architecture_decision에 흡수
2. project_signup_nickname_change + project_signup_nickname_temp → 1개로 통합
3. project_designer_workflow + project_designer_mobile_first → project_designer_pending에 흡수
4. project_shadcn_design + feedback_shadcn_default → feedback_shadcn_default 1개로 통합
5. project_feature_spec_auth_update → MEMORY.md 인라인으로 흡수 후 삭제
6. project_debug_hook → project_superpowers_plugin에 통합

## 결과
- 파일: ~125개 → 97개 / MEMORY.md: 220줄 → 130줄

**Why:** 200줄 제한 초과 + 완료/구식 파일 누적으로 인덱스 가독성 저하
**How to apply:** 삭제된 파일명을 실수로 참조하지 않도록 주의. 다음 최적화 시 이 목록 참고.
