---
name: 게시글 리액션 API 리네임 + 응답 확장 대응
description: 2026-04-21 백엔드 리액션 API Breaking change 대응 완료, 잔여 작업(동시 배포/디자이너 추가 컨펌/실서버 테스트) 및 PostCard active 한계
type: project
originSessionId: 6947cc59-7ef8-4758-91fe-abb48b5d745f
---
## 완료 (2026-04-21, 커밋 `3a84a04`, 10 파일)

백엔드 PR #62 기반 게시글 리액션 API Breaking change 대응:

- **enum 리네임**: EMPATHY/APPRECIATE/HELPFUL → LIKE/CURIOUS/USEFUL
- **카운트 필드 리네임**: empathyCount/appreciateCount/helpfulCount → likeCount/curiousCount/usefulCount
- **응답 확장 활용**:
  - 목록(PostSummary): `likeCount` 추가 — 기존 하드코딩 0 제거
  - 상세(PostDetail): `reactionCounts`(3종 map) + `myReactionType` + `commentCount` 추가
  - 상세 페이지에서 별도 `GET /reaction` 호출 제거 (fetchPost 응답을 `reactionFromPostDetail`로 변환)
- **디자이너 결정 반영**: 카운트 0이면 아이콘만 표시 (라벨 fallback 제거, aria-label로 a11y 유지)
- **MSW 핸들러/시드 데이터 새 스펙 반영**

## 잔여 작업

- [ ] 백엔드 배포와 프론트 **동시 배포 조율** (Breaking change — 시차 두면 400/빈카운트)
- [ ] 디자이너 추가 컨펌: 아이콘 모양 / 강조 색상 (현재 Heart/Star/Lightbulb + 빨강 active 임시 유지, ReactionBar.tsx 상단 주석 참고)
- [ ] 실서버 테스트 (현재 MSW로만 검증)

## 알려진 한계 (추후 백엔드 추가 요청 후보)

**PostSummary에 `myReactionType` 미포함** → 카드에서 좋아요 active 강조가 새로고침 시 초기화됨. 낙관적 토글만 유지 중.
- 의도된 trade-off, `PostCard.tsx` 주석에 명시
- 백엔드에 PostSummary에 myReactionType 추가 요청하면 해결

## 배경

- 백엔드 PR: https://github.com/AIRO-offical/therapist_community_BE/pull/62
- 공유일: 2026-04-21
