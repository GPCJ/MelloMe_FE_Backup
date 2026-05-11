---
name: CH-09 답글 동선 결정 — PC 모달 / 모바일 라우트 분기 (2026-05-11)
description: CommentReplyModal 신규 — PC 모달 + 모바일 기존 라우트 유지 / 댓글 첨부·공개범위는 의도적으로 제외 (텍스트만)
type: project
originSessionId: 2cffd4f0-2c2e-46a8-ac47-b28072449871
---
CH-09 backlog의 "답글 동선 ⓐ/ⓑ 결정 미완료" 항목을 해소한 결정입니다. 2026-05-11 develop `a6bbca3` 머지+push 완료, Vercel preview 브라우저 검증 대기.

**결정 사항:**

1. **답글 진입 분기** — `PostDetailPage`의 💬 답글 버튼 클릭 시 `window.matchMedia('(min-width: 768px)').matches`로 런타임 분기.
   - PC (md 이상): `CommentReplyModal`(신규) open, 같은 페이지 위에 떠서 부모 댓글 컨텍스트 + 본인 입력만 노출.
   - 모바일: 기존 `/posts/:id/comments/:cid` 라우트 이동 (`autoReply` state로 입력 영역 자동 활성). CommentDetailPage 그대로 유지.

2. **댓글/답글 모달은 텍스트 content only** — 시안(Figma 1387:10430)에 있던 이미지/파일 첨부 아이콘 + "모든 사람이 볼 수 있어요 🔒" 공개범위 UI는 의도적으로 제거. 백엔드 API에 댓글 첨부/공개범위 필드 없음 + PM 컨펌 부재.

3. **대댓글 목록 위치** — 모달 밖(PostDetailPage 본문)에 유지. 모달은 [부모 댓글 read-only + 본인 입력 영역] 두 블록만, 기존 메인 통합 렌더(CH-09 1/2)는 그대로.

4. **State 위치** — `CommentReplyModal`은 `PostDetailPage` 로컬 state(`replyModalParent: CommentResponse | null`)로 관리. PostWriteModal과 달리 Zustand 글로벌 불필요(PostDetail에서만 open되므로).

5. **자식 댓글에서 답글 다는 경우** — 답글은 flat 2레벨 정책상 항상 top-level 부모(parent) 아래에 평탄하게 달림. PC 모달엔 항상 parent 객체 전달, mention 동선은 v1에서 단순화(추후 확장 시 props 추가).

**Why:**
- PC 모달 채택 이유: 별도 라우트 이동 시 페이지 컨텍스트 손실. 시안이 모달 패턴 명시. 모바일은 좁은 화면+키보드 UX 때문에 풀스크린 페이지가 자연스러워서 기존 동선 유지.
- 첨부/공개범위 제외 이유: 백엔드 미지원 + PM 미컨펌 상태에서 dummy UI 박는 건 합리화. 시안 정합보다 도메인 정합 우선.

**How to apply:**
- 답글 관련 후속 작업(첨부 enable, mention 동선 등)은 백엔드 컨펌 + PM 컨펌 후 진행.
- 신규 모달 컴포넌트는 PostWriteModal 패턴(ESC + body scroll lock + mousedown 외부 닫기 + 헤더 ← 타이틀 ✏️ PencilLine submit) 차용. 위치는 `components/post/`.
- 모바일 답글 흐름 변경 시 CommentDetailPage와 useReplyInput hook 동시 점검 필요.
