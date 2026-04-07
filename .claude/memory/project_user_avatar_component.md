---
name: UserAvatar 공통 컴포넌트 통합
description: 프로필 이미지 하드코딩 아바타를 UserAvatar 컴포넌트로 통합 완료, PostDetail/CommentResponse 타입에 authorProfileImageUrl 추가
type: project
---

UserAvatar 공통 컴포넌트(`components/common/UserAvatar.tsx`) 생성하여 6곳의 하드코딩 아바타 통합 완료 (04-07).

적용 위치: PostDetailPage, CommentCard, CommentWritePage, Layout, PostCard, ProfilePage

`PostDetail`과 `CommentResponse` 타입에 `authorProfileImageUrl` optional 필드 추가.

**Why:** 프로필 사진 수정 후 다른 페이지에서 기본 아바타만 표시되는 버그 — 대부분 페이지에서 이미지 URL을 받지 않고 이니셜만 렌더링하고 있었음.

**How to apply:** 새로운 아바타 표시가 필요하면 UserAvatar 사용 (size: xs/sm/md/lg). 백엔드가 해당 필드를 내려주지 않으면 이니셜 fallback으로 동작.
