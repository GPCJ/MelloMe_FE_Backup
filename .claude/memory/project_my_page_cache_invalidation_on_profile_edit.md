---
name: 프사/닉네임 변경 시 마이페이지 RQ 캐시 무효화 (2026-05-12)
description: ProfilePage에서 프사/닉네임 변경 후 myPosts·myComments·myScraps 캐시 prefix 무효화로 PostCard 아바타·닉네임 stale 해결. 옵션 A/B/C 트레이드오프 박제.
type: project
originSessionId: 078e63be-093a-4d71-af72-dc0c20b33306
---
# 프사/닉네임 변경 시 마이페이지 RQ 캐시 무효화 (2026-05-12)

## 결정

`ProfilePage.tsx`의 `handleImageChange`/`handleSaveNickname` 성공 분기에서 `setUser(...)` 직후 `invalidateMyPageTabs()` 호출. 헬퍼는 컴포넌트 함수 내부에 closure로 선언, `myPosts`/`myComments`/`myScraps` 세 queryKey를 prefix만으로 무효화함 (페이지 번호 무관 전체 매칭).

구현 커밋: `ee07728` (develop, 2026-05-12 미푸시 상태).

## Why

ProfilePage 헤더 큰 아바타는 `useAuthStore`의 `user.profileImageUrl`을 직접 구독하므로 `setUser({...user, profileImageUrl})` 한 줄로 즉시 갱신됨. 그러나 "내 시그널" 탭의 PostCard 작은 아바타는 `post.authorProfileImageUrl`(서버 응답)을 props로 받고, 그 데이터는 ProfilePage의 `useQuery(['myPosts', page-1])` 캐시에 박혀있어 `setUser`만으로는 stale. 닉네임도 동일 구조(`post.authorNickname` 캐시 박힘).

## How to apply

- **재발 시그널:** "store에 박힌 본인 정보는 즉시 반영되는데, 같은 페이지의 리스트/카드는 옛값을 그대로 들고 있다"는 사용자 신고.
- **본인 정보만 들어있는 캐시(`my*` 계열):** prefix 무효화로 충분, 위 패턴 그대로 적용.
- **타인 정보 섞인 캐시(feed 등):** 본인 글만 매핑 갈아끼우는 setQueryData 또는 PostCard 자체에서 본인 분기 등 별도 검토. `PostSummary.authorId` 부재(`PostCard.tsx:18-19` TODO) 해소가 선행 조건.

## 옵션 비교 (옵션 A 채택)

| 옵션 | 변경량 | 네트워크 | 채택 여부 |
|---|---|---|---|
| **A. `invalidateQueries(['myPosts'])` prefix 무효화** | 1~3줄 | 활성 탭 1회 + 비활성 2회는 다음 마운트 때 | ✅ 채택 |
| B. `setQueryData`로 캐시 직접 패치 | 페이지별 queryKey 순회 + 닉네임 매핑 따로 → 길어짐 | 0회 | 비채택 (과함) |
| C. PostCard에서 본인 여부 분기 (`authorId === currentUserId`이면 store override) | 작지만 영향 범위 넓음 | 0회 | 비채택 (`PostSummary.authorId` 부재 + nickname 비교 부정확 + 피드까지 영향, MVP 임박) |

## 구현 디테일

```ts
const queryClient = useQueryClient();
const invalidateMyPageTabs = () => {
  queryClient.invalidateQueries({ queryKey: ['myPosts'] });
  queryClient.invalidateQueries({ queryKey: ['myComments'] });
  queryClient.invalidateQueries({ queryKey: ['myScraps'] });
};
```

호출 위치:
- `handleImageChange`: `uploadProfileImage` 성공 후 `setUser` 다음 줄
- `handleSaveNickname`: `updateMyProfile` 성공 후 `setUser` 다음 줄 (early return 분기에서는 호출 X — 실제로 데이터 안 바뀐 케이스)

## 동작 흐름

```
프사 업로드 성공
  ↓ setUser(...)            ─ store 갱신, 헤더 아바타 즉시 변경
  ↓ invalidateMyPageTabs()  ─ RQ 캐시 stale 마킹
  ↓ 활성 query 자동 refetch  ─ 서버에서 새 authorProfileImageUrl 받아옴
  ↓ ProfilePage 리렌더       ─ postsData.items 새 객체
  ↓ PostCard 새 props        ─ UserAvatar imageUrl 갱신 → img src 변경
```

PostCard 자체는 props만 보는 컴포넌트(자체 캐시·store 구독 없음)라 코드 수정 0.
