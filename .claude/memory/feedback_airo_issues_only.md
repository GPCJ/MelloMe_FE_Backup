---
name: 이슈 채널은 Jira (구 airo GitHub 이슈에서 전환)
description: 백엔드 요청·버그 리포트는 Jira 티켓으로. GitHub 이슈(airo 포함)는 사용 중단.
type: feedback
originSessionId: 6ddff2ad-b5e4-45d6-8422-16a4eadb4382
---

## 현재 정책 (2026-05-19~)

**모든 이슈/백엔드 요청/버그 리포트는 Jira 티켓**으로 등록한다. GitHub 이슈(airo, 멜로미 모두)는 사용하지 않는다.

**Why:** 사용자가 2026-05-19에 명시 — "이슈는 이제 안올릴 것 같아. jira 티켓으로 이슈 공유하기 시작해서 github 이슈는 이제 안쓸듯."

**How to apply:**
- 백엔드 작업 요청·기능 요청·버그 리포트가 생기면 **`jira_draft.md` 최상단에 섹션 추가**
- 현재 사용 중인 계정은 Jira 미연결 → 사용자가 **다른 계정으로 로그인 후 Jira MCP로 생성** (또는 사용자가 다른 세션에서 직접 등록)
- LLM 친화 프롬프트 섹션은 그대로 포함 (`[[feedback_backend_llm_prompt]]`)
- 프로젝트 키 **MEL** — Jira 생성 전 `getVisibleJiraProjects`로 재확인

## 과거 정책 (대체됨)

- ~~2026-04-10 ~ 2026-05-18: airo 레포(AIRO-offical/therapist_community_FE) GitHub 이슈로 단일화~~
- ~~그 이전: 멜로미 + airo 두 레포 동시 생성 (`feedback_github_issues_dual_repo.md`)~~

## 관련

- Jira 초안 파일: `jira_draft.md`
- Jira 프로젝트 조회 정책: [[feedback_jira_project_query_first]]
- LLM 프롬프트 포함 규칙: [[feedback_backend_llm_prompt]]
