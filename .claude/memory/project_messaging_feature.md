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

**백엔드 확인 항목 (2026-06-01 staging Swagger로 갱신):**
- Q2 ✅ **해소** — `GET /messages/{messageId}` description = "수신자가 조회하면 자동 읽음 처리". 즉 GET 상세가 read 처리함, 조건=수신자 조회(보낸함/broadcast 제외). slice 3 낙관적 -1 로직 유효. **slice 3 하드 블로킹 풀림.**
- Q1 ⚠️ **거의 해소** — `NotificationResponse`에 `referenceId`(generic)+`postId`(별도) 둘 다 존재. NEW_MESSAGE면 referenceId=messageId 가능성 높음(postId는 댓글/게시글용 별도). 단 필드 desc 비어 Swagger만으론 미확정 → 실제 NEW_MESSAGE 알림 1건 런타임 확인 필요. 그동안 slice 0 안전 fallback(`/messages` 목록)이 받침.

**slice 1 완성 (2026-06-01, PR #20 ready, base develop) — ⚠️ AI 작성 인지부채 HIGH:**
- 이번 세션 slice 1 step 4~6 전부 AI가 작성(사용자 "뇌 덜 쓰는" 모드 명시 요청, 유닛마다 설명 받음). [[feedback_ai_written_code_cognitive_debt]] 대상.
- 신규 6파일: `stores/messageComposeStore.ts`(트리거 store, receiver 담고 닫을 때 null 청소) / `hooks/useSendMessage.ts`(가드+발송+에러분기, `MESSAGE_MAX_LENGTH=1000` export) / `hooks/useOpenMessageCompose.ts`(PC=store/모바일=navigate 분기 헬퍼) / `components/message/MessageComposeModal.tsx`(루트 상시마운트 토글, 닫힐 때 content 리셋, hook 후 return null) / `pages/message/MessageComposePage.tsx`(`?to=&name=`, to 가드).
- 수정: `Layout.tsx`(모달 마운트) / `PostDetailPage.tsx`·`CommentCard.tsx`(작성자 아바타→`UserActionDropdown`) / `App.tsx`(`/messages/new` 라우트).
- **함정 박제**: CommentCard 기존 `onMessageClick`은 쪽지 아니라 💬 답글 아이콘(line 204). 재사용 안 하고 내부에서 헬퍼 직접 호출로 분리.
- **자기점검 질문**: ① 모달이 store만으로 드롭다운과 통신하는 이유? ② 닫힐 때 content/receiver 비우는 이유(루트 상시마운트)? ③ `useOpenMessageCompose`가 분기를 한곳에 가두는 이득? ④ 1000자가 2000 아닌 근거?
- **다음**: staging 실측(프사→쪽지→전송 토스트, PC모달/모바일라우트) → PR #20 머지 → slice 2. 모바일 성공후 `/posts` 임시이동은 slice 2에서 `/messages` 교체.

**slice 1 인지부채 자기점검 진행 + 모달 마운트 전략 재결정 (2026-06-02):**
- 자기점검 Q&A **전부 완료 (2026-06-02)**: Q1(store로 진입점↔모달 분리) ✅ / Q2(상시 마운트라 자동 언마운트 안 됨→수동 청소) ✅ / Q3(`useOpenMessageCompose`가 분기 정책 단일 출처+진입점 동작 통일) ✅ / Q4(maxLength=1000은 백엔드 제약의 거울, FE 2겹 가드=textarea+send 방어체크) ✅. Q3은 TIL 초안에 신규 섹션 박제(notion_draft.md), Q4는 표면적이라 미박제(사용자 판단).
- **★ 결정: 쪽지 작성 모달을 상시 마운트 → 조건부 마운트로 전환.** 근거: 상시 마운트 이점(닫힘 애니메이션·내용 임시저장·재마운트 회피)이 이 모달엔 하나도 실사용 안 됨(애니메이션 미구현/임시저장은 오히려 매번 비움/모달 가벼움) → 수동 청소 복잡도만 떠안음. 사용자가 직접 트레이드오프 판단해 결정(학습 세션).
- **구현 방식 = 조건부 B(얇은 게이트 컴포넌트).** 조건부 A(Layout이 `open` 구독)는 모달 열 때 페이지 전체 리렌더 비용 발생 → state 없는 `MessageComposeModalGate`가 `open`만 구독해 `{open && <MessageComposeModal/>}`. 모달 변경=open 구독 삭제+content 리셋 effect(`:20-22`) 삭제+ESC/스크롤 effect `!open` 가드 삭제+return-null의 `!open` 제거. Layout `:30` 한 줄 교체.
- **✅ 구현 완료 (2026-06-02, 커밋 `bcea18e`, PR #20에 push).** 방식 B 확정, AI 작성(기계적 변경이라)+유닛설명+본인 diff 리뷰. deadline-guard hook이 AI 편집 차단 → 사용자가 `! touch .claude/deadline-unlock`로 직접 unlock 후 진행. 다른 세션(`feat/concern-form-reorder`의 미커밋 ConcernForm.tsx) 보호 위해 격리 worktree에서 작업 후 제거. 3파일(+20/−15): 신규 `MessageComposeModalGate`(open만 구독, open일 때만 모달 마운트→리렌더 격리) / `MessageComposeModal`(open구독·content리셋effect·!open가드 제거) / `Layout`(게이트로 교체). tsc -b 통과. 런타임 동작은 staging 실측에서 확인 예정. 인지부채 낮음(사용자가 Q1~Q4 자기점검으로 메커니즘 이해 완료 후 구현).
- 기존 `PostWriteModal`(상시 마운트)은 **이번에 안 건드림** → 백로그 [[backlog]] **R-13**에 조건부 전환 검토 박제(Hot Path라 별도 PR).
- TIL 노션 초안 작성 완료(`.claude/memory/notion_draft.md`, 분류=TIL): "전역 모달의 두 마운트 전략 — 조건부 vs 상시+return null" 장점6/단점6/최종결정. `/post-notion-draft`로 업로드 대기.
- **PR #20(slice 1) 여전히 OPEN, base develop, MERGEABLE.** 머지 게이트=staging 실측(미완) — 단 위 조건부 전환을 PR #20에 포함할지/별도로 갈지도 다음 세션 결정 필요.

**PR #20 코드 리뷰 진행 + 브랜치 상태 함정 (2026-06-02):**
- **리뷰 진행 상황 박제** (이번 세션 시작 때 "어디까지 리뷰했나" 기록이 없어 곤란 → 다음 재개용). per-commit 자가 리뷰([[feedback_pr_per_commit_review_workflow]]) 방식.
  - ✅ 완료: `useSendMessage.ts` / `MessageComposePage.tsx` / `messageComposeStore.ts` / `MessageComposeModal.tsx`(디스크의 상시 마운트 버전 + `bcea18e` 마운트 전환 개념까지) / `useOpenMessageCompose.ts` / `PostDetailPage.tsx`·`CommentCard.tsx`(b553cdd).
  - 남은: `App.tsx`(4ab3893, 디스크에 있음, 라우트 한 줄) / `MessageComposeModalGate.tsx`·`Layout.tsx`(bcea18e 게이트).
- **⚠️ 브랜치 상태 함정**: 현재 작업 브랜치 `feat/concern-form-reorder`에는 `bcea18e`(조건부 마운트 전환)가 **없음**(`git merge-base --is-ancestor bcea18e HEAD` = NO). 따라서 **디스크의 `MessageComposeModal.tsx`는 폐기된 상시 마운트 버전**(open 구독·content 리셋 effect·`!open` 가드 잔존)이고, `MessageComposeModalGate.tsx`는 디스크에 아예 없음. PR #20 최종본을 리뷰/검증하려면 `git checkout feat/messaging-slice1-send`(단 워킹트리에 다른 세션의 `ConcernForm.tsx` 미커밋 변경 있어 정리 필요) 또는 `git show bcea18e`로 그 부분만 확인.
- 리뷰 중 정리된 핵심 이해(다음 세션 참고): store=진입점↔모달 통신 창구(부모-자식 아니라 트리 거리 때문, 언마운트 무관) / `content`만 로컬(공유 불필요) / `receiverId`만 서버로(nickname은 표시용) / `useOpenMessageCompose`=PC·모바일 분기 단일 출처(진입점은 위임만) / 두 진입점 연결 코드는 `size` 한 줄 빼고 동일.

**✅ PR #20(slice 1) develop 머지 완료 (2026-06-03):**
- 검증용 격리 worktree(`feat/messaging-slice1-send` 체크아웃)에서 `npm run dev`(staging 직결, env 파일 worktree로 복사 필요 — gitignore라 새 worktree엔 없어 흰화면 났던 함정) → 브라우저 실측 통과(프사→쪽지→ESC/배경클릭 닫힘→재오픈 빈 입력창 ✓, PC모달/모바일라우트 ✓).
- 실측 중 버그 3건 발견·수정 → 단일 커밋 `a4d2ba4` push 후 머지(merge commit, base develop, MERGEABLE/CLEAN):
  1. **스크롤 잠김** — `UserActionDropdown` `<DropdownMenu modal={false}>`. Base UI 드롭다운(`modal` 기본 true)이 body `overflow:hidden`을 잠근 상태에서 쪽지 모달이 열리며 그 잠긴 값을 "원래값"으로 메모 → 닫을 때 hidden 박제. PostWriteModal/CommentReplyModal은 버튼에서 직접 열려 깨끗해서 멀쩡 → 누수 장소는 모달이나 *조건*은 드롭다운 락이라 드롭다운을 끔(모달 패턴 일관성 보존). **재사용 함정 → 추후 wiki 후보.**
  2. **토스트 중복** — 준비 중 안내 `toast(..., { id: 'coming-soon' })` 공통 id로 dedup(sonner 호출은 받되 같은 id면 기존 갱신).
  3. **이동 시 토스트 잔존** — `Layout`에 `useEffect(() => toast.dismiss(), [location.pathname])`. 단일 Toaster 큐 + 라우트 전환 단일 길목이라 한 곳이면 전역 적용.
- 3건 전부 사용자 자가 리뷰+소크라테스 재진술로 이해 완료, 노션 초안 `notion_draft.md` `[트러블슈팅]` 섹션에 박제(업로드 대기).
- 정리: 검증 worktree 제거. merged 브랜치 `feat/messaging-slice1-send`는 로컬/원격 잔존(삭제 미정).
- **다음 = slice 2** (쪽지함/상세). 모바일 전송 성공 후 `/posts` 임시이동 → `/messages`로 교체.

진행 상황(슬라이스별 완료/진행)은 [[backlog]] 참조.
