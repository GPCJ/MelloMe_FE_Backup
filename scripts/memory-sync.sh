#!/usr/bin/env bash
# Claude 메모리 ↔ MelloMe_FE_Backup 레포 동기화 스크립트

set -e

# 환경 자동 감지 (macOS vs WSL2)
if [ -d "/Users/jin/my-project" ]; then
  PROJECT_REPO="/Users/jin/my-project"
  MEMORY_SRC="/Users/jin/.claude/projects/-Users-jin-my-project/memory"
else
  PROJECT_REPO="/home/jin24/my-project"
  MEMORY_SRC="/home/jin24/.claude/projects/-home-jin24-my-project/memory"
fi
MEMORY_IN_REPO="$PROJECT_REPO/.claude/memory"

if [ ! -d "$PROJECT_REPO/.git" ]; then
  echo "❌ 프로젝트 레포를 찾을 수 없습니다: $PROJECT_REPO"
  exit 1
fi

# 환경 이름 감지
if [ -d "/Users/jin/my-project" ]; then
  ENV_NAME="macOS (맥북)"
else
  ENV_NAME="WSL2 (윈도우)"
fi

# rebase 중 sync_status.md 충돌 자동 해결 (어차피 덮어쓸 파일)
auto_resolve_sync_conflict() {
  if git diff --name-only --diff-filter=U 2>/dev/null | grep -q "sync_status.md"; then
    echo "🔧 sync_status.md 충돌 자동 해결 중..."
    git checkout --ours .claude/memory/sync_status.md 2>/dev/null || \
    git checkout --theirs .claude/memory/sync_status.md 2>/dev/null || true
    git add .claude/memory/sync_status.md
  fi
}

# 안전한 pull --rebase (충돌 시 sync_status.md 자동 해결)
safe_pull_rebase() {
  if ! git pull --rebase origin main 2>&1; then
    auto_resolve_sync_conflict
    # sync_status.md 외 다른 충돌이 있는지 확인
    if git diff --name-only --diff-filter=U 2>/dev/null | grep -qv "sync_status.md"; then
      echo "❌ sync_status.md 외 다른 파일에서 충돌 발생 — 수동 해결 필요"
      git rebase --abort
      exit 1
    fi
    git rebase --continue --no-edit 2>/dev/null || git -c core.editor=true rebase --continue
  fi
}

case "$1" in
  push-mello)
    echo "📤 메모리 → 레포 sync 후 push 중..."
    cd "$PROJECT_REPO"
    # sync_status.md 최신화
    SYNC_TIME=$(date '+%Y-%m-%d %H:%M KST')
    cat > "$MEMORY_SRC/sync_status.md" << EOF
---
name: 동기화 상태
description: MelloMe_FE_Backup 레포 마지막 동기화 시간 — 맥북/WSL2 메모리 일치 여부 확인용
type: project
---

## 마지막 동기화

- **시간**: $SYNC_TIME
- **환경**: $ENV_NAME
- **레포**: https://github.com/GPCJ/MelloMe_FE_Backup

**Why:** 환경 간 메모리 동기화 상태 검증용. 다른 환경에서 pull 후 이 파일의 시간을 확인하면 메모리가 최신인지 알 수 있음.

**How to apply:** 새 환경에서 대화 시작 시 이 파일 시간과 레포 최근 커밋 시간이 일치하면 동기화 정상.
EOF
    # 로컬 메모리 → 레포 내 메모리 폴더로 복사
    mkdir -p "$MEMORY_IN_REPO"
    rsync -a --delete --exclude='.git' "$MEMORY_SRC/" "$MEMORY_IN_REPO/"
    # 모든 변경사항(코드 + 메모리)을 하나의 커밋으로
    git add -A
    if git diff --cached --quiet; then
      echo "ℹ️  변경 사항 없음."
    else
      git commit -m "${COMMIT_MSG:-chore: push 변경사항 동기화 $(date '+%Y-%m-%d %H:%M')}"
    fi
    safe_pull_rebase
    git push origin main
    echo "✅ push 완료."
    ;;
  pull-mello)
    echo "📥 레포 → 메모리 pull 중..."
    cd "$PROJECT_REPO"
    git pull --rebase origin main
    if [ -d "$MEMORY_IN_REPO" ]; then
      mkdir -p "$MEMORY_SRC"
      rsync -a --delete "$MEMORY_IN_REPO/" "$MEMORY_SRC/"
      echo "✅ pull 완료. 메모리 업데이트됨."
    else
      echo "⚠️  레포에 메모리 디렉토리가 없습니다: $MEMORY_IN_REPO"
    fi
    ;;
  *)
    echo "사용법: $0 {push-mello|pull-mello}"
    exit 1
    ;;
esac
