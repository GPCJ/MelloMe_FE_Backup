---
name: project_playwright_e2e_setup_2026_06_10
description: Playwright E2E 도입 — 팔로우 셀프 QA 자동화 시도. WSL 시스템 라이브러리(libnspr4 등) 누락 → install-deps. 명령어 분해 + 인과 사슬. 노션 초안 후보
metadata: 
  node_type: memory
  type: project
  originSessionId: 63e114a1-d27c-4231-ae36-e5a6cf92bc1e
---

# Playwright E2E 자동화 도입 (2026-06-10)

> 노션 기록 후보(학습 로그/TIL). 작성 맥락: 팔로우 기능을 팀 QA 없이 **셀프 검증**해 main 머지하려고, 손클릭 대신 자동 브라우저 테스트(Playwright)를 처음 도입하다 WSL 시스템 라이브러리 문제를 만남.

## 왜 시작했나 (인과 사슬)
1. 팔로우 기능(목록·토글·탭) staging QA가 팀 여력 부족으로 안 들어옴 → **셀프 검증으로 prod(main) 올리기로 결정** ([[project_follow_feature]]).
2. 셀프 검증 신뢰도를 높이려 손클릭 대신 **Playwright로 자동화** 시도(사용자가 평소 관심 있던 도구라 학습 겸).
3. 도입 방식 = **임시 학습 스펙**(uncommitted, 끝나면 `git restore`로 레포 미오염). 정식 devDep 자산화는 별도 PR로 분리.

## Playwright란
- **코드로 실제 브라우저(chromium 등)를 띄워 클릭·입력·검증을 자동화**하는 E2E 테스트 도구. 사람이 클릭하던 회귀 검증을 스크립트로 재현.
- 구성 2단계: ① `@playwright/test` = npm 라이브러리(테스트 러너+API). ② `playwright install chromium` = **브라우저 본체 바이너리** 다운로드(~수백 MB, `~/.cache/ms-playwright/`).

## 만든 산출물 (임시, frontend/)
- `playwright.config.ts` — testDir `e2e`, `baseURL http://localhost:3000`, `headless:false`(WSLg `DISPLAY=:0`로 눈에 보이게), `slowMo:600`, screenshot/video/trace on.
- `e2e/follow.spec.ts` — staging 백엔드(`api-staging`, dev의 `.env.local`이 이김) 대상 3 테스트:
  - `#1` 로그인 후 홈피드 게시글 렌더(Hot Path smoke). PostCard=`a[href^="/posts/"]`.
  - `#9` 팔로우 탭 전환 → 글(`a[href^=/posts/]`) 또는 빈 placeholder("팔로우한 치료사의 글이 아직 없어요.") 중 하나 렌더(회귀 없음).
  - `#6` `/follow` 팔로잉 탭 언팔 토글 = **정책 A**(행 수 유지 `ul li` 카운트 불변 + 버튼 "팔로우"로 flip) → **재팔로우로 상태 복원**(staging 데이터 무손실 + 재팔로우 경로 동시 검증).
  - 로그인 헬퍼: `/login` → `#email`/`#password` fill → "로그인" 버튼 → `/login` 벗어남 대기.
- 계정(staging): `FEtest@test.com`/`test1234`(인증완료), `FEtest1@test.com`(인증완료, #10 실시간용), `FEuser@test.com`/`TEST1234`(USER 롤). pw 평문이라 노션엔 계정값 제외.

## 막힌 지점 = WSL 시스템 라이브러리 누락
- 첫 실행 시 3 테스트 모두 **테스트 로직 도달 전 브라우저 launch 실패**:
  `chrome: error while loading shared libraries: libnspr4.so: cannot open shared object file`
- 원인: chromium **본체는 받았지만**, 그게 의존하는 **리눅스 공유 라이브러리**(libnspr4/libnss3/libasound2 등)가 최소설치 WSL엔 없음. Playwright의 흔한 첫-설치 이슈. 앱·스펙 결함 아님.

## 해결 명령어 (진짜 터미널에서, sudo)
```
cd /home/jin24/MelloMe_FE_Backup/frontend && sudo env "PATH=$PATH" npx playwright install-deps chromium
```
- `npx playwright install-deps chromium` — chromium이 필요로 하는 **OS 라이브러리 목록을 `apt-get`으로 설치**(Playwright가 목록을 앎).
- `sudo` — 시스템 전역 패키지라 관리자 권한 필요.
- `env "PATH=$PATH"` — sudo가 보안상 PATH를 비워 node/npx를 못 찾는 것 방지(현재 PATH 명시 전달).
- **진짜 터미널 필요** — Claude Code `!` 프리픽스는 TTY가 없어 sudo 비번 프롬프트 불가(`sudo: a terminal is required`). 앞서 비-sudo `touch`/alias가 됐던 것과 대비.

## 곁가지로 박힌 것
- `deadline-guard.sh`가 AI 코드 생성 차단 → unlock = `touch $PROJECT_DIR/.claude/deadline-unlock`(레포 루트 고정, 4h). 안내는 **절대경로**로 ([[feedback_absolute_path_in_shell_guidance]], `mel-unlock` alias).

## 세션 후반 추가 (실행하며 만난 것)
- **WSL 비번 분실 복구** — sudo install-deps에 비번 필요한데 사용자가 잊음. 복구 = **Windows 터미널**(WSL 안 아님)에서 `wsl -u root`(비번 없이 root 진입) → `passwd jin24`(새 비번) → exit. 이후 진짜 WSL 터미널에서 sudo 재시도. (재사용 가능한 env 트릭)
- **networkidle 대기 금지** — 이 앱은 알림 SSE(fetch-event-source)가 **상시 연결**이라 네트워크가 절대 idle 안 됨 → `page.waitForLoadState('networkidle')`가 30s 타임아웃. 이미지 load/onError 대기는 고정 `page.waitForTimeout(2000)`으로 대체. (모든 e2e 공통 함정)
- **2회 네비 테스트 flake** — #8(/follow + post 상세 2회 이동 + SSE 지연)이 기본 30s 타임아웃에 간헐 걸림 → `test.slow()`(타임아웃 ×3)로 해소.
- **headed 동작 확인** — `DISPLAY=:0`(WSLg)로 headed 정상, slowMo 600으로 눈에 보임.

## 결과 / 종결
- **최종 5/5 통과** (staging): #1 피드 렌더 / #9 팔로우 탭 / #2 뒤로가기 스크롤 복원(Hot Path 회귀 무탈) / #8 아바타 `[avatar]`경고0(F-14 fix 확인)+작성자 드롭다운 팔로우 / #6 언팔 정책A+재팔로우 복원.
- 스펙=**throwaway로 git restore**(레포 미오염). 정석은 별도 PR로 devDep 자산화(미진행).
- 그 뒤 **develop→main 머지 `5654a96` prod 배포**(충돌 없음·tsc OK). cherry-pick dupes는 자동 처리됨([[project_cherry_pick_retry_logging_to_main_2026_05_28]] 우려는 미발생). 머지 정당화 프레임 [[feedback_selfqa_merge_gate]].
- 미자동화=#3필터/#4fallback/#5리액션캐시(저위험·기리뷰)·#10실시간(2계정 수동).
