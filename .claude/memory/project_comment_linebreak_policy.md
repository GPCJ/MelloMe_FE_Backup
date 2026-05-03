---
name: 댓글 줄바꿈 허용 정책 전환 (2026-05-02)
description: 댓글 input → textarea 전환 결정 + 트레이드오프 7개 박제 — Why·How to apply 포함
type: project
originSessionId: 086dbdbe-ddae-47e4-a1cf-fad6914d55aa
---
# 댓글 줄바꿈 허용 정책 전환 (2026-05-02)

## 결정

댓글 작성/편집/표시에 **줄바꿈을 허용**한다. 표시단 `whitespace-pre-wrap`, 입력단 textarea 사용.

**Why**: PM/팀원이 QA에서 "댓글 줄바꿈 안 됨"을 UX 버그로 반복 신고. 게시글 본문은 textarea라 줄바꿈 허용 의도가 이미 코드에 박혀 있는데 댓글만 input(single-line)으로 차단돼 비대칭. 사용자 직관(작성 시 친 줄바꿈이 보존되리라는 기대)과 코드가 어긋나는 상태였음.

**How to apply**:
- 댓글 표시 컴포넌트는 `whitespace-pre-wrap` 필수 (CommentCard.tsx, ProfilePage 미리보기 등)
- 댓글 입력 컴포넌트는 `<textarea>` (CommentInput, CommentCard 편집 폼)
- 게시글 본문(`.post-content`)도 동일 정책 — 이미 textarea로 입력받지만 표시단에 `white-space: pre-wrap` 누락돼 줄바꿈이 시각적으로 사라지던 회귀 동시 수정

## 1차 처리 (2026-05-02 사용자 직접 수정)

- `frontend/src/index.css` `.post-content { white-space: pre-wrap }` 추가
- `frontend/src/components/post/CommentCard.tsx` 편집 input → `<textarea rows={3}>`, 표시 `<p>`에 `whitespace-pre-wrap`

## 한계점 7개 (박제 — `feedback_document_limitations_with_benefits`)

기능이 동작한다고 도메인 효용까지 검증된 것은 아님. 아래 7개는 후속 작업 대기 항목으로 backlog R-07에 체크박스 형태로 분리 저장.

1. **Enter 정책의 모바일 한계** — Shift+Enter가 모바일에 없음. 데스크탑은 Slack 스타일(Enter=submit, Shift+Enter=newline) 가능하지만 모바일은 "Enter=줄바꿈, 버튼=submit"이 강제됨. 한 줄 댓글이 다수일 텐데 매번 버튼 클릭하는 마찰 신규 발생. 분기 안 두면 한쪽이 손해.

2. **줄바꿈 도배 가능성** — `\n` 수십 개로 댓글 카드 높이 인위 확장 가능. `.trim()`은 양끝만 자르므로 중간 연속 newline 방어 못 함. 프론트 normalize 또는 백엔드 정책 필요.

3. **백엔드 `\n` 처리 미검증** — 게시글 본문은 textarea로 통과 검증됐지만 댓글은 미검증. sanitize 단계에서 `\n` stripping될 위험 있음. 작업 후 실서버 round-trip 1회 확인 필수.

4. **ProfilePage 댓글 미리보기 line-clamp-2 왜곡** — `ProfilePage.tsx:514` 미리보기는 줄바꿈만으로도 2줄 채워 truncate 표시. 짧은 본문도 잘려 보이는 시각 회귀.

5. **편집 모드 form 자동 submit 메커니즘 변경** — 기존 input 시절 Enter=submit 동작에 의존하던 form `onSubmit`이 textarea 전환 후 발화 안 됨(Enter=줄바꿈). 저장 버튼만 유효 경로. CommentCard.tsx:118 주석("input은 single-line이라 줄바꿈 충돌 없음")이 거짓이 됨 → 갱신 필요.

6. **변경 손실 임팩트 증가** — input 시절은 한 줄이라 손실 임팩트 작음. textarea는 여러 줄 작성 후 손실 시 임팩트 큼. dirty 감지 + 이탈 confirm 가드 검토.

7. **시각적 무게 증가** — 댓글 카드 높이 가변, 한 댓글이 모바일 화면 절반 차지 가능. 댓글 많으면 본문→첫 댓글 도달 시간↑. "더보기/접기" UI 부채 발생 여지.

## 2차 처리 (2026-05-03, 커밋 5927bf4 — develop 배포)

7가지 한계 결정사항 확정:

| # | 처리 결과 |
|---|---|
| #1 Enter 분기 | 구현 완료 — 데스크탑 Enter=submit/Shift+Enter=줄바꿈, 모바일 버튼 강제 |
| #2 normalize | 구현 완료 — `useCommentSubmit` 훅 내부 C안 채택 |
| #3 백엔드 \n 검증 | staging 테스트 대기 (round-trip \n 보존 여부) |
| #4 ProfilePage clamp | R-07 후속 |
| #5 Enter submit 깨짐 | #1과 함께 해결됨 |
| #6 dirty 감지 | R-07 후속 |
| #7 시각적 무게 | R-07 후속 (CommentCard line-clamp-2는 이미 적용) |

**결정 근거**:
- **onSubmit 타입 B안** (`() => void`): 캐스팅(A안) 대신 타입 정합성 유지. `CommentInput` form이 `e.preventDefault()` 직접 처리, 호출부는 content만 전달.
- **normalize 위치 C안** (훅 내부): 호출부 3곳 누락 위험 없음, API 전송 직전 단일 지점에서 보장.

## 잔여 과제

- #3 staging 검증 → backlog R-07 체크리스트
- #4/#6/#7 → backlog R-07 후속 항목
