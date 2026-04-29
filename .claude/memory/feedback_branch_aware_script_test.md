---
name: 브랜치별 스크립트 테스트 함정 — working tree 회귀
description: 패치된 스크립트가 한 브랜치에만 있을 때 다른 브랜치 checkout 시 working tree가 OLD 버전으로 회귀하는 함정
type: feedback
created: 2026-04-29
originSessionId: 5675044e-f887-4f9b-b8dc-a0b07f4a86ee
---
스크립트(특히 `scripts/` 하위)를 한 브랜치에서 패치하고 다른 브랜치로 checkout하면 working tree가 그 브랜치 commit의 상태로 갱신되어 패치가 사라집니다. 그 상태로 스크립트를 실행하면 OLD 동작이 나와 사고로 이어질 수 있습니다.

**Why:** 2026-04-29 `memory-sync.sh`를 develop에 패치 + commit + push 후 "다른 브랜치(main)에서도 잘 동작하나 테스트해봐야지"라며 main으로 checkout. main에는 패치가 없으니 working tree의 스크립트가 OLD 버전으로 회귀. 그 상태에서 push-mello 실행 → OLD 스크립트가 main 직접 push 수행 → "main 직접 push 금지" 정책 위반. force-push로 회복.

**How to apply:**
- 스크립트 변경 + 검증은 같은 브랜치에서 반복 (다른 브랜치로 옮겨가며 테스트 금지).
- 모든 사용 브랜치에 스크립트 동시 반영이 필요하면 cherry-pick / merge로 명시적 동기화 후에야 그 브랜치에서 테스트.
- 실험적 변경이면 commit 안 한 상태로 한 브랜치에서만 검증하고, 만족 시 정식 commit.
- Vercel 같은 배포 자동화도 동일 함정 — main이 OLD 코드로 빌드되는 상황 항상 인지.
- 사고 발생 시 회복: `git reset --hard <safe-sha> && git push --force origin <branch>`. destructive이므로 사용자 명시 승인 필수.

## 관련 메모리

- `feedback_branch_preference.md` — main(prod) + develop(staging) 2브랜치 정책
- `project_memory_sync.md` — develop 브랜치 sync 전환 (본 사고로 추가된 헬퍼 함수 동작 정의)
- `feedback_direct_coding_default.md` — 인프라/툴링 코드 예외 (스크립트 작성 위임 정책)
