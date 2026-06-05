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

**slice 2(쪽지함) 구현 완료 + PR #21 생성 (2026-06-03) — ⚠️ AI 작성 인지부채 HIGH:**
- 사용자 위임("너가 코드생성 → PR 생성 → PR 리뷰 → merge"). slice 1과 동일 흐름. AI 전체 작성 → [[feedback_ai_written_code_cognitive_debt]] 대상, **사용자 자가 리뷰 대기 중**.
- **작업 공간 = 격리 worktree** `/home/jin24/MelloMe_slice2` (브랜치 `feat/messaging-slice2`, develop 최신 기준). 이유: 현재 메인 워킹트리 `feat/concern-form-reorder`에 다른 세션의 ConcernForm 미커밋 변경 보호. env 파일(gitignore)은 메인에서 복사, node_modules는 메인 것 심링크([[fresh-git-worktree-gitignore-env-vite-ts]] 함정 회피).
- **PR #21** (base develop, https://github.com/GPCJ/MelloMe_FE_Backup/pull/21). 논리 단위 6커밋. `tsc -b` 통과.
- 변경 6파일: `api/messages.ts`(received/sent/detail/delete 4종 추가) / `MessageBoxPage`(`/messages`, 받은·보낸 2탭, 목록=RQ `['messages',tab,page-1]`, Pagination, unread 강조, broadcast "공지" 뱃지) / `MessageDetailPage`(`/messages/:messageId`, 전문+삭제 confirm, 수신자 조회 시 받은함 캐시 invalidate) / `App.tsx`(라우트 2개, new를 :messageId보다 먼저) / `ProfilePage`(헤더 돋보기 왼쪽 MessageCircle → /messages) / `MessageComposePage`(모바일 성공 후 /posts→/messages).
- **범위 제외(의도적)**: ① 안읽음 뱃지·읽음 -1 동기화 = `useMessageStore` 의존 → **slice 3**. ② 알림 NEW_MESSAGE 상세 라우팅 승격 = Q1(referenceId=messageId) 런타임 미확인 → `/messages` 목록 fallback 유지. ③ 답장/스레드 = API 단발형이라 범위밖.
- **자기점검 질문(리뷰 시)**: ① 탭 전환 시 `setPage(1)` 이유? ② 상세 useEffect가 받은함 캐시만 invalidate하고 뱃지 카운트는 안 건드리는 이유(=slice 3 경계)? ③ 상세 "보낸/받는 사람" 라벨을 `senderId===myId`로 판단하는 이유(목록 탭 정보 없이 상세 단독 판단)? ④ `['messages','received']` prefix invalidate가 모든 page 캐시를 무효화하는 RQ 원리? ⑤ PC 모달은 닫기만/모바일은 /messages 이동으로 분기한 이유?
- **다음**: 자가 리뷰 → 머지 → slice 3(뱃지+실시간 SSE). 머지 후 worktree 제거 + 심링크 정리.

**✅ slice 2 per-commit 자가 리뷰 + develop 머지 완료 (2026-06-04):**
- per-commit 자가 리뷰 6커밋 전부 완료([[feedback_pr_per_commit_review_workflow]]). 인지부채 해소.
  - 실로직은 2·3번 커밋에 집중, 나머지(API/라우트/UI아이콘/이동 한 줄)는 단순. 통과한 자기점검 핵심: ① `keepPreviousData`(키 바뀔 때 직전 데이터 유지→깜빡임 방지) + `switchTab`의 `setPage(1)`(존재 안 하는 페이지 요청 차단) + 0/1-based 변환. ② 읽음 effect 4조건 중 `receiverId===myId`=방향분간(없으면 보낸쪽지에 헛동작=의미버그)·`!message.read`=중복 invalidate 차단(없어도 동작은 맞음=최적화). ③ invalidate 범위: 읽음=`['messages','received']` 좁게(받은함만 영향)/삭제=`['messages']` 넓게(받은함·보낸함·detail 어디 걸칠지 모름, 공통조상 prefix로 일괄). ④ 가드 2겹: `!validId`=URL형식(요청 전 차단, `enabled:validId`)/`isError||!message`=요청 후 실패(404 등). ⑤ `iAmSender`=나 자신 안 띄우고 항상 상대만(카톡 방 제목 비유). ⑥ React Router v6 라우트 매칭=작성순서 아닌 구체성 랭킹(정적>동적), 순서는 가독성 관례.
  - 자가 리뷰 중 학습 2건 노션 초안 박제(`notion_draft.md`, TIL): `keepPreviousData` + v6 라우트 랭킹 매칭.
- **머지**: PR #21 merge commit `2896528`, base develop, MERGEABLE/CLEAN. remote 브랜치 사용자 삭제. 로컬 브랜치 `feat/messaging-slice2` 삭제. 검증 worktree `/home/jin24/MelloMe_slice2` 제거(node_modules 심링크만 끊김, 메인 무사). 로컬 develop ff `2896528`까지 최신화.
- staging 실측은 사용자가 머지 전 직접 진행(별도 버그 보고 없음).
- **다음 = slice 3(안읽음 뱃지 + 읽음 -1 동기화 + 실시간 SSE).** 뱃지=store(push)/목록=RQ(pull) 이원화. 읽음 effect는 slice 2에서 받은함 캐시만 무효화, 뱃지 카운트 -1은 slice 3 `useMessageStore` 신설로. SSE 아키텍처는 [[sse-b-zustand-fetch-event-source]]. 백엔드 Q1(NEW_MESSAGE referenceId=messageId) 런타임 미확인 → 알림 상세승격 보류, `/messages` 목록 fallback 유지.

**✅ slice 2 후속 수정 5건 develop 직접 머지 (2026-06-04, ff 5논리커밋 `016f82b`~`49672f2`):**
- 브라우저 검증(staging dev, 항목별 수정→HMR 확인 루프)에서 발견한 버그/개선 5건. 브랜치 `fix/messaging-slice2-followup`→develop ff 머지+push, 브랜치 삭제. AI 작성(사용자 위임), 항목별 사용자 확인. ⑤ 일부는 [[feedback_ai_written_code_cognitive_debt]] 대상(ProfileHeaderActions 신규).
- ① **전송 후 목록 최신화**(`useSendMessage`): 성공 시 `invalidateQueries(['messages'])` 추가. 기존엔 staleTime 30s 안에 쪽지함 가면 새로고침해야 보였음. PC/모바일 공유 hook 한 곳.
- ② **프로필 헤더 반응형**(신규 `ProfileHeaderActions.tsx`): 좁은 화면서 아이콘 3개가 PageHeader 정중앙 타이틀과 겹침 → PC(md+)=아이콘 가로+CSS group-hover 툴팁(외부 의존성 0), 모바일(md-)=케밥(⋮)→드롭다운 [아이콘+라벨 세로]. 드롭다운 `modal={false}`(스크롤락 누수 회피). 검색 아이콘은 기능 미구현 placeholder 유지.
- ③ **삭제 404**(`MessageDetailPage`): `invalidateQueries(['messages'])`가 화면에 떠 있는 detail 쿼리까지 무효화→active observer가 삭제된 쪽지 refetch→404. 해법=detail 안 건드리고 `navigate('/messages')`로 언마운트(자연 소멸), 목록(received/sent)만 무효화. 성공 토스트는 Layout 라우트전환 `toast.dismiss()`로 안 보여 제거. (removeQueries도 active observer면 refetch 유발 → 제거가 정답 아님, navigate 언마운트가 정답)
- ④ **전송 후 보낸함 탭 이동**: PC 모달도 이제 닫고 `/messages?tab=sent` 이동(기존엔 게시글 체류, 사용자 결정으로 변경). 모바일도 `?tab=sent`. `MessageBoxPage`가 `useSearchParams`로 초기 탭 결정. 방금 보낸 쪽지 바로 보이게.
- ⑤ **레이아웃 정합**: 쪽지함/상세 최상위 `max-w-[640px]`로 헤더·콘텐츠 폭 통일(기존 헤더 full-width). 쪽지함 탭=프로필 3종탭 컨벤션(sticky+bg-white, text-xs/py-2.5). 상세 본문=흰 카드 아닌 목록 행 스타일(bg-white+border-b, body는 bg-gray-50라 구분).
- **★ 함정 박제(wiki 후보)**: shadcn `DropdownMenuItem`에 `[&_svg:not([class*='size-'])]:size-4` 규칙 → 드롭다운 안 아이콘은 `size={N}` **prop을 줘도 CSS가 16px로 강제**(class 우선순위>HTML attr). 탈출=아이콘에 `className="size-N"`(size- 클래스 있으면 `:not`에서 빠짐). 케밥 드롭다운 아이콘 크기 안 먹던 원인.

**slice 3(뱃지+읽음동기화+실시간) 구현 완료 + PR #23 생성 (2026-06-04) — ⚠️ AI 작성 인지부채 HIGH, 자가 리뷰 대기:**
- Speed mode([[feedback_speed_mode_ai_first_task_split]], 사용자 선택)로 AI 전체 작성. 4 Task 분할, 유닛별 설명. [[feedback_ai_written_code_cognitive_debt]] 대상.
- 브랜치 `feat/messaging-slice3-badge`. PR #23 base develop, 논리 커밋 4개, `tsc -b` 통과. **검토·브라우저 검증은 내일(2026-06-05~) 이어서 완결 예정.**
- **linkify 정정**: 세션 초반 "linkify 미머지로 그대로 둠"이라 판단했으나 **이미 머지 완료**(PR #22 MERGED, 머지커밋 `e841427`가 origin/develop에 존재). 로컬 develop이 stale해 오판한 것([[feedback_verify_merge_status_against_origin]]). linkify 브랜치는 로컬/원격 모두 정리됨. slice 3는 그 위 develop에서 독립 분기.
- **핵심 설계 = 알림 시스템 거울 복제 + 별도 SSE 연결 없음.** 쪽지 unread push는 기존 알림 SSE 1개에 편승(NEW_MESSAGE 이벤트 시 increment). 정답지: `useNotificationStore`/`useNotificationSSE`/`SideNav` 뱃지/`api/notifications.ts`.
- 변경 6파일: 신규 `stores/useMessageStore.ts`(unreadCount 전용 set/increment/decrement/clear) + `components/message/MessageUnreadBadge.tsx`(store 구독, 0이면 미렌더, 부모 relative 전제) / 수정 `api/messages.ts`(`fetchUnreadMessageCount`) + `ProfileHeaderActions.tsx`(PC 아이콘+모바일 케밥 뱃지 배선) + `useNotificationSSE.ts`(초기·MSW·탭복귀 `/me/messages/unread-count` 동기화+NEW_MESSAGE increment+로그아웃 clear) + `MessageDetailPage.tsx`(읽음 effect에 낙관 decrement).
- **UI 자체 결정**: 모바일 케밥 뱃지는 트리거 위(쪽지함 아이콘이 드롭다운 안에 숨어서). 뱃지 노출=프로필 헤더 1곳(slice 2 진입점 컨벤션).
- **자기점검 질문(리뷰 시)**: ① 왜 별도 SSE 엔드포인트 대신 알림 SSE에 편승? ② 알림 뱃지·쪽지 뱃지 둘 다 +1이 버그가 아니라 의도인 이유? ③ 읽음 시 낙관 decrement인데 왜 "신뢰 소스는 동기화"라고 하나(낙관 실패 시 복원 경로)? ④ `MessageUnreadBadge`가 0일 때 null 반환하는 이유 + 부모 relative 전제? ⑤ 로그아웃 시 `useMessageStore.clear()`를 알림 clear 옆에 둔 이유?
- **범위 제외**: 알림 NEW_MESSAGE 상세 라우팅 승격(Q1 referenceId=messageId 런타임 미확인 → `/messages` fallback 유지) / 뱃지 전역 노출.
- **다음**: 자가 리뷰 → staging SSE 실측(다른 계정 발송→실시간 +1, 읽음→-1) → 머지. 머지 후 쪽지 핵심 4슬라이스(0~3) 완료.

**✅ slice 3 자가 리뷰 + 실측 + develop 머지 완료 (2026-06-05) — 쪽지 핵심 4슬라이스(0~3) 완결:**
- per-commit 자가 리뷰 4커밋 전부 완료([[feedback_pr_per_commit_review_workflow]]). 통과한 자기점검 핵심: ① 뱃지=store(push)/목록=RQ(pull) 이원화. ② setUnreadCount=서버 신뢰소스 덮어쓰기 vs increment/decrement=낙관. `Math.max(0,...)`=over-decrement(낙관이 서버보다 앞설 때) 음수 방지 안전망. ③ 알림 SSE 편승 이유=NEW_MESSAGE가 이미 알림 스트림으로 옴→2번째 연결은 인프라 중복. ④ 두 뱃지(알림 전체/쪽지만) 동시 +1은 서로 다른 관점이라 중복카운트 아님(의도). ⑤ getState=렌더 밖(SSE 콜백/effect)이라 구독 불필요·명령만. ⑥ 읽음 effect `!message.read`=틀린 감소 원인 차단(1차)+`Math.max(0)`=결과 방어(2차) 짝.
- **★ 실측 중 버그 1건 발견·수정 (커밋 `21c44d0`)**: 쪽지 unread-count 응답 필드가 **`unreadCount`인데 코드는 `count`로 구조분해** → `setUnreadCount(undefined)` → 숫자 없는 빈 빨간 점. **알림 엔드포인트는 `count`, 쪽지는 `unreadCount`로 필드명이 달랐음**(거울 복제 시 같다고 가정한 게 원인). 타입(`types/message.ts`)도 `count`로 잘못 박혀 `tsc`가 못 걸렀음 — **교훈: FE 타입은 손으로 적은 거라 서버 실응답과 다를 수 있다, 런타임 1건 확인이 정답**([[feedback_verify_spec_before_workaround]]). 진단법: 빈 뱃지=`undefined<=0`이 false라 점은 뜨고 내용은 빈 span → DOM inspect로 span 내용 비었는지 확인 → Network 실응답 필드명 대조.
- **UI 마감 (커밋 `43dcf1c`)**: 프로필 헤더 뱃지 18→15px. 모바일은 화면 좁아 숫자 대신 작은 점(`MessageUnreadBadge` `dotOnly` prop). 케밥 트리거 + 드롭다운 안 쪽지함 아이콘 양쪽에 점(메뉴 열어도 안읽음 보이게).
- **머지**: PR #23 merge commit `6a1b270`, base develop, 로컬 develop ff 동기화. 실측 4종 통과(초기 동기화/실시간 +1/읽음 -1/모바일 점). env가 **prod**(`api.melonnetherapists.com`) 직결 상태로 테스트함(staging 아님, 본인 계정 2개).
- **다음(별개 트랙)**: 알림 페이지 헤더 너비 과다 → slice 2에서 쪽지함/상세를 `max-w-[640px]`로 통일한 것과 동일 패턴으로 수정 예정. 쪽지 브랜치 밖 별도 작업(backlog). 쪽지 기능 자체는 4슬라이스로 일단락.

**✅ 쪽지 후속 수정 4건 develop 머지+push (2026-06-05) — 핵심 4슬라이스 이후 UX/버그 보강:**
- 논리 4커밋(한국어, 서명X). 워킹트리=HEAD 무손실 분할 검증 + tsc 통과 후 push(`6fb9527..54a9e3f`).
  1. `a9e24ba` **feat: 쪽지 상세 답장 입력** — 받은 쪽지(`!iAmSender && !broadcast`) 상세 하단에 textarea+전송. **답장=새 쪽지**(메일함 모델, 스레드 아님) → `sendMessage(message.senderId, content)`(receiverId가 원본 senderId로 뒤집힘). 기존 `useSendMessage` 재사용(onSuccess=입력 비우기). textarea `field-sizing-content`로 높이 자동(비울 때도 자동 축소 — JS scrollHeight 방식은 프로그램적 clear 시 안 줄어서 회피). Enter 전송=CommentInput 패턴(IME `isComposing` 가드+Shift+Enter 줄바꿈+모바일 제외). 본인 작성, Enter 핸들러만 AI 위임.
  2. `9032b43` **fix: 안읽음 뱃지 SPA 미동기화** — **백엔드가 상세 GET 시 읽음 처리 후 `read:true`로 응답** → slice3의 낙관 `!message.read` 게이트가 항상 false라 `decrement()`가 안 돎(새로고침=서버 재동기화 때만 맞춰짐). 해법=수신자 조회 시 `fetchUnreadMessageCount()`→`setUnreadCount()` **서버 재동기화**로 교체(낙관 decrement 폐기). 진단법: "새로고침 후엔 맞음"=서버 truth는 동작, SPA 낙관만 안 됨 → 게이트 의심.
  3. `3cbba9d` **fix: 쪽지함 탭 URL 보존** — 탭이 컴포넌트 로컬 `useState`라 상세 갔다 오면 받은함으로 리셋. 탭을 `searchParams`(URL)와 양방향 연동(`const tab = searchParams.get('tab')...` + 전환 시 `setSearchParams({tab})`) + 상세 `backTo`를 `iAmSender`면 `/messages?tab=sent`로 분기. URL이 탭의 진실 소스가 됨(브라우저 back은 A가, 버튼은 backTo가 담당). `?tab=sent`는 원래 전송 후 동선용이었는데 이번에 양방향으로 승격.
  4. `54a9e3f` **feat: 알림→쪽지 상세 직행** — `notificationRoute.ts` NEW_MESSAGE를 `/messages`(목록)→`/messages/${referenceId}`(상세). **Q1 런타임 확정**: `/notifications` 응답에서 NEW_MESSAGE `referenceId`(예 30)가 `/messages/30` URL과 일치 → referenceId=messageId 확정(postId는 null). referenceId 없으면 목록 fallback.
- **남은 ③ 프로필 사진 = BE 블로킹**: `MessageResponse`에 이미지 URL 필드 **없음**(senderNickname/receiverNickname만), `GET /users/{id}`도 부재 → 상대 사진 소스 전무. `senderProfileImageUrl`/`receiverProfileImageUrl` 추가 요청 필요(게시글/댓글 응답엔 이미 작성자 이미지 있어 같은 패턴). 그 전엔 `UserAvatar` 닉네임 이니셜 fallback만 가능. backlog 참조.
- 커밋 4분할 기법 함정(wiki 후보): `git apply --unidiff-zero`가 삽입(insertion) hunk를 어긋나게 적용 → 본문 큰 변경은 **context 있는 통 hunk**로, 혼합 import hunk만 0-context로 분할.

진행 상황(슬라이스별 완료/진행)은 [[backlog]] 참조.
