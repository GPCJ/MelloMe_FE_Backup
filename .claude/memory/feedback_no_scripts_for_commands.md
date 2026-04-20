---
name: 슬래시 커맨드 요청 시 스크립트 파일 별도 생성 금지
description: 슬래시 커맨드만 요청했을 때 scripts/ 파일을 함께 만들지 말 것
type: feedback
---

슬래시 커맨드 생성 요청 시 `.claude/commands/` 파일만 만들 것. 별도 스크립트 파일(scripts/*.sh 등)은 만들지 말 것.

**Why:** 사용자가 push-airo 슬래시 커맨드 요청 시 scripts/push-airo.sh를 함께 작성하려 하자 직접 중단하고 커맨드 파일만 만들라고 교정함.

**How to apply:** "슬래시 커맨드 만들어줘" 요청 시 `.claude/commands/*.md` 파일만 생성. 스크립트가 필요하면 사용자가 따로 요청할 것.
