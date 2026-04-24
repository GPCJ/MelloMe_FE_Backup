---
name: Jira 이슈 생성 전 프로젝트 목록 조회 필수
description: Jira MCP로 이슈 생성 전 반드시 전체 프로젝트 조회 후 올바른 프로젝트 확인
type: feedback
---

Jira 이슈 생성 전 반드시 `getVisibleJiraProjects`로 전체 프로젝트 목록을 먼저 조회하고 올바른 프로젝트에 생성할 것.

**Why:** 2026-04-24 MEL 프로젝트 미확인 상태에서 BUR에 이슈를 잘못 생성 → 삭제 후 재생성하는 번거로움 발생.

**How to apply:** 이슈 생성 요청이 오면 프로젝트 키를 확신할 수 없는 경우 먼저 프로젝트 목록 조회 후 진행.
