---
name: worktree 생성 시 base 브랜치 확인 필수
description: EnterWorktree 도구는 기본 origin/main에서 분기 — 사용자가 develop에서 작업 중이면 잘못된 base
type: feedback
originSessionId: a1e801b6-8b86-45e8-a113-36492475ec6e
---
EnterWorktree 도구는 기본값으로 `origin/<default-branch>` (=`origin/main`)에서 worktree 분기를 만듭니다. 사용자 작업 흐름이 `develop` 이면 main 기준 worktree는 develop 최신 커밋이 빠진 stale 상태로 시작됩니다.

**Why:** 2026-05-10 세션에서 PC 작성 모달 구현하려고 worktree 만들었는데 base가 main(0770f00)이라 develop의 7+ 커밋(CH-02 비인증 차단 카드, presigned 3단계 업로드 마이그레이션, useWelcomeModal 훅, chrome 통일 등)을 모두 누락. 빌드/타입 체크 통과해도 런타임 회귀(`PostListPage:402 Cannot read properties of undefined (reading 'id')`) 발생. 결국 새 브랜치 + cherry-pick으로 develop 위에 옮겨 충돌 해소 필요.

**How to apply:**
- worktree 만들기 전 `git branch --show-current`로 작업 흐름 확인
- 메인 작업 브랜치가 `develop`이면 worktree 만든 직후 `git log --oneline -3 origin/develop` 으로 base가 develop tip인지 검증
- 다르면 즉시 `git checkout -b <new-name> origin/develop`으로 base 교체 (또는 worktree 다시 만들기)
- 작업 끝낸 뒤 cherry-pick 정리하는 비용보다 시작 시점 base 검증이 훨씬 쌈
