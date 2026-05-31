---
name: project_concern_card_feature
description: "고민 카드(Concern Card) 기능 — 설계·계획 완료, 백엔드 명세 대기로 구현 보류 (PM 진단명 목록은 2026-05-27 수령·박제)"
metadata: 
  node_type: memory
  type: project
  originSessionId: 1660f044-7119-4166-bb15-e57715bc7a57
---

발달장애 아동 치료사가 임상 고민을 구조화 카드로 작성 → 피드에 일반 글과 함께 노출 → 상세에서 전체 확인하는 Post-MVP 프로토타입 기능. 반응 약하면 폐기 가능 전제.

**상태 (2026-05-27)**: 설계·구현계획 완료 + 커밋. 구현 미착수. **대기 중.**

**2026-05-28 차단 해소 — 백엔드 명세 확정 (Jira MEL-55, 백엔드 MEL-54 구현 완료, 단 staging/prod 미배포·main 미머지로 추정)**

설계 대비 델타(이 방향으로 스펙/계획 정정 필요):
- postType 리터럴 `CONCERN` → **`CONCERN_CARD`**
- 중첩 `concern{worry,...}` 객체 폐기 → **flat**: `content`(=고민 본문, 별도 worry 필드 없음) + 최상위 `therapyArea`/`ageGroup`/`diagnoses[]`/`otherNotes`
- `note?` → **`otherNotes`**(200자), `diagnoses` **최대 10개·각 100자**
- Q1=기존 `POST /api/v1/posts`+postType / Q2=Summary에 4필드 동봉 확정 / Q3=배열 제약 위와 같음

설계에 없던 새 요구사항:
- **권한 마스킹**: `USER` 롤은 `diagnoses`/`otherNotes`=`null` → 프론트 숨김+"치료사 인증 후 확인 가능"
- **postType 필터**: `feed`/`feed/following`/`me/posts`에 `?postType=CONCERN_CARD` → 피드 탭(전체/고민카드/일반글)
- 고민카드 **첨부파일 미지원**(향후)

확인 대기: ① content가 HTML(`<p>`)인지 기존 평문인지 — **코드 확인 결과 평문**(PostWriteForm이 textarea값 그대로 createPost 전송, contentPreview도 whitespace-pre-wrap). ② 백엔드 배포 시점(staging/prod 미배포).

**2026-05-28 스펙·계획 정정 완료 (flat 피벗, 미커밋)**: 사용자와 「Flat 직결」 아키텍처 합의 → 중첩 `concern` 객체/FE 뷰모델/변환 어댑터 폐기. 결정 근거: 백엔드 계약이 Post 모양과 1:1(`createPost`가 PostCreateRequest 그대로 POST, `fetchFeed`/`fetchPost`가 응답 그대로 반환) → 타입에 flat 필드만 추가하면 작성·읽기 변환 없이 흐름. 격리 가치 소멸.
- 정정 방향: PostType에 `CONCERN_CARD`; PostSummary/PostDetail에 `ageGroup?`·`diagnoses?:string[]|null`·`otherNotes?:string|null`(therapyArea 기존); PostCreateRequest/PostUpdateRequest 동일 필드+postType; 고민 본문=content; `Concern` 인터페이스/`ConcernCreateRequest` 폐기.
- `api/concerns.ts`는 변환 어댑터 아님 = flat PostCreateRequest 조립해 createPost 호출하는 얇은 `createConcern` 래퍼.
- ConcernCard props=Post 필드 직독(`ageGroup/therapyArea/diagnoses/otherNotes/body/clamp`), 마스킹=`diagnoses===null`→"치료사 인증 후 확인 가능".
- 진단명 시드 22종 → `{name(저장값 한글), aliases(영문·이칭 검색)}` 구조, 최대 10·각 100자, 기타 200자.
- 두 문서(`docs/.../specs/2026-05-27-concern-card-design.md`, `plans/2026-05-27-concern-card.md`) 전면 재작성 완료. 계획 Task1~9=배포 무관(목 데이터 시각 확인까지), Task10=배포 후 staging E2E+마스킹 검증.
- 피드/내 글 postType 필터 탭은 백엔드 파라미터 준비됐으나 후속 백로그(범위 제외).

**2026-05-28 구현 진행 — Task 1·2·3·4·5 완료, Task 6 재개점**
- `54332f6` docs(concern): 백엔드 확정(MEL-55) 반영해 스펙·계획 flat 재작성
- `d51929b` feat(concern): 고민 카드 타입 추가 — CONCERN_CARD, flat 필드(ageGroup/diagnoses/otherNotes) — 본인 작성
- `2505927` feat(concern): 연령대 칩·라벨·진단명 시드 22종(aliases)·배열 제약 상수 추가 — 칩/라벨/제약상수/인터페이스=본인 작성, 22종 데이터=AI 작성(unlock `.claude/deadline-unlock` 사용, 스펙 §3.5 표 그대로 전사)
- `def1c54` feat(concern): 작성 헬퍼 `api/concerns.ts` 추가 — flat PostCreateRequest 조립, `createConcern(input)`이 postType `'CONCERN_CARD'` 고정 + `otherNotes` trim || undefined + `visibility` 기본 PUBLIC. AI 작성+사용자 검토(들여쓰기 2-space·필드 순서 정렬). **격리 이유**: 백엔드가 어긋날 때 호출부 안 흔들고 헬퍼 한 곳만 수정 가능.
- `4f41d89` feat(concern): ConcernCard 표시 컴포넌트 추가 — B안(헤더/메타dl/구분선/고민지점/otherNotes), 마스킹 판정 `diagnoses === null` → "치료사 인증 후 확인 가능", `otherNotes === null` → 숨김. JSX는 AI 초안 복붙(사용자 미흡수 자각) → 시각 확인으로 박음.
- `fa7deeb` feat(concern): 피드/상세에서 CONCERN_CARD를 ConcernCard로 렌더 — PostCard `clamp` ON(피드 3줄 미리보기, body=`contentPreview`)·PostDetailPage clamp OFF(풀텍스트, body=`post.content`), PostDetailPage 치료영역 해시태그는 CONCERN_CARD일 때 숨김(ConcernCard 내부 메타와 중복 방지: `therapyLabel && post.postType !== 'CONCERN_CARD'`). 본인 작성, AI는 위치 grep·검토만.
- **다음 재개점 = Task 6 `DiagnosisTagInput`** — 새 로직, **본인 작성 영역**. 계획서 Task 6 Step 1에 pseudocode 가이드, Step 2에 참조 코드(대조용으로만). 동작 요지: 입력→suggestions 필터(`SEED_DIAGNOSES` name+aliases lowercase 포함)→Enter/클릭 추가→✕ 제거. 가드: trim 후 빈값/100자 초과/중복/최대10개 시 무시 + 입력 비움. Backspace+빈입력=마지막 태그 제거.

**2026-05-28 Task 6 진행 — 추상 1 완료, 추상 2 진행 중 (4단계 해상도 학습 모드 적용)**
- 학습 방법론 합의: [[feedback_abstract_to_code_resolution_levels]] — 추상1(화면+행동) → 추상2(데이터모델+소유권) → 의사코드 → 코드. 사용자 명시 요청: "AI가 코드를 먼저 구상하면 이해 흐름이라 구조적으로 다름. 추상→해상도가 점점 올라가는 흐름으로".
- **가드 UX 결정 (추상 1 부록 — 박제)**:
  - **최대 10개 도달 시**: input `disabled` + placeholder를 "최대 10개" 안내문구로 교체(이유 명시)
  - **중복 진단명**: 에러 토스트("이미 같은 진단명이 있다")로 사용자에게 알림
  - **100자 초과**: `maxLength={100}`로 input에서 막음(토스트 아님)
  - 코드 단계에서 확인할 것: 프로젝트 토스트 시스템 grep `toast` — 없으면 placeholder 함수
- **추상 2 진행 상태**:
  - Q1 결과물 자료구조 = `string[]` (사용자 모름 → Task 1에서 본인이 박은 `PostCreateRequest.diagnoses?: string[]` 환기로 해결)
  - Q2 input 글자 = state (사용자 ref라고 잘못 답 → 화이트보드/책상서랍 비유로 잡음, [[user_react_internals_learning]] 단편규칙 7번 추가)
  - Q3 suggestions = 매 렌더 계산(파생값) (사용자 (b) 정답, [[user_react_internals_learning]] 단편규칙 8번 추가)
- **다음 세션 재개점**: Q3 "왜 매 렌더 계산이 맞나"를 본인 문장으로 정리 → 추상 2 마무리 → **부모-자식 책임 분담**(누가 무엇 소유하나) → 의사코드 → 코드. 진행 중 흐름은 학습 모드 — AI 코드 선구상 금지, 단계별 사용자 직답 우선.
- **자동완성 UX 결정**: 고스트 텍스트 폐기, 드롭다운 카드형(세로) 채택 → [[project_concern_autocomplete_dropdown_card]]. Task 6 시각만 영향(로직 동일).
- 세션 중 함정: `! touch .claude/deadline-unlock`을 `frontend/`에서 실행하면 실패 — 반드시 **repo 루트**에서. 정상 시 `.claude/deadline-unlock` 파일 생성.
- **Task 4 시각 확인 패턴 (재사용 가능)**: PostCard 본문 영역에 ConcernCard 임시 강제 렌더(더미 props) → dev 확인 → `git restore`로 원복(커밋 X). 호출부(분기 코드)가 없을 때 표시 컴포넌트 단독 시각 검증 → [[feedback_visual_check_temp_render_pattern]]

**차단 요인 (남은 1건)**
1. 백엔드 요청/응답 명세 — 스펙 3절 Q1(작성 엔드포인트 형태) · Q2(피드 `PostSummary`에 `concern` 동봉?) · Q3(진단명 배열 제약)
2. ~~PM 진단명 시드 목록~~ ✅ **2026-05-27 수령** — PM 구글시트 '기타 임상 정보' 22종(한글/영문/이칭). 스펙 2절 "PM 제공 시드 진단명 목록" 표에 박제. 재개 시 이 표로 시드 상수 파일 생성(파일은 아직 미생성, 본인 결정).

**2026-05-29 진행 — Task 6·7·8·9 코드 완료, Task 10 게이트만 남음**

- Task 6 `DiagnosisTagInput` = 학습 모드 4단계 + Cursor 출력 + 본인 IME 가드 패치(`isComposing`).
- Task 7 `ConcernForm` = Cursor 일괄 출력 → MEDIUM 3건(canSubmit·초기값 null·THERAPY_CHIPS UNSPECIFIED 필터) + LOW 2건(headerSlot→mode/onModeChange + trackEvent post_created/postType param) 사후 정정.
- Task 8 `WriteTypeToggle` 신규 + `PostWriteForm` 헤더 옵셔널 토글 슬롯(`mode`/`onModeChange`) — 기존 호출부 호환.
- Task 9 컨테이너 배선 — `PostWriteModal` + `PostCreatePage` 모드 state + 폼 스왑. PostWriteModal에 `handleClose` useCallback 래퍼 추가(모달 unmount되지 않으므로 명시적 mode 'post' 리셋).
- Speed Mode 운영 합의 → [[feedback_speed_mode_ai_first_task_split]] 신규 박제. Task 6은 학습 모드, 7·8·9는 Speed Mode로 분담.
- 인지부채 박제 → [[project_concern_card_implementation_2026_05_29]] (메커니즘 7개 + 회귀 위험 9건 + 자기점검 질문 5개).
- **Swagger staging 확인 (2026-05-29)**: PostType `CONCERN_CARD` ✓, request body 필드/제약 일치 ✓, PATCH `postType` 제외 ✓, Summary/Detail 4필드 동봉 ✓, AgeGroup enum 일치 ✓, **피드 `?postType=` query 지원**(보너스, 백로그 탭 가능), 권한 마스킹은 description 미명시(staging 실측 필요).
- 워킹트리: `DiagnosisTagInput`/`ConcernForm`/`WriteTypeToggle` 신규 + `PostWriteForm`/`PostWriteModal`/`PostCreatePage` 수정 — 모두 **미커밋**. Task별 분할 커밋 권장(계획서 각 Task Step에 메시지 박혀 있음). 별개 트랙: `posts.ts`(2줄)·스펙 md 수정은 본 세션 무관 = 따로 처리.
- 시각 확인 부분 진행 — 모달 PC 검증 중 **2건 발견·정정**:
  - 🐛 **모달 스크롤 버그**: ConcernForm 하단(진단명 input 이하) 잘림 + 스크롤 불가. 원인 = 폼 루트 높이 무제약 + 모달 `max-h-[90vh] overflow-hidden`. 정정 = 모달 variant 루트에 `flex-1 min-h-0` 추가. PostWriteForm 동일 패턴이나 콘텐츠 짧아 우연히 안 깨짐(잠재 회귀).
  - 🎨 **Backspace UX 옵션 C 채택**: 빈 input + Backspace로 마지막 태그 제거 동작 폐기. 실수 비용 > 키보드 효율(평균 1~3개). ✕ 버튼만 제거 경로. 재도입 시 옵션 B(2단) 우선, A 금지 — 박제 [[project_concern_card_implementation_2026_05_29]].
- **다음 세션 재개점 = 모바일 페이지(`/posts/create`) 검증 + 추가 시각 회귀 점검** → 분할 커밋(Task 6~9 + UI 정정 별도) → Task 10은 백엔드 staging 배포 후.

**2026-05-29 후속 — 코드리뷰 15건 정정 + 수정 기능 + 모바일 리다이렉트**

- /code-review high (7 finder × 1 sweep) → 15 finding 동기 정정(HIGH→MEDIUM→LOW+Altitude 순서). 신규: `WriteFormHeader`(헤더 공통 추출), 정정: dirty confirm·first_post_created·submit race·popover capture·flex-1 min-h-0·dropdown button·missing-field toast·aria-labelledby·mode reset useEffect·content trim·ARIA aria-pressed·required props. screen_name 'concern_write' 분기는 PM 게이트 — TODO 주석만. 상세: [[project_concern_card_implementation_2026_05_29]].
- alias 정규화 폐기(사용자 의향) — 'ASD' Enter → 'ASD' 그대로. 의미적 중복은 의도된 트레이드오프.
- **staging 백엔드 정합성 재검증** (api-staging.melonnetherapists.com/v3/api-docs 실측): CreateTherapyPostRequest/TherapyPostSummaryResponse/TherapyPostDetailResponse/UpdateTherapyPostRequest 전체 일치. postType enum·ageGroup·diagnoses items.maxLength:100·maxItems:10·visibility enum·feed `?postType=` query 모두 ✓. → QA 가능 상태.
- **모바일 작성 완료 리다이렉트**: `/posts/${id}` 상세 → `/posts` 홈 피드(PC 모달과 일관). 첨부 실패 fallback은 detail로 보존.
- **고민카드 수정 기능 (Task 11)**: `ConcernEditForm.tsx` 신규 + PostEditPage 분기. 라우트 `/posts/:postId/edit` 단일 유지. updatePost(PATCH) 재사용. mode 토글 없음(postType 불변). visibility UI 미노출(기존 값 유지). isDirty 비교로 변경 없으면 차단. 누락 필드 토스트.
- 진행 상황: Task 6~9 + 코드리뷰 정정 15건 + 수정 기능 모두 미커밋. 별개 트랙(posts.ts/스펙md)도 미커밋. Task 10 마스킹 실측만 잔여.

**2026-05-29 staging 브라우저 검증 결과 (USER 권한)**:
- 다른 사람 고민카드 GET → diagnoses=null, otherNotes=null + accessLocked 블러 처리 정상 ✓
- USER 권한 작성 시도 → 백엔드 400 반환 ✓
- 프론트 가드 추가: PostWriteForm.handleModeChange에서 `next === 'concern' && isPublicOnly` 분기 → sonner toast.error('이 기능은 치료사 인증이 필요한 기능입니다.', action: '치료사 인증하러 가기' → navigate('/therapist-verifications')). ConcernForm 가드는 미발동(USER 진입 자체 불가)이라 추가 안 함.

**2026-05-29 develop 푸시 완료 — 4 commit**:
- `08701a7` chore: .gitignore에 .superpowers/ 추가
- `5470a1b` fix(image-attach): 재시도 catch 블록 err 타입캐스트 위치 이동 (별개 트랙)
- `682eb67` docs(concern): 스펙 md를 flat 피벗으로 재작성 (별개 트랙, 이전 세션 작업)
- `4c3db6b` feat(concern): 고민카드 작성/수정 + 공개범위 UI + USER 가드 토스트 (메인)
- Vercel 자동 배포 → develop 환경에서 다른 직군 QA 의뢰 가능 상태.
- **워킹트리 보류**: PostWriteForm 모바일 인라인 툴바(첨부/공개범위를 프로필↔치료영역 사이로 이동 + border-y + 24px) 변경분은 검토 보류로 워킹트리에서 revert. 재현 정보는 [[project_concern_card_implementation_2026_05_29]] "🔄 검토 보류" 섹션에 박힘.
- **잔여 검증**: GA4 `post_created { postType: 'CONCERN_CARD' }` / `first_post_created` 이벤트 실제 발사 확인은 PM 영역(미진행).
- **백엔드 정합성 재검증**: staging Swagger schema 명명은 FE와 다름(`Therapy` prefix). 매핑 → [[reference_backend_openapi_schema_naming]].
- 재개 트리거 「고민 카드 이어가자」는 더 이상 적용 안 됨 — 기능 완료, QA 피드백 받으면 후속 정정 진행.

**2026-05-29 저녁 — develop→main 머지/push + GA4 prod 발사 확인 완료**

- 머지 커밋 `b1e944d Merge remote-tracking branch 'origin/develop'`. 충돌 3건(`posts.ts`, `PostWriteForm.tsx`, `PostEditPage.tsx`) 전부 **develop본 채택** 정책 적용([[project_cherry_pick_retry_logging_to_main_2026_05_28]]).
- main push 완료(`412a25c..b1e944d`), Vercel prod 자동 배포.
- **GA4 prod 실측 ✓**: `post_created { postType: 'CONCERN_CARD' }` 실시간 보고서 매개변수 카드에서 확인. `index.html:26` `location.hostname === 'www.melonnetherapists.com'` 가드 통과 + analytics.ts 발사.
- 백업 브랜치 `main-backup-before-merge-2026-05-29`는 **로컬에만** 존재(origin push 미진행, 회귀 시 옵션).
- 잔여 후속 → [[project_concern_card_prod_followup_2026_05_30]]에 트리거별 절차 박제: ① 롤백 ② PM Custom Dimension 핸드오프 ③ QA 피드백.
- 메모리·MEMORY.md 인덱스 갱신 완료.

**재개 트리거**: 「고민 카드 이어가자」 또는 위 차단 요인 해소 시.

**문서 (결정 본문은 여기, 메모리는 포인터만)**
- 스펙: `docs/superpowers/specs/2026-05-27-concern-card-design.md` (`8a7ac07`)
- 계획: `docs/superpowers/plans/2026-05-27-concern-card.md` (10태스크, `170d719`)
- 브레인스토밍 목업: `.superpowers/brainstorm/*/content/` (write-modal-v2, feed-detail-order)

**핵심 결정 (코드/스펙 미기재 비자명 부분만)**
- 아키텍처: `postType: 'CONCERN'` + 구조화 `concern{worry, ageGroup, therapyArea, diagnoses[], note?}`. 읽기는 Post 형태로 응답받아 기존 피드/상세/댓글/리액션 재사용.
- **연령대는 기존 `types/post.ts`의 휴면 `AgeGroup` enum(AGE_0_2~AGE_65_PLUS) 재사용** — 사용자 6단계(영아기~노령기)와 1:1. 새 enum 안 만듦.
- 치료영역 단일 선택(본인 치료영역, PM 합의) / 진단명 복수 자유문자열 + 프론트 자동완성(시드), 백엔드 enum 검증 X(추후 빈도 분석 후 enum 검토).
- 표시 = B안(메타 → 구분선 → 고민지점), 피드/상세 완전 통일(clamp만 차이). 칩 무채색(FilterChips 컨벤션).
- API 매핑은 `api/concerns.ts` 어댑터 한 곳에 격리 → 백엔드 확정 시 어댑터만 수정.

**구현 방식 (사용자 합의)**: 커서 IDE에 평문 단위 지시 → diff 확인·이해 후 다음 단위. 새 로직(ConcernForm, DiagnosisTagInput)은 본인 작성, 기계적(타입/상수/표시/배선)은 AI 작성+리뷰. 계획은 페이즈 A(백엔드 무관 UI)/B(명세 후 와이어) 분리 제안까지 논의됨.

**2026-05-27 보류 결정**: MSW+추측계약으로 dev E2E를 만드는 안을 검토했으나, ① MSW 핸들러를 막 제거함(staging 기반) ② 추측 계약이 와이어타입+핸들러+읽기분기 3곳에 박혀 "통신만 수정"이 아님 → 명세 확정 전 추측 구현 회피하고 대기 선택. 관련 [[project_messaging_feature]]와 동일한 백엔드 대기 패턴.
