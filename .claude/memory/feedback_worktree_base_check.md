---
name: worktree 생성 시 base 브랜치 + gitignore 항목 확인 필수
description: EnterWorktree 도구 기본 origin/main 분기 + .env 등 gitignore 항목은 worktree마다 따로 복사 — 둘 다 시작 시점 체크리스트
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

## .env 등 gitignore 항목도 worktree마다 따로 복사

worktree 생성 시 git이 추적하는 파일은 자동으로 따라오지만 `.gitignore`에 들어간 파일(`.env`, `.env.local`, `node_modules` 등)은 worktree 디렉토리에 복사되지 않습니다. 메인 repo의 환경변수 파일이 worktree에 없으면 axios baseURL 같은 환경 의존 코드가 undefined로 떨어져 런타임에 가서야 문제가 드러납니다.

**Why:** 2026-05-10 세션에서 worktree base를 develop으로 옮긴 뒤에도 `/posts` 흰 화면이 재발했습니다. 진단해보니 worktree에 `.env*` 파일이 없어 `VITE_API_BASE_URL`이 undefined → axios baseURL 부재 → 모든 API 호출이 vite 기본 origin(`localhost:3000`)을 쓰는데 vite proxy가 `/api`만 매치해서 `/posts/feed` 같은 경로는 SPA fallback(`index.html`)을 받음. fetchFeed가 HTML 문자열을 받으니 `pages.flatMap(p => p.items)`에서 `p.items`가 undefined가 되어 PostListPage map이 폭발했습니다. base 검증과 별개로 한 단계 더 있어야 했던 체크리스트입니다.

**How to apply:**
- worktree 생성 직후 `cp <main-repo>/frontend/.env <main-repo>/frontend/.env.local <worktree>/frontend/`로 메인 repo의 env 파일 복사
- 일반화: `git ls-files --others --ignored --exclude-standard`로 메인 repo의 gitignore된 파일 목록 확인 → 그중 환경 파일(`.env*`)은 worktree에도 복사
- npm install도 worktree마다 따로 (메인 repo node_modules symlink는 vite `server.fs.allow` 깨뜨림)
- 검증: dev 서버 띄우고 첫 API 호출 응답이 200 + JSON인지 확인 (HTML이면 SPA fallback 의심)
