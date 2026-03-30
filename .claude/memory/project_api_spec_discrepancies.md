---
name: API 스펙 불일치 목록 (2026-03-20 실제 백엔드 연결 후 업데이트)
description: 백엔드 자동생성 openapi JSON과 현재 프론트 코드 간 불일치 항목. 실제 백엔드 연결로 새 항목 추가됨.
type: project
---

백엔드가 공유한 자동생성 openapi JSON(`openapi-3.0.yaml`)과 현재 프론트 코드 간 불일치 항목.

**Why:** 백엔드 스펙 기준으로 프론트 타입/코드를 맞춰야 함. 실제 서버 연결 후 새 불일치 발견됨.

**How to apply:** 수정 전 아래 항목 확인 후 타입/컴포넌트 함께 수정.

---

## 1. 누락된 엔드포인트 (백엔드 구현 필요)

프론트에서 호출 중인데 스펙에 없음:

| 엔드포인트 | 프론트 파일 | 용도 |
|---|---|---|
| `POST /api/v1/auth/oauth/google` | `api/auth.ts` `googleLogin()` | Google 로그인 |
| `GET /api/v1/me/dashboard` | `api/mypage.ts` `fetchMyDashboard()` | 마이페이지 대시보드 |
| `GET /api/v1/me/posts` | `api/mypage.ts` `fetchMyPosts()` | 내가 쓴 글 |
| `GET /api/v1/me/activity` | `api/mypage.ts` `fetchMyActivity()` | 내 활동 내역 |
| `DELETE /api/v1/posts/{postId}/reaction` | `api/posts.ts` `unlikePost()` | 게시물 반응 취소 |

---

## 2. 파라미터 이름/구조 불일치

**`GET /api/v1/posts` 쿼리 파라미터:**

| 항목 | 스펙 | 프론트 코드 | 판단 |
|---|---|---|---|
| 정렬 파라미터명 | `sortType` | `sort` | 프론트 수정 필요 (`sort` → `sortType`) |
| 정렬 값 | `LATEST`, `MOST_VIEWED` | `PostSort` 타입 (`LATEST`등) | 값 매핑 확인 필요 |
| 게시판 필터 | 없음 | `board` 파라미터 전송 중 | 백엔드 지원 여부 확인 필요 |
| 치료 영역 필터 | 없음 | `therapyArea` 파라미터 전송 중 | 백엔드 지원 여부 확인 필요 |

---

## 3. 게시물 반응 타입 불일치 (기획 변경 가능성)

| 항목 | 스펙 | 프론트 코드 |
|---|---|---|
| Post reaction | `EMPATHY`, `APPRECIATE`, `HELPFUL` | `LIKE` 전송 중 (`likePost()`) |
| Comment reaction | `LIKE`, `DISLIKE` | 동일 (일치) |

→ 게시물 반응이 단순 LIKE에서 3가지 감정 표현으로 바뀐 것으로 보임.
→ UI 변경 수반 (버튼 3개로 늘어남) → **와이어프레임 확인 후 결정**

---

## 4. 타입 구조 불일치 (2026-03-20 실제 백엔드 연결 후 발견, 수정 필요)

### 수정 완료
- `PostListResponse`: `items` → `posts`, 페이지네이션 중첩 객체 → flat 구조 (`page`, `size`, `totalElements`, `totalPages`, `hasNext`)

### 수정 필요
| 항목 | 스펙 | 프론트 타입 |
|---|---|---|
| `therapyArea` enum 값 | `OCCUPATIONAL`, `SPEECH`, `COGNITIVE`, `PLAY` | `OCCUPATIONAL_THERAPY`, `SPEECH_THERAPY` 등 `_THERAPY` 붙은 형태 |
| `PostSummary` 작성자 | `authorNickname: string` | `author: { id, nickname, profileImageUrl }` 객체 |
| `PostDetail` 작성자 | `authorNickname: string` | `author: { id, nickname, profileImageUrl }` 객체 |
| `PostDetail` 스크랩 | 없음 | `scrapped: boolean` 있음 |
| `CommentResponse` 작성자 | `authorId`, `authorNickname`, `authorRole` (별도 필드) | `author: { id, nickname, profileImageUrl }` 객체 |
| `CommentResponse` 권한 | `canEdit`, `canDelete` 있음 | 없음 |
| `CommentResponse` 답글 | `replies: CommentResponse[]` 중첩 | 없음 |

---

## 5. attachments 필드 (2026-03-30 추가)

- `GET /api/v1/posts/{postId}` 응답에 `attachments` 배열 추가됨
- 스웨거에 `required` 표시 없음 → `optional`로 처리
- `Attachment` 인터페이스 + `PostDetail.attachments?` 타입 추가 완료
- `PostDetailPage.tsx`에 첨부파일 목록 UI 구현 완료 (파일명 + 크기 + 다운로드 링크)

---

## 결론

- **백엔드에 확인/요청할 것:** 누락 엔드포인트 5개 구현, `board`/`therapyArea` 파라미터 지원 여부
- **와이어프레임 공유 후 결정:** 반응 타입 변경 여부, 필터 설계
- **프론트 수정 확정:** `sort` → `sortType`, `therapyArea` enum 값, 작성자/댓글 타입 구조
