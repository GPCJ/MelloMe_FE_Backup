---
name: main↔develop divergence 강제 동기화 (2026-05-11)
description: 2026-05-11 main을 develop으로 reset --hard + force-push해 cherry-pick 중복 27커밋 흡수, 양쪽 remote(origin/airo) 통일
type: project
originSessionId: b9d46f86-253d-482e-b83c-6e026306947d
---
2026-05-11 main↔develop divergence 해소. main을 develop으로 `reset --hard` 후 origin/airo 양쪽에 `--force-with-lease` push. 최종 SHA: `dd9ed7d`.

배경:
- 4-29 분기 이후 main에 develop에서 cherry-pick된 중복 커밋 27개가 누적 (같은 메시지/타임스탬프, 다른 SHA).
- develop는 staging 브라우저 검증 완료, main은 cherry-pick으로 부분만 받은 어정쩡 상태.
- 자동 머지 dry-run 시 충돌 13건 예상 (소스 7: `posts.ts`/`PostCard.tsx`/`index.css`/`SignupPage.tsx`/`PostCreatePage.tsx`/`PostListPage.tsx`/`types/post.ts` + 메모리 마크다운 6).

작업 절차:
1. 백업 브랜치 `main-backup-2026-05-11` 생성, origin/airo 양쪽 push (롤백 안전망).
2. `git checkout main && git reset --hard develop`.
3. `git push --force-with-lease origin main` (`0770f00 → dd9ed7d`).
4. `git push --force-with-lease airo main` (`5113c22 → dd9ed7d`).

발견점:
- airo main이 origin main과 SHA가 달랐음 (`5113c22` vs `0770f00`). `push-mello`/`push-airo` 스크립트가 main을 일관 동기화하지 않을 수 있다는 신호. 이번에 양쪽 `dd9ed7d`로 통일됨.

**Why:** develop가 검증 끝, main이 어정쩡 상태였음. MVP 발표(05-15) D-4 시점에 prod 갱신이 필요해 강제 동기화 선택. 사용자는 클린 히스토리 선호 + 혼자 작업이라 force-push 리스크 낮음.

**How to apply:**
- 백업 브랜치 삭제는 MVP 발표 후 안정화 확인 시점에 결정.
- 향후 push-airo로 main 동기화 시 SHA drift 가능성 인지 — cherry-pick 동기화는 양쪽 SHA를 어긋나게 만듦.
- 롤백 시: `git checkout main && git reset --hard main-backup-2026-05-11 && git push --force-with-lease origin main && git push --force-with-lease airo main`.
