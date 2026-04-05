#!/bin/bash
set -e

# push-airo: .claude/, CLAUDE.md, scripts/ 제외하고 airo remote에 push

# 1. main 브랜치 확인 및 이동
CURRENT=$(git branch --show-current)
STASHED=false

if [ "$CURRENT" != "main" ]; then
  echo "⚠️  현재 $CURRENT 브랜치 → main으로 이동"
  git checkout main
fi

# uncommitted 변경 감지 시 stash
if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "⚠️  uncommitted 변경 감지 → stash"
  git stash
  STASHED=true
fi

# 실패해도 반드시 main 복귀하는 cleanup
cleanup() {
  git checkout main 2>/dev/null
  if [ "$STASHED" = true ]; then
    echo "📦 stash 복원"
    git stash pop
  fi
}
trap cleanup EXIT

# 2. fetch
git fetch airo

# 3. 변경사항 체크
if git diff --quiet airo/main..main -- frontend/ backend/; then
  echo "ℹ️  변경사항 없음."
  exit 0
fi

# 4. public 브랜치 재생성
git branch -D public 2>/dev/null || true
git checkout -b public main

# 5. private 파일 tracking 제거
git rm -r --cached .claude/ 2>/dev/null || true
git rm --cached CLAUDE.md 2>/dev/null || true
git rm -r --cached scripts/ 2>/dev/null || true

# .gitignore에 추가 (중복 방지)
grep -qxF '.claude/' .gitignore || echo '.claude/' >> .gitignore
grep -qxF 'CLAUDE.md' .gitignore || echo 'CLAUDE.md' >> .gitignore
grep -qxF 'scripts/' .gitignore || echo 'scripts/' >> .gitignore
git add .gitignore

# 6. commit
git commit -m "chore: remove private files for public repo" || true

# 7. force push
if git push airo public:main --force; then
  echo ""
  echo "✅ airo push 완료."
else
  echo ""
  echo "❌ airo push 실패."
  exit 1
fi
