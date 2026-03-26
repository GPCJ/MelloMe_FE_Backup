---
name: 세션 브릿지
description: 다음 세션에서 바로 이어갈 수 있도록 저장한 일회성 컨텍스트. 다음 /session-bridge 실행 시 정리 예정.
type: project
ephemeral: true
date: 2026-03-25
---

## 중단된 작업
- 치료사 인증 즉시 승인 UI 처리 — 백엔드가 즉시 승인 로직 구현 완료되면 프론트에서 제출 후 환영 화면 보여줘야 함. 현재는 성공 시 바로 `/posts`로 이동해버려서 유저가 승인됐다는 걸 체감 못함. 환영 화면 추가 필요.

## 다음 즉시 할 것 (우선순위 순)
1. **치료사 인증 즉시 승인 UI** — 제출 성공 후 `/posts`로 바로 이동 대신 환영/승인 화면 표시 (백엔드 즉시 승인 완료 확인 후)
2. **댓글 시스템 유튜브 스타일 구현** — parentCommentId 처리 방식 백엔드 논의 후 진행 (flat 2레벨, @멘션)
3. **401 인터셉터** — 액세스 토큰 만료 시 자동 재발급, refresh 엔드포인트 URL 스웨거 확인 필요
4. **댓글 작성/삭제 테스트** — 게시글 작성 성공했으니 이어서 테스트 가능

## 블로킹 / 대기 중
- 백엔드: 치료사 인증 즉시 승인 로직 구현 중
- 백엔드: 댓글 대댓글 parentCommentId 처리 방식 확인 필요
- 좋아요 3종 리액션 백엔드 enum 확정 (EMPATHY/APPRECIATE/HELPFUL)

## 참고 컨텍스트
- 오늘 해결한 것: Google OAuth 코드 제거, 게시글 작성 API 연결(postType/therapyArea/ageGroup), 댓글 삭제 URL 수정, board 파라미터 제거, sortType 수정, 페이지 0-based 수정, 치료사 인증 API 연결(multipart/form-data)
- 치료사 인증 페이지: APPROVED 상태면 재신청 불가 화면 표시, 제출 후 getMe() 재조회로 store 업데이트
- 댓글 시스템: 유튜브 스타일(flat 2레벨 + @멘션) 방향 확정, 백엔드 논의 후 구현 예정
