---
name: project-notification-integration-2026-05-13
description: feat/notification 알림 기능 통합 완료 (2026-05-13) — cherry-pick + Swagger 정합 fix 4건 + store/페이지 분리 패턴 발견
metadata: 
  node_type: memory
  type: project
  cognitive_debt: HIGH
  originSessionId: e53c02b0-a765-4e47-b751-2059fdf30cca
---

알림 기능을 develop에 통합 완료 (2026-05-13, 브랜치 `feat/notification-integration`).

## 작업 분담 (attribution)

| 작업 | 작성자 | 인지부채 |
|---|---|---|
| 알림 코어 9파일 신규 (cherry-pick from `origin/feat/notification`) | 이전 세션 AI | HIGH |
| Swagger 정합 fix 4건 (enum/page-size/postId/referenceId 시그니처) | 본 세션 AI | HIGH |
| 통합 4파일 수정 (App 라우트+SSE 매니저, Layout/SideNav 뱃지, mocks/handlers/index) | 본 세션 AI | HIGH |
| `useNotificationStore.removeNotification` `wasUnread` 시그니처 + `some()` 변환 | 사용자 직접 입력 (의사코드는 AI 제시) | 낮음 (직접 작성 + 학습 박제) |
| 본 작업의 디버깅 (MSW 모드에서 안 읽은 알림 삭제 시 카운트 미감소 발견) | 사용자 | — |

후속 학습 보강 필요 영역 (인지부채 HIGH): SSE 흐름(`useNotificationSSE` 지수 백오프 / `Last-Event-ID` / `visibilitychange` 재연결), `connectSSE`의 fetch+ReadableStream 직접 파싱 패턴, Zustand store/페이지 분리 구조가 핵심.

## 통합 전략 결정 Why

`origin/feat/notification`은 2026-04-26 base에서 35커밋 작업되었고 그 사이 develop이 78커밋 진화. 알림 외 영역(LoginPage/SignupPage/WelcomeModal/CommentCard/PostCard/CommentInput 등)이 양쪽에서 별도로 진화해 14파일 코드 충돌 발생. 알림 기능만 별도로 개발한 브랜치였으므로 develop이 이미 더 최신 — 그대로 머지하면 develop의 진화분이 옛 시안으로 덮일 위험.

**옵션 B 채택: 알림 코어 파일만 cherry-pick + 통합 지점 4파일만 수동 수정.**

## 변경 파일 (총 13개)

**신규 9개 (cherry-pick)**: `api/notifications.ts`, `types/notification.ts`, `lib/sseClient.ts`, `hooks/useNotificationSSE.ts`, `stores/useNotificationStore.ts`, `utils/notificationRoute.ts`, `pages/notification/NotificationPage.tsx`, `mocks/data/notifications.ts`, `mocks/handlers/notifications.handlers.ts`

**통합 4개 (수동 수정)**: `App.tsx`(라우트+`NotificationManager` 컴포넌트), `components/layout/SideNav.tsx`(알림 슬롯 뱃지), `components/layout/Layout.tsx`(BottomNav 알림 슬롯 뱃지), `mocks/handlers/index.ts`(notificationsHandlers 추가)

## Swagger 정합 fix 4건

staging `https://api-staging.melonnetherapists.com/v3/api-docs` 기준 정합:

1. `NotificationType` enum에 `VERIFICATION_SUBMITTED` 추가 (8종)
2. `PaginatedNotifications` 필드명 `pageNumber/pageSize` → `page/size`, `totalPages` 추가
3. `NotificationResponse.postId` 필드 제거 — 백엔드 미동봉, frontend 가정 오류
4. `getNotificationRoute(type, referenceId?)` 시그니처 변경 — `referenceId` 의미가 type별로 다름:
   - `NEW_POST_REACTION`/`NEW_SCRAP` → 게시글 ID → `/posts/${referenceId}`
   - `NEW_COMMENT`/`NEW_REPLY`/`NEW_COMMENT_REACTION` → 댓글 ID → `/posts` 목록 fallback (postId 미동봉 → B-10 대기)
   - `VERIFICATION_*` → `/profile`

## axios 응답 unwrap 자동 처리 확인

`api/notifications.ts`의 `res.data` 캐스팅이 unwrap 누락처럼 보였으나, `axiosInstance.ts:37` 응답 인터셉터가 `{success, data}` 자동 unwrap 처리. 추가 변경 불필요 (wiki `unwrap` 동일 패턴이지만 이 경우엔 OK).

## 부수 버그 fix — store/페이지 알림 분리 패턴

**증상**: MSW 모드에서 안 읽은 알림 휴지통 클릭 시 SideNav/BottomNav 뱃지 카운트 미감소. 개별 읽음/모두 읽음은 정상.

**원인**: `useNotificationStore.notifications`(SSE로 도착)와 `NotificationPage` 로컬 `useState`(fetch)가 분리 관리됨. `removeNotification(id)`가 store 배열에서 `find`로 `read` 여부 검사하는데, 페이지 알림은 store 배열에 없어 `target = undefined` → 카운트 그대로.

**왜 다른 함수는 동작하나**: `markAsRead`/`markAllAsRead`는 `read` 여부 분기 없이 무조건 카운트 변경 (`-1` 또는 `0`). 삭제만 `read`에 따라 분기 필요 (읽은 거 지우면 카운트 유지, 안 읽은 거 지우면 -1).

**fix**: `removeNotification: (id, wasUnread?: boolean) => void` 시그니처 확장. 호출자가 명시하면 그 값 사용, 미명시 시 store 배열 검사 fallback 유지(향후 Layout 드롭다운 삭제 기능 대비). `find + !!` 대신 `some()` 사용.

## 검증

- `tsc -b --noEmit` 통과
- `npm run build` 통과 (7.01s)
- MSW 모드 브라우저 검증: 뱃지/목록/개별 읽음/모두 읽음/삭제/라우팅 8케이스 통과 (사용자 확인)

## 미해결

- **B-10** 백엔드 알림 응답에 `postId` 동봉 요청 — 댓글 계열 알림 라우팅 정상화
- **LIVE staging 검증 미실시** — SSE 인프라(ALB idle timeout, EC2 nginx `proxy_buffering`) 미확인
- **커밋 미실시** — 사용자가 추가 디버깅 후 직접 커밋 (한국어/서명 금지)
- **헤더 드롭다운 미반영** — `feat/notification` 원본의 Bell 드롭다운(최근 5건 미리보기)은 develop의 Chrome 통일 정책(Layout 헤더 폐기)으로 적용 불가. 진입점은 SideNav/BottomNav/`/notifications` 페이지로 일원화

## 관련

- backlog `CH-05` (완료) / `B-10` (백엔드 대기)
- wiki `sse-b-zustand-fetch-event-source` (decision, SSE 옵션 B + fetch-event-source 결정)
- wiki `unwrap` (debugging, 응답 unwrap 패턴 — 본 작업은 자동 unwrap 활용)
- [[user-reactivity-libs-learning]] — 단편 규칙 누적 (store/페이지 분리 분기 시 호출자가 인자로 정보 전달)
- [[project-chrome-unification-policy]] — 헤더 드롭다운 미반영 결정 근거
