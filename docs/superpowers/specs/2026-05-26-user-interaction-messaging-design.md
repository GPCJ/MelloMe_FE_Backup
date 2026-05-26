# 쪽지(DM) 및 유저 상호작용 진입점 설계

- 작성일: 2026-05-26
- 개정: 2026-05-26 (critic 감사 반영 — C-1/M-1/M-2/M-3 및 미해결 질문 해소)
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
| 댓글/대댓글 | `CommentResponse` | 있음 (`types/post.ts` 확인) |
| 게시글 목록/피드 카드 | `TherapyPostSummaryResponse` | 없음 (nickname/img만) |

### 알림 연동의 실제 상태 (중요 — 초기 설계 오류 정정)

백엔드 OpenAPI의 `NotificationResponse.type` enum에는 `NEW_MESSAGE`가 있습니다. **그러나 프론트엔드는 이를 아직 지원하지 않습니다:**

- `types/notification.ts`의 `NotificationType` union에 `NEW_MESSAGE`가 없습니다.
- `utils/notificationRoute.ts`의 `getNotificationRoute` switch에 `NEW_MESSAGE` case가 없어, 현재 쪽지 알림 카드를 누르면 `default → '/posts'`로 빠집니다.

따라서 "알림이 쪽지 상세로 이동"하려면 프론트 타입/라우팅 추가가 선행되어야 합니다(슬라이스 0). 또한 `notificationRoute.ts` 주석에 따르면 `referenceId`의 의미는 타입마다 다르고 댓글 계열은 postId 미동봉이라 상세로 이동하지 못하는 전례가 있습니다. NEW_MESSAGE의 `referenceId`가 messageId인지는 백엔드 확인 항목입니다(7장 Q1).

## 4. 확정된 결정 사항

### 진입 UI
- 프사 클릭/터치 시 드롭다운을 띄웁니다. **트리거 영역은 프사(아바타)만이며 닉네임은 트리거가 아닙니다.**
- 드롭다운 항목은 세로로 프로필, 팔로우, 쪽지 순서입니다.
- 이번 범위에서는 쪽지만 동작합니다. 프로필과 팔로우는 회색 비활성으로 노출하고 클릭 시 "준비 중인 기능이에요" 토스트를 띄웁니다(백엔드 API 부재). 3칸 노출은 향후 확장 자리를 미리 보여주기 위한 의도된 결정입니다.
- 본인 프사를 클릭한 경우 드롭다운을 띄우지 않습니다. **본인 판정은 `authorId === useAuthStore.getState().user?.id`로 합니다**(`MeResponse.id: number` 확인).

### 진입점 위치
- 게시글 상세의 작성자, 댓글/대댓글의 작성자에 적용합니다(authorId가 있는 곳).
- 피드 카드는 authorId가 없어 이번 범위에서 제외하고, 백엔드가 `authorId`를 추가하면 적용합니다.

### 쪽지 작성 화면
- PC는 모달, 모바일은 라우트로 분기합니다(CH-09 정책, `matchMedia(min-width:768px)`).
- 드롭다운에서 쪽지를 누르면 수신자가 채워진 상태로 작성창이 열립니다.
- content는 빈값/공백 차단 + 최대 2000자 가드를 둡니다(`CommentReplyModal`의 `MAX_LENGTH` 패턴 차용).
- 발송 실패(4xx/5xx)는 삼키지 않고 원인별로 분기합니다(존재하지 않는/차단된 수신자 등). 401은 axios 인터셉터가 흡수합니다.

### 쪽지함
- 진입점은 프로필 페이지 헤더의 돋보기(Search) 아이콘 왼쪽에 둔 말풍선 아이콘입니다.
- 말풍선 아이콘에 안읽은 쪽지 수 숫자 뱃지를 표시합니다(`/me/messages/unread-count`).
- 받은함과 보낸함을 한 페이지의 2탭으로 둡니다.
- **목록 데이터는 React Query로 가져옵니다**(`useQuery(['messages','received',page])` / `['messages','sent',page]`). `NotificationPage`와 동일하게 목록=RQ, 안읽음 카운트=store로 이원화합니다. `useMessageStore`는 unreadCount 전용입니다.
- API가 제공하는 기능을 모두 구현합니다(받은함, 보낸함, 상세 보기, 삭제).

### 알림 / 뱃지 동작 (critic M-2 반영)
- 쪽지 도착 알림은 알림 페이지에서 `NEW_MESSAGE` 카드로 확인합니다. 카드를 클릭하면 쪽지 상세로 이동합니다(슬라이스 0의 라우팅 + Q1 확인 후 동작).
- **쪽지가 도착하면 알림 뱃지와 쪽지 뱃지가 둘 다 +1 됩니다.** 쪽지는 알림으로도 쌓이므로 알림 unreadCount가 오르고(기존 `addNotification`이 type 무관 +1), 쪽지 전용 뱃지도 별도로 오릅니다. 이는 의도된 동작이며 SSE 특수처리가 필요 없습니다.
- 안읽음 뱃지 갱신은 기존 알림 SSE에 얹습니다. `useNotificationSSE`의 `notification` 이벤트 핸들러에서 파싱한 `notification.type === 'NEW_MESSAGE'`면 `useMessageStore.getState().increment()`를 호출합니다.
- 초기 로드와 탭 복귀 시 `/me/messages/unread-count`로 동기화합니다(알림 `syncUnreadCount`와 동일 위치/패턴).

### 엣지케이스 기본값
- 읽음 처리: `GET /messages/{id}` 호출 시 백엔드가 read 처리한다고 가정합니다(7장 Q2 확인 대상). 상세 진입 시 unread였으면 `useMessageStore.decrement()`로 뱃지를 1 줄입니다. **단 GET이 실제 read 처리를 안 했거나 실패하면, 다음 초기/탭복귀 동기화에서 서버값으로 되돌아와 깜빡일 수 있습니다. 낙관 감소는 성공 응답 후에만 적용하고, 동기화를 신뢰 소스로 둡니다.**
- broadcast 쪽지: 받은함에서 `broadcast=true`면 "공지" 뱃지를 붙이고 답장 버튼을 두지 않습니다. 상세 조회/삭제는 일반 쪽지와 동일하게 처리합니다.
- 삭제: 가벼운 확인창을 거칩니다. 성공 시 해당 항목을 목록(RQ 캐시)에서 제거합니다.
- `/messages/new?to=:id`의 `to` 쿼리 파라미터가 비숫자/누락이면 작성 화면에서 가드합니다(`PostDetailPage`의 `isNaN(Number(...))` 가드 패턴).

## 5. 아키텍처

알림 시스템을 거울처럼 복제합니다. 단 "목록=RQ / 카운트=store" 이원 구조까지 함께 복제해야 합니다(아래 M-1 반영).

핵심 경계는 `UserActionDropdown`입니다. 모든 진입점이 이 컴포넌트 하나를 거치므로, 나중에 프로필/팔로우 API가 생기면 이 컴포넌트만 고쳐 전 진입점에 반영됩니다.

### 신규 파일

| 파일 | 책임 | 정답지 |
|---|---|---|
| `types/message.ts` | DTO 타입 4종 | `types/notification.ts` |
| `api/messages.ts` | 6개 엔드포인트 호출 함수 | `api/notifications.ts` |
| `stores/useMessageStore.ts` | `unreadCount` + 액션(`setUnreadCount`, `increment`, `decrement`, `clear`) | `useNotificationStore`의 unreadCount 부분 |
| `components/common/UserActionDropdown.tsx` | 진입 허브 드롭다운(프로필/팔로우/쪽지). 트리거=프사, 본인 미노출 | `CommentCard`의 DropdownMenu, `UserMenu.tsx` |
| `components/message/MessageComposeModal.tsx` | PC 작성 모달 | `PostWriteModal`, `CommentReplyModal` |
| `components/message/MessageUnreadBadge.tsx` | 말풍선 옆 숫자 뱃지 | `SideNav`의 뱃지 JSX |
| `pages/message/MessageBoxPage.tsx` | `/messages` 받은/보낸 2탭 (목록=RQ) | `NotificationPage` |
| `pages/message/MessageDetailPage.tsx` | `/messages/:messageId` 전문 + 삭제 + 읽음 | `NotificationPage` 카드 |
| `pages/message/MessageComposePage.tsx` | `/messages/new?to=:id` 모바일 작성 | 모달 내용 재사용 |

### 수정 파일

| 파일 | 변경 |
|---|---|
| `types/notification.ts` | `NotificationType`에 `'NEW_MESSAGE'` 추가 (슬라이스 0) |
| `utils/notificationRoute.ts` | `case 'NEW_MESSAGE'` 추가 → `referenceId ? '/messages/${referenceId}' : '/messages'` (슬라이스 0, Q1 확인 후 확정) |
| `App.tsx` | `/messages`, `/messages/:messageId`, `/messages/new` 라우트 추가(AuthRoute + Layout 안). `/messages/new`를 `/messages/:messageId`보다 먼저 배치 |
| `hooks/useNotificationSSE.ts` | 쪽지 unread 초기/탭복귀 동기화 추가, `notification` 이벤트가 `NEW_MESSAGE`면 `useMessageStore.increment()` |
| `ProfilePage.tsx` 헤더 | 돋보기 왼쪽에 말풍선 아이콘 + `MessageUnreadBadge`, 클릭 시 `/messages` 이동 |
| `PostDetailPage.tsx`, `CommentCard.tsx` | 작성자 프사를 `UserActionDropdown`으로 감쌈. 좌측 프로필 컬럼 레이아웃/시안 정합(세로선 정렬)이 깨지지 않는지 손으로 확인 |

## 6. 구현 슬라이스

전체를 한 번에 하지 않고 각각 독립적으로 끝나는 단위로 나눕니다. 각 슬라이스가 끝나면 그 자체로 동작하는 체크포인트가 됩니다.

### 슬라이스 0: 알림 NEW_MESSAGE 지원 (선행, 작음)
1. `types/notification.ts` — `NotificationType`에 `'NEW_MESSAGE'` 추가
2. `utils/notificationRoute.ts` — `case 'NEW_MESSAGE'` 추가 (Q1 확인 전에는 목록 `/messages` fallback으로 두고, 확인 후 상세 라우팅)

체크포인트: 타입 에러 없이 빌드, 알림 목록에 NEW_MESSAGE 카드가 오면 클릭 시 최소한 게시판이 아닌 쪽지 영역으로 이동

### 슬라이스 1: 쪽지 보내기 (최소 end-to-end)
1. `types/message.ts` 작성 (정답지: `types/notification.ts`)
2. `api/messages.ts`에 `sendMessage`만 먼저 (정답지: `api/notifications.ts`)
3. `UserActionDropdown.tsx` 작성 (3항목, 쪽지만 동작, 프로필/팔로우는 토스트, 본인 미노출)
4. `MessageComposeModal` + 모바일 `MessageComposePage` (content 2000자/빈값 가드, 발송 에러 분기)
5. 진입점 연결 (`PostDetailPage`, `CommentCard` 작성자 프사를 드롭다운으로 감쌈)
6. 라우트 `/messages/new` 추가

체크포인트: 게시글 상세에서 작성자 프사 클릭 → 쪽지 → 전송 → 토스트 확인 (staging, 로그인 상태)

### 슬라이스 2: 쪽지함
1. `api/messages.ts` 확장 (received/sent/detail/delete)
2. `MessageBoxPage` (받은/보낸 2탭, 목록=React Query)
3. `MessageDetailPage` (전문 + 삭제 + 읽음 낙관 감소)
4. 라우트 `/messages`, `/messages/:messageId` 추가
5. `ProfilePage` 헤더 말풍선 아이콘 → `/messages`

체크포인트: 말풍선 → 받은함 → 쪽지 클릭 → 상세 → 삭제

### 슬라이스 3: 뱃지 + 실시간
1. `stores/useMessageStore.ts` (unreadCount + setUnreadCount/increment/decrement/clear)
2. `MessageUnreadBadge` (숫자 뱃지, store 구독)
3. `useNotificationSSE.ts` 수정 (초기/탭복귀 `/me/messages/unread-count` 동기화, `notification` 이벤트가 `NEW_MESSAGE`면 `increment()`)
4. 상세 진입 시 read 반영 (`decrement()`, 성공 응답 후에만)

체크포인트: 다른 계정으로 쪽지 발송 시 알림 뱃지·쪽지 뱃지 둘 다 +1, 쪽지 읽으면 쪽지 뱃지 -1. staging에서 SSE가 실제 동작하므로 실시간 +1까지 검증 가능.

## 7. 백엔드 확인 항목 (착수 전 차단성 질문)

슬라이스 1·2는 아래 확인 없이 진행 가능하지만, **슬라이스 0의 라우팅 확정과 슬라이스 3은 Q1·Q2에 의존합니다.**

- **Q1 [차단]** `NEW_MESSAGE` 알림의 `referenceId`가 messageId인가? 아니면 알림 카드 → 쪽지 상세 이동이 깨집니다(댓글 계열처럼 fallback 필요). staging 실데이터/Swagger로 1건 확인.
- **Q2 [차단]** `GET /messages/{messageId}`가 실제로 read 처리하는가? 어떤 조건에서(수신자 조회만? 보낸함/broadcast 제외?)? 슬라이스 3의 뱃지 감소 로직 전부가 여기 의존.
- **Q3 (비차단, 백로그)** 피드 카드 진입점을 위해 `TherapyPostSummaryResponse`에 `authorId` 추가 요청(이번 범위 밖).

## 8. 한계와 가정

- 읽음 처리를 별도 API 없이 상세 조회의 부수효과로 가정합니다(Q2). 동작이 다르면 슬라이스 3의 낙관 감소 로직을 조정합니다. 신뢰 소스는 초기/탭복귀 동기화이고, 낙관 감소는 표시 지연을 줄이는 보조 수단입니다.
- 쪽지는 스레드형이 아니라 단발 메일함 모델이므로, "대화 잇기" 같은 UX는 제공하지 않습니다.
- 안읽음 뱃지를 알림 SSE에 얹기 때문에, SSE가 끊긴 동안 도착한 쪽지는 다음 초기/탭복귀 동기화 시점에 반영됩니다.
- 개발/테스트는 staging 백엔드로 직접 합니다(`.env*`가 `VITE_MSW_ENABLED=false`, staging/prod URL). 따라서 쪽지는 MSW 핸들러를 만들지 않습니다(만들어도 실행되지 않는 죽은 코드). 누군가 `VITE_MSW_ENABLED=true`로 돌리면 쪽지 엔드포인트만 404가 나지만, 현재 워크플로우에선 무해하고 필요 시 후속으로 추가합니다.

## 9. 범위 밖 (Out of scope)

- 피드 카드에서의 진입(백엔드 authorId 추가 후)
- 프로필 항목의 실제 동작(`GET /users/{id}` 부재)
- 팔로우 항목의 실제 동작(`/follow` 부재)
- 쪽지 답장/대화 스레드(API 모델이 단발형)
- 모바일 BottomNav 쪽지함 진입(현재는 ProfilePage 헤더 말풍선만. 필요 시 후속)
