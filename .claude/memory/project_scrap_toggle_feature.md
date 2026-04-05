---
name: 스크랩 토글 기능 구현 상태
description: PostCard 스크랩 버튼 구현 완료 + 백엔드 isScrapped 필드 요청 필요
type: project
---

## 구현 완료 (04-05)
- PostCard Bookmark 아이콘 → `<button>` + `stopPropagation`으로 Link 이벤트 전파 차단
- 클릭 시 `scrapPost` / `unscrapPost` API 호출 + 로컬 state로 아이콘 색상 토글
- MyScrappedPost 타입을 실제 백엔드 응답(flat 구조)에 맞게 수정
- ProfilePage 스크랩 탭 렌더링도 flat 구조에 맞춰 매핑 수정

## 한계
- 로컬 state 기반 → 새로고침 시 스크랩 표시 초기화
- **Why:** 백엔드 PostSummary에 `isScrapped` 필드가 없음

## 백엔드 요청 필요
- PostSummary 응답에 `isScrapped` 필드 추가 요청
- **How to apply:** 필드 추가되면 `useState(post.isScrapped)`로 초기값 전환
