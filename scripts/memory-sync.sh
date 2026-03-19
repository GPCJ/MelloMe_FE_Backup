#!/usr/bin/env bash
# Claude 메모리 ↔ MelloMe_FE_Backup 레포 동기화 스크립트

set -e

PROJECT_REPO="/Users/jin/my-project"
MEMORY_SRC="/Users/jin/.claude/projects/-Users-jin-my-project/memory"
MEMORY_IN_REPO="$PROJECT_REPO/.claude/memory"

if [ ! -d "$PROJECT_REPO/.git" ]; then
  echo "❌ 프로젝트 레포를 찾을 수 없습니다: $PROJECT_REPO"
  exit 1
fi

case "$1" in
  push-mello)
    echo "📤 메모리 → 레포 sync 후 push 중..."
    cd "$PROJECT_REPO"
    # 커밋 안 된 변경사항 확인 후 자동 커밋
    if ! git diff --quiet || ! git diff --cached --quiet; then
      echo "⚠️  커밋되지 않은 변경사항 감지 → 자동 커밋 진행"
      git add -A
      git commit -m "chore: push 전 변경사항 자동 커밋 $(date '+%Y-%m-%d %H:%M')"
    fi
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
- **환경**: macOS (맥북)
- **레포**: https://github.com/GPCJ/MelloMe_FE_Backup

**Why:** 환경 간 메모리 동기화 상태 검증용. 다른 환경에서 pull 후 이 파일의 시간을 확인하면 메모리가 최신인지 알 수 있음.

**How to apply:** 새 환경에서 대화 시작 시 이 파일 시간과 레포 최근 커밋 시간이 일치하면 동기화 정상.
EOF
    # 로컬 메모리 → 레포 내 메모리 폴더로 복사
    mkdir -p "$MEMORY_IN_REPO"
    rsync -a --delete --exclude='.git' "$MEMORY_SRC/" "$MEMORY_IN_REPO/"
    git pull --rebase origin main 2>/dev/null || git pull origin main || true
    git add .claude/memory
    if git diff --cached --quiet; then
      echo "ℹ️  메모리 변경 사항 없음."
    else
      git commit -m "chore: claude memory sync $(date '+%Y-%m-%d %H:%M')"
    fi
    git push origin main
    echo "✅ push 완료."
    ;;
  pull-mello)
    echo "📥 레포 → 메모리 pull 중..."
    cd "$PROJECT_REPO"
    git pull origin main
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
