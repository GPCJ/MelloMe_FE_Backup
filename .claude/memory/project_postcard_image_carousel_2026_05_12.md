---
name: project-postcard-image-carousel-2026-05-12
description: "PostCard 이미지 캐러셀 추가 완료 (2026-05-12) — imageUrls 사용, useDragScroll 공용 훅 추출, Link drag 버그 해결"
metadata: 
  node_type: memory
  type: project
  originSessionId: 2d3bc8cc-a543-4e3e-9113-ef432a2b427b
---

PostCard에 첨부 이미지 가로 드래그 캐러셀 추가 완료 (2026-05-12).

**구현 내역**
- 데이터 소스: `imageUrls: string[]` (staging spec 확인 — 로컬 `docs/openapi-local.json`엔 없었으나 staging swagger에 존재, 사용자 보고로 발견)
- 타입 확장: `PostSummary.imageUrls?: string[]` 1줄 추가
- 렌더: PostDetailPage 캐러셀 컨벤션 그대로 (`overflow-x-auto`, `shrink-0 w-60 h-60`, `crossOrigin="anonymous"`, `draggable={false}`, `-mx-6 px-6`)
- 가드: `post.imageUrls && post.imageUrls.length > 0`
- `<Link>` 안 클릭 흡수: `onClickCapture`에서 `state.current.moved > 5`면 `preventDefault + stopPropagation`

**useDragScroll 공용 추출**
- 신규: `frontend/src/hooks/useDragScroll.ts`
- 인라인 복제본 3곳 정리: PostCard / PostDetailPage / PostWriteForm 모두 import 사용
- 동일 동작 보장 — API 시그니처 변경 없음

**Link drag 충돌 버그 (디버그 트레이스)**
- 증상: PostCard만 캐러셀 드래그 후 커서에 스크롤 따라붙음 + 링크 고스트 표시
- 원인: `<Link>(=<a>)` 기본 `draggable=true` → dragstart가 `<a>`에서 발화하고 BODY 방향으로만 bubbling → 자식 div의 `onDragStart` 핸들러 못 잡음
- 1차 시도(div `onDragStart preventDefault`) 실패 → 2차 수정 `<Link draggable={false}>` 성공
- 1차 가드는 유지 (이중 가드: 미래 자식이 draggable=true 될 때 방어)

**Why**: MVP D-3 마감 임박에서 시안 정합 우선. useDragScroll은 3곳 중복이라 추출이 자연스러움. Link drag 버그는 PostCard가 코드베이스 첫 "캐러셀 in Link" 사례라 처음 부딪힌 함정.

**How to apply**: PostCard/카드형 컴포넌트에서 가로 드래그 인터랙션 추가 시 부모가 `<Link>`/`<a>` 또는 `draggable=true`인지 확인. 그렇다면 그 조상에도 `draggable={false}` 필수.

**관련**
- wiki `usedragscroll-onclickcapture-5px-high` (pattern, 인지부채 HIGH)
- wiki `link-dragstart-bubbling-postcard-2026-05-12` (debugging)
- [[project-postcard-attachment-chip-pending]] — 첨부 칩은 백엔드 대기 (분리 작업)
- [[feedback-ai-written-code-cognitive-debt]] — 자기보고: useRef/ref 미숙 상태에서 통과
