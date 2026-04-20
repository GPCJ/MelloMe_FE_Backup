#!/usr/bin/env bash
# Claude 메모리 ↔ MelloMe_FE_Backup 레포 동기화 스크립트

set -e

# 환경 자동 감지 (macOS vs WSL2)
if [ -d "/Users/jin/MelloMe_FE_Backup" ]; then
  PROJECT_REPO="/Users/jin/MelloMe_FE_Backup"
  MEMORY_SRC="/Users/jin/.claude/projects/-Users-jin-MelloMe-FE-Backup/memory"
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

case "$1" in
  push-mello)
    echo "📤 메모리 → 레포 sync 후 push 중..."
    guard_memory_src_not_empty
    cd "$PROJECT_REPO"
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
    git pull --rebase origin main
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
