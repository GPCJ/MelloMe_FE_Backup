---
name: 메모리 최적화 다이제스트 (04-06)
description: 삭제된 메모리 파일에서 아직 유효한 핵심 사실 압축 — 31개 삭제/통합, 134→103개
type: project
---

## 삭제된 파일에서 유효한 사실 (압축)

**완료된 구현 (별도 파일 불필요, 코드에 반영됨)**
- 프로필 수정(PATCH /me), 프로필 이미지 업로드, 내 댓글 탭, axios FormData 버그 수정 — 모두 구현 완료
- TipTap 제거 → textarea 통일, 헤더 검색/글쓰기 PostListPage 이동, 마이페이지→프로필 명칭 변경+3탭 — UI 확정 반영
- MSW 선구현 방침 폐기 → 백엔드 직접 연동 전환
- 로그인/회원가입 응답 대응 완료(04-04), /session-bridge 커맨드 폐기 → /wrap-up만 사용

**정책 (MEMORY.md 인라인으로 이동)**
- 게시물 열람: 로그인만 필요, 공개 게시물 미인증 열람 가능, 인증 전용은 블러
- 토큰: AT=body(localStorage), RT=httpOnly Cookie. AT 만료 ~15분
- MVP 단일 게시판 (board 파라미터 미사용)
- 페이지네이션 0-based (프론트 currentPage-1 변환)
- 로그인 응답: `{isNewUser, user, tokens}` + RT는 Set-Cookie

**기타**
- 워크트리 정리 완료(03-19), main 단일 브랜치 운영
- OpenAPI 수령 완료, 백엔드 응답 형식 통일 안정화됨
- therapistVerification: 항상 객체 반환 (null 아님), status NOT_REQUESTED 기본
- 테스트 데이터는 백엔드에 요청하는 방식으로 통일

## 통합 내역
- signup_nickname + post_title → project_auth_policy_change.md
- figma_screenshot + figma_export → feedback_figma_sharing.md
- notion_confirm + notion_path → feedback_notion_upload_workflow.md
- api_issues + api_spec_discrepancies → project_backend_priority_list.md (미해결만)
- cognitive_debt → project_pending_refactor.md
- issue_sync_policy → project_backend_communication.md
- post_visibility, token_strategy, mvp_single_board, pagination_spec, backend_login_response → 이 다이제스트 + MEMORY.md 인라인
