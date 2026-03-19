Run the following steps to push to the airo remote (therapist_community_FE), excluding Claude Code related files:

1. Check for uncommitted changes on `main`, EXCLUDING Claude-related files (`.claude/`, `CLAUDE.md`, `scripts/`):
   - Run: `git diff --quiet -- . ':(exclude).claude' ':(exclude)CLAUDE.md' ':(exclude)scripts' && git diff --cached --quiet -- . ':(exclude).claude' ':(exclude)CLAUDE.md' ':(exclude)scripts'`
   - If there are no changes (only Claude files changed or nothing): print "ℹ️  프론트엔드 변경사항 없음." and stop — do NOT proceed with push
   - If there are actual code changes: run `git add -A` and commit with message: `chore: push 전 변경사항 자동 커밋`
2. `git checkout public`
3. `git reset --hard main` — public을 main과 동일하게 리셋
4. Remove private files (always, unconditionally): `git rm -rf .claude/ CLAUDE.md scripts/ 2>/dev/null; true`
5. If there are staged changes, commit with message: `chore: Claude Code 관련 파일 제거 (공개 레포용)`
6. `git push airo public:main --force`
7. `git checkout main`
8. Print "✅ airo push 완료."
