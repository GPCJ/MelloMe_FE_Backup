---
name: ai-2026-06-20
description: "AI작성+셀프QA 머지 4기능(팔로우/팔로우탭/라이트박스/고민카드) 다중에이전트 버그리뷰 확정 14건. 미열람 보관, 트리거「심층 리뷰 결과 확인」"
metadata: 
  node_type: memory
  type: project
  updated: 2026-06-20
  originSessionId: f48a31e5-ac3f-4342-9960-fad2736be293
---

# AI 코드 심층 버그 리뷰 결과 (2026-06-20)

> **상태: 사용자 미열람 보관.** 본인이 나중에 직접 읽고 착수하기로 함. 트리거「심층 리뷰 결과 확인」.
> 방식: Workflow 다중에이전트(38 서브에이전트, ~177만 토큰). 기능 클러스터별 finder → 후보별 2렌즈(correctness/reproducibility) 적대적 검증. 후보 17 → **확정 14**(MEDIUM 7 / LOW 7, 확정 HIGH 0) + **반증 3**.
> 대상 = AI작성+셀프QA만으로 머지된 4기능. 인지부채 박제와 연결: [[project_follow_implementation_2026_06_09]] [[project_follow_feed_tab_implementation_2026_06_09]] [[project_image_lightbox_implementation_2026_06_09]] [[project_concern_card_implementation_2026_05_29]]
> 모든 finalSeverity는 검증자 정정 반영값.

## 🟠 MEDIUM (7) — 실제 동작 결함

1. **[팔로우 탭] 팔로우/언팔 후 팔로우 탭 미갱신** — `hooks/useInfiniteFeed.ts:98-106`
   - `staleTime:Infinity` + `refetchOnWindowFocus:false`라 명시적 refetch/invalidate 없으면 옛 캐시 영구 표시. 팔로우 mutation(`useFollowToggle.ts:41`/`useFollowUser.ts:33`)은 `['follow-counts']`만 무효화하고 `['feed-following']`은 안 건드림. /follow에서 새 치료사 팔로우/언팔 후 팔로우 탭 복귀해도 새로고침 전까지 반영 안 됨.
   - 수정: 팔로우/언팔 onSuccess에 `qc.invalidateQueries({queryKey:['feed-following']})` 추가, 또는 팔로우 피드만 staleTime 낮춤(전체피드 스냅샷 복원과 분리). **가장 고칠 가치 높음(추천 1순위)**.

2. **[팔로우] NEW_FOLLOW SSE가 팔로워 목록 캐시 미무효화** — `hooks/useNotificationSSE.ts:120-122`
   - `['follow-counts']`만 invalidate. 팔로워 목록은 `['follow',tab]`(`FollowListPage.tsx:27`, staleTime 30s)라 prefix 불일치로 안 건드림. 팔로워 탭 열어둔 채 피팔로우 → 카운트는 +1인데 목록엔 신규 팔로워 미표시.
   - 수정: 핸들러에 `invalidateQueries({queryKey:['follow']})` 추가. **#1과 묶어 처리 가능(같은 결의 캐시 누락)**.

3. **[팔로우] 토글 전체 잠금 — 다른 행 클릭 무반응** — `hooks/useFollowToggle.ts:27`
   - `if (pendingId !== null) return`이 어느 행이든 in-flight면 모든 행 차단. 그러나 `FollowListPage.tsx:106` disabled는 `pendingId===u.userId`(자기 행만). 다른 행 버튼은 활성으로 보이는데 클릭이 토스트/피드백 없이 삼켜짐. 느린 네트워크에서 체감.
   - 수정: 행별 in-flight Set으로 동시 허용, 또는 진행 중 다른 행도 disabled로 시각/동작 일치.

4. **[팔로우 탭] 전체 피드 카드 backTo 미전달 → 필터/페이지 소실** — `pages/post/PostListPage.tsx:432-434`(페이지네이션 분기), `:372-376`(무한 분기)
   - 팔로우 탭 카드는 `backTo="/posts?tab=following"` 명시(`:468`)인데 전체 피드 카드엔 backTo 없음. `PostDetailPage.tsx:87` `backTo = location.state?.from ?? '/posts'` 폴백. **실제 소실은 필터 켜진 페이지네이션 경로 한정**(무한 분기는 snapshot 복원으로 무해, sort만 잠재). `/posts?therapyArea=SPEECH&page=3`에서 글 열고 헤더 뒤로가기 → 필터/페이지 초기화된 /posts로 떨어짐.
   - 수정: 페이지네이션 카드에 `backTo={`/posts${location.search}`}` 전달.

5. **[라이트박스] 모바일 캐러셀 터치 드래그 후 라이트박스 오작동 오픈** — `pages/post/PostDetailPage.tsx:434-436`
   - onClick의 `moved<=5` 드래그/클릭 구분이 `useDragScroll`의 마우스 전용 핸들러(onMouse*)에 의존. 터치 스크롤은 네이티브 overflow-x-auto 위임이라 `moved`가 0에 머묾 → 터치 스와이프 후 손 떼면 라이트박스 열림. **단 모던 브라우저의 스크롤 시 합성 click 억제로 발현 완화**(검증자 1명 LOW로 봄, 짧은 드래그/엣지케이스 한정).
   - 수정: useDragScroll에 onPointerDown/Move 추가해 터치도 moved 추적, 또는 클릭 판정 pointer 기반화.

6. **[라이트박스] 핀치 확대 후 한 손가락 팬 불가** — `components/common/ImageLightbox.tsx:97-112, 134-141`
   - 핀치 시작 시 `pan.active=false`(:101) 강제. 한 손가락 떼면(:138) pinch만 끄고 남은 1포인터로 pan 재활성 로직 없음 → `pan.active && size===1`(:126) 거짓이라 팬 분기 미진입. pan.active=true 유일 지점은 새 pointerdown(:104). 손 완전히 뗐다 다시 눌러야 팬됨.
   - 수정: onPointerUp에서 size 2→1 전환 시 남은 포인터로 pan 재초기화(startX/Y·startOx/Oy 세팅, scale>1이면 active=true).

7. **[팔로우 탭] 렌더 중 consume() store mutation + StrictMode** — `pages/post/PostListPage.tsx:71-81`
   - `useRef(pickInitialSnapshot())` 인자가 매 렌더 평가되는데 `pickInitialSnapshot`이 `consumeSnapshot()`(store를 `set({snapshot:null})`로 비우는 write) 호출 → 렌더 중 부수효과. **⚠️ 검증 갈림**: 검증자 A는 "useRef는 첫 값만 보관, hook 슬롯 안정이라 2차 패스 null 무시 → 동작 정상, LOW 코드스멜"로 **반증**. 검증자 B는 "dev StrictMode 더블인보크에서 깨질 수 있음, MEDIUM"으로 인정. **프로덕션 빌드(1회 렌더)에선 무해, dev 한정 잠재**.
   - **이미 추적 중**: [[project_postlistpage_ref_render_issue.md]]. 리뷰가 독립 재발견. 정식 수정 = consume을 렌더 밖(useEffect/lazy)으로 이동 + 비파괴 read/clear 분리.

## 🟡 LOW (7) — 잠재결함 / 위생

8. **[팔로우] 드롭다운 팔로우↔목록 캐시 desync** — `hooks/useFollowUser.ts:29-34`. 정책A로 `['follow']` 목록 미무효화 의도적이나, 사전 방문해 캐시 fresh(30s)면 드롭다운 팔로우 직후 팔로잉 목록 진입 시 카운트 +1인데 목록엔 미표시. (콜드 진입은 정상 fetch라 무해)
9. **[팔로우] stale `following`으로 잘못된 토글 방향** — `hooks/useFollowUser.ts:19-28`. `wasFollowing`이 `['follow-status']` 캐시값 의존. 목록 언팔(`useFollowToggle`)은 이 캐시 미동기화 → 30s 내 드롭다운 재오픈 시 stale로 이미 언팔된 대상에 unfollow 발사. BE 멱등 아니면 409.
10. **[팔로우] 언마운트 후 setState** — `hooks/useFollowUser.ts:21-40`, `useFollowToggle.ts:47-49`. isMounted/AbortController 가드 없음. **React 19라 no-op·무경고, 사실상 무해**(category memory-leak 표기는 부정확).
11. **[라이트박스] clamp가 변경 전 scale의 rect 읽음** — `ImageLightbox.tsx:118-124, 82-92`. `setScale(next)` 직후 clamp가 아직 미커밋된 이전 scale의 getBoundingClientRect 사용 → 빠른 줌 시 한 프레임 늦게 경계, 일시 과도 팬 후 자가보정. 미세·미관상.
12. **[고민카드] diagnoses undefined 시 빈 진단명 행** — `ConcernCard.tsx:22, 48-64`. `masked = diagnoses === null`이 undefined 미포함. 타입은 `string[]|null|undefined`. 진단명 행만 무조건 렌더(ageGroup/therapyArea는 조건부). undefined 도달 시 레이블만 빈 행 + 마스킹 안내 소실. **BE가 필드 생략(undefined)해야 발현 — 가설적**. 수정: `masked = diagnoses == null`.
13. **[고민카드] DiagnosisTagInput 길이검증 데드코드** — `DiagnosisTagInput.tsx:46-50, 105`. input `maxLength=100`이 하드캡이라 addTag의 `>100` 토스트 분기 영원히 미발화. 붙여넣기도 무음 절단(피드백 없음). 수정: maxLength 제거하고 addTag에서만 검증, 또는 데드분기 제거.
14. **[고민카드] 수정폼 dirty trim 비대칭** — `ConcernEditForm.tsx:70, 96`. `isDirty = content !== initial.content`(trim 없음)인데 제출은 `content.trim()`. 본문 앞뒤 공백만 추가해도 canSubmit 활성 → 트림 후 동일 본문 불필요 PATCH(updatedAt bump). 수정: `content.trim() !== initial.content.trim()`.

## ✅ 반증 3건 (적대적 검증이 거른 거짓양성 — 참고)

- **sentinel observer 재교차 중복 fetch** (`PostListPage.tsx:170-201`) — RQ in-flight promise 재사용(`cancelRefetch:false`) + 커서 단조전진(getNextPageParam이 마지막 페이지서 파생)이 막음. 최악도 정상 연속 로드.
- **모바일 더블탭 줌 상쇄** (`ImageLightbox.tsx:146-155, 227-232`) — img `touchAction:'none'`이 합성 dblclick 차단(의도 설계). 터치는 onPointerUp 커스텀 경로만, PC는 onDoubleClick만 담당.
- **ConcernForm 언마운트 setState** (`ConcernForm.tsx:107-113`) — `navigate`는 동기 언마운트 아님. finally setSubmitting은 같은 동기 스택서 실행(아직 마운트). 두 setState 한 커밋 배치. 누수 매개체 없음.

## 다음 행동 후보 (착수 시 결정)
- **추천: #1·#2 캐시 결함 묶어 수정**(작고 명확, 팔로우 핵심기능 정합). 손코딩 vs AI 분담 정하기.
- #5·#6 모바일 라이트박스 제스처(실기기 QA 동반 필요).
- #7은 [[project_postlistpage_ref_render_issue.md]]와 통합 — 정식 수정 시 같이.
- 전체 원본 결과(검증자 reasoning 포함): 세션 task 출력 `w34cm05sd` (`/tmp/.../tasks/w34cm05sd.output`, 휘발성 — 영속 필요 시 본 파일이 요약본).
