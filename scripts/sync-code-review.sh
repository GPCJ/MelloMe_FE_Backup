#!/bin/bash
# feature-codegen 워크트리의 변경사항을 code-review 워크트리에 동기화

set -e  # 에러 발생 시 즉시 중단

REPO_ROOT="/home/jin24/my-project"
FEATURE_DIR="$REPO_ROOT/.claude/worktrees/feature-codegen"
REVIEW_DIR="$REPO_ROOT/.claude/worktrees/code-review"
FEATURE_BRANCH="worktree-feature-codegen"

echo "=== [1/2] feature-codegen 커밋 확인 ==="
cd "$FEATURE_DIR"

# 미커밋 변경사항 체크 (수정된 파일 or 새 파일)
if ! git diff --quiet || ! git diff --cached --quiet || [ -n "$(git ls-files --others --exclude-standard)" ]; then
  echo "미커밋 변경사항 발견 → 커밋 메시지를 입력하세요:"
  read -r commit_msg

  if [ -z "$commit_msg" ]; then
    commit_msg="wip: sync to code-review"
  fi

  git add -A
  git commit -m "$commit_msg"
  echo "커밋 완료: $commit_msg"
else
  echo "미커밋 변경사항 없음 → 기존 커밋 기준으로 머지합니다."
fi

echo ""
echo "=== [2/2] code-review 브랜치에 머지 ==="
cd "$REVIEW_DIR"

git merge "$FEATURE_BRANCH" --no-ff -m "merge: sync from feature-codegen"
echo ""
echo "✓ 동기화 완료 (feature-codegen → code-review)"
