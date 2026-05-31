---
name: dm-api
description: "쪽지 백엔드 API가 존재(05-25 \"부재\" 오확인 정정), mailbox 모델, 설계 스펙 위치 및 백엔드 대기 질문"
metadata: 
  node_type: memory
  type: project
  originSessionId: 441d03d6-0d7f-438e-9654-eaf4b835590a
---

쪽지(DM) 기능 — 2026-05-26 착수.

**API 존재 확정 (중요 — 정정):** staging Swagger에 쪽지 엔드포인트가 **존재함**. backlog의 "Swagger에 message/dm/chat 엔드포인트 부재 확정(2026-05-25)"은 **오확인**이었고, 백엔드가 이후 추가함. (교훈: 백엔드 변경 잦으니 [[reference_backend_swagger]]로 fresh 재확인.)

엔드포인트: `POST /messages`, `GET|DELETE /messages/{id}`, `GET /me/messages/received|sent|unread-count`. 알림에 `NEW_MESSAGE` 타입 존재.

**모델:** 대화(스레드)형 아니라 **받은함/보낸함 메일함 모델**.

**설계 스펙 (longform):** `docs/superpowers/specs/2026-05-26-user-interaction-messaging-design.md` (커밋됨, OMC critic 감사 반영). 상세 설계·슬라이스·근거는 이 파일이 단일 출처.

**핵심 결정 요약:**
- 진입 = 작성자 프사 클릭 → 드롭다운(프로필/팔로우/쪽지 세로). **쪽지만 동작**, 프로필/팔로우는 UI-only(API 부재, 클릭 시 "준비 중" 토스트). 본인 프사면 드롭다운 미노출.
- 진입점 = 게시글 상세 + 댓글(authorId 있는 곳). 피드 카드는 authorId 없어 백로그.
- 쪽지함 = 프로필 헤더 말풍선 아이콘 + 안읽음 숫자 뱃지. 작성 = PC 모달 / 모바일 라우트.
- **뱃지 카운트 = store(push) / 목록 = RQ(pull)** (알림 시스템 미러링).
- 알림 `NEW_MESSAGE` → 알림 페이지 카드, 클릭 시 쪽지 상세.
- 개발/테스트 = staging 직접 (env `VITE_MSW_ENABLED=false`라 MSW 미사용, 핸들러 안 만듦).

**`UserActionDropdown` 설계 5결정 확정 (slice 1, 본인작성):**
- ① Props = `targetUserId: number` + 아바타 표시값(`nickname`/`imageUrl`/`size`). 호출부는 값만 넘김.
- ② self판정 = `useAuthStore((s) => s.user?.id)` **훅 구독**(getState 아님 — getState는 SSE 등 컴포넌트 밖용). 비로그인이면 `targetUserId(number) !== undefined`라 자연히 "타인" 취급 → 드롭다운 노출(의도된 동작).
- ③ 트리거·콘텐츠 **양쪽** stopPropagation (작성자 프사가 `Link` 안에 있어 네비 누수 방지, [[link-dragstart-bubbling-postcard]] 전례).
- ④ 트리거는 `UserAvatar`를 **감싸기**(`<DropdownMenuTrigger><UserAvatar/></DropdownMenuTrigger>`). 이 프로젝트 dropdown은 `@base-ui/react` 기반이라 Radix의 `asChild` 자체가 없음(render prop만 존재) — 감싸기가 정답. CommentCard/UserMenu 패턴 동일.
- ⑤ 프로필·팔로우 = 회색 className + `sonner` 토스트("준비 중인 기능이에요"). 진짜 `disabled` 아님(disabled면 클릭 토스트 불가).
- 정답지: `CommentCard`의 DropdownMenu, `UserMenu.tsx`.

**백엔드 대기 질문 (slice 3 의존, 착수 전 확인 필요):**
- Q1: `NEW_MESSAGE` 알림의 `referenceId`가 messageId인가? (알림 카드 → 쪽지 상세 라우팅이 여기 의존)
- Q2: `GET /messages/{id}`가 실제 read 처리하나? 어떤 조건에서? (안읽음 뱃지 -1 로직이 여기 의존)

진행 상황(슬라이스별 완료/진행)은 [[backlog]] 참조.
