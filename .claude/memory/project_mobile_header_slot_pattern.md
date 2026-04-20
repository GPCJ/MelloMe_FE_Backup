---
name: MobilePageHeader rightAction slot 패턴 + 데스크탑 회귀 주의
description: MobilePageHeader가 rightAction slot으로 오른쪽 영역을 페이지에서 주입받는 구조. rightAction에 케밥/액션을 넣으면 데스크탑에서 사라지는 회귀 주의
type: project
originSessionId: 1c5f9820-1e8b-4d01-bbca-a067d9627bb2
---
MobilePageHeader는 `rightAction?: ReactNode` slot 패턴으로 오른쪽 영역 UI를 각 페이지에서 주입받는 구조. 컨테이너 자체가 `md:hidden`이라 **rightAction에 넣은 것은 데스크탑에서 사라짐**.

- `backTo?`: 있으면 ← 뒤로가기 + 타이틀, 없으면 타이틀만
- `rightAction?`: 페이지별로 다른 아이콘/버튼을 ReactNode로 전달

**Why slot:** variant나 route 분기 대신 slot을 선택한 이유 — props 단순(3개), 새 페이지 추가 시 컴포넌트 수정 불필요, 관심사 분리(레이아웃 vs 콘텐츠).

## ⚠️ 회귀 주의 — 데스크탑 대응 누락

`MobilePageHeader.rightAction`에 수정/삭제 케밥 같은 "페이지 레벨 액션"을 넣으면, 데스크탑 사용자는 해당 기능에 접근할 수 없음. 실제 사례: `PostDetailPage`에서 본인 글 수정/삭제 케밥이 데스크탑에서 사라지는 버그 발견 → 수정 (2026-04-14, 커밋 9b88447).

**해결 패턴:** 데스크탑 전용 `hidden md:flex` 래퍼로 동일 드롭다운을 게시글 카드 바깥 상단에 중복 렌더.

```tsx
{/* 모바일: MobilePageHeader.rightAction으로 그대로 유지 */}
<MobilePageHeader rightAction={<KebabDropdown />} />

{/* 데스크탑: 별도 래퍼로 노출 */}
<div className="hidden md:flex justify-end mb-2">
  <KebabDropdown />
</div>
```

**리팩토링 시점:** 드롭다운 JSX가 2곳 이상 반복되면 컴포넌트(`PostActionsMenu` 등) 추출 고려. 현재는 PostDetailPage 한 곳에만 2회 반복 → 보류.

## 현재 사용처

- PostListPage: 검색 아이콘 → `/search` (데스크탑에선 다른 진입점 존재 필요)
- PostDetailPage: 수정/삭제 케밥 (데스크탑 별도 렌더 추가됨)
- CommentWritePage / CommentDetailPage: 케밥 메뉴 (데스크탑 대응 확인 필요)
- ProfilePage: 톱니바퀴 드롭다운 → 로그아웃 (데스크탑은 Layout 헤더에 이미 있음)

**How to apply:** 새 페이지에 `rightAction`으로 액션 추가할 때 **반드시 데스크탑 뷰에서도 같은 액션 접근 경로가 있는지 확인**. 없으면 `hidden md:flex` 래퍼로 별도 렌더.
