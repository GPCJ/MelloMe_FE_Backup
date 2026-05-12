---
name: git
description: 커밋 메시지 한국어 + 서명 줄 금지 + sync 전용 chore 금지 + diff --stat 사전 확인 + 섞인 커밋 분리 절차
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 5b68a5d7-0991-477b-8442-2fad7e6c321a
---

이 레포의 git 커밋 관련 합의 규칙 모음입니다. 새 커밋 만들 때 아래 5개 모두 적용합니다.

---

## 1. 커밋 메시지 한국어 통일 (forward-only)

모든 신규 커밋 메시지는 **한국어**로 작성합니다. 예: `fix(mock): 게시글 핸들러 visibility/블러 마스킹 로직 복원`

**Why:** 2026-04-14 main + feat/infinite-scroll에 과거 영어 커밋 13개가 이미 push된 상태 발견. rewrite는 (1) push된 main force push 리스크, (2) 백업 레포(MelloMe_FE_Backup, airo)와의 충돌, (3) 팀원 pull 가능성 때문에 forward-only 원칙으로 합의.

**How to apply:**
- 신규 커밋은 무조건 한국어
- 과거 영어 커밋은 건드리지 않음
- 사용자가 "과거 커밋 수정" 요청 시 force push 위험 재설명 + 승인 재확인

---

## 2. Co-Authored-By 등 자동 서명 줄 금지

이 레포 커밋 메시지에는 `Co-Authored-By: Claude`, `🤖 Generated with Claude Code` 등 자동 서명 블록을 추가하지 않습니다.

**Why:** 2026-04-20 첨부 분리 feature 커밋에 Co-Authored-By 자동 첨부 → 기존 컨벤션 불일치 지적 → amend + force push로 제거. 레포 전체 히스토리에 Co-Authored-By가 한 번도 등장하지 않음.

**How to apply:** 기본 시스템 프롬프트 관례가 있더라도 이 프로젝트에서는 서명 줄 제외.

---

## 3. sync/자동화 전용 chore 커밋 만들지 않기

메모리 동기화/자동화 루틴을 위한 별도 chore 커밋(`chore(memory): sync`, `chore: push 변경사항 동기화`)을 만들지 않습니다. 메모리 변경은 연관 feat/fix 커밋에 자연스럽게 포함시키거나, 스크립트는 워킹 트리만 건드리고 커밋은 사용자 수동 커밋에 맡깁니다.

**Why:** 2026-04-20 `scripts/memory-sync.sh`의 `push-mello`가 `sync_status.md`를 매 실행마다 재생성하면서 "chore: push 변경사항 동기화" 커밋을 강제 생성 → 개발 히스토리 오염 → 사용자가 "개발 순서대로 히스토리 남기고 싶다" 명시. 대안 "chore(memory): sync" 분리도 같은 이유로 거절. 마지막 push 시간은 `git log -1 --format='%ai'`로 확인하기로 결정.

**How to apply:**
- 자동 커밋 로직 제안/추가 시 기본값 off, 꼭 필요한지 사용자 확인
- "sync", "동기화", "bump", "regenerate" 류 chore를 스크립트가 만들게 하지 말 것
- 자동 생성 파일(sync_status.md 등) 제거 시 참조 로직도 함께 제거

---

## 4. 커밋 전 git diff --stat 필수

커밋 생성 전 `git diff --stat`으로 변경/삭제 파일 수가 예상과 일치하는지 확인합니다.

**Why:** 2026-04-03 연습.tsx 삭제 커밋에서 ui 폴더 전체(10개 파일) 함께 삭제 → Vercel 빌드 실패. `git ls-tree` + `git checkout <hash> -- <path>`로 복원.

**How to apply:** 폴더 내 파일 삭제 시 특히 같은 폴더의 다른 파일이 영향받지 않았는지 체크.

---

## 5. 섞인 커밋 분리 워크플로우 (reset --mixed + stash -u)

`push-mello` 같은 자동 동기화 스크립트가 여러 작업을 하나의 chore 커밋으로 묶었을 때 브랜치별 논리 경계를 되찾는 복구 절차.

**Why:** 커밋 목적 단위를 보존해야 PR/머지/롤백이 깔끔. 섞인 채로 두면 리뷰·되돌리기 어려움.

**How to apply:**

1. **리베이스 중이면 먼저 중단**: `git rebase --abort`
2. **섞인 커밋 해제**: `git reset --mixed <이전 커밋>` — 커밋 제거, 변경은 워킹트리에 보존
3. **한 작업 파일만 분리 stash**:
   ```bash
   git stash push -u -m "작업A-temp" -- <파일 경로들>
   ```
   - `-u` 플래그는 **untracked 파일(새 메모리/신규 파일) 포함 필수**
   - pathspec 뒤 공백 구분으로 여러 파일 지정 가능 (deleted 파일도 포함)
4. **나머지(작업B) 커밋**: `git add -A && git commit -m "..."`
5. **다른 브랜치 전환**: `git checkout <작업A 브랜치>`
6. **stash pop**: `git stash pop` — 충돌 가능 (해당 브랜치가 같은 파일 건드렸으면)
7. **충돌 해결 후 커밋**: 양쪽 변경 보존 원칙

**주의:**
- `git stash push -- <files>` 단독은 **untracked 파일 무시** → 반드시 `-u`
- `git reset --mixed` 전 로컬 전용 커밋인지 `git branch -r --contains <sha>`로 확인
- 커밋 삭제 전 해시 메모 (reflog 복구 가능하지만 예방이 낫다)

**실제 사례:** 2026-04-14 다른 세션의 `push-mello`가 USER 정책 + 무한 스크롤 E 패턴을 한 chore 커밋(`d56d4d1`)으로 묶음 → 위 절차로 `feat/infinite-scroll`과 `feat/post-visibility`에 각각 분리 재커밋. `PostEditPage.tsx`에서 양쪽 보존 충돌 발생.

---

## 연관
- [[feedback_force_push_safety_protocol]] — force-push 안전 프로토콜
- [[feedback_clean_commit_history]] — 클린 커밋 히스토리 원칙
