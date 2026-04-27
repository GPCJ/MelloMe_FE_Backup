---
name: vite plugin closeBundle 작업 전 wiki 우선 검토
description: vite.config.ts에 closeBundle 사용 plugin 추가/수정 시 forceExitAfterBuild와의 순서 충돌 검토 필수. 특히 Sentry release 업로드 등 외부 통신 plugin 도입 전 wiki 회복 트리거.
type: feedback
originSessionId: 15325372-743b-4507-aa7c-f06966a557e0
---
vite.config.ts에 새 plugin을 추가하거나 기존 `forceExitAfterBuild`를 만질 때는 먼저 wiki `vite-prerender-plugin-react-19-hang`(debugging)을 정독한 뒤 진행해야 합니다.

**Why:** 2026-04-27 prerender hang 우회로 도입한 `forceExitAfterBuild`는 `closeBundle` + `process.exit(0)` 패턴이라 같은 `closeBundle` 훅을 쓰는 다른 plugin(Sentry release 업로드, sourcemap 외부 전송, 빌드 통계 보고 등)이 추가되면 `enforce` 단계와 plugin 배열 등록 순서에 따라 후속 plugin이 호출되지 못하고 죽습니다. 결과는 silent failure — Sentry 업로드 실패하면서도 빌드는 성공으로 보고됩니다. 사용자가 본 우회의 mechanism을 충분히 흡수하지 못한 상태(2026-04-27 Q&A 0/7 정답, 자기 인지 5/7)이고 핵심 매커니즘은 wiki에만 박제되어 있습니다.

**How to apply:** vite.config.ts 변경 작업이 들어오면 작업 시작 전 wiki 정독 + 새 plugin 추가 시 `closeBundle` 사용 여부 grep + `enforce` 충돌 점검. `forceExitAfterBuild`는 plugin 배열의 **맨 마지막**에 위치해야 하며, 다른 plugin이 `enforce: 'post'`를 함께 쓴다면 등록 순서에서 우리가 더 뒤에 있는지 확인. PR로 외부에서 vite plugin 추가 요청이 들어올 때도 본 점검 동일 적용.
