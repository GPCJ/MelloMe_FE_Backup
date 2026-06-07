---
name: project_cherry_pick_retry_logging_to_main_2026_05_28
description: 2026-05-28 develop→main cherry-pick 누적 — 이미지 업로드 retry/로깅(477b68c) + 더보기 띠 feat(e95f186) + 더보기 띠 refine(412a25c). 추후 develop→main 정식 머지 시 3쌍 동일패치 충돌 주의
metadata: 
  node_type: memory
  type: project
  originSessionId: e46840d8-0d58-410a-acd9-c91ce82d1c42
---

2026-05-28, develop 작업 중 운영(main)에 즉시 필요한 변경만 **cherry-pick**으로 단독 반영. develop엔 쪽지/고민카드/알림 등 백엔드 대기 미완성 커밋이 섞여 있어 전체 머지 불가였기 때문. 같은 패턴이 하루에 3번 누적됨.

## 적용 이력 (develop SHA → main SHA)

**1. 이미지 업로드 재시도 + 실패 로깅** — `e7ea9bb` → `477b68c`
- 파일: `frontend/src/api/posts.ts`(+40, 재시도 헬퍼 + `console.warn` 로깅), `PostWriteForm.tsx`·`PostEditPage.tsx`(업로드 로직을 posts.ts로 이관)
- 함께 묶였던 decode 가드 `14ac498`은 main↔develop 동일이라 별도 반영 불필요.
- 이전 main = `026f302`.

**2. 더보기 띠 feat (한손 도달성)** — `79615b5` → `e95f186`
- 파일: `frontend/src/components/post/PostCard.tsx`
- 변경: 더보기 버튼을 카드 가로 전체 탭 밴드로 확장(`-mx-6 px-6 w-[calc(100%+3rem)]`), 가운데 정렬 + ChevronDown 아이콘 + 상단 구분선 + 옅은 bg.
- 이전 main = `477b68c`.

**3. 더보기 띠 refine (rounded + 12px 여백)** — `67a8b69` → `412a25c`
- 파일: 동일 `PostCard.tsx`
- 변경: 둥근 모서리(`rounded-md`) + 카드 좌우 12px 흰 여백(`-mx-3` + `w-[calc(100%+1.5rem)]`)으로 "정의된 pill" 인상 강화. body가 순백(oklch 1 0 0)이라 띠 bg가 body에 새어 보이던 문제를 모양으로 종단.
- 이전 main = `e95f186`.

## How to apply (추후 develop→main 정식 머지 시)

3쌍 모두 **동일 패치/다른 SHA**라 git이 보통 자동 동일화 처리. 단 기존 main↔develop 강제 sync 이력([[project_main_develop_force_sync_2026_05_11]])이 있어, 충돌 발생 가능 파일은:
- `frontend/src/api/posts.ts`, `PostWriteForm.tsx`, `PostEditPage.tsx` (1번)
- `frontend/src/components/post/PostCard.tsx` (2·3번)

충돌 시 **양쪽 내용 동일 확인 → develop 쪽(또는 동일본) 채택** = 로직 손실 아님.

## 2026-05-29 정식 머지 검증 결과

`b1e944d Merge remote-tracking branch 'origin/develop'`로 develop→main 정식 머지. 위 예측대로 충돌 3파일(`posts.ts`, `PostWriteForm.tsx`, `PostEditPage.tsx`) 발생 → **develop본 채택**(`git checkout --theirs` + `git add` + `git merge --continue`)으로 무손실 해결 확인. PostCard.tsx는 자동 머지(예측한 충돌 회피). 후속 = [[project_concern_card_prod_followup_2026_05_30]].

관련:
- [[project_image_upload_retry_idempotency_design]] (1번 원인 설계)
- wiki `tailwind-w-full-postcard-2026-05-28` (2·3번에서 발견된 CSS 함정 박제, debugging)
