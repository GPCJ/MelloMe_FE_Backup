---
name: visibility 응답 정책 충돌 (디자이너 vs 백엔드)
description: PRIVATE 게시글의 USER 응답 처리 방식이 디자이너 의도와 백엔드 구현이 어긋남 — 데일리/주간회의 안건
type: project
originSessionId: d1955d39-18ef-4d3a-90f8-251b1dac4855
---
## 충돌 내용

`visibility=PRIVATE` (치료사 전용) 게시글을 USER 롤이 요청했을 때:

- **디자이너 의도**: USER도 응답에 **포함**해서 받되, 본문은 **블러 처리** (기존 isBlurred UI 활용 — "인증된 회원에게만 공개된 게시물입니다" 카드). 가입 유도 + UX 일관성.
- **백엔드 현재 동작**: USER에게 PRIVATE 글을 **응답에서 아예 제외**. Swagger 테스트로 확인됨 (2026-04-14).

백엔드가 디자이너와 합의 없이 독단적으로 결정한 것으로 보임.

## Why
디자이너 시안과 어긋난 채로 운영되면 USER는 "이런 콘텐츠가 존재한다"는 정보 자체를 못 받음 → 가입 전환율 하락 + UI 자산(`PostCard`/`PostDetailPage`의 isBlurred 블러 카드) 낭비.

## How to apply
- **2026-04-14 데일리스크럼 안건**으로 올림
- 합의 결과에 따라 백엔드 GET /posts, GET /posts/{id} 응답 정책 수정 요청
- 프론트 mock(`mocks/handlers/posts.handlers.ts`)은 **이미 디자이너 의도대로 구현 완료** (USER에게 isBlurred=true + 빈 content/contentPreview로 응답). 백엔드가 디자이너 안을 따르면 mock과 일치, 백엔드 안을 고수하면 mock 수정 필요.
- 관련 브랜치: `feat/post-visibility` (커밋 a277906, 7652b8c, 63ac2a2)
