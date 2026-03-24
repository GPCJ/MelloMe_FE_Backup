Run the following steps to push to the airo remote (therapist_community_FE), excluding Claude Code related files:

1. Check for frontend changes between `airo/main` and `main`, EXCLUDING Claude-related files (`.claude/`, `CLAUDE.md`, `scripts/`):
   - First fetch airo remote: `git fetch airo`
   - Run: `git diff --quiet airo/main..main -- . ':(exclude).claude' ':(exclude)CLAUDE.md' ':(exclude)scripts'`
   - If there are no changes (only Claude files changed or nothing): print "ℹ️  프론트엔드 변경사항 없음." and stop — do NOT proceed with push
   - If there are actual code changes: proceed to next step
2. `git checkout public`
3. `git reset --hard airo/main` — public을 airo/main 기준으로 초기화
4. `git merge --squash main` — main의 변경사항 전체를 staging에만 올림 (커밋하지 않음)
5. Remove private files (always, unconditionally): `git rm -rf .claude/ CLAUDE.md scripts/ 2>/dev/null; true`
6. Determine commit message:
   - Run: `git log airo/main..main --oneline | grep -iv "memory sync\|자동 커밋\|claude" | head -1 | sed 's/^[a-f0-9]* //'`
   - If result is non-empty: use that as the commit message
   - If result is empty: use `chore: sync $(date +%Y-%m-%d)`
7. `git add -A` then commit with the message from step 6
8. `git push airo public:main --force`
9. `git checkout main`
10. Print "✅ airo push 완료."
