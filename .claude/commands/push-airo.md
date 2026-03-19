Run the following steps to push to the airo remote (therapist_community_FE), excluding Claude Code related files:

1. `cd` to the git root
2. `git checkout public`
3. `git merge main --no-edit`
4. Remove Claude-related files if they reappeared: `git rm -r --cached .claude/ CLAUDE.md scripts/` (only if tracked)
5. If there are staged changes, commit with message: `chore: Claude Code 관련 파일 제거 (공개 레포용)`
6. `git push airo public:main`
7. `git checkout main`
8. Print "✅ airo push 완료."
