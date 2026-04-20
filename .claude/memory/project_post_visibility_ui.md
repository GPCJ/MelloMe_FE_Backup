---
name: 게시글 공개/비공개 UI 선반영
description: PostCreatePage에 공개/비공개 토글 UI 추가 완료, API 연동은 미포함
type: project
---

게시글 공개/비공개 UI 선반영 완료 (2026-04-02)

`PostCreatePage.tsx`에 `isPublic` 상태 + 자물쇠 아이콘 토글 추가.

- 모바일: 아이콘 행(이미지·클립 왼쪽, 자물쇠 오른쪽) + 풀너비 게시하기 버튼
- 데스크탑: 클립 왼쪽 | 자물쇠 + 게시하기 오른쪽 한 줄
- 공개 시 `LockOpen`, 비공개 시 `Lock` 아이콘

**Why:** 백엔드 visibility 필드 미정. postType 필드 미사용 합의.

**How to apply:** 백엔드 필드 확정 시 `isPublic` 상태를 API 요청에 연결하면 됨. postType과 별도 필드로 구현 예정.
