---
name: 댓글 중복 POST fix (2026-05-11)
description: 백엔드 보고 20~30ms 간격 중복 POST를 in-flight 가드 + IME isComposing 차단으로 방어, develop 머지 완료, 사용자 환경 재현 실패라 prod 로그 모니터링이 유일 검증
type: project
originSessionId: 67b5e1ef-28b2-4f79-adf5-12683b0cb775
---
## 결정

2026-05-11 댓글 작성 POST 중복(동일 댓글이 20~30ms 간격으로 2건 도착) 방어 패치를 적용했습니다. PR #13 → develop tip `1ef340e` (rebase merge, fast-forward), 3파일 +11/-1.

**A 가드 (in-flight)**: `useCommentSubmit.handleSubmit` 첫 줄 + `CommentWritePage.handleSubmit` 첫 줄에 `if (submitting) return`. `setSubmitting` 비동기 배치 race 차단.

**B 가드 (IME)**: `CommentInput.handleKeyDown` 진입 시 `e.nativeEvent.isComposing` 차단. React `onKeyDown`이 한글 IME 합성 종료 시 Enter keydown을 2회 발화하는 패턴 차단.

**Why**: 백엔드 로그에서 동일 댓글 POST 2건이 20~30ms 간격으로 도착. 사람 더블탭(~80ms+) 불가능한 시차라 이벤트 시스템 자동 이중 발화로 좁혔습니다. tracer 진단 1순위는 React `onKeyDown` IME 이중 발화(isComposing=true 1회 + 실제 Enter 1회), 2순위는 in-flight 가드 부재로 race 통과. 두 가설을 동시에 막는 A+B를 함께 적용했습니다.

**How to apply**: 댓글/답글 작성 흐름에 추가 변경 시 두 가드를 유지합니다. R-06(useCommentSubmit 통합) 진행 시 `CommentWritePage`의 자체 `handleSubmit`은 자연 제거되며 A 가드는 한 곳만 남습니다.

## 한계점 (박제)

- **사용자 환경 재현 실패**: WSL/Windows 11 PC + Chrome dev 서버에서 develop 코드(가드 없음)와 fix 코드(가드 있음) 둘 다 한글 Enter 시 POST 1건만 발생. B 가드의 직접 효과를 사용자 환경에서 입증할 수 없었습니다.
- **트리거 환경 미특정**: 백엔드 보고는 사실이므로 어딘가는 트리거 중입니다. 후보는 다른 OS/IME(macOS Safari, Android Chrome, MS IME 등), 모바일 작성 페이지(`/posts/:id/comments/write`), 답글 경로(parentCommentId 포함), 더블탭. 백엔드에 User-Agent/경로 정보 추가 요청은 후속 작업입니다.
- **실효 검증 수단 한정**: 머지 후 백엔드 로그 24h 모니터링이 fix 효과를 검증하는 유일한 경로입니다.
- **방어 코드 성격**: 가드는 부수효과 0이라 머지는 안전하나, 사용자 환경에서 검증되지 않은 "방어막"입니다. 트리거 환경이 좁혀지면 별도 PR로 근본 fix 보강 가능합니다.

## 잔여 작업

`backlog.md` 참조 (Vercel staging 확인 / main(prod) 머지 결정 / 백엔드 로그 모니터링 / airo 동기화).
