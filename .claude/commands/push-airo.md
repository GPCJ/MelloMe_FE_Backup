Run the following steps to push to the airo remote (therapist_community_FE), excluding Claude Code related files:

1. `git checkout public`
2. `git reset --hard main` — public을 main과 동일하게 리셋
3. Remove private files (always, unconditionally): `git rm -rf .claude/ CLAUDE.md scripts/ 2>/dev/null; true`
4. If there are staged changes, commit with message: `chore: Claude Code 관련 파일 제거 (공개 레포용)`
5. `git push airo public:main --force`
6. `git checkout main`
7. Print "✅ airo push 완료."
