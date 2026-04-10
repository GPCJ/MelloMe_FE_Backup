# API Reference (Swagger 기준 — 2026-04-10)

> 원본: `http://43.203.40.3:8080/swagger-ui/index.html`
> Base URL: `http://43.203.40.3:8080`
> 인증: Bearer JWT (`Authorization: Bearer <accessToken>`)

---

## 목차

1. [인증 (Auth)](#1-인증-auth)
2. [게시글 (Posts)](#2-게시글-posts)
3. [댓글 (Comments)](#3-댓글-comments)
4. [스크랩 (Scraps)](#4-스크랩-scraps)
5. [리액션 — 게시글](#5-리액션--게시글)
6. [리액션 — 댓글](#6-리액션--댓글)
7. [첨부파일 (Attachments)](#7-첨부파일-attachments)
8. [치료사 인증 (Therapist Verification)](#8-치료사-인증-therapist-verification)
9. [마이페이지 (Me)](#9-마이페이지-me)
10. [관리자 (Admin)](#10-관리자-admin)
11. [홈 (Home)](#11-홈-home)
12. [공통 Enum 값](#12-공통-enum-값)
13. [공통 응답 래퍼](#13-공통-응답-래퍼)

---

## 1. 인증 (Auth)

### POST `/api/v1/auth/signup` — 회원가입

**Request Body:**
```ts
{
  email: string;
  password: string;
  nickname: string;
}
```

**Response — `SignupResponse`:**
```ts
{
  id: number;    // int64
  email: string;
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
  isNewUser: boolean;
  user: CurrentUserResponse;  // 아래 참조
  tokens: {
    accessToken: string;
    accessTokenExpiresInSec: number;  // int64
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

**Request/Response:** 없음 (200 OK)

---

## 2. 게시글 (Posts)

### GET `/api/v1/posts` — 게시글 목록 🔒

**Query Params:**
| param    | type   | default  | 비고 |
|----------|--------|----------|------|
| page     | int    | 0        | 0-based |
| size     | int    | 10       | |
| sortType | string | "LATEST" | `LATEST` \| `MOST_VIEWED` |

**Response — `PostListResponse`:**
```ts
{
  posts: TherapyPostSummaryResponse[];
  page: number;
  size: number;
  totalElements: number;  // int64
  totalPages: number;
  hasNext: boolean;
}
```

**`TherapyPostSummaryResponse`:**
```ts
{
  id: number;
  postType: PostType;
  title: string;
  contentPreview: string;
  authorNickname: string;
  therapyArea: TherapyArea;
  ageGroup: AgeGroup;
  viewCount: number;
  createdAt: string;  // ISO 8601
}
```

---

### POST `/api/v1/posts` — 게시글 작성 🔒

**Request Body (모두 required):**
```ts
{
  title: string;
  content: string;
  postType: PostType;
  therapyArea: TherapyArea;
  ageGroup: AgeGroup;
}
```

**Response:** `TherapyPostDetailResponse` (아래 참조)

---

### GET `/api/v1/posts/{postId}` — 게시글 상세 🔒

**Path:** `postId` (int64)

**Response — `TherapyPostDetailResponse`:**
```ts
{
  id: number;
  title: string;
  content: string;
  postType: PostType;
  authorId: number;
  authorNickname: string;
  therapyArea: TherapyArea;
  ageGroup: AgeGroup;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  canEdit: boolean;
  canDelete: boolean;
  attachments: PostAttachmentResponse[];
}
```

---

### PATCH `/api/v1/posts/{postId}` — 게시글 수정 🔒

**Request Body (모두 required):**
```ts
{
  title: string;
  content: string;
  therapyArea: TherapyArea;
  ageGroup: AgeGroup;
}
```

> `postType`은 수정 불가

**Response:** `TherapyPostDetailResponse`

---

### DELETE `/api/v1/posts/{postId}` — 게시글 삭제 🔒

**Response:** 200 OK (body 없음)

---

## 3. 댓글 (Comments)

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
  replies: ReplyCommentResponse[];  // 대댓글
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

## 4. 스크랩 (Scraps)

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

**Response — `ScrapListResponse`:**
```ts
{
  scraps: ScrappedPostResponse[];
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
  title: string;
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

## 5. 리액션 — 게시글

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
}
```

---

### GET `/api/v1/posts/{postId}/reaction` — 게시글 리액션 조회

**Response:** `PostReactionStatusResponse`

---

## 6. 리액션 — 댓글

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

## 7. 첨부파일 (Attachments)

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

## 8. 치료사 인증 (Therapist Verification)

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
}
```

---

### GET `/api/v1/therapist-verifications/me` — 내 인증 상태 조회

**Response:** `TherapistVerificationResponse`

---

### GET `/api/v1/therapist-verifications/me/image` — 내 인증 이미지 다운로드

**Response:** binary

---

## 9. 마이페이지 (Me)

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
  therapistVerification: {
    status: string;
    requestedAt: string | null;
    reviewedAt: string | null;
    rejectionReason: string | null;
  } | null;
}
```

---

### GET `/api/v1/me/scraps` — 내 스크랩 목록

→ [4. 스크랩](#4-스크랩-scraps) 참조

---

### GET `/api/v1/me/downloads` — 내 다운로드 목록 🔒

**Query Params:** `page` (default 0), `size` (default 10)

**Response — `DownloadListResponse`:**
```ts
{
  downloads: DownloadedPostResponse[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
}
```

**`DownloadedPostResponse`:**
```ts
{
  postId: number;
  postType: PostType;
  title: string;
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

## 10. 관리자 (Admin)

### GET `/api/v1/admin/therapist-verifications` — 인증 목록 조회

**Query Params:**
| param  | type   | default | 비고 |
|--------|--------|---------|------|
| status | string | -       | 필터 (optional) |
| page   | int    | 0       | |
| size   | int    | 20      | |

**Response — `TherapistVerificationPageResponse`:**
```ts
{
  verifications: TherapistVerificationResponse[];
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

## 11. 홈 (Home)

### GET `/api/v1/home`

**Response:** `Record<string, string>` (key-value map)

---

## 12. 공통 Enum 값

### PostType
| 값 | 설명 |
|----|------|
| `COMMUNITY` | 커뮤니티 게시글 |
| `RESOURCE` | 자료 게시글 |

### TherapyArea
| 값 | 설명 |
|----|------|
| `UNSPECIFIED` | 미지정 |
| `OCCUPATIONAL` | 작업치료 |
| `SPEECH` | 언어치료 |
| `COGNITIVE` | 인지치료 |
| `PLAY` | 놀이치료 |

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

### PostReactionType (게시글)
`EMPATHY` | `APPRECIATE` | `HELPFUL`

### CommentReactionType (댓글)
`LIKE` | `DISLIKE`

### VerificationStatus
`PENDING` | `APPROVED` | `REJECTED`

### SortType
`LATEST` | `MOST_VIEWED`

---

## 13. 공통 응답 래퍼

모든 API 응답은 `ApiResponse<T>` 래퍼로 감싸짐:

```ts
{
  success: boolean;
  data: T;  // 각 엔드포인트별 응답 타입
}
```

> 🔒 = `Authorization: Bearer <accessToken>` 필요
