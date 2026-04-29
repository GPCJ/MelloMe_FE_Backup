#!/usr/bin/env bash
# AI 코드 생성 안전장치 (Ulysses contract).
# Edit/Write/MultiEdit/NotebookEdit 호출 시 .claude/deadline-unlock 파일이 4시간 이내에 생성됐을 때만 통과.
# .claude/ 경로 또는 .md 파일은 항상 통과 (메모리/문서 편집은 차단 대상 아님).

set -e

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-/home/jin24/MelloMe_FE_Backup}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

fp=$(python3 "$SCRIPT_DIR/extract-tool-path.py")

case "$fp" in
  *"/.claude/"*|*.md)
    exit 0
    ;;
esac

flag="$PROJECT_DIR/.claude/deadline-unlock"
if [ -f "$flag" ]; then
  age=$(( $(date +%s) - $(stat -c %Y "$flag") ))
  if [ "$age" -lt 14400 ]; then
    exit 0
  fi
fi

printf '🔒 직접 작성 모드입니다. AI 코드 생성이 차단되었습니다.\nunlock하려면: ! touch .claude/deadline-unlock\n(unlock은 4시간 후 자동 만료)\n' >&2
exit 2
