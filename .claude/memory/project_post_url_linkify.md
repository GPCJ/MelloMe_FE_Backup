---
name: project_post_url_linkify
description: 게시글 상세 본문 평문 URL → 클릭 링크 변환 (PR
metadata: 
  node_type: memory
  type: project
  originSessionId: 09efbc35-290c-4827-ad54-14626a03c6f0
---

게시글 상세페이지 본문의 평문 URL을 클릭 가능한 링크로 변환. **PR #22 develop 머지 완료(2026-06-04, 수동 머지).**

**방식**: 렌더 시점 변환(저장 데이터는 평문 유지 → 기존 글 전부 적용 + 되돌리기 쉬움).
- `frontend/src/utils/linkify.ts` — http(s) URL 정규식으로 `<a target="_blank" rel="noopener noreferrer">`로 감쌈, 비URL 조각은 HTML escape.
- `PostDetailPage.tsx` 본문 렌더 — `linkifyUrls()` 통과 후 기존 `DOMPurify.sanitize(..., { ADD_ATTR: ['target'] })`. ADD_ATTR로 새 탭(target) 보존, 위험 스킴 차단은 DOMPurify 담당.
- `index.css` `.post-content a` — 파랑+밑줄 스타일(주입 HTML 자식이라 기존 `.post-content p/strong` 패턴과 동일하게 CSS에서 스타일, Tailwind 아님).

**비자명 결정/한계 (회귀 오인·후속 작업 대비)**:
- (a) **escape 도입으로 본문 속 리터럴 `<태그>`가 이제 글자로 노출됨** — 이전엔 DOMPurify가 삼켰음. 평문 에디터(SimpleTextEditor) 기준 더 올바른 동작이나, "갑자기 태그가 보인다"는 회귀로 오인 주의.
- (b) 단순 정규식이라 URL 끝의 문장부호(`.` `)` `,`)가 링크에 포함될 수 있음. 정교화 필요 시 linkify 계열 라이브러리(새 의존성 트레이드오프).
- (c) **loop(누산기+커서) 버전 채택 이유** = escape-first `.replace` 콜백 버전은 `url<태그`처럼 URL 뒤 공백 없이 `<`가 붙으면 over-capture, loop 버전은 `<`에서 끊겨 더 정확.
- (d) **범위 = 상세 본문만.** 피드 미리보기(PostCard)/ConcernCard 본문 미적용 — 후속 확장 여지.

확인 남은 것: 실제 dev 브라우저에서 링크 새 탭 열림(target 생존) 눈 확인(node는 jsdom 없어 미검증, 의존성 추가 회피).
