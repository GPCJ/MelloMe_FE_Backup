# 쪽지(DM) 및 유저 상호작용 진입점 설계

- 작성일: 2026-05-26
- 단계: Post-MVP
- 대상 독자: 프론트엔드 개발자(본인)
- 상태: 설계 확정, 구현 대기

## 1. 목적

게시글 상세와 댓글에서 다른 유저와 상호작용할 수 있는 진입점을 만들고, 그 진입점에서 쪽지를 주고받는 기능을 구현합니다. 진입점은 향후 팔로우, 타인 프로필 등으로 확장할 수 있는 단일 허브로 설계합니다.

## 2. 배경과 전략

직관적으로는 "타인 프로필 페이지를 만들고 거기서 쪽지/팔로우"가 자연스럽지만, 타인 프로필 조회 API(`GET /users/{id}`)가 아직 없습니다. 반면 쪽지 발송은 `receiverId`만 있으면 가능하고, 그 ID는 게시글 상세와 댓글 응답에 이미 실려 옵니다.

그래서 프로필 허브를 선행하지 않고, 작성자가 노출되는 곳에서 바로 상호작용을 거는 인라인 액션 전략을 택합니다. 진입 UI는 프사 클릭 시 드롭다운을 띄우는 방식으로 합니다. 프사를 실수로 눌렀을 때 곧바로 페이지가 이동하면 UX에 해롭다는 판단입니다.

## 3. 백엔드 API 현황 (staging 기준, 2026-05-26 확인)

쪽지 엔드포인트는 develop(staging)에 이미 반영되어 있습니다.

| Method | Path | 용도 |
|---|---|---|
| POST | `/api/v1/messages` | 쪽지 발송 |
| GET | `/api/v1/messages/{messageId}` | 쪽지 상세 조회 |
| DELETE | `/api/v1/messages/{messageId}` | 쪽지 삭제 |
| GET | `/api/v1/me/messages/received` | 받은 쪽지함 (page/size, 0-based) |
| GET | `/api/v1/me/messages/sent` | 보낸 쪽지함 (page/size) |
| GET | `/api/v1/me/messages/unread-count` | 안읽은 쪽지 수 |

DTO:

```
MessageSendRequest { receiverId*: long, content*: string }

MessageResponse {
  messageId, senderId, senderNickname,
  receiverId, receiverNickname,
  content, read: boolean, broadcast: boolean, createdAt
}

UnreadCountResponse { count: long }
PagedResponseMessageResponse { items[], page, size, totalElements, totalPages, hasNext }
```

설계상 중요한 점은 이 API가 대화(스레드)형이 아니라 받은함/보낸함으로 나뉘는 쪽지함 모델이라는 것입니다. 채팅 UI가 아니라 메일함에 가깝습니다.

상호작용 진입에 필요한 작성자 식별 정보:

| 위치 | 응답 스키마 | authorId |
|---|---|---|
| 게시글 상세 | `TherapyPostDetailResponse` | 있음 |
| 댓글/대댓글 | `CommentResponse` | 있음 |
| 게시글 목록/피드 카드 | `TherapyPostSummaryResponse` | 없음 (nickname/img만) |

알림 시스템은 `NEW_MESSAGE` 타입을 이미 지원합니다(`NotificationResponse.type` enum 포함). 쪽지가 도착하면 알림이 자동으로 쌓이고, SSE로도 수신됩니다.

## 4. 확정된 결정 사항

### 진입 UI
- 프사 클릭/터치 시 드롭다운을 띄웁니다.
- 드롭다운 항목은 세로로 프로필, 팔로우, 쪽지 순서입니다.
- 이번 범위에서는 쪽지만 동작합니다. 프로필과 팔로우는 UI만 노출하고 동작하지 않습니다(백엔드 API 부재).
- 본인 프사를 클릭한 경우 드롭다운을 띄우지 않습니다.

### 진입점 위치
- 게시글 상세의 작성자, 댓글/대댓글의 작성자에 적용합니다(authorId가 있는 곳).
- 피드 카드는 authorId가 없어 이번 범위에서 제외하고, 백엔드가 `authorId`를 추가하면 적용합니다.

### 쪽지 작성 화면
- PC는 모달, 모바일은 라우트로 분기합니다(CH-09 정책, `matchMedia(min-width:768px)`).
- 드롭다운에서 쪽지를 누르면 수신자가 채워진 상태로 작성창이 열립니다.

### 쪽지함
- 진입점은 프로필 페이지 헤더의 돋보기(Search) 아이콘 왼쪽에 둔 말풍선 아이콘입니다.
- 말풍선 아이콘에 안읽은 쪽지 수 숫자 뱃지를 표시합니다(`/me/messages/unread-count`, 알림 뱃지와 별개).
- 받은함과 보낸함을 한 페이지의 2탭으로 둡니다.
- API가 제공하는 기능을 모두 구현합니다(받은함, 보낸함, 상세 보기, 삭제).

### 알림 연동
- 쪽지 도착 알림은 알림 페이지에서 `NEW_MESSAGE` 카드로 확인합니다.
- 알림 카드를 클릭하면 쪽지 상세로 이동합니다.

### 안읽음 뱃지 갱신 방식
- 기존 알림 SSE에 얹습니다. `notification` 이벤트가 `NEW_MESSAGE`면 쪽지 카운트를 갱신합니다.
- 초기 로드와 탭 복귀 시 동기화합니다(알림 `syncUnreadCount`와 동일 패턴).
- 별도 폴링이나 새 SSE 연결은 만들지 않습니다.

### 엣지케이스 기본값
- 읽음 처리: `GET /messages/{id}` 호출 시 백엔드가 read 처리한다고 가정합니다. 상세 진입 시 unread였으면 뱃지를 1 줄입니다.
- broadcast 쪽지: 받은함에서 `broadcast=true`면 "공지" 뱃지를 붙이고 답장 버튼을 두지 않습니다.
- UI-only 항목(프로필/팔로우): 회색 비활성으로 두고, 클릭 시 "준비 중인 기능이에요" 토스트를 띄웁니다.
- 삭제: 가벼운 확인창을 거칩니다.

## 5. 아키텍처

알림 시스템을 거울처럼 복제합니다. `notifications.ts` / `useNotificationStore` / `NotificationPage` 패턴이 검증되어 있어, 쪽지도 동일 구조로 만들어 학습과 유지보수 비용을 줄입니다.

핵심 경계는 `UserActionDropdown`입니다. 모든 진입점이 이 컴포넌트 하나를 거치므로, 나중에 프로필/팔로우 API가 생기면 이 컴포넌트만 고쳐 전 진입점에 반영됩니다.

### 신규 파일

| 파일 | 책임 | 정답지 |
|---|---|---|
| `types/message.ts` | DTO 타입 4종 | `types/notification.ts` |
| `api/messages.ts` | 6개 엔드포인트 호출 함수 | `api/notifications.ts` |
| `stores/useMessageStore.ts` | `unreadCount` 전용 store | `useNotificationStore` |
| `components/common/UserActionDropdown.tsx` | 진입 허브 드롭다운(프로필/팔로우/쪽지) | `CommentCard`의 DropdownMenu, `UserMenu.tsx` |
| `components/message/MessageComposeModal.tsx` | PC 작성 모달 | `PostWriteModal`, `CommentReplyModal` |
| `components/message/MessageUnreadBadge.tsx` | 말풍선 옆 숫자 뱃지 | `SideNav`의 뱃지 JSX |
| `pages/message/MessageBoxPage.tsx` | `/messages` 받은/보낸 2탭 | `NotificationPage` |
| `pages/message/MessageDetailPage.tsx` | `/messages/:messageId` 전문 + 삭제 | `NotificationPage` 카드 |
| `pages/message/MessageComposePage.tsx` | `/messages/new?to=:id` 모바일 작성 | 모달 내용 재사용 |

### 수정 파일

| 파일 | 변경 |
|---|---|
| `App.tsx` | `/messages`, `/messages/:messageId`, `/messages/new` 라우트 추가(AuthRoute + Layout 안) |
| `hooks/useNotificationSSE.ts` | 쪽지 unread 초기/탭복귀 동기화 추가, `NEW_MESSAGE` 이벤트 시 카운트 갱신 |
| `ProfilePage.tsx` 헤더 | 돋보기 왼쪽에 말풍선 아이콘 + 뱃지, 클릭 시 `/messages` 이동 |
| `PostDetailPage.tsx`, `CommentCard.tsx` | 작성자 프사/닉네임을 `UserActionDropdown`으로 감쌈 |

## 6. 구현 슬라이스

전체를 한 번에 하지 않고 각각 독립적으로 끝나는 단위로 나눕니다. 각 슬라이스가 끝나면 그 자체로 동작하는 체크포인트가 됩니다.

### 슬라이스 1: 쪽지 보내기 (최소 end-to-end)
1. `types/message.ts` 작성 (정답지: `types/notification.ts`)
2. `api/messages.ts`에 `sendMessage`만 먼저 (정답지: `api/notifications.ts`)
3. `UserActionDropdown.tsx` 작성 (3항목, 쪽지만 동작, 본인 미노출)
4. `MessageComposeModal` + 모바일 `MessageComposePage`
5. 진입점 연결 (`PostDetailPage`, `CommentCard` 작성자를 드롭다운으로 감쌈)
6. 라우트 `/messages/new` 추가

체크포인트: 게시글 상세에서 작성자 프사 클릭 → 쪽지 → 전송 → 토스트 확인

### 슬라이스 2: 쪽지함
1. `api/messages.ts` 확장 (received/sent/detail/delete)
2. `MessageBoxPage` (받은/보낸 2탭 + 목록)
3. `MessageDetailPage` (전문 + 삭제 + 읽음)
4. 라우트 `/messages`, `/messages/:messageId` 추가
5. `ProfilePage` 헤더 말풍선 아이콘 → `/messages`

체크포인트: 말풍선 → 받은함 → 쪽지 클릭 → 상세 → 삭제

### 슬라이스 3: 뱃지 + 실시간
1. `stores/useMessageStore.ts` (unreadCount)
2. `MessageUnreadBadge` (숫자 뱃지)
3. `useNotificationSSE.ts` 수정 (초기/탭복귀 동기화, `NEW_MESSAGE` 시 +1)
4. 상세 진입 시 read 반영 (-1)

체크포인트: 다른 계정으로 쪽지 발송 시 뱃지 +1, 읽으면 -1

## 7. 백엔드 확인 항목 (구현과 별개)

- `GET /messages/{id}`가 실제로 read 처리하는지 확인합니다(별도 read API가 없음).
- `NEW_MESSAGE` 알림의 `referenceId`가 messageId인지 확인합니다(상세 이동에 사용).
- 피드 카드 진입점을 위해 `TherapyPostSummaryResponse`에 `authorId` 추가를 요청합니다(이번 범위 밖, 백로그).

## 8. 한계와 가정

- 읽음 처리를 별도 API 없이 상세 조회의 부수효과로 가정합니다. 백엔드 동작이 다르면 슬라이스 3의 read 반영 로직을 조정해야 합니다.
- 쪽지는 스레드형이 아니라 단발 메일함 모델이므로, "대화 잇기" 같은 UX는 제공하지 않습니다.
- 안읽음 뱃지를 알림 SSE에 얹기 때문에, SSE가 끊긴 동안 도착한 쪽지는 다음 초기/탭복귀 동기화 시점에 반영됩니다.

## 9. 범위 밖 (Out of scope)

- 피드 카드에서의 진입(백엔드 authorId 추가 후)
- 프로필 항목의 실제 동작(`GET /users/{id}` 부재)
- 팔로우 항목의 실제 동작(`/follow` 부재)
- 쪽지 답장/대화 스레드(API 모델이 단발형)
