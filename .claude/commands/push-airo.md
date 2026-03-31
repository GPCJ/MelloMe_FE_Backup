Run the following steps to push to the airo remote (therapist_community_FE).
Only the `frontend/` directory is published — all other files stay private.

1. Fetch airo remote to get the latest state:
   `git fetch airo`

2. Check if there are any changes in `frontend/` between `airo/main` and `main`:
   - Run: `git diff --quiet airo/main..main -- frontend/`
   - If exit code is 0 (no changes): print "ℹ️  프론트엔드 변경사항 없음." and stop — do NOT proceed
   - If exit code is 1 (changes exist): proceed to next step

3. Switch to the `public` branch:
   `git checkout public`

4. Reset `public` to exactly match `airo/main`:
   `git reset --hard airo/main`

5. Bring in ONLY the `frontend/` directory from `main` (no merge, no conflict possible):
   `git checkout main -- frontend/`

6. Stage only `frontend/`:
   `git add frontend/`

7. Determine commit message:
   - Run: `git log airo/main..main --oneline | grep -iv "memory sync\|자동 커밋\|claude" | head -1 | sed 's/^[a-f0-9]* //'`
   - If result is non-empty: use that as the commit message
   - If result is empty: use `chore: sync $(date +%Y-%m-%d)`

8. Commit:
   `git commit -m "<message from step 7>"`
   - If nothing to commit: print "ℹ️  커밋할 변경사항 없음." then go to step 10

9. Force-push to airo:
   `git push airo public:main --force`

10. Return to main branch:
    `git checkout main`

11. Print "✅ airo push 완료."
