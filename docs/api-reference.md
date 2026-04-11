# API Reference (Swagger 기준 — 2026-04-10)

> Swagger UI: `https://api.melonnetherapists.com/swagger-ui/index.html`
> Base URL: `https://api.melonnetherapists.com`
> 인증: Bearer JWT (`Authorization: Bearer <accessToken>`)

---

## 목차

1. [인증 (Auth)](#1-인증-auth)
2. [게시글 (Posts)](#2-게시글-posts)
3. [피드 (Feed)](#3-피드-feed)
4. [댓글 (Comments)](#4-댓글-comments)
5. [스크랩 (Scraps)](#5-스크랩-scraps)
6. [리액션 — 게시글](#6-리액션--게시글)
7. [리액션 — 댓글](#7-리액션--댓글)
8. [첨부파일 (Attachments)](#8-첨부파일-attachments)
9. [게시글 이미지 (Post Images)](#9-게시글-이미지-post-images)
10. [알림 (Notifications)](#10-알림-notifications)
11. [치료사 인증 (Therapist Verification)](#11-치료사-인증-therapist-verification)
12. [마이페이지 (Me)](#12-마이페이지-me)
13. [약관 (Terms)](#13-약관-terms)
14. [관리자 (Admin)](#14-관리자-admin)
15. [홈 (Home)](#15-홈-home)
16. [공통 Enum 값](#16-공통-enum-값)
17. [공통 응답 래퍼 / 페이지네이션](#17-공통-응답-래퍼--페이지네이션)

---

## 1. 인증 (Auth)

### POST `/api/v1/auth/signup` — 회원가입

**Request Body (required: email, password, agreements):**
```ts
{
  email: string;
  password: string;          // minLength: 8
  agreements: AgreementRequest[];
}
```

**`AgreementRequest` (required: type, version):**
```ts
{
  type: "SERVICE_TERMS" | "PRIVACY_POLICY" | "MARKETING";
  version: string;
  agreed: boolean;
}
```

**Response — `SignupResponse`:**
```ts
{
  id: number;
  email: string;
  nickname: string;
  accessToken: string;
  role: string;
}
```

---

### POST `/api/v1/auth/login` — 로그인

**Request Body (required: email, password):**
```ts
{
  email: string;
  password: string;
}
```

**Response — `LoginResponse`:**
```ts
{
  user: CurrentUserResponse;
  tokens: {
    accessToken: string;
    accessTokenExpiresInSec: number;
  };
}
```

> RT는 `Set-Cookie: httpOnly`로 전달됨 (body에 없음)

---

### POST `/api/v1/auth/refresh` — 토큰 갱신

**Request:** 없음 (RT는 Cookie로 자동 전송)

**Response — `RefreshResponse`:**
```ts
{
  accessToken: string;
  accessTokenExpiresInSec: number;
}
```

---

### POST `/api/v1/auth/logout` — 로그아웃

**Response:** 200 OK (body 없음)

---

## 2. 게시글 (Posts)

### GET `/api/v1/posts` — 게시글 목록 (페이지 기반) 🔒

**Query Params:**
| param    | type   | default  | 비고 |
|----------|--------|----------|------|
| page     | int    | 0        | 0-based |
| size     | int    | 10       | |
| sortType | string | "LATEST" | `LATEST` \| `MOST_VIEWED` |

**Response — `PagedResponse<TherapyPostSummaryResponse>`:**
```ts
{
  items: TherapyPostSummaryResponse[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
}
```

**`TherapyPostSummaryResponse`:**
```ts
{
  id: number;
  postType: PostType;
  contentPreview: string;
  authorNickname: string;
  therapyArea: TherapyArea;
  visibility: Visibility;
  viewCount: number;
  createdAt: string;       // ISO 8601
  scrapped: boolean;
}
```

> `title`, `ageGroup` 필드 삭제됨

---

### POST `/api/v1/posts` — 게시글 작성 🔒

**Request Body (required: content):**
```ts
{
  content: string;
  therapyArea?: TherapyArea;
  visibility?: Visibility;
}
```

> `title`, `ageGroup`, `postType` 삭제됨. `therapyArea`도 optional로 변경

**Response:** `TherapyPostDetailResponse`

---

### GET `/api/v1/posts/{postId}` — 게시글 상세 🔒

**Path:** `postId` (int64)

**Response — `TherapyPostDetailResponse`:**
```ts
{
  id: number;
  content: string;
  postType: PostType;
  authorId: number;
  authorNickname: string;
  therapyArea: TherapyArea;
  visibility: Visibility;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  canEdit: boolean;
  canDelete: boolean;
  attachments: PostAttachmentResponse[];
  scrapped: boolean;
}
```

> `title`, `ageGroup` 삭제됨. `visibility`, `scrapped` 추가

---

### PATCH `/api/v1/posts/{postId}` — 게시글 수정 🔒

**Request Body (required: content):**
```ts
{
  content: string;
  therapyArea?: TherapyArea;
  visibility?: Visibility;
}
```

> `title`, `ageGroup` 삭제됨

**Response:** `TherapyPostDetailResponse`

---

### DELETE `/api/v1/posts/{postId}` — 게시글 삭제 🔒

**Response:** 200 OK (body 없음)

---

## 3. 피드 (Feed)

### GET `/api/v1/posts/feed` — 게시글 피드 (커서 기반, 무한스크롤) 🔒

**Query Params:**
| param  | type   | default | 비고 |
|--------|--------|---------|------|
| size   | int    | 20      | |
| cursor | string | -       | 다음 페이지 커서 (첫 요청 시 생략) |

> 정렬: LATEST 고정

**Response — `CursorPagedResponse<TherapyPostSummaryResponse>`:**
```ts
{
  items: TherapyPostSummaryResponse[];
  nextCursor: string | null;
  hasNext: boolean;
  size: number;
}
```

---

## 4. 댓글 (Comments)

### GET `/api/v1/posts/{postId}/comments` — 댓글 목록

**Response — `CommentResponse[]`:**
```ts
{
  id: number;
  postId: number;
  parentCommentId: number | null;
  authorId: number;
  authorNickname: string;
  authorRole: string;
  content: string;
  deleted: boolean;
  canEdit: boolean;
  canDelete: boolean;
  createdAt: string;
  updatedAt: string;
  replies: ReplyCommentResponse[];
}
```

**`ReplyCommentResponse`:**
```ts
{
  id: number;
  postId: number;
  parentCommentId: number;
  authorId: number;
  authorNickname: string;
  authorRole: string;
  content: string;
  deleted: boolean;
  canEdit: boolean;
  canDelete: boolean;
  createdAt: string;
  updatedAt: string;
}
```

---

### POST `/api/v1/posts/{postId}/comments` — 댓글 작성

**Request Body (required: content):**
```ts
{
  content: string;
  parentCommentId?: number;  // 대댓글일 때만
}
```

**Response:** `CommentResponse`

---

### PATCH `/api/v1/comments/{commentId}` — 댓글 수정

**Request Body (required: content):**
```ts
{
  content: string;
}
```

**Response:** `CommentResponse`

---

### DELETE `/api/v1/comments/{commentId}` — 댓글 삭제

**Response:** 200 OK (body 없음)

---

## 5. 스크랩 (Scraps)

### POST `/api/v1/posts/{postId}/scrap` — 스크랩 추가

**Response — `ScrapStatusResponse`:**
```ts
{
  postId: number;
  scrapped: boolean;
}
```

---

### DELETE `/api/v1/posts/{postId}/scrap` — 스크랩 삭제

**Response:** `ScrapStatusResponse`

---

### GET `/api/v1/posts/{postId}/scrap` — 스크랩 상태 조회

**Response:** `ScrapStatusResponse`

---

### GET `/api/v1/me/scraps` — 내 스크랩 목록

**Query Params:** `page` (default 0), `size` (default 10)

**Response — `PagedResponse<ScrappedPostResponse>`:**
```ts
{
  items: ScrappedPostResponse[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
}
```

**`ScrappedPostResponse`:**
```ts
{
  postId: number;
  contentPreview: string;
  authorNickname: string;
  therapyArea: TherapyArea;
  ageGroup: AgeGroup;
  viewCount: number;
  postCreatedAt: string;
  scrappedAt: string;
}
```

---

## 6. 리액션 — 게시글

### PUT `/api/v1/posts/{postId}/reaction` — 게시글 리액션 토글

**Request Body (required: reactionType):**
```ts
{
  reactionType: "EMPATHY" | "APPRECIATE" | "HELPFUL";
}
```

**Response — `PostReactionStatusResponse`:**
```ts
{
  postId: number;
  empathyCount: number;
  appreciateCount: number;
  helpfulCount: number;
  myReactionType: "EMPATHY" | "APPRECIATE" | "HELPFUL" | null;
  reactionCounts: Record<string, number>;
  topReactionType: "EMPATHY" | "APPRECIATE" | "HELPFUL" | null;
  topReactionCount: number;
  topReactionColorToken: string;
}
```

---

### GET `/api/v1/posts/{postId}/reaction` — 게시글 리액션 조회

**Response:** `PostReactionStatusResponse`

---

## 7. 리액션 — 댓글

### PUT `/api/v1/comments/{commentId}/reaction` — 댓글 리액션 토글

**Request Body (required: reactionType):**
```ts
{
  reactionType: "LIKE" | "DISLIKE";
}
```

**Response — `CommentReactionStatusResponse`:**
```ts
{
  commentId: number;
  likeCount: number;
  dislikeCount: number;
  myReactionType: "LIKE" | "DISLIKE" | null;
}
```

---

### GET `/api/v1/comments/{commentId}/reaction` — 댓글 리액션 조회

**Response:** `CommentReactionStatusResponse`

---

## 8. 첨부파일 (Attachments)

### POST `/api/v1/posts/{postId}/attachments` — 파일 업로드 🔒

**Request:** `multipart/form-data` — `file` (binary, required)

**Response — `PostAttachmentResponse`:**
```ts
{
  id: number;
  originalFilename: string;
  contentType: string;
  sizeBytes: number;
  extension: string;
  downloadUrl: string;
  createdAt: string;
}
```

---

### GET `/api/v1/posts/{postId}/attachments/{attachmentId}/download` — 파일 다운로드 🔒

**Response:** binary (파일 스트림)

---

### DELETE `/api/v1/posts/{postId}/attachments/{attachmentId}` — 첨부파일 삭제 🔒

> 마지막 첨부파일 삭제 시 postType이 COMMUNITY로 롤백

**Response:** 200 OK (body 없음)

---

## 9. 게시글 이미지 (Post Images)

### POST `/api/v1/posts/{postId}/images` — 이미지 업로드 🔒

**Request:** `multipart/form-data` — `file` (binary, required)

> jpg/png/webp, 5MB 이하

**Response — `PostImageResponse`:**
```ts
{
  id: number;
  imageUrl: string;
  originalFilename: string;
  displayOrder: number;
  createdAt: string;
}
```

---

### GET `/api/v1/posts/{postId}/images` — 이미지 목록 조회 🔒

**Response:** `PostImageResponse[]`

---

### GET `/api/v1/posts/{postId}/images/{imageId}` — 이미지 다운로드 🔒

**Response:** binary

---

## 10. 알림 (Notifications)

### GET `/api/v1/notifications` — 알림 목록 🔒

**Query Params:** `page` (default 0), `size` (default 20)

**Response — `PagedResponse<NotificationResponse>`:**
```ts
{
  items: NotificationResponse[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
}
```

**`NotificationResponse`:**
```ts
{
  id: number;
  type: NotificationType;
  content: string;
  referenceId: number;
  senderId: number;
  senderNickname: string;
  read: boolean;
  readAt: string | null;
  createdAt: string;
}
```

---

### GET `/api/v1/notifications/subscribe` — SSE 실시간 알림 구독 🔒

**Header (optional):** `Last-Event-ID` — 유실 이벤트 복구용

**Response:** `text/event-stream` (SSE)

---

### GET `/api/v1/notifications/unread-count` — 미읽은 알림 수 🔒

**Response — `UnreadCountResponse`:**
```ts
{
  count: number;
}
```

---

### PATCH `/api/v1/notifications/{notificationId}/read` — 단건 읽음 처리 🔒

**Response:** 200 OK

---

### PATCH `/api/v1/notifications/read-all` — 전체 읽음 처리 🔒

**Response:** 200 OK

---

### DELETE `/api/v1/notifications/{notificationId}` — 알림 삭제 🔒

**Response:** 200 OK

---

## 11. 치료사 인증 (Therapist Verification)

### POST `/api/v1/therapist-verifications` — 인증 신청

**Request:** `multipart/form-data`
```ts
{
  licenseCode: string;      // required
  licenseImage: File;       // required, binary
}
```

**Response — `TherapistVerificationResponse`:**
```ts
{
  id: number;
  userId: number;
  userEmail: string;
  userNickname: string;
  licenseCode: string;
  licenseImageOriginName: string;
  licenseImageDownloadUrl: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  reviewedById: number | null;
  reviewedByNickname: string | null;
  reviewedAt: string | null;
  rejectReason: string | null;
  createdAt: string;
  updatedAt: string;
  demoted: boolean;
}
```

---

### GET `/api/v1/therapist-verifications/me` — 내 인증 상태 조회

**Response:** `TherapistVerificationResponse`

---

### GET `/api/v1/therapist-verifications/me/image` — 내 인증 이미지 다운로드

**Response:** binary

---

## 12. 마이페이지 (Me)

### GET `/api/v1/me` — 현재 유저 정보

**Response — `CurrentUserResponse`:**
```ts
{
  id: number;
  email: string;
  nickname: string;
  profileImageUrl: string | null;
  role: string;
  canAccessCommunity: boolean;
  communityAccessLevel: string;
  therapistVerification: TherapistVerificationSummary | null;
}
```

**`TherapistVerificationSummary`:**
```ts
{
  status: string;
  requestedAt: string | null;
  reviewedAt: string | null;
  rejectionReason: string | null;
}
```

---

### PATCH `/api/v1/me` — 프로필 수정

> 닉네임(2~20자), 프로필 이미지 URL 변경. null이면 기존 값 유지

**Request Body:**
```ts
{
  nickname?: string;        // minLength: 2, maxLength: 20
  profileImageUrl?: string;
}
```

**Response:** `CurrentUserResponse`

---

### DELETE `/api/v1/me` — 회원 탈퇴

> 계정 soft delete + 토큰 전체 폐기 + 쿠키 만료

**Response:** 200 OK

---

### POST `/api/v1/me/profile-image` — 프로필 이미지 업로드

**Request:** `multipart/form-data` — `file` (binary, required)

> jpg/png/webp, 5MB 이하

**Response:** `Record<string, string>` (imageUrl 포함)

---

### GET `/api/v1/me/profile-image/profile-images/{filename}` — 프로필 이미지 조회

> 인증 불필요

**Response:** binary

---

### GET `/api/v1/me/posts` — 내가 쓴 게시글

**Query Params:** `page` (default 0), `size` (default 10)

**Response:** `PagedResponse<TherapyPostSummaryResponse>`

---

### GET `/api/v1/me/comments` — 내가 쓴 댓글

> 삭제된 댓글 포함, content 마스킹

**Query Params:** `page` (default 0), `size` (default 10)

**Response — `PagedResponse<MyCommentResponse>`:**

**`MyCommentResponse`:**
```ts
{
  commentId: number;
  content: string;
  postId: number;
  createdAt: string;
  isDeleted: boolean;
}
```

---

### GET `/api/v1/me/scraps` — 내 스크랩 목록

→ [5. 스크랩](#5-스크랩-scraps) 참조

---

### GET `/api/v1/me/downloads` — 내 다운로드 목록 🔒

**Query Params:** `page` (default 0), `size` (default 10)

**Response — `PagedResponse<DownloadedPostResponse>`:**

**`DownloadedPostResponse`:**
```ts
{
  postId: number;
  postType: PostType;
  contentPreview: string;
  authorNickname: string;
  therapyArea: TherapyArea;
  ageGroup: AgeGroup;
  firstDownloadedAt: string;
  lastDownloadedAt: string;
  downloadCount: number;
}
```

---

## 13. 약관 (Terms)

### GET `/api/v1/terms/service` — 이용약관 URL

> S3 presigned URL (10분 유효). 인증 불필요

**Response:** `Record<string, string>`

---

### GET `/api/v1/terms/privacy` — 개인정보처리방침 URL

> S3 presigned URL (10분 유효). 인증 불필요

**Response:** `Record<string, string>`

---

## 14. 관리자 (Admin)

### GET `/api/v1/admin/therapist-verifications` — 인증 목록 조회

**Query Params:**
| param  | type   | default | 비고 |
|--------|--------|---------|------|
| status | string | -       | 필터 (optional) |
| page   | int    | 0       | |
| size   | int    | 20      | |

**Response — `PagedResponse<TherapistVerificationResponse>`:**
```ts
{
  items: TherapistVerificationResponse[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
}
```

---

### POST `/api/v1/admin/therapist-verifications/{verificationId}/approve` — 승인

**Response:** `TherapistVerificationResponse`

---

### POST `/api/v1/admin/therapist-verifications/{verificationId}/reject` — 반려

**Request Body (required: rejectReason):**
```ts
{
  rejectReason: string;
}
```

**Response:** `TherapistVerificationResponse`

---

### GET `/api/v1/admin/therapist-verifications/{verificationId}/image` — 인증 이미지 다운로드

**Response:** binary

---

## 15. 홈 (Home)

### GET `/api/v1/home`

**Response:** `Record<string, string>` (key-value map)

---

## 16. 공통 Enum 값

### PostType
| 값 | 설명 |
|----|------|
| `COMMUNITY` | 커뮤니티 게시글 |
| `RESOURCE` | 자료 게시글 |

### TherapyArea
| 값 | 설명 |
|----|------|
| `UNSPECIFIED` | 미지정 |
| `SENSORY_INTEGRATION` | 감각통합치료 |
| `SPEECH` | 언어치료 |
| `OCCUPATIONAL` | 작업치료 |
| `COGNITIVE` | 인지치료 |
| `PHYSICAL` | 물리치료 |
| `ART` | 미술치료 |
| `MUSIC` | 음악치료 |
| `PLAY` | 놀이치료 |
| `BEHAVIOR` | 행동치료 |

### AgeGroup
| 값 | 설명 |
|----|------|
| `UNSPECIFIED` | 미지정 |
| `AGE_0_2` | 0~2세 |
| `AGE_3_5` | 3~5세 |
| `AGE_6_12` | 6~12세 |
| `AGE_13_18` | 13~18세 |
| `AGE_19_64` | 19~64세 |
| `AGE_65_PLUS` | 65세 이상 |

### Visibility
| 값 | 설명 |
|----|------|
| `PUBLIC` | 공개 |
| `PRIVATE` | 비공개 |

### PostReactionType
`EMPATHY` | `APPRECIATE` | `HELPFUL`

### CommentReactionType
`LIKE` | `DISLIKE`

### NotificationType
| 값 | 설명 |
|----|------|
| `NEW_COMMENT` | 새 댓글 |
| `NEW_REPLY` | 새 대댓글 |
| `NEW_POST_REACTION` | 게시글 리액션 |
| `NEW_COMMENT_REACTION` | 댓글 리액션 |
| `NEW_SCRAP` | 스크랩 |
| `VERIFICATION_SUBMITTED` | 인증 신청 |
| `VERIFICATION_APPROVED` | 인증 승인 |
| `VERIFICATION_REJECTED` | 인증 반려 |

### VerificationStatus
`PENDING` | `APPROVED` | `REJECTED`

### SortType
`LATEST` | `MOST_VIEWED`

### AgreementType
`SERVICE_TERMS` | `PRIVACY_POLICY` | `MARKETING`

---

## 17. 공통 응답 래퍼 / 페이지네이션

### ApiResponse 래퍼

모든 API 응답은 `ApiResponse<T>`로 감싸짐:
```ts
{
  success: boolean;
  data: T;
}
```

### PagedResponse (오프셋 기반)

```ts
{
  items: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
}
```

### CursorPagedResponse (커서 기반 — 피드 전용)

```ts
{
  items: T[];
  nextCursor: string | null;
  hasNext: boolean;
  size: number;
}
```

> 🔒 = `Authorization: Bearer <accessToken>` 필요
