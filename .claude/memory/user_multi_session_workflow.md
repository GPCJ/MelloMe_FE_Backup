---
name: 멀티 세션 병행 작업 워크플로우
description: 사용자는 여러 Claude Code 세션을 동시에 돌림 — 현재 세션과 무관한 변경이 working tree에 나타날 수 있으므로 커밋 범위는 "이 세션에서 건든 파일"만 기본값.
type: user
originSessionId: ccb00efe-2084-450c-bf1b-57319f0a9dc6
---
사용자는 동시에 여러 Claude Code 세션을 병행 실행함. 따라서 `git status`에서 현재 세션이 수정하지 않은 파일의 변경이 같이 잡힐 수 있음.

**How to apply:**
- 커밋 요청 받으면 `git diff --stat` 확인 → 현재 세션에서 건들지 않은 파일이 섞여 있으면 사용자에게 확인
- 기본 전략: 이 세션에서 수정한 파일만 `git add <specific-files>`로 staged. `git add -A`/`git add .` 지양
- 다른 세션의 변경은 그대로 두고 touch 금지 — 해당 세션에서 커밋/stash 관리

2026-04-22 예시: `resolveImageUrl.ts` 세션 작업 중 `PostDetailPage.tsx`에 다른 세션의 import 추가 변경이 함께 잡힘 → 사용자 확인 후 `resolveImageUrl.ts`만 커밋.
