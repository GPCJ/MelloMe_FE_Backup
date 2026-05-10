---
name: 기능 작업 중 번들러/인프라 설정 건드리지 말기
description: 빌드 에러/로컬 검증 이슈를 핑계로 vite.config 등 인프라 파일 수정 금지 — 스코프는 요청된 파일 변경에 한정
type: feedback
originSessionId: a1e801b6-8b86-45e8-a113-36492475ec6e
---
기능 작업(예: PC 모달 분리) 도중 빌드가 안 되거나 로컬 검증이 막힌다고 해서 `vite.config.ts`, `package.json`, `tsconfig` 같은 번들러/인프라 설정을 임의로 수정하지 말 것. 작업 스코프는 사용자가 요청한 기능에 해당하는 파일 수정으로 한정.

**Why:** 2026-05-10 세션에서 PC 작성 모달 구현 후 worktree에서 `vite build`가 prerender + forceExit 상호작용으로 silently 종료. 이걸 디버깅하면서 `vite.config.ts`의 `forceExitAfterBuild` 플러그인을 건드리려다 사용자에게 "번들은 건들지 마, 변경 사항만 새 브랜치로 옮겨줘" 컷오프 받음. 빌드 깨진 건 develop 기준 별개 이슈일 가능성 + 로컬 환경(worktree node_modules drift) 문제일 수도. 어떤 경우든 기능 PR에 끌고 들어갈 변경이 아님.

**How to apply:**
- 빌드/CI 깨짐을 발견해도 기능 브랜치 안에서 고치지 말고, 별도 이슈/브랜치로 분리해서 사용자에게 보고
- 로컬 검증이 막히면 "검증 못 함" 명시하고 PR 단계 또는 CI에서 확인하도록 넘기기 — 무리하게 fix 시도 금지
- 의심 후보가 인프라 설정이면 사용자에게 먼저 "이거 건드려도 되나?" 컨펌 받기
- 확장 적용: ESLint/Prettier 설정, CI 워크플로, Docker compose 등도 동일 원칙
