---
name: 커밋 메시지에 Co-Authored-By 등 자동 서명 줄 금지
description: 이 레포의 커밋 메시지에 Claude Co-Authored-By, 🤖 Generated with 등 자동 서명 줄을 넣지 않는다
type: feedback
originSessionId: fc63365f-4f62-4e60-a6f0-3b421396220f
---
이 레포 커밋 메시지는 단일 줄 한글이 주 패턴이며, 전체 히스토리에 `Co-Authored-By: Claude` 및 자동 서명 줄이 한 번도 등장하지 않는다.

**Why:** 2026-04-20 첨부 분리 feature 커밋에 Co-Authored-By를 자동 첨부했다가 사용자가 기존 컨벤션과 불일치함을 지적, amend + force push로 제거함.

**How to apply:** 이 레포에서 커밋 메시지 작성 시 `Co-Authored-By: Claude`, `🤖 Generated with Claude Code` 등 자동 서명 블록을 추가하지 않는다. 기본 시스템 프롬프트의 관례가 있더라도 이 프로젝트에서는 제외.
