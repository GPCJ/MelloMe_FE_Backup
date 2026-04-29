#!/usr/bin/env bash
# Claude 메모리 ↔ MelloMe_FE_Backup 레포 동기화 스크립트

set -e

# 환경 자동 감지 (macOS vs WSL2)
if [ -d "/Users/jin/MelloMe_FE_Backup" ]; then
  PROJECT_REPO="/Users/jin/MelloMe_FE_Backup"
  MEMORY_SRC="/Users/jin/.claude/projects/-Users-jin-MelloMe-FE-Backup/memory"
elif [ -d "/Users/jin/my-project" ]; then
  PROJECT_REPO="/Users/jin/my-project"
  MEMORY_SRC="/Users/jin/.claude/projects/-Users-jin-my-project/memory"
else
  PROJECT_REPO="/home/jin24/MelloMe_FE_Backup"
  MEMORY_SRC="/home/jin24/.claude/projects/-home-jin24-MelloMe-FE-Backup/memory"
fi
MEMORY_IN_REPO="$PROJECT_REPO/.claude/memory"

if [ ! -d "$PROJECT_REPO/.git" ]; then
  echo "❌ 프로젝트 레포를 찾을 수 없습니다: $PROJECT_REPO"
  exit 1
fi

# 빈 소스 가드 — MEMORY_SRC가 비어있으면 rsync --delete로 레포 메모리가 통째로 날아감 (2026-04-20 사고 전례)
guard_memory_src_not_empty() {
  local src_count
  src_count=$(find "$MEMORY_SRC" -type f 2>/dev/null | wc -l)
  if [ "$src_count" -lt 5 ]; then
    echo "❌ 메모리 소스가 비어있어 보입니다 ($MEMORY_SRC: $src_count 파일)."
    echo "   새 환경이면 먼저 'pull-mello'를 실행하세요."
    exit 1
  fi
}

# 대량 삭제 감지 — 로컬이 레포보다 현저히 적으면 2차 사고 방지 (2026-04-20 2차 사고 교훈)
# 로컬 < 레포 * 0.5 이면 abort. FORCE_PUSH=1 로 우회 가능.
guard_no_mass_deletion() {
  local src_count repo_count threshold
  src_count=$(find "$MEMORY_SRC" -type f 2>/dev/null | wc -l)
  repo_count=$(find "$MEMORY_IN_REPO" -type f 2>/dev/null | wc -l)

  # 레포에 메모리 자체가 없으면(초기 세팅) 체크 스킵
  if [ "$repo_count" -lt 5 ]; then return 0; fi

  # 임계치: 레포의 50%
  threshold=$((repo_count / 2))
  if [ "$src_count" -lt "$threshold" ]; then
    if [ "$FORCE_PUSH" = "1" ]; then
      echo "⚠️  대량 삭제 경고: 로컬 $src_count < 레포 $repo_count (50% 임계치 $threshold)"
      echo "   FORCE_PUSH=1 이라 계속 진행합니다."
      return 0
    fi
    echo "❌ 대량 삭제 감지: 로컬($src_count 파일) < 레포($repo_count 파일)의 50%($threshold)"
    echo "   push 하면 레포 메모리가 대량 삭제됩니다."
    echo "   의도한 작업이라면 FORCE_PUSH=1 ./scripts/memory-sync.sh push-mello 로 다시 실행하세요."
    echo "   새 환경/일부 파손 상태라면 먼저 'pull-mello'로 복구하세요."
    exit 1
  fi
}

# 메모리 sync는 항상 develop 대상으로 작동 (2026-04-29 정책 갱신).
# 2브랜치 정책(main=prod, develop=staging)에서 일상 작업=develop 원칙에 맞춰 메모리 sync도 develop으로 통일.
# main은 코드 PR merge 흐름으로만 갱신 (memory sync로 main에 직접 커밋 안 함).
# 현재 브랜치가 develop이 아니면 임시 전환 + 미커밋 변경분 stash → 종료 시 복귀 + pop.
ensure_on_develop() {
  ORIG_BRANCH=$(git rev-parse --abbrev-ref HEAD)
  STASHED=0
  if [ "$ORIG_BRANCH" != "develop" ]; then
    if ! git diff --quiet HEAD || [ -n "$(git ls-files --others --exclude-standard)" ]; then
      git stash push -u -m "memory-sync-auto-$(date +%s)" >/dev/null
      STASHED=1
    fi
    git checkout develop
    echo "ℹ️  $ORIG_BRANCH → develop 임시 전환 (메모리 sync는 항상 develop 대상)"
  fi
}

restore_orig_branch() {
  if [ "$ORIG_BRANCH" != "develop" ]; then
    git checkout "$ORIG_BRANCH"
    if [ "$STASHED" = "1" ]; then
      git stash pop || echo "⚠️  stash pop 충돌. 'git stash list'로 확인 후 수동 처리하세요."
    fi
    echo "ℹ️  원래 브랜치($ORIG_BRANCH)로 복귀"
  fi
}

case "$1" in
  push-mello)
    echo "📤 메모리 → 레포 sync 후 push 중..."
    cd "$PROJECT_REPO"
    ensure_on_develop
    # rsync 전에 레포 상태가 필요하므로 pull 먼저 (push-mello 기존 흐름에선 commit 후 pull이었는데,
    # 대량 삭제 가드는 rsync 실행 전 레포 파일 수를 알아야 정확하니 순서 조정)
    # --autostash: 스크립트 자체/코드 미커밋 변경이 있어도 rebase 가능하도록 임시 stash
    git pull --rebase --autostash origin develop
    guard_memory_src_not_empty
    guard_no_mass_deletion
    # 로컬 메모리 → 레포 내 메모리 폴더로 복사 (sync_status.md도 일반 메모리로 취급)
    mkdir -p "$MEMORY_IN_REPO"
    rsync -a --delete --exclude='.git' "$MEMORY_SRC/" "$MEMORY_IN_REPO/"
    # 모든 변경사항(코드 + 메모리)을 하나의 커밋으로
    git add -A
    if git diff --cached --quiet; then
      echo "ℹ️  변경 사항 없음."
    else
      git commit -m "${COMMIT_MSG:-chore: push 변경사항 동기화 $(date '+%Y-%m-%d %H:%M')}"
    fi
    git push origin develop
    restore_orig_branch
    echo "✅ push 완료."
    ;;
  pull-mello)
    echo "📥 레포 → 메모리 pull 중..."
    cd "$PROJECT_REPO"
    ensure_on_develop
    git pull --rebase origin develop
    if [ -d "$MEMORY_IN_REPO" ]; then
      mkdir -p "$MEMORY_SRC"
      rsync -a --delete "$MEMORY_IN_REPO/" "$MEMORY_SRC/"
      echo "✅ pull 완료. 메모리 업데이트됨."
    else
      echo "⚠️  레포에 메모리 디렉토리가 없습니다: $MEMORY_IN_REPO"
    fi
    restore_orig_branch
    ;;
  *)
    echo "사용법: $0 {push-mello|pull-mello}"
    exit 1
    ;;
esac
