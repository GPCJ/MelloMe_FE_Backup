// 팔로우 목록 행 — /me/followings, /me/followers 공유 DTO.
// 주의: 백엔드 FollowUserResponse에는 "내가 이 사람을 팔로우 중인가"(following) 필드가 없다.
//       팔로워 탭 맞팔 버튼은 그래서 이번 슬라이스 제외(backlog F-12).
export interface FollowUser {
  userId: number;
  nickname: string;
  profileImageUrl?: string | null;
  role: string;
}

// POST/DELETE/GET /users/{userId}/follow 응답.
export interface FollowStatus {
  userId: number;
  following: boolean;
}

// GET /me/follow-counts 응답.
export interface FollowCount {
  followerCount: number;
  followingCount: number;
}

// offset 페이지 응답 (커서 아님 — page/totalPages/hasNext).
export interface PagedFollowUsers {
  items: FollowUser[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
}
