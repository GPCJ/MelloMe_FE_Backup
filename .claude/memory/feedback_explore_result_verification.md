---
name: Explore 에이전트 결과의 하드코딩/누락 판정은 직접 검증
description: 에이전트가 "하드코딩"이라 보고한 코드는 원본 파일을 직접 열어 prop 리터럴과 실제 판정 로직을 구분
type: feedback
originSessionId: fa4a79a3-3bd8-4345-83ef-12424170ca09
---
Explore 에이전트가 "하드코딩 / 누락 / TODO"라고 단정한 발견은 회의/문서에 반영하기 전에 직접 원본 파일을 Read로 재검증할 것.

**Why:** 2026-04-14 UI 싱크 회의 준비 중 C-5 안건(댓글 인증 배지)에서 Explore가 `CommentCard.tsx`의 `<VerifiedBadge status="APPROVED" />`를 "APPROVED 하드코딩"이라 보고. 사용자가 "내가 알기로는 API 응답 기반으로 표시하는데?"라고 반박 → 직접 파일을 읽어 확인하니 실제로는 `{comment.authorRole === 'THERAPIST' && <VerifiedBadge status="APPROVED" />}` 구조였음. 즉 `authorRole`(API 응답 필드)로 조건부 렌더링하고, "APPROVED"는 범용 배지 컴포넌트에 전달하는 prop 리터럴일 뿐이었음. 하드코딩 아님. 이 오판으로 하마터면 회의에서 존재하지 않는 버그를 논의할 뻔했음.

**How to apply:** 에이전트 보고에서 "하드코딩 / 고정값 / 하드코딩 중"이라는 표현이 나오면 그대로 받아들이지 말고, 해당 파일을 직접 Read해서:
1. prop에 전달되는 리터럴 값인지(= 범용 컴포넌트 사용)
2. 실제 판정/분기 로직 자체가 고정된 것인지
를 구분. 사용자가 기억과 다르다고 의심을 표할 때는 특히 무조건 직접 검증.
