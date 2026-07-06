---
name: 프론트엔드 작업 백로그
description: 데일리 태스크 선택용 단일 참조 파일 — 할 수 있는 것 / 블로킹 대기 / 검증 방법 포함
type: project
updated: 2026-06-04
originSessionId: f733d60b-43f4-4c4c-be62-0deecb757652
---
# 프론트엔드 작업 백로그

> 상태: `[ ]` 미완 / `[x]` 완료 / `[?]` 검증 필요 / `[-]` 해소(의도적 종료)
> 블로킹 태그: `[BE]` 백엔드 / `[디자인]` 디자이너
> 검증일: 각 항목의 마지막 확인 날짜
> 상세 필요 시 → `detail/` 또는 기존 메모리 파일 링크

---

## 1. 바로 할 수 있는 것 (프론트 독립)

> ✅ **(2026-06-08 해소) 위 "develop push 금지" 경고는 해결됨.** 공유 워킹트리에서 두 세션이 얽혔던 것을 정리: 팔로우 커밋들을 `feat/follow`로 분리(cherry-pick) → **PR #25(feat/follow→develop, 미머지, QA 예정)**. develop은 origin/develop(`d086a2d`) + **UI fix 2커밋만**(`bf518d9` 메뉴 / `390e2e9` 검색, 새 SHA `497dae0`·`20c5fc4`)으로 정리해 **push 완료**. 즉 origin/develop엔 팔로우 WIP 안 섞임. 백업 브랜치 `backup-tangled-develop`(구 tip `dd384b8`)은 PR 머지 후 삭제 예정.
> 교훈: **두 Claude 세션이 워킹트리 하나를 공유하면 브랜치/커밋이 발밑에서 바뀐다.** 동시 작업 시 브랜치 새로 파지 말고 같은 브랜치 유지가 안전.

### ★ 내일 1순위 (2026-05-11)
- [x] **CH-09** 게시글 상세 댓글/대댓글 시안 정합 — 완료 (2026-05-20 브라우저 검증 통과). 상세는 아래 Chrome 통일 후속 섹션 CH-09 참조
- [x] **MEL-47** 피드 정렬 전환 UI (최신순/인기순) — 완료 (커밋 `64d5b6c`, develop+main 배포)
  - 무한스크롤 모드 한정 칩 토글(`PostListPage.tsx:275~298`), `sort` state→`useInfiniteFeed` queryKey→API 배선, 뒤로가기 snapshot에 sort 보존. BE `GET /posts/feed?sort=` 지원 확인(prod 동작)

### 임시 조치 / 버그
- [x] **F-01** 인터셉터 로그인 401 refresh 버그 (커밋 a92320a)
- [x] **F-02** LoginPage/SignupPage catch 에러 메시지 추출 오류 (커밋 a92320a)
- [x] **F-03** MSW `FORCE_FEED_500` 토글 false 확인 (04-16 확인 완료)
  - 검증: `grep "FORCE_FEED_500" frontend/src/mocks/handlers/posts.handlers.ts` → `false` 여야 정상
- [x] **F-04** Paginated 프로퍼티 fallback 매핑 검증 (04-16 확인 완료)
  - 결과: 세 엔드포인트 모두 `items`로 통일, 프론트 타입과 일치, 배포 환경 정상 동작 확인
- [?] **F-05** 댓글 중복 POST 방어 (2026-05-11, PR #13 → develop `1ef340e`)
  - 패치: A 가드 — `useCommentSubmit` / `CommentWritePage` `handleSubmit` 첫 줄 `if (submitting) return` + B 가드 — `CommentInput.handleKeyDown` 진입 시 `e.nativeEvent.isComposing` 차단 (3파일 11줄)
  - 원인 가설: 백엔드 보고 20~30ms 간격 중복 POST → React `onKeyDown` 한글 IME 합성 종료 시 Enter 2회 발화 + in-flight 가드 부재 race 통과
  - **한계 (박제)**: 사용자 환경(WSL/Win11 Chrome)에서 develop/fix 양쪽 모두 POST 1건만 발생 → fix 효과 사용자 환경 검증 불가. 트리거 환경(다른 OS/IME/모바일/답글 경로) 미특정
  - [ ] Vercel staging 자동 배포 확인 (develop 푸시 트리거)
  - [ ] 백엔드 로그 24h 모니터링 — 중복 POST 사라지는지 (유일한 실효 검증)
  - [ ] main(prod) 머지 결정 — MVP D-4 핫픽스로 prod까지 올릴지 사용자 결정
  - [ ] airo 동기화 — `/push-airo` 트리거 시 같이 반영
  - 상세: `project_comment_duplicate_post_fix_2026_05_11.md`
- [x] **F-06** PostDetailPage 리소스 404 처리 개선 — 완료 (2026-05-22, develop `4281ead`, 사용자 직접 구현). catch에 `status === 404` 분기 추가 → "게시글을 찾을 수 없어요." + `<Link to="/posts">` 목록 링크. 403(redirect)과 분리
  - **현황**: 삭제됐거나 없는 게시글(`/posts/:id` → BE 404)도 `catch`가 403만 분기하고 나머지는 전부 `setError('게시글을 불러오는 데 실패했습니다.')`로 뭉침 (`PostDetailPage.tsx:159-167` catch / `266-270` 렌더)
  - **문제 2가지**:
    1. 404(영구적 없음)와 500·네트워크(일시적 실패)를 같은 문구로 표시 → 없는 글인데 사용자가 새로고침 반복
    2. 복구 동선 없음 — 빨간 텍스트 한 줄뿐, "목록으로/홈으로" 링크 없음 (정작 NotFoundPage엔 홈 버튼 있음)
  - **대비**: 라우트 미스(`path="*"` → NotFoundPage)는 친절한데, 더 흔한 리소스 404가 더 빈약한 역전 상태
  - **최소 변경안 (권장)**: catch에서 `err.response?.status === 404`만 추가 분기 → "삭제됐거나 없는 게시글이에요" + 목록 링크. 전용 화면 vs 인라인 메시지는 착수 시 결정
  - **blast radius**: 작음 (catch 분기 1개 + 렌더 1곳). Hot Path지만 정상 흐름 미변경
  - 검증: `/posts/99999`(없는 ID) 직접 진입 시 404 전용 메시지 + 빠져나갈 링크 노출 확인
  - 연관: `feedback_error_handling`(에러 원인별 분기 정책)
- [ ] **F-07 [BE]** 고민카드 `otherNotes`(기타) 전면 제거 후속 (2026-06-03)
  - 배경: 2차 모바일 UT 반영으로 **작성 폼**(`ConcernForm.tsx`)에서만 기타 입력 제거 → prod main 반영 완료 (커밋 `edd4b42`+`d17ddbd`, 입력순서 재배치 동반)
  - **남은 불일치**: 작성엔 없는데 **수정 폼**(`ConcernEditForm.tsx`)엔 기타 입력 여전히 존재 → 수정 시 기타 추가/편집 가능 (작성↔수정 비대칭)
  - **유지 대상(건드리지 말 것)**: 조회 `ConcernCard.tsx`의 기타 표시 — 기존 데이터 하위호환용
  - **잔존 참조**: `ConcernEditForm.tsx`(state/필드), `PostEditPage.tsx:222`, `PostDetailPage.tsx:391`, `PostCard.tsx:132`, `constants/concern.ts:41`(`OTHER_NOTES_MAX_LENGTH`), `api/concerns.ts`, `types/post.ts`(63/111/137/146) — 모두 optional이라 현재 tsc 영향 없음
  - **[BE] 선결**: API/DB에서 `otherNotes` 필드를 완전히 뺄지 결정 — 필드 하나 제거라 백엔드 작업은 소규모 예상. 백엔드 협의 후 착수
  - **결정 갈림길**: (a) 수정 폼만 기타 제거(FE 단독, BE 필드는 유지) / (b) BE 필드까지 완전 제거(스키마·기존 데이터 영향 검토)
  - 검증: 고민카드 수정 진입 시 기타 입력 미노출 + 기존 기타 보유 카드 조회 정상
- [ ] **F-08 [BE]** 홈피드 미리보기 생략 신호 백/프론트 중복 — FE 단독 조치 완료, 백엔드 협조 대기 (2026-06-04)
  - **배경**: 백엔드가 `contentPreview`를 글자수 초과 시 잘라 끝에 "..."(또는 "…")를 붙임 + 프론트도 5줄 클램프로 자름 → "더 있음" 신호가 중복·불일치(긴 글=프론트 "... 더보기" / 중간 글=백엔드 "..."만, CTA 없음 / 경계 케이스 이중 "...")
  - **FE 조치(완료, develop `fb42a22`, AI 작성·인지부채)**: 어댑터 `utils/contentPreview.ts`의 `parseContentPreview`가 끝의 "..."/"…"를 떼어내 `backendTruncated` boolean으로 승격, 본문은 표식 없는 text 렌더. `PostCard`에서 `showMore = backendTruncated ∥ overflowed(5줄)`로 신호 단일화 → 글 길이 무관 "... 더보기" 일관 노출
  - **FE 단독의 한계(박제)**: "..." 문자열 휴리스틱이라 **작성자가 본문을 "..."로 끝낸 짧은 글은 잘림으로 오탐** → "더보기" 오노출(클릭 시 동일 상세라 무해하나 부정확)
  - **[BE] 요청 사항**: `contentPreview` 응답에 **잘림 여부 boolean**(`contentTruncated` 또는 `hasMore`) 추가 → FE가 "..." 휴리스틱 대신 플래그로 키잉(오탐 제거). 플래그 도입 시 백엔드 "..." 표식은 제거 가능(FE가 신호 소유). 더불어 `contentPreview` 생략 규칙(글자수 한도)이 현재 **openapi 미문서화** → 스펙 명문화 요청
  - **주의**: 플래그 없이 "..."만 제거 요청 X — 중간 글(5줄 이내로 잘린)에서 FE가 잘림 여부를 못 알아 "더보기" 누락(정보 손실). "..." 제거는 **반드시 플래그와 동반**
  - **미적용 경로**: `ConcernCard`(고민카드 본문 clamp)는 별도 클램프 메커니즘이라 이번 조치 범위 밖 — 백엔드 플래그 도입 시 동일 적용 검토
  - 검증: 짧은 글(생략 없음)=신호 X / 중간 글(백엔드 생략, 5줄 이내)=「... 더보기」 노출 / 긴 글(5줄 초과)=「... 더보기」 + 백엔드 "..." 비노출(클립) / 이중 "..." 없음
  - 연관: `PostCard.tsx`, `utils/contentPreview.ts`

- [x] **F-09** 알림 페이지 헤더 너비 과다 — 완료 (2026-06-05, develop ff `6fb9527`, 브라우저 검증 통과)
  - 원인: 헤더는 full-width인데 콘텐츠만 `max-w-2xl`(672px)로 좁혀 헤더가 더 넓어 보였음 (`NotificationPage.tsx:138`/`:154`)
  - 조치: 폭 제한을 최상위 div로 올려 헤더+콘텐츠를 함께 `max-w-[640px]` 중앙 정렬 (쪽지함과 동일 패턴·폭)
  - 검증: `/notifications` 헤더·목록 폭 일치 + 쪽지함과 시각 정합 확인
- [x] **F-11** 랜딩 페이지 placeholder 확정 — 완료 (2026-06-08, develop `d086a2d`)
  - 배경: 랜딩 부활(`feat/landing-page` PR #24 머지 06-06). PM 와이어프레임(`Mellti` 브랜드) 기반 구현 완료, 폰 목업 3종(피드/인증/고민카드)은 실제 화면 재현
  - **placeholder 3종 해소**(`d086a2d`): 협업문의 링크(nav) + 아이로 인스타그램 URL(footer) + 사업자등록번호(footer) 기입 + CTA/버튼 auth 분기. 검증 `grep -E "TODO\((협업문의|인스타|사업자번호)\)|000-00-00000" frontend/src/pages/landing/LandingPage.tsx` → 0건 확인
- [ ] **F-12 [BE]** 팔로워 탭 맞팔(follow-back) 버튼 — 1차 안정화 후 (2026-06-08 보류 결정)
  - 배경: 팔로우 수직 슬라이스 1(`/follow` 목록+언팔 토글) 설계 시 발견. 설계 문서 `docs/superpowers/specs/2026-06-08-follow-list-toggle-design.md`
  - **블로커**: `FollowUserResponse`(`/me/followers`·`/me/followings` 응답)에 "내가 이 사람을 팔로우 중인가"(`following`) 필드 부재 → 팔로워 탭 각 행의 팔로우/팔로잉 버튼 **초기 라벨**을 정확히 못 그림(userId/nickname/profileImageUrl/role만 옴). POST/DELETE 자체는 동작하므로 "기능"은 가능, "정확한 초기 표시"만 BE 의존
  - **[BE] 요청(안정화 후)**: `FollowUserResponse`에 `following: boolean` 추가 (쪽지 F-10과 동일한 응답 필드 1개 추가 패턴, 소규모)
  - FE 후속(BE 해소 후): 팔로워 탭 행에 맞팔 버튼 배선, `following`으로 초기 라벨 정확히. 우회안(보류): (나) 행별 `GET /users/{id}/follow` N+1 / (다) 내 팔로잉 전체 Set 대조
  - 결정/Why: 1차 팔로우(목록+언팔) 완료 + 자잘한 버그·수정 안정화 후 BE 요청하기로 (2026-06-08). 슬라이스 1은 팔로잉 탭 언팔 토글로 데모 완결, 팔로워 탭은 명단 표시만
- [ ] **F-11b [PM]** 랜딩 카피↔실제 기능 갭 — PM 소유 (passive)
  - **카피↔실제 갭**: Feature③이 광고하는 **팔로우 피드·리포스트·휘발성 게시글**은 미구현 가능성 → 신규 유저 기대-실제 갭. PM이 실제 구현 현황에 맞춰 카피 조정 검토 (FE 능동 작업 아님, PM 결정 대기)
- [x] **F-14** 사이드바 "..." 메뉴 계정·고객센터 비활성화 (2026-06-08, 로컬 develop `bf518d9`, dev 검증 통과, **unpushed**)
  - 원인: `UserMenu.tsx` 계정→`/account`, 고객센터→`/support` navigate인데 두 라우트 부재 → 클릭 시 404로 빠짐
  - 조치: 두 `DropdownMenuItem`에 `disabled` (base-ui Menu.Item, className에 이미 `data-disabled:pointer-events-none data-disabled:opacity-50` → 회색+클릭 무반응), `onClick={navigate(...)}`는 주석으로 보존
  - **⚠️ 의도적 비활성화 — 이후 세션이 "버그"로 오인해 재활성화 금지.** 기능 구현 시 `disabled` 제거 + onClick 복원
- [x] **F-15** 검색 페이지 폭 홈피드와 동일 정합 (2026-06-08, 로컬 develop `390e2e9`, dev 검증 통과, **unpushed**)
  - 조치: `SearchPage.tsx` 최상위 `<div className="pb-20 md:pb-8">` → `max-w-3xl mx-auto pb-20 md:pb-8` (홈피드 768px와 동일, 검색 결과가 동일 PostCard 목록이라 폭 통일). 프로필은 640px로 더 좁음(미채택)
- [x] **F-13** 게시글 상세 이미지 라이트박스(클릭 → 확대 팝업) — 완료 (2026-06-09, develop 1커밋 `3b7c36d`, 브라우저 검증 통과). AI 작성+리뷰. 인지부채 박제 [[project_image_lightbox_implementation_2026_06_09]]
  - 결정: **직접 오버레이**(라이브러리 X, blast radius 최소) / 좌우 네비게이션 + ESC·배경 클릭 닫기 / **핀치 줌 포함**(Pointer 이벤트로 터치·마우스 통합)
  - 구현: 신규 `components/common/ImageLightbox.tsx`(Portal, LegalModal 컨벤션) + `PostDetailPage` 캐러셀 `<img>` onClick 배선(드래그 구분 `moved<=5`, `cursor-pointer`)
  - 기능: Phase1=풀스크린 확대+wrap 네비+카운터. Phase2=핀치 줌(max 4배)/확대 중 팬/더블탭·더블클릭 1↔2배 토글/PC 휠 줌, 확대 중 ◀▶ 숨김, `touchAction:none`
  - 의도된 한계(박제): 스와이프 닫기 미구현 / focus trap 미구현(role=dialog만) / 줌 transition 없음(핀치 반응성 우선) / 모바일 실기기 제스처는 코드+브라우저 검증만
- [x] **F-15 ★ 홈피드 "팔로우" 탭 배선 (접근 B)** — **완료 (2026-06-09, PR #26 develop 머지 `41484c9`)**. dev 검증 통과(전체 Hot Path 5종 회귀 무탈)+`/code-review high`(HIGH 0, 삭제 캐시갭 `d4d8303` 수정). 구현/취약점 박제 [[project_follow_feed_tab_implementation_2026_06_09]]. **남은 후속**: 팔로우 탭 스크롤 복원(snapshot store 일반화)·정렬/필터(BE following에 sort·therapyArea 추가 선결)·backTo 하드코딩 location 파생화
  - 현황(완료 전): `PostListPage` activeTab==='following'이 placeholder("팔로우한 치료사의 글이 여기에 표시됩니다", `:394~398`)만. BE `/posts/feed/following`(커서, `size/cursor/postType`, **sort 없음**) 준비됨
  - 작업: `fetchFollowingFeed` 추가 + `useInfiniteFeed`(현재 `fetchFeed`+queryKey `['feed']` 하드코딩) 일반화 또는 형제 훅 + 팔로우 탭 실배선 + 팔로우 탭에선 정렬 토글(MEL-47) 숨김
  - ⚠️ **핵심 위험 = 무한스크롤 Hot Path 회귀** — useInfiniteFeed 일반화 시 전체피드 동작(스크롤복원/필터/fallback) 회귀 검증 필수
  - 프론트 단독, 커서 구조 호환. 트리거 「팔로우 탭 이어가자」. 상세 [[project_follow_feature]]
  - 검증: 팔로우 탭에서 팔로우한 사람 글 무한스크롤 + 전체피드 5종 회귀 무탈
  - **후속 ① 팔로우 탭 스크롤 복원 — 코드 완성 (2026-06-10, 워킹트리 미커밋, tsc OK)**: `feedScrollStore`에 `tab` 태그 + `sort?` optional / `pickInitialSnapshot`(consume 후 `snap.tab===activeTab`일 때만 ref 채움) / 시딩 tab 라우팅(infinite=`'all'`·followingFeed=`'following'`일 때만 initialSnapshot → 캐시 교차오염 방지) / 복원 effect `isInfiniteMode` 게이트 제거 → `[]` 양탭 1회 / `handleCardClick` all·following 분기 + following 카드 `<div onClickCapture>` 래핑. **대부분 본인 손코딩(학습 모드)**, 마지막 3b effect+nit만 AI(unlock). ⚠️ **런타임 QA 2건 미완**: ⑴following 탭 스크롤+아이템 복원 ⑵following 저장→all 탭 캐시 안 섞이는지(회귀) → 컨디션 회복 후 셀프QA→커밋. low-sev 관찰: `pickInitialSnapshot`이 무조건 consume → 필터뷰 착지 시 스냅샷 옛 코드보다 일찍 discard(영향 미미). 후속 ② backTo 하드코딩→location 파생화 = **미착수**
- [x] **F-14 [BE]** 팔로워/팔로잉 목록 아바타 이미지 깨짐 — ✅ **BE 해결 (2026-06-10)**
  - 원인: `FollowUserResponse.profileImageUrl`이 풀 URL 아닌 **raw S3 키**(`xxxx.png`)로 와서 `resolveImageUrl`이 404 URL로 오해석 → 아바타 깨짐
  - 조치: BE가 작성자 이미지(`TherapyPostSummaryResponse.authorProfileImageUrl`)와 동일 URL 빌드를 `FollowUserResponse`에 적용 → **풀 URL 응답**. `/me/followers`·`/me/followings` 공유 DTO라 한 번에 해소. FE 변경 불필요(우회 안 함)
  - 잔존(무해): FE `UserAvatar` onError 이니셜 폴백(`cd556ac`)+`console.warn('[avatar] …')`(`eb8f469`)는 graceful degradation으로 유지
- [ ] **F-16** 구인 탭 필터 줄 초소형 화면 겹침 — 우선순위 낮음 (2026-07-06)
  - 증상: `JobPostFeed.tsx:55` 필터 줄이 `flex items-center gap-2`(no wrap)에 지역/고용형태 native `<select>`(각 `flex-1 min-w-0`) + "모집중만" 버튼 3개를 한 줄에 담음 → 화면 작은 기종에서 select가 최소폭 이하로 눌려 라벨("고용형태 전체")이 native 드롭다운 화살표와 겹치거나 잘림
  - 범위: **초소형 화면 한정** — 일반 모바일 폭에선 정상 노출. 데이터/기능 영향 없음(표시만)
  - 최소안: 필터 줄 `flex-wrap` + select `min-w-[7rem]`(좁으면 "모집중만"이 아래로 접힘) / 또는 지역·고용형태를 `grid grid-cols-2`로 묶고 "모집중만"을 별줄로
  - 검증: 좁은 폭(≤360px, DevTools 디바이스)에서 라벨 안 잘림 + 일반 폭 회귀 없음
  - 발견: 2026-07-06 실기기(소형) 스크린샷. 탭 UI 작업(`PostListPage`)과 별개, 미착수

### 리팩토링 / 마이그레이션 (미검증)
- [x] **R-01a** ProfilePage 3탭 RQ 마이그레이션 완료 (2026-04-23, 커밋 924d55e + 0ba0523)
- [x] **R-01b** PostListPage `useInfiniteFeed` → `useInfiniteQuery` (2026-04-29 런타임 회귀 검증 통과)
  - 커밋: 8f0b595, cd126d6 (prerender 비활성 우회 0dcf346은 6d234cc로 해소)
  - 런타임 검증 항목 (production 사이트 직접, 모두 통과):
    - [x] 무한 스크롤 다음 페이지 페치
    - [x] 게시글 클릭 → 뒤로가기 시 스크롤/필터 복원
    - [x] 필터 칩 변경 시 깜빡임 없음
    - [x] 에러 시 P1 fallback 전환
  - 상세: `project_rq_migration_implementation.md`
- [ ] **R-02** stale-response(race) 가드 — **보류 (2026-05-20)**
  - **원안 정정**: "AbortController 일괄 적용"은 R-01b(RQ 마이그레이션) 이전 표현. RQ 도입으로 지형 바뀜
  - **현재 3개 fetch 지점 상태**:
    1. PostListPage 무한스크롤(`useInfiniteFeed`, Hot Path) — RQ `signal` 자동 가드 ✅ 해소
    2. PostListPage 필터/페이지 fetch (`PostListPage.tsx:120` `fetchPosts().then(setData)`) — plain, 가드 없음 ❌
    3. PostDetailPage 상세 fetch (`PostDetailPage.tsx:152` `Promise.all([fetchPost,fetchComments,fetchPostImages]).then()`) — plain, 가드 없음 ❌
  - **남은 작업 = #2, #3 두 곳만** (둘 다 프론트 단독 가능)
    - #2: `fetchPosts`는 axios라 `{signal}`만 넘기면 됨
    - #3: `fetchPost/fetchComments/fetchPostImages`가 `signal` 미수신 → (a) 세 함수에 signal 추가(진짜 취소) / (b) `let ignore=false` 플래그(setState만 차단, api 무변경, ~3줄)
  - **보류 근거 (정확히)**: MVP 안정화 우선 + Hot Path 회귀 위험 회피 + 저빈도 **잠재결함(latent)**. ⚠️ "응답이 빨라 체감 안 됨"은 보류 근거로 부적절 — race는 **느린 네트워크(모바일 3G)에서 터짐**, dev 환경 미재현 ≠ 안 터짐 (댓글 중복 POST 교훈 동일)
  - **재개 트리거**: ① 모바일/느린 네트워크에서 "필터 바꿨는데 이전 결과 보임" 또는 "다른 글 눌렀는데 이전 글 잠깐 뜸" 리포트 / ② PostDetailPage를 RQ로 리팩토링 착수 시 #3 공짜 동반
  - **별개 BE 블로킹 항목**: 필터칩을 무한스크롤로 통일하려면 `/posts/feed`(cursor)에 `therapyArea`(+`keyword`/`postType`) query param 추가 필요 → 현재 `/posts/feed`는 `cursor/size/sort`만 받음. 필터는 `GET /posts`(offset)로 분리돼 있어 BE 양식 변경 전엔 통일 불가
  - 검증: `grep -n "signal\|ignore" frontend/src/pages/post/PostListPage.tsx frontend/src/pages/post/PostDetailPage.tsx` → #2/#3 가드 적용 여부
- [ ] **R-03** refresh plain axios 분리
  - 검증: `grep "import axios" frontend/src/api/axiosInstance.ts` → plain axios import 유무
  - 참고: F-01과 연관, 백엔드 연결 후 401 통합 테스트 시점에 처리
- [x] **R-04** FilterChips 컴포넌트 추출 — 완료 (`components/common/FilterChips.tsx` 존재)
  - 상세: `project_search_code_review.md`
- [ ] **R-05** ProfilePage 관심사 분리 (RQ 마이그레이션 후 후속 정리)
  - 현황: 3탭 RQ 전환 후 파일 400줄+, 탭/편집/인증 로직 혼재
  - 검증: `wc -l frontend/src/pages/profile/ProfilePage.tsx` → 분리 전후 비교
- [ ] **R-06** 게시글 본문 스타일 Tailwind 통일 (낮음, 통일 차원)
  - 현황: `index.css`의 `.post-content` plain CSS 자손 선택자(`p/h2/strong/em/ul/ol/blockquote`) — `dangerouslySetInnerHTML` 주입 HTML이라 Tailwind 유틸 못 붙임
  - 후보: `@tailwindcss/typography`의 `prose` 클래스로 교체 (의존성 1개 추가) / `@apply`로 토큰만 재사용
  - 트리거: 리치 에디터 도입 시 같이 처리하면 효율적
  - 검증: `grep "post-content" frontend/src/index.css` → 룰 제거 여부, 게시글 상세에서 시각 회귀 없음
- [x] **R-10** 댓글 리액션 API 연동 — staging 검증 통과 (2026-05-06)
  - 완료 (origin/develop c0db39a): 타입 4필드+`CommentReaction` / API 추가+리네임+unwrap / `ReactionBar` 시그니처 일반화 / `useCommentReactionToggle` 신설(B 패턴) / `CommentCard` placeholder 제거+ReactionBar 연동 / `PostDetailPage`+`CommentDetailPage` 통합
  - tsc ✅ (R-07 시그니처 mismatch fix 동반 — 커밋 ccb21d6, 2026-05-05)
  - MSW 스킵 결정 — 백엔드 dev/staging 이미 배포 → 직접 테스트로 대체
  - staging 검증 통과: 토글 즉시 active+카운트 / PUT 응답 reconcile / 동일 타입 해제 / 다른 타입 전환 / 실패 롤백
  - 결정/Why: B 패턴(진실 단일화) + PUT 응답 reconcile(동시성/규칙 변경 견고) + CommentResponse 4필드 동봉으로 N+1 없음(Swagger 2026-05-04 재확인). 별도 메모리 박제는 /wrap-up 시점
- [ ] **R-11** PostListPage 리팩토링 — 옵션 미결정, 채택 다음 세션에서 결정
  - 현황: PostListPage.tsx 385줄 / state 8개 / useEffect 4개 / 핸들러 5개. 환영 모달까지 추가되며 책임 영역이 7개로 늘어남(검색바·탭·무한스크롤·페이지 fallback·필터·리액션 캐시·환영 모달)
  - 옵션 비교 (채택 미결정):
    - **A. custom hook 분리만** (권장 후보) — logic만 추출, JSX 0 변경. blast radius 작음, 테스트 용이 / hook 4-5개 신설
    - B. JSX도 sub-component 분리 — `<InfiniteFeedSection />` 등으로 마크업도 추출. 더 깔끔 / Hot Path 큰 변경, 회귀 위험 ↑
    - C. 라우트/RQ 추상화 — `useFeedQuery` 추상화로 RQ에 fully 위임. 가장 정리됨 / post-MVP 규모
  - 옵션 A 가정 시 분리 대상 hook 5개 (참고):
    - `useWelcomeModal` — welcomeOpen + localStorage useEffect + handleVerify/handleClose (2026-05-06 추가분)
    - `useFeedTab` — activeTab state (전체/팔로우)
    - `useTherapyAreaFilter` — therapyArea + VALID_THERAPY_AREAS 검증 effect + handleFilterClick
    - `usePageModeFeed` — data/loading/error/feedFailed + fetch effect + handlePageChange
    - `useFeedReactionCache` — handleReactionUpdated (qc.setQueriesData 캐시 갱신)
  - 잔존 (PostListPage 본체, 옵션 A 가정): useInfiniteFeed + IntersectionObserver + initialSnapshotRef(스크롤 복원). 무한스크롤 코어는 그대로 두는 게 안전
  - ⚠️ MVP D-8 blast radius 경고 — 회귀 시나리오 5종 동반 검증 필수:
    1. 무한 스크롤 다음 페이지 페치 / 2. 게시글 클릭 → 뒤로가기 시 스크롤·필터 복원
    3. 필터 칩 변경 시 깜빡임 없음 / 4. 페이지 모드 fallback 전환 / 5. 리액션 토글 캐시 갱신
  - 검증: `wc -l frontend/src/pages/post/PostListPage.tsx` → 분리 후 200줄 이하 목표 + 위 5종 production staging 직접 통과
  - 연관: R-04 FilterChips 추출(완료) / R-05 ProfilePage 관심사 분리(미착수, 같은 패턴)
- [ ] **R-12** `PostListPage.handleReactionUpdated` `any` 4건 → 정확 타입 (R-01b RQ 마이그레이션 잔여 부채)
  - 현황: `qc.setQueriesData` 콜백에서 `old`/`page`/`item` 모두 `any`로 임시 처리, 동작 정상 / 타입 안전성만 부족
  - 작업: `old: InfiniteData<PaginatedPosts>` / `page: PaginatedPosts` / `item: PaginatedPosts['items'][number]` 박기
  - 함정: `setQueriesData` 콜백의 generic 추론이 까다로워 잘못 박으면 빌드 깨짐 — staging 검증 필수
  - 우선순위: 낮음 (MVP 발표 후), R-08/R-10 캐시 패치 코드 일관 정리 시 묶기

- [ ] **R-13** `PostWriteModal` 조건부 마운트 전환 검토 — 쪽지 모달과 동일 판단 적용 여부
  - 현황: `PostWriteModal`(상시 마운트 + `if(!open) return null`)은 닫힘 애니메이션·내용 보존 등 상시 마운트 이점을 실사용 안 하면서 수동 청소(`mode` 리셋 effect `:17-19`, 라우트 변경 자동 close `:21-26`)만 떠안음. 쪽지 모달(`MessageComposeModal`)을 조건부 마운트로 전환하며 같은 구조적 판단이 여기에도 적용됨
  - 작업: 얇은 게이트 컴포넌트(`PostWriteModalGate`)로 `open` 구독 격리 → 조건부 렌더. 단 `PostWriteModal`은 `mode` 상태 + 2개 폼(post/concern) 분기라 쪽지 모달보다 청소 로직 많음 → 전환 이득 더 큼
  - 함정: 라우트 변경 자동 close effect(`:21-26`)는 조건부 마운트로도 안 사라짐(open이 store에 살아있는 store-트리거 패턴 자체의 비용) → 별도 유지 필요
  - 보류 근거: 이번 스코프는 쪽지 모달만. PostWriteModal은 Hot Path(글 작성)라 회귀 위험 → 별도 PR로 분리
  - 검증: `grep -n "return null" frontend/src/components/post/PostWriteModal.tsx` + 글 작성 모달 열기/닫기/모드전환/라우트이동 4종 회귀
- [ ] **R-09** `CommentCard` `React.memo` 적용 — 댓글 리액션 토글 시 불필요 리렌더 차단
  - 현황: 댓글 리액션 hook을 페이지 레벨 단일(B 옵션)로 채택 → 토글 시 부모 `comments` 배열 갱신 → 모든 CommentCard 기본 리렌더
  - 목표: `React.memo(CommentCard)` + immutable update 패턴(이미 hook에서 적용)으로 변경된 카드만 실제 리렌더
  - 작업: `CommentCard` export를 `memo()`로 감싸기, props 비교 함수 필요 여부 검토(기본 shallow 비교로 충분할 가능성 큼)
  - 함정: `CommentCard` 안에서 `ReactionBar`에 `counts={{LIKE:..., CURIOUS:..., USEFUL:...}}` 객체 리터럴로 넘김 → 매 리렌더마다 reference 새 객체. ReactionBar에 memo 씌워도 props 비교 통과 X. `useMemo` 또는 어댑터 헬퍼로 정리
  - 검증: React DevTools Profiler에서 한 카드 토글 시 다른 카드 렌더 횟수 0 확인
  - 연관: 댓글 리액션 작업 완료 후 측정 → 실측 부하가 미미하면 보류 가능
- [x] **R-08** `togglePostReaction` reconcile + RQ 캐시 패치 통일 — staging 검증 통과 (2026-05-06)
  - 1단계 ✅ 백엔드 PUT 응답 형태 확인 — `{success, data: PostReaction}` 래퍼
  - 2단계 ✅ `togglePostReaction` 반환 `Promise<PostReaction>` + unwrap (커밋 8e1c30c)
  - 3단계 ✅ `useReactionToggle`이 응답으로 `setReaction(fresh)` reconcile (커밋 8e1c30c)
  - 4단계 ✅ B 패턴 채택 — `useReactionToggle.onUpdated?` 콜백 / `PostListPage`가 `qc.setQueriesData({queryKey:['feed']}, ...)` 캐시 4필드 갱신 (커밋 bdb4586)
  - 5단계 ✅ staging 검증 통과 (토글/뒤로가기/새로고침/실패 롤백 4시나리오)
  - 한계점 박제: 다른 PostCard 호출부(PostListPage pagination mode 333행 / ProfilePage 333,424행 / SearchPage 152행)는 콜백 미등록 — 각 데이터 소스 캐시 다르므로 별도 처리 필요. `onReactionUpdated`를 옵셔널(`?`) prop으로 두어 컴파일 통과
  - 옵션 검토 메모리: `project_post_reaction_cache_patch_options.md` (A/B/C 트레이드오프 + B 채택 Why)
- [?] **R-07** 댓글 줄바꿈 허용 후속 작업 — 2차분 develop 배포(5927bf4), 모바일 테스트 검증 중
  - 1차 완료(05-02): `CommentCard.tsx` 편집 input→textarea + 표시 `whitespace-pre-wrap`, `index.css` `.post-content white-space: pre-wrap`
  - 2차 완료(05-03): `CommentInput.tsx` textarea + Enter 분기 + `CommentCard.tsx` line-clamp-2 + `useCommentSubmit` normalize
  - [x] **#1** 작성/편집 비대칭 해소 — Enter 분기(데스크탑 Enter=submit, 모바일 버튼 강제)
  - [x] **#2** 줄바꿈 도배 방어 — `useCommentSubmit`에서 `replace(/\n{3,}/g, '\n\n').trim()` 적용
  - [x] **#3** 백엔드 `\n` round-trip 검증 통과 (2026-05-06 staging 확인)
  - [ ] **#4** ProfilePage 댓글 미리보기 line-clamp-2 왜곡 — `ProfilePage.tsx:514` 줄바꿈만으로 truncate
  - [x] **#5** Enter=submit 깨짐 — #1과 함께 해결됨
  - [ ] **#6** 편집 모드 변경 손실 가드 — dirty 감지 + 이탈 confirm
  - [ ] **#7** 시각적 무게 — 댓글 카드 가변 높이, "더보기/접기" UI 부채
  - 검증: 모바일 staging에서 댓글 작성 줄바꿈 + #3 round-trip 확인
  - 결정/Why: `project_comment_linebreak_policy.md`

### Chrome 통일 후속 (시안 진행)
2026-05-08 chrome 통일 정책 결정/구현 후속. 상세: `project_chrome_unification_policy.md`, `project_user_menu_component.md`

- [x] **CH-01** `PageHeader` `leftAction` 슬롯 + 모바일 햄버거 — 완료 (`PageHeader.tsx:9,12,17` 슬롯 + `PostListPage.tsx:228` leftAction 주입)
- [x] **CH-02** 비인증 차단 카드 — 완료 (2026-05-10, develop 머지 PR #10)
  - **분기 필드**: `accessLocked: boolean` (PostSummary/PostDetail), 백엔드 응답 키 그대로 매핑 (이전 `isBlurred` 변환 레이어 제거)
  - **PostCard 시안 적용** (figma 1321:4066): `blur-[5.8px]` + `opacity-50` 본문/첨부 블러 + 중앙 🔒 + "치료사 인증 후에 볼 수 있어요!" 오버레이
  - **클릭 동작**: 차단 카드 Link `to`를 `/therapist-verifications`로 분기
  - **상세 페이지**: `GET /posts/:id` 403 시 `/therapist-verifications` redirect (axios.isAxiosError 분기)
  - **회귀 fix 동반**: 로그아웃→재로그인 시 이전 사용자 RQ 캐시(feed 등) 노출 버그 발견, `queryClient` 싱글턴 분리(`lib/queryClient.ts`) + `clearAuth`에서 `queryClient.clear()` 호출 → UserMenu/ProfilePage/401 refresh 4경로 일괄 통과
  - **헤더 자물쇠 아이콘 제거**: 본문 블러+오버레이로 차단 상태 충분히 전달, 시각 노이즈 정리
  - **부수 발견 (후속 backlog 후보)**: UserMenu 시안 1332:6580에서 메뉴 bundle 구분선 있음 — 현재 평면 3개
- [ ] **CH-03** 카드 액션바 4종 리액션 — 백엔드 스펙 확인 필요, 별 PR 후보
- [x] **CH-04** PostListPage PC 검색바 제거 — 완료 (PostListPage에 `<input>`/검색바 렌더 없음, searchParams는 필터 라우팅용)
- [x] **CH-05** 알림 페이지 구현 — 완료 (`NotificationPage.tsx` + `/notifications` 라우트, PR #19, F-09 헤더 정합). SSE 실시간 포함
- [ ] **CH-06** 인증완료 모달 구현 — 시안 1321:5251 (현재는 `VerificationCompletePage` 페이지)
- [ ] **CH-07** 게시글 작성 모달/페이지 임시저장(Draft) — 2026-05-10 PR #12 작업 중 후순위 결정
  - **트리거**: 모달 닫힘(ESC/배경/← back) 또는 모바일 페이지 이탈 시 본문/카테고리/공개범위 localStorage 보관, 다음 진입 시 복원
  - **clear 시점**: 작성 성공 직후, 또는 N일(예: 7일) 만료
  - **고려 사항**: 멀티 유저 시 user ID 키링 (예: `mello:post-draft:${userId}`), 첨부 파일은 File 객체 직렬화 불가라 메타데이터만 저장(파일 자체는 미보존)
  - **검증**: 작성 중 새로고침 → 본문/공개범위 복원 / 작성 성공 → localStorage 키 삭제 / 다른 유저 로그인 → 이전 유저 draft 안 보임
  - **PM 컨펌**: 시안에 임시저장 명시 없음 — 도입 전 PM 컨펌 필요 (자동 저장 vs 명시적 저장 등). 디자인 결정은 자체 판단.
- [ ] **CH-08** 시안 아이콘 컴포넌트 적용 (현재 lucide-react 라이브러리 사용 중)
  - **현황**: 작성 모달/페이지 헤더(←, ✏️), 본문 툴바(🖼️ 📎), 공개범위 자물쇠(🔒/🔓), 첨부 X 등 모두 lucide-react 아이콘 임시 사용
  - **목표**: figma 라이브러리에 정의된 멜로미 전용 아이콘 컴포넌트로 교체 (디자이너 export 또는 SVG 직접 사용)
  - **우선순위**: 낮음 — 시각적 차이가 미세하고 lucide도 디자인 일관성에 큰 해는 안 됨. 디자이너 부재로 Figma에서 직접 export하거나 lucide 계속 사용 (일괄 교체 시점 자체 결정)
  - **확장 적용 범위**: PostCard 헤더, PostListPage 빈 상태 +, BottomNav, SideNav 등 lucide 사용 전 화면 전체
  - **검증**: `grep -r "from 'lucide-react'" frontend/src` 0건 또는 의도적 잔존 명시
- [x] **CH-09** ★ 게시글 상세 댓글/대댓글 시안 정합 — 옵션 A (메인 통합 + 카드 룩 재설계) — **완료 (2026-05-20)**
  - **완료 요약**: 8개 작업 + PC 답글 모달 모두 구현 (커밋 d587fe4 통합 렌더 / cf6194c 카드 룩 / a6bbca3 답글 모달). 2026-05-20 브라우저 검증 통과(top+자식 N, 자식 없는 top, 삭제 부모+살아있는 자식, 편집 입력 보존, PC 모달/모바일 라우트 분기). 작업 8(스켈레톤 시안 룩)만 보류 — 로딩이 빨라 스켈레톤 거의 미노출, `PostDetailPage.tsx:51` 위 보류 주석 박제. 댓글 북마크는 백엔드 API 부재로 생략 확정
  - **사용자 직접 코딩 결정 (2026-05-11)**: 단순 스타일 변경이 아니라 데이터 렌더 로직·컴포넌트 재설계가 동반됨 → AI 위임 X, 학습 목표 정합
  - **시안 출처**: PC `1387:13250` (Reply_list), Mobile `1321:3821` 댓글 영역
  - **데이터 모델**: 이미 준비됨 — `comments`(flat 배열), `getReplies(parentId)`, `topComments` 헬퍼 존재. 추가 API 호출 / 모델 변경 X
  - **변경 작업 (8가지)**:
    1. `PostDetailPage` 댓글 리스트 렌더 로직 — `topComments.map(parent => [parent, ...getReplies(parent.id)])` 형태로 부모+자식 함께 렌더, 외부 div의 `onClick={navigate(detail)}` 제거
    2. `CommentCard` 재설계 — 인라인 프로필(sm) → **좌측 프로필 컬럼(48px)** 분리 + 우측 contents_area(닉네임/뱃지/시간 한 줄+케밥, 본문, 액션 행)
    3. `CommentCard` props 추가 — `isReply?: boolean`, `hasReplies?: boolean`
    4. `hasReplies` 인 부모 댓글: 좌측 프로필 아래로 **세로선** (CSS `border-l` 또는 절대위치 `w-px bg-gray-300`)
    5. `isReply` 인 대댓글: 카드 위쪽에 **꺾인 선(╰) prefix area** (16px 높이, 좌측 16px padding, 48px 폭, CSS `border-l + border-b + rounded-bl` 조합 권장 — SVG 자산 의존 X)
    6. 댓글 액션 행 시안 정합 — 댓글 아이콘 좌측 + ReactionBar + (북마크 우측 끝)
    7. 댓글 사이즈/폰트 — 닉네임 14px bold / 시간 11px gray-500 / 본문 14px leading-20
    8. PostDetailSkeleton 시안 룩 반영
  - **결정 미완료 (착수 전 확정)**:
    - **답글 작성 동선**: ⓐ 메시지 아이콘 → CommentDetailPage 진입(권장, D-4 안전) / ⓑ 인라인 입력창
    - **댓글 북마크**: 시각만(no-op) / **생략(권장)** — 백엔드 댓글 스크랩 API 없음, 존재하지 않는 기능 노출 회피
  - **유지 사항**: `CommentDetailPage` 자체는 변경 X (메시지 아이콘 진입점만 유지), `@replyToNickname` 멘션 표시 그대로, `flat 2레벨` 정책(메모리) 유지
  - **검증**: top 댓글 1+자식 N 케이스 / 자식 없는 top 댓글 / 삭제된 부모+살아있는 자식 케이스 / 모바일·PC 양쪽 시각 확인 / 카드 클릭 navigate 제거 회귀(편집 모드 입력 보존 등)
  - **함정**: 외부 래퍼 div의 `cursor-pointer + onClick`이 편집 중인 textarea 입력 보존 가드 역할 했음 → onClick 제거 시 편집 모드 가드 흐름 재검토 필요
- [x] **CH-10** ProfilePage 빈 상태 카피 시안 정합 후속 — 완료 (2026-05-22, develop `8e32da8`, 사용자 직접 구현). `TabEmpty message` 3곳 시그널 카피로 교체
  - 현황: 2026-05-11 헤더/탭 라벨/본문 폭 시안 정합 완료. 빈 상태 메시지는 이번 범위 밖이라 그대로 둠
  - 시안 카피: `내 시그널` → "첫 시그널을 보내세요!" / `이어진 시그널` → "시그널을 이어보세요!" / `수집한 시그널` → "시그널을 수집해보세요!"
  - 위치: `ProfilePage.tsx` `TabEmpty message=...` 호출 3곳
  - 검증: 각 탭에서 빈 상태 시각 확인 + 메시지 문구 정확 매칭
  - 상세: `project_profile_page_signal_chrome_2026_05_11.md`

### 디자이너 부재(2026-05-22) 후 정리 — 내일 단일 참조 (2026-05-25 검증)
> 디자이너 퇴팀으로 "디자인 대기"가 풀린 항목 정리. 단 일부는 **디자이너 무관·백엔드 의존**이라 안 풀림. 착수 순서 = 위→아래(쉬운 독립 항목부터).
> 2026-05-25 코드/Swagger 검증: D-04/D-06은 이미 구현됨 / DM·타인프로필·팔로우는 Swagger 엔드포인트 부재 확정 / 알림(CH-05)은 백엔드 ready.

#### ✅ 확인 결과 이미 해소 (재착수 불필요)
- [x] **D-04** 첨부파일 UI — `PostDetailPage.tsx:387~432` 시안 정합(`1387:12297`)으로 이미지 캐러셀+첨부 칩+다운로드 구현 완료 (2026-05-25 확인)
- [x] **D-06** 3종 리액션 UI — `ReactionBar.tsx`(LIKE/CURIOUS/USEFUL) 완성, 댓글·게시글 상세(`PostDetailPage.tsx:544`) 적용. 피드 카드 `PostCard`만 LIKE 단독 노출(의도) → 잔존은 CH-03뿐
- [-] ~~**D-07** 블러 UI~~ → CH-02 구현 완료(2026-05-10)로 해소

#### 🟢 바로 가능 — 프론트 단독 + 자체 결정 (시안 없음)
- [x] **D-02** alert() → toast.error() 전환 완료 (2026-06-19, develop `3cd64b8`·`9d743c7`). 12곳 교체 + visibleToasts={1} 토스트 단일 노출
- [ ] **D-03** 모바일/PC 상단 헤더 — `project_mobile_header_refactor.md` 참조, 자체 결정
- [ ] **D-09** 데스크탑 헤더 글쓰기 버튼 — 알림 아이콘 왼쪽 자체 결정
- [x] **MEL-47** 정렬 토글 UI(최신/인기) — 완료 (커밋 `64d5b6c`, §1 항목 참조)
- [-] **D-05** 치료영역 배지 — **보류** (2026-06-19). FollowUser·MessageResponse·알림 등 다수 DTO에 therapyArea 없음 → 전체 통일 시 BE DTO 대규모 추가 필요. 비용 대비 효과 낮아 BE 일괄 요청 시점까지 대기
- [ ] **CH-03** 피드 카드(`PostCard`)에 3종 리액션 노출할지 — 현재 LIKE만. 노출 결정 시 기존 `ReactionBar` 재사용

#### 🟢 바로 가능 — 시안 있음 (Figma 참조)
- [ ] **D-10 / CH-06** VerificationCompletePage(PENDING/APPROVED) + 인증완료 모달 — 시안 `1321:5251` (한 묶음 검토)
- [ ] 치료사 인증 페이지(`TherapistVerificationPage`) — 기존 Figma 시안 확인 후 구현
- [x] **D-11** 치료사 인증 상세 정보 UI — 완료 (거절 사유 `TherapistVerificationPage.tsx:144`/`VerificationCompletePage.tsx:70` + 신청일 `:142`)

#### 🔴 디자이너 무관 — 백엔드 블로킹 ("풀린 거 아님", 내일 착수 불가)
- [x] **🔔 쪽지(DM)** — ✅ **핵심 4슬라이스(0~3) 완료 (2026-06-05).** API 존재(05-25 "부재"는 오확인). 설계 스펙 `docs/superpowers/specs/2026-05-26-user-interaction-messaging-design.md`, 메모리 [[project_messaging_feature]].
  - slice 0·1 진입/작성(PR #20, merge), slice 2 쪽지함/상세/삭제(PR #21, merge `2896528`) + 후속 5건(`016f82b`~`49672f2`), slice 3 안읽음 뱃지+읽음 동기화+실시간 SSE(PR #23, merge `6a1b270`).
  - slice 3 실측 4종 통과(초기 동기화/실시간 +1/읽음 -1/모바일 점). 실측 중 필드명 버그 1건 수정(`count`→`unreadCount`, 커밋 `21c44d0`) + 뱃지 UI 마감(`43dcf1c`).
  - **백엔드:** Q2 ✅(GET 상세 자동 읽음) / Q1 ⚠️(NEW_MESSAGE referenceId=messageId 런타임 미확인, `/messages` 목록 fallback 유지). content maxLength=**1000**.
  - **후속 4건 ✅ 완료 (2026-06-05, develop push `6fb9527..54a9e3f`)**: 쪽지 상세 답장 입력(+Enter) / 알림 NEW_MESSAGE→상세 직행(Q1 referenceId=messageId **런타임 확정**) / 안읽음 뱃지 SPA 미동기화 fix(상세 GET이 read:true 응답 → 서버 재동기화로 전환) / 쪽지함 탭 URL 보존(searchParams 양방향 + backTo 분기). 상세 [[project_messaging_feature]].
  - **남은 확장(별도, 후순위)**: 피드 카드 진입점(authorId 부재, BE) / 답장·스레드(API 단발형, BE 재설계).
- [ ] **F-10 [BE]** 쪽지 발신/수신 프로필 사진 — `MessageResponse`에 이미지 URL 필드 부재 (2026-06-05)
  - 현황: 쪽지 상세/목록은 닉네임만 표시. `MessageResponse`(`types/message.ts`)에 senderNickname/receiverNickname만 있고 **이미지 URL 없음** → 상대 프로필 사진 표시 불가. `GET /users/{id}`(타인 프로필, B-09)도 부재라 우회 fetch도 불가
  - 사용자 요청: 닉네임만으론 상대 식별 어려움(실명 아닌 닉네임) → 프로필 사진 표시 희망
  - **[BE] 요청**: `MessageResponse`에 `senderProfileImageUrl` + `receiverProfileImageUrl` 추가 (게시글/댓글 응답엔 이미 작성자 이미지 동봉 → 같은 패턴, 소규모 예상)
  - FE 후속(BE 해소 후): 쪽지 상세 발신/수신 라벨 옆에 `UserAvatar` 배선. 그 전엔 닉네임 이니셜 fallback만 가능
  - 검증: 쪽지 상세에서 상대 프로필 사진 노출 + 이미지 없는 유저는 이니셜 fallback
- [ ] **B-09** 타인 프로필 — `GET /users/{id}` 부재 재확인. 상세 스펙/시안(`1444:24270`)은 §2 B-09
- [x] **B-04** 팔로우/언팔로우 — **FE 1차 완료 (2026-06-08, PR #25 미머지)**. 목록2탭+언팔토글(정책A)+ProfilePage 카운트+작성자 드롭다운 팔로우+NEW_FOLLOW 카운트동기화. 상세 [[project_follow_feature]]. 미해결=F-12 맞팔필드/F-14 아바타이미지(둘 다 BE)

#### 💡 검증 중 발견 — 디자이너 무관, 백엔드 ready (바로 가능)
- [x] **CH-05** 알림 페이지 — 완료. `NotificationPage.tsx` + `/notifications` 라우트 + SSE 실시간(PR #19). §1 CH-05 참조

### 인지부채 (코드 아닌 학습)
- [x] **L-01** `useInfiniteFeed` + P1 fallback 메커니즘 복습 (04-17 대략적 로직 + controller 이해 완료, 더 깊이 파는 것은 RQ 도입 후 불필요)
  - 상세: wiki `p1-feed-pagination-auto-fallback-high`
- [ ] **L-02** base-ui vs Radix/shadcn `asChild` 구분 재복습 — 이 프로젝트 dropdown은 폴더명만 shadcn이고 실토대는 `@base-ui/react`라 `asChild` 없음(감싸기가 정답). 2026-05-27 쪽지 작업 중 미체화 자각. 상세: `feedback_shadcn_button_aschild.md` 플래그
- [ ] **L-02** multipart/form-data 연결 과정 이해
- [ ] **L-03** 리액션 API 리팩토링 흐름 이해
- [x] **L-04** 마이페이지 3탭 데이터 흐름 이해 (04-17 완료)

### GA4 이벤트
- [x] **G-01** GA4 커스텀 이벤트 1차 4종 삽입 (2026-04-24 완료, 커밋 cf7750e)
  - `SignupPage` → `signup_completed` / `LoginPage` → `login_completed` (navigate 전) / `TherapistVerificationPage` → `verification_requested` / `PostCreatePage` → `first_post_created` (`fetchMyPosts(0,1).totalElements === 0` 프론트 단독 판별, `/me.postCount` 스펙 부재로 대체)
  - 검증: GA4 실시간 리포트에서 4종 이벤트 집계 확인 완료
- [x] **G-02** PM 정식 스펙 주요 7개 추가 삽입 완료 (커밋 e15a065)
  - 삽입 위치 확인:
    - `sign_up` → `SignupPage.tsx:62`
    - `profile_edited` → `ProfilePage.tsx:76,106` (편집 저장 2경로)
    - `certification_started` → `TherapistVerificationPage.tsx:58`
    - `certification_submitted` → `TherapistVerificationPage.tsx:100` (스펙 외 보강)
    - `certification_completed` → `VerificationCompletePage.tsx:32`
    - `post_created` / `first_post_created` → `PostCreatePage.tsx:96-97`
    - `reaction` 헬퍼 → `lib/analytics.ts:79` (type 분기)
    - `screen_exit` → `hooks/useScreenExit.ts:63` (beacon transport)
  - [?] GA4 실시간 리포트 집계 검증 — 6/7개 정상 추적 확인. **`certification_completed` 1건만 미발생** (재현/원인 추적 필요, `VerificationCompletePage.tsx:32` `verStatus === 'APPROVED'` 분기 effect)
- [-] **G-03** PM 정식 스펙 비주요 17개 점진 삽입 — **PM 확인 후 진행** (2026-06-19). 불필요한 이벤트 추가 시 GA4 대시보드 난잡해질 수 있어 PM이 원하는 이벤트 먼저 확인하기로. 미삽입 13개 목록은 세션 기록 참조
- [ ] **G-04** `certification_completed` 미추적 원인 추적 (G-02 잔여)
  - 현황: 2026-05-06 GA4 실시간 검증 시 7개 중 6개 정상, 이 1건만 미발생
  - 위치: `VerificationCompletePage.tsx:32` (`verStatus === 'APPROVED'` 분기 effect)
  - 후보 가설: ① MVP 즉시 APPROVED 정책으로 effect deps/타이밍 미스 ② 중복 fire 가드가 첫 fire도 막음 ③ 페이지 재진입 시 fire 안 되도록 의도라면 정상(스펙 재확인)
  - 검증: GA4 DebugView에서 인증 신청 → APPROVED 페이지 진입 시 이벤트 발생 여부, `verStatus` 값/effect 호출 횟수 console.log
  - 우선순위: 낮음 (북극성 지표 아님, MVP 정책상 모든 신청자가 도달 → 누락분 추후 boring fix)

### SEO
- [x] **S-01** vite-prerender-plugin 빌드 hang 진단 + prerender 재도입 (2026-04-27 완료, 커밋 6d234cc)
  - 원인: React 19 + `react-dom/server` `renderToString`이 Node 이벤트 루프 잔류 핸들 남김 (preactjs/vite-prerender-plugin Issue #3, 1년+ 미해결)
  - 해결: 자체 vite 플러그인 `closeBundle` 훅에서 `process.exit(0)` 호출 + `apply: 'build'` + `enforce: 'post'`
  - 검증: 로컬 9초 종료 / Vercel 14초 배포 완료 / prerender 3개 산출물 정상
  - 상세: wiki `vite-prerender-plugin-react-19-hang` (debugging)

### 정책 페이지
- [x] **P-01** 개인정보처리방침 페이지 `/privacy` + Signup/LandingFooter/LoginPage 링크 (2026-04-24 완료)
  - 상세: `project_privacy_policy_page.md`
- [x] **P-02** 이용약관 페이지 `/terms` + SignupPage/LoginPage 이용약관 링크 연결 (2026-04-24 완료, 준비중 스텁)
  - TermsPage는 본문 없이 "준비 중" 안내만. 본문 채우는 건 후속 작업(법적 검토 이후)
  - SignupPage는 새탭, LoginPage는 same-tab 유지 (PrivacyPage 패턴 동일)

---

## 2. 블로킹 대기

### 백엔드 [BE]
- [x] **B-01** 프로필 이미지 URL localhost 버그 (P0) — 해소 2026-04-22
  - 백엔드 EC2에 `APP_BASE_URL` 주입 완료, 응답이 `https://api.melonnetherapists.com/...`로 내려옴 → 프론트 `resolveImageUrl.ts` localhost 치환 제거
  - 상세: `project_profile_image_localhost_bug.md`
- [?] **B-02** title 필드 optional 변경 (P0) — 확인일: 04-16
  - 현황: 프론트 `PostCreateRequest`에 title 없음. 백엔드가 required로 막는지 확인 필요
  - 검증: Swagger에서 POST /posts title 없이 요청 → 400 여부
- [x] **B-03** visibility 블러 정책 — 백엔드 준비 완료 (2026-05-09 사용자 검증)
  - 현황 갱신: USER 롤 GET /posts 응답에 PRIVATE 게시글 **포함**, `contentPreview="비공개 글입니다"` 마스킹 + `accessLocked: true` boolean 필드 제공
  - 응답 예시 필드: visibility/accessLocked/contentPreview/imageUrls=[]/카운트=0
  - 분기 신호: `accessLocked === true` (문자열 비교 X)
  - 단, GET /posts/:id 직접 접근은 실패("게시글을 불러오는 데 실패했습니다.") — 디테일 진입 시 분기 필요
  - 후속: CH-02 디자인 도착 시 블러 + 🔒 + VerificationRequiredModal 구현
- [x] **B-04** 팔로우 시스템 API — **BE 완료 확인 (2026-06-08 Swagger 실조회)**. 블로킹 해제 → FE 착수 대기
  - 등재 엔드포인트: `users/{userId}/follow`(GET/POST/DELETE) / `posts/feed/following`(커서) / `me/followings`·`me/followers`(offset) / `me/follow-counts`
  - **FE 구현 = `project_follow_feature.md` 참조 (API 계약 + 스코프 + 미결 박제). 트리거 「팔로우 이어가자」**
  - ⚠️ 타인 프로필(B-09 `GET /users/{id}`)은 여전히 부재 → 팔로우 버튼 위치 미결
- [?] **B-05** 스크랩 `scrapped` 필드 초기값 연동 (P1) — 확인일: 04-16
  - 현황: 합의 완료 + 구현 가능성. 프론트는 `useState(false)` 고정 중
  - 검증: DevTools → GET /posts 응답에서 `scrapped` 값 확인 → 있으면 `useState(post.scrapped)` 교체
  - 정책: **자신이 쓴 글도 스크랩 가능** (2026-04-22 주간 회의 확정) — `authorId === currentUserId` 조건으로 스크랩 버튼 숨기는 분기 두지 말 것
- [ ] **B-06** 환영 모달 isNewUser 트리거 — 확인일: 2026-05-06
  - 현황: 환영 모달 자체는 회원가입 직후 SignupPage에서 localStorage 신호로 트리거 완료(2026-05-06). 다른 디바이스/세션 첫 로그인 시 트리거는 미구현 — 백엔드 isNewUser 응답 정상 여부 확인 후 LoginPage에 같은 신호 추가 가능
  - 검증: DevTools → 로그인 응답 `isNewUser` 값이 실제 상태와 일치하는지
  - 상세: `project_welcome_modal_implementation.md`
- [ ] **B-07** 게시글 이미지 presigned URL 대응 (P1) — 확인일: 04-22
  - 현황: 백엔드가 presigned URL 방식으로 결정, 작업 대기
  - 검증: Swagger `/v3/api-docs` 재조회 → `PostImageResponse.imageUrl`이 서명 쿼리 포함 절대 URL인지
  - 상세: `project_post_image_presigned_url.md`
- [-] ~~**B-08** 유저 행동 분석용 `analyticsId` 필드 추가~~ → **드롭 (2026-04-24)** PM 결정: GA4 유저 단위 추적 안 함, Looker Studio/Firebase 로우데이터로 대체. 이벤트 4종은 프론트 독립 착수로 이동.
- [ ] **B-09** 타인 프로필 조회 API (P1, MVP 후) — 확인일: 2026-05-12 (staging Swagger 기준 부재)
  - **현황**: staging Swagger에 `/me` 계열만 있고 `GET /users/{id}` 류 부재 확정. 타인 프로필 카드 채울 데이터 소스 없음
  - **요청 엔드포인트 2종**:
    1. `GET /api/v1/users/{userId}` — 공개 프로필 카드 (nickname, profileImageUrl, role/title, verifiedAt 또는 인증 배지 flag, introduction)
    2. `GET /api/v1/users/{userId}/posts` — 그 사람이 쓴 공개 게시글 페이지네이션 (visibility=PUBLIC만, accessLocked 정책은 본인 피드와 동일)
  - **권한 정책 확인 필요**: 비인증 유저가 타인 프로필 열람 시 403? 200 + 차단 카드? (`B-03` 패턴 재사용 가능)
  - **시안 출처**:
    - 타인 프로필 페이지: figma node `1444:24270` (PC 700+)
    - ⋯ 더보기 메뉴: figma node `1416:19545` (링크복사/차단/신고)
  - **프론트 단독 가능한 후속 작업 (백엔드 해소 후 즉시 착수)**:
    1. 라우트 `/profile/:userId` 추가 (`App.tsx`)
    2. `UserProfilePage` 신규 (헤더 ← + 닉네임 + 🔍 + ⋯ / 프로필 카드 / 액션바 / 탭 2종)
    3. `PostCard` / `PostDetailPage` / `CommentCard` 프사에 `onClick → navigate('/profile/' + authorId)` (stopPropagation)
    4. 본인 클릭 시 `/profile/:myId` → `MyProfilePage` 분기 (또는 `/profile` redirect)
    5. `PostSummary` / `CommentResponse` 타입에 `authorId` 존재 확인 — 없으면 백엔드 추가 요청 묶기
  - **MVP 스코프 결정 (2026-05-12)**:
    - 액션바 [메세지][연결하기] → **버튼 hidden** (DM/팔로우 시스템 MVP 미포함, B-04 미해소)
    - ⋯ 메뉴 → **링크복사만 노출** (clipboard 1줄), 차단/신고는 백엔드 미확인 → MVP 후
    - "이어진 시그널" 탭 → **UI-only + NotFound** (`아직 이어진 시그널이 없어요`), 데이터 fetch 없음
  - **컴포넌트 전략**: 기존 `ProfilePage`(본인, 탭 3종 구현 완료) **건드리지 않음**. `UserProfilePage`만 신규. 공통 추출(`ProfileView`)은 신규 페이지 동작 후 별도 작업으로 분리 (premature abstraction 회피)
  - **MVP 발표(05-15) 후 진행**: 백엔드 의존 + 차단/신고/연결 기능 미결정 → MVP 안정화 우선
  - 검증: staging Swagger 재조회로 엔드포인트 등재 확인, 응답 스키마 필드 매핑

### 해소됨
- [-] ~~탈퇴 유저 에러코드 분리~~ → 비번 틀림과 동일 에러 유지 확정 (04-16)
- [x] ~~이미지 public + 절대 경로~~ → 해결됨 (04-16)

### PM / 운영
- [ ] **PM-01** 개인정보처리방침 법적 검토 → 통과 시 `PrivacyPage.tsx` 상단 초안 배너 제거 + 시행일 갱신
  - 검증: `grep "검토 중인 초안" frontend/src/pages/PrivacyPage.tsx` → 제거 여부
- [ ] **PM-02** 개인정보 보호책임자 연락처 확정 → `melonnebuilders@gmail.com` 플레이스홀더 교체


---

## 3. UI만 존재 (기능 미동작, 낮은 우선순위)

- **U-01** 로그인 상태 유지 체크박스 (`/login`)
- **U-02** 비밀번호 찾기 링크 (`/login`)
- **U-03** 이용약관/개인정보처리방침 링크 (`/login`)
- **U-04** 검색바 (`/posts`) — 백엔드 검색 API 필요
- **U-05** 배너 통계 하드코딩 (`/posts`)
- **U-06** 공지사항 드롭다운 mock (네비게이션 바)

---

## 완료 아카이브

- [x] Pagination 컴포넌트 추출 (커밋 32ac85a)
- [x] MobilePageHeader 추출 (커밋 c336ca0)
- [x] 무한 스크롤 main 머지 (커밋 7d2803e)
- [x] P0 필터 칩 feed 중복 요청 버그 (커밋 d776f85)
- [x] P1 feed→pagination fallback (커밋 f4a50cc)
- [x] U-07 공개/비공개 토글 API 연동 — PostCreatePage/PostEditPage에서 `visibility: PUBLIC|PRIVATE` 이미 전송 중 (04-17 재확인)

---

## 운영 규칙

1. **세션 시작**: 이 파일 읽기 → 오늘 할 항목 선택 → 해당 항목 검증 grep 실행
2. **작업 완료 시**: 체크박스 업데이트 + 확인일 갱신
3. **새 이슈 발견 시**: 적절한 섹션에 넘버링 추가
4. **주 1회**: 블로킹 대기 섹션 전체 확인일 갱신
