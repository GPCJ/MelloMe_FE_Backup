---
name: 프론트엔드 작업 백로그
description: 데일리 태스크 선택용 단일 참조 파일 — 할 수 있는 것 / 블로킹 대기 / 검증 방법 포함
type: project
updated: 2026-05-12
originSessionId: f733d60b-43f4-4c4c-be62-0deecb757652
---
# 프론트엔드 작업 백로그

> 상태: `[ ]` 미완 / `[x]` 완료 / `[?]` 검증 필요 / `[-]` 해소(의도적 종료)
> 블로킹 태그: `[BE]` 백엔드 / `[디자인]` 디자이너
> 검증일: 각 항목의 마지막 확인 날짜
> 상세 필요 시 → `detail/` 또는 기존 메모리 파일 링크

---

## 1. 바로 할 수 있는 것 (프론트 독립)

### ★ 내일 1순위 (2026-05-11)
- [ ] **CH-09** 게시글 상세 댓글/대댓글 시안 정합 — 옵션 A(메인 통합 + 카드 룩 재설계) — **사용자 직접 코딩** (인지부채 학습 목표)
  - 현황: 이번 세션에서 옵션 A로 합의(2026-05-11). 단순 스타일 X, 로직 변경 多 → AI 위임 보류
  - 진입점: `PostDetailPage.tsx` 댓글 리스트 렌더 로직 + `CommentCard.tsx` 재설계
  - 상세는 아래 Chrome 통일 후속 섹션 CH-09 참조
- [ ] **MEL-47** 피드 정렬 전환 UI 추가 (최신순/인기순)
  - Jira: MEL-47 / 담당: 진서현(나) / 상태: 해야 할 일
  - 현황: 정렬 API 스펙 확인 필요 (Swagger `GET /posts?sort=LATEST|POPULAR` 파라미터 여부)
  - 연관: D-01 (디자이너 시안 대기 중) — 시안 없으면 임시 UI로 선착수 가능
  - 검증: 최신순 ↔ 인기순 전환 시 피드 재요청 + 탭 상태 유지 확인

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
- [ ] **R-02** AbortController 일괄 적용 (PostListPage, PostDetailPage)
  - 검증: `grep "AbortController" frontend/src/pages` → 적용 여부
- [ ] **R-03** refresh plain axios 분리
  - 검증: `grep "import axios" frontend/src/api/axiosInstance.ts` → plain axios import 유무
  - 참고: F-01과 연관, 백엔드 연결 후 401 통합 테스트 시점에 처리
- [ ] **R-04** FilterChips 컴포넌트 추출 (Pagination 추출 완료, 다음 순서)
  - 검증: `grep "FilterChips" frontend/src/components` → 공통 컴포넌트 존재 여부
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

- [ ] **CH-01** `PageHeader` `leftAction` 슬롯 추가 + 모바일 햄버거 ≡ (UserMenu 재사용)
  - 현황: PageHeader는 `title`/`backTo`/`rightAction` 3슬롯. 모바일에서 좌측 햄버거 진입점 부재
  - 작업: `PageHeader`에 `leftAction?: ReactNode` 추가, 모바일 페이지에서 `<UserMenu side="bottom" align="start" sideOffset={8}>` 트리거로 햄버거 아이콘 주입
  - 검증: 모바일 뷰에서 햄버거 → 메뉴 3항목 펼침 / PC에선 leftAction 없을 때 좌측 공간 깨지지 않음
- [x] **CH-02** 비인증 차단 카드 — 완료 (2026-05-10, develop 머지 PR #10)
  - **분기 필드**: `accessLocked: boolean` (PostSummary/PostDetail), 백엔드 응답 키 그대로 매핑 (이전 `isBlurred` 변환 레이어 제거)
  - **PostCard 시안 적용** (figma 1321:4066): `blur-[5.8px]` + `opacity-50` 본문/첨부 블러 + 중앙 🔒 + "치료사 인증 후에 볼 수 있어요!" 오버레이
  - **클릭 동작**: 차단 카드 Link `to`를 `/therapist-verifications`로 분기
  - **상세 페이지**: `GET /posts/:id` 403 시 `/therapist-verifications` redirect (axios.isAxiosError 분기)
  - **회귀 fix 동반**: 로그아웃→재로그인 시 이전 사용자 RQ 캐시(feed 등) 노출 버그 발견, `queryClient` 싱글턴 분리(`lib/queryClient.ts`) + `clearAuth`에서 `queryClient.clear()` 호출 → UserMenu/ProfilePage/401 refresh 4경로 일괄 통과
  - **헤더 자물쇠 아이콘 제거**: 본문 블러+오버레이로 차단 상태 충분히 전달, 시각 노이즈 정리
  - **부수 발견 (후속 backlog 후보)**: UserMenu 시안 1332:6580에서 메뉴 bundle 구분선 있음 — 현재 평면 3개
- [ ] **CH-03** 카드 액션바 4종 리액션 — 백엔드 스펙 확인 필요, 별 PR 후보
- [ ] **CH-04** PostListPage PC 검색바 제거 — 큰 UI 수정 시 묶어서
- [ ] **CH-05** 알림 페이지 구현 — 현재 `/notifications` → `NotFoundPage`
- [ ] **CH-06** 인증완료 모달 구현 — 시안 1321:5251 (현재는 `VerificationCompletePage` 페이지)
- [ ] **CH-07** 게시글 작성 모달/페이지 임시저장(Draft) — 2026-05-10 PR #12 작업 중 후순위 결정
  - **트리거**: 모달 닫힘(ESC/배경/← back) 또는 모바일 페이지 이탈 시 본문/카테고리/공개범위 localStorage 보관, 다음 진입 시 복원
  - **clear 시점**: 작성 성공 직후, 또는 N일(예: 7일) 만료
  - **고려 사항**: 멀티 유저 시 user ID 키링 (예: `mello:post-draft:${userId}`), 첨부 파일은 File 객체 직렬화 불가라 메타데이터만 저장(파일 자체는 미보존)
  - **검증**: 작성 중 새로고침 → 본문/공개범위 복원 / 작성 성공 → localStorage 키 삭제 / 다른 유저 로그인 → 이전 유저 draft 안 보임
  - **PM/디자이너 컨펌**: 시안에 임시저장 명시 없음 — 도입 전 컨펌 필요 (자동 저장 vs 명시적 저장 등)
- [ ] **CH-08** 시안 아이콘 컴포넌트 적용 (현재 lucide-react 라이브러리 사용 중)
  - **현황**: 작성 모달/페이지 헤더(←, ✏️), 본문 툴바(🖼️ 📎), 공개범위 자물쇠(🔒/🔓), 첨부 X 등 모두 lucide-react 아이콘 임시 사용
  - **목표**: figma 라이브러리에 정의된 멜로미 전용 아이콘 컴포넌트로 교체 (디자이너 export 또는 SVG 직접 사용)
  - **우선순위**: 낮음 — 시각적 차이가 미세하고 lucide도 디자인 일관성에 큰 해는 안 됨. 디자이너가 아이콘 셋 export 일괄 제공 시점에 일괄 교체가 효율적
  - **확장 적용 범위**: PostCard 헤더, PostListPage 빈 상태 +, BottomNav, SideNav 등 lucide 사용 전 화면 전체
  - **검증**: `grep -r "from 'lucide-react'" frontend/src` 0건 또는 의도적 잔존 명시
- [ ] **CH-09** ★ 게시글 상세 댓글/대댓글 시안 정합 — 옵션 A (메인 통합 + 카드 룩 재설계)
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
- [ ] **CH-10** ProfilePage 빈 상태 카피 시안 정합 후속
  - 현황: 2026-05-11 헤더/탭 라벨/본문 폭 시안 정합 완료. 빈 상태 메시지는 이번 범위 밖이라 그대로 둠
  - 시안 카피: `내 시그널` → "첫 시그널을 보내세요!" / `이어진 시그널` → "시그널을 이어보세요!" / `수집한 시그널` → "시그널을 수집해보세요!"
  - 위치: `ProfilePage.tsx` `TabEmpty message=...` 호출 3곳
  - 검증: 각 탭에서 빈 상태 시각 확인 + 메시지 문구 정확 매칭
  - 상세: `project_profile_page_signal_chrome_2026_05_11.md`

### 인지부채 (코드 아닌 학습)
- [x] **L-01** `useInfiniteFeed` + P1 fallback 메커니즘 복습 (04-17 대략적 로직 + controller 이해 완료, 더 깊이 파는 것은 RQ 도입 후 불필요)
  - 상세: wiki `p1-feed-pagination-auto-fallback-high`
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
- [ ] **G-03** PM 정식 스펙 비주요 17개 점진 삽입 (G-02 안정화 후)
  - 콘텐츠/탐색/세부 인증 이벤트들. 우선순위 낮음
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
- [ ] **B-04** 팔로우 시스템 API (P1) — 확인일: 04-16
  - 현황: 미구현
  - 검증: Swagger에서 `/follow` 엔드포인트 존재 여부
- [?] **B-05** 스크랩 `scrapped` 필드 초기값 연동 (P1) — 확인일: 04-16
  - 현황: 합의 완료 + 구현 가능성. 프론트는 `useState(false)` 고정 중
  - 검증: DevTools → GET /posts 응답에서 `scrapped` 값 확인 → 있으면 `useState(post.scrapped)` 교체
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
  - **MVP 발표(05-15) 후 진행**: 백엔드 의존 + 디자인 결정 미해소(차단/신고/연결) → MVP 안정화 우선
  - 검증: staging Swagger 재조회로 엔드포인트 등재 확인, 응답 스키마 필드 매핑

### 해소됨
- [-] ~~탈퇴 유저 에러코드 분리~~ → 비번 틀림과 동일 에러 유지 확정 (04-16)
- [x] ~~이미지 public + 절대 경로~~ → 해결됨 (04-16)

### PM / 운영
- [ ] **PM-01** 개인정보처리방침 법적 검토 → 통과 시 `PrivacyPage.tsx` 상단 초안 배너 제거 + 시행일 갱신
  - 검증: `grep "검토 중인 초안" frontend/src/pages/PrivacyPage.tsx` → 제거 여부
- [ ] **PM-02** 개인정보 보호책임자 연락처 확정 → `melonnebuilders@gmail.com` 플레이스홀더 교체

### 디자이너 [디자인]
- [ ] **D-01** 정렬 토글 UI (LATEST/POPULAR) 시안
- [ ] **D-02** fallback 안내 메시지 문구 확인
- [ ] **D-03** 모바일/PC 상단 헤더 별도 디자인 — 상세: `project_mobile_header_refactor.md`
- [ ] **D-04** 첨부파일 UI 위치/디자인 (PostDetailPage)
- [ ] **D-05** 치료영역 배지 디자인 (인증 치료사 닉네임 옆) — 백엔드 완료
- [ ] **D-06** 3종 리액션 UI 디자인 (좋아요·공감·도움) — 백엔드 완료
- [ ] **D-07** 블러 UI 디자인 (미인증 회원 열람 시)
- [ ] **D-08** 팔로우/언팔로우 버튼 위치/디자인
- [ ] **D-09** 데스크탑 헤더 글쓰기 버튼
- [ ] **D-10** VerificationCompletePage PENDING/APPROVED 화면 디자인
- [ ] **D-11** 치료사 인증 상세 정보 UI 디자인

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
