---
name: project_concern_card_implementation_2026_05_29
description: "고민 카드 Task 6~9 구현 박제 (인지부채 HIGH) — Task 6은 학습 모드 진행, Task 7·8·9는 Speed Mode로 Cursor 일괄 위임. 다음에 만지기 전 본 문서로 멘탈 모델 복원."
metadata: 
  node_type: memory
  type: project
  cognitive_debt: HIGH
  status: "implemented (Task 10 = staging 검증 대기, 백엔드 미배포)"
  originSessionId: e6719f80-10c5-489c-afe5-fb6b595f6c5d
---

# ⚠️ 인지부채 태그 — 읽기 전 주의

본 세션(2026-05-29) Task 6~9 구현의 **상당 부분이 Cursor IDE 코드 생성** 결과입니다. [[user_self_coding_goal]] 정책과 [[feedback_direct_coding_default]] "새 로직=본인 작성" 룰의 예외 적용 — [[feedback_speed_mode_ai_first_task_split]] 합의에 따른 운영 모드. 다음에 이 코드를 만지기 전 본 메모리로 메커니즘을 복원하세요. 깊이 이해 안 된 줄을 그대로 두지 말 것.

# 작성 분담 요약

| Task | 파일 | 작성 주체 | 비고 |
|---|---|---|---|
| 6 | `frontend/src/components/post/DiagnosisTagInput.tsx` | Cursor 출력 + 본인 IME 가드 패치 | 학습 모드 4단계 진행(추상1·2 완료), JSX 본문 흡수도 中 |
| 7 | `frontend/src/components/post/ConcernForm.tsx` | Cursor 일괄 출력 → AI(Claude) MEDIUM/LOW 정정 | Speed Mode, 인지부채 高 |
| 8 | `frontend/src/components/post/WriteTypeToggle.tsx` (신규) + `PostWriteForm.tsx` 패치 3곳 | AI(Claude) 전량 | 기계적, 인지부채 中 |
| 9 | `PostWriteModal.tsx` + `pages/post/PostCreatePage.tsx` | Cursor 일괄 출력 → AI MEDIUM 정정 | Speed Mode, 인지부채 中 |

본인 작성 영역(낮은 인지부채): Task 1·2·5 본문 + DiagnosisTagInput IME 가드 + Task 7/9 정정 승인 + 본 세션 디자인 결정.

---

# 핵심 메커니즘 7개

## 1. 컨트롤드 컴포넌트 + 콜백 prop (DiagnosisTagInput)

자식이 부모 state(`diagnoses: string[]`)를 직접 못 만지므로:
- 부모 → 자식: `value: string[]`을 props로 전달
- 자식 → 부모: `onChange: (next: string[]) => void` 콜백으로 전체 새 배열을 통째로 전달(부분 변경 X)

자식 내부에서 가드(중복/최대10·100자) 통과 후 `onChange([...value, tag])` 또는 `onChange(value.filter(...))`. **자식은 부모가 가진 현재 배열을 props로 받아 가드 판정에 사용**. 이게 핵심 — 자식만 보면 가드 못 함.

대안 비교: `onAdd`/`onRemove` 두 콜백으로 쪼개는 패턴도 있으나, 단일 `onChange(next)`가 React 컨트롤드 컴포넌트 컨벤션에 더 충실 + 부모 reducer 패턴과 잘 어울림. 본 구현은 후자.

## 2. suggestions = 매 렌더 파생값 (useEffect 사용 X)

자식 함수 본문에서 `const q = input.trim().toLowerCase()` → `const suggestions = SEED_DIAGNOSES.filter(...).slice(0, 8)`.

useEffect+setState로 했다면: input 변경 → 렌더1 → effect → setSuggestions → 렌더2 (한 박자 늦음 + 렌더 2번). 파생값은 함수 본문 변수로 충분. React 컴포넌트 함수가 매 렌더 다시 실행된다는 사실에 기반.

다음에 비슷한 "입력 → 필터 결과" 패턴 만나면 같은 판단. [[user_react_internals_learning]] 단편규칙 8번에 박혀 있음.

## 3. IME `isComposing` 가드 (Enter 이중 발화 방어)

`DiagnosisTagInput.tsx:58` `if (e.key === 'Enter' && !e.nativeEvent.isComposing)`.

한글 입력 중 Enter는 ① IME 조합 확정 Enter + ② 사용자 의도 Enter 두 번 발생할 수 있음. `isComposing` 가드 없으면 미완성 글자가 태그로 들어감. [[project_comment_duplicate_post_fix_2026_05_11]]과 같은 함정 패턴.

Backspace 분기는 IME 조합 중 발동하지 않으므로 가드 불요.

## 4. 헤더 토글 슬롯 패턴 (PostWriteForm + ConcernForm 대칭)

두 폼 모두 props에 `mode?: 'post' | 'concern'`, `onModeChange?: (m) => void`를 받음.

내부 헤더에서:
```
{onModeChange ? (
  <WriteTypeToggle mode={mode ?? '기본'} onChange={onModeChange} />
) : (
  <h1>제목 폴백</h1>
)}
```

**`onModeChange` 미제공 = 기존 호출부와 호환** (기존 PostWriteForm 호출부가 mode/onModeChange 없이 변형 없이 동작). 회귀 위험 X. 컨테이너만 토글 슬롯을 활성화.

두 폼이 같은 API → 컨테이너에서 같은 props로 스왑 가능 (메커니즘 6).

## 5. WriteTypeToggle (회색 알약 토글)

`bg-gray-100 + rounded-lg + p-0.5` 컨테이너 안에 두 버튼. 활성 = `bg-white shadow-sm font-semibold text-gray-900`, 비활성 = `text-gray-500`. type="button" 일관(form submit 방지). 동작은 단순한 컨트롤드 — `mode`/`onChange` 두 props만 받음.

## 6. 컨테이너 폼 스왑 (PostWriteModal + PostCreatePage)

컨테이너가 `useState<'post' | 'concern'>('post')` 모드를 소유하고, **자식 폼 컴포넌트 자체를 분기로 교체**:

```
{mode === 'post' ? <PostWriteForm {...} /> : <ConcernForm {...} />}
```

PostCreatePage는 두 폼이 공유할 props를 `common` 객체 + `as const`로 묶어 중복 줄임. URL 라우팅은 그대로(`/posts/create`), 폼만 통째로 교체. 라우트 분기 X.

## 7. handleClose 래퍼 — 모달 재오픈 모드 리셋

`PostWriteModal`은 `open === false`일 때 `null` 리턴만 할 뿐 컴포넌트 자체는 unmount되지 않음(전역 모달). 따라서 `useState mode`는 모달 닫혀도 마지막 값 유지. 명시적 리셋 없이는 사용자가 고민 카드 모드로 닫고 다시 열면 그 상태 그대로 부활 — UX 예측 불가.

해결: `handleClose = useCallback(() => { setMode('post'); closeModal(); }, [closeModal])` 만들어 모든 닫기 경로(배경 mousedown, ESC effect, 폼 onClose prop, handleSuccess)에서 일관 호출.

useCallback이 필요한 이유: ESC effect의 dep 배열에 `handleClose` 들어가는데, 매 렌더 새 함수면 effect가 리바인드 반복 → 비효율 + 깜빡임 우려. 메모화로 안정화.

---

# 회귀 위험 체크리스트

다음을 만질 때 깨지지 말아야 할 invariant:

1. **`onModeChange` 호환성**: PostWriteForm/ConcernForm props에서 `mode?: ... onModeChange?: ...`를 옵셔널로 유지. 다른 호출부(미래)가 안 넘기면 폴백 제목 표시되어야 함.
2. **DiagnosisTagInput `value` 단일 소스**: 자식이 자체적으로 value를 복사 보관하면 부모-자식 sync 깨짐. 항상 props만 읽기.
3. **suggestions filter 순서**: `q` 매칭 → `!value.includes(d.name)` 제외 → `.slice(0, 8)`. 순서 바뀌면 already-added 항목이 후보에 보일 수 있음.
4. **Backspace 분기 자체 제거됨 (2026-05-29 옵션 C 결정)**: 빈 input + Backspace = 마지막 태그 제거 동작은 실수 비용이 크다는 UX 판단으로 제거. ✕ 버튼만 제거 경로. 재도입 검토 시 옵션 B(2단 선택→제거) 우선 — A(즉시) 금지. IME 가드는 Enter 분기에만 둠.
5. **모달 닫기 경로 일관성**: 새 닫기 경로 추가 시(예: 우상단 X 버튼) `handleClose` 호출. `closeModal` 직접 호출하면 모드 리셋 누락.
6. **handleClose useCallback dep**: `closeModal` 외 다른 의존이 생기면 dep 배열 갱신 필요. 함수 본문이 다른 state 읽기 시작하면 stale closure 함정.
7. **ConcernCard 분기 위치**: `accessLocked`(비공개 차단) 분기 **이후**, 일반 본문 분기 **앞**. 순서 바뀌면 차단 게시글이 ConcernCard로 잘못 렌더될 수 있음.
8. **trackEvent payload 키**: `'post_created'` 이벤트명은 PM 정식 24종 안에 있음, `postType` param은 신규 — PM 스펙 24종에 등록되어 있는지 검증 필요. 없으면 PM 합의 전까지 param 제거 검토.
9. **PostCreatePage `useScreenExit('post_write')`**: 고민 카드 모드일 때도 동일 screen name 발사 — 분석에서 두 모드 미분리. PM 신규 screen name 합의 시 분기 도입.

---

# 트레이드오프 / 보류

## 보류 (의도된)

- **권한 마스킹 동작 검증** — Swagger description엔 미명시. 백엔드 MEL-55 구현됐다고 메모리 박혀 있지만 staging 실측 전까지 100% 확정 아님. Task 10 게이트(백엔드 staging 배포 후 USER 토큰으로 호출해 `diagnoses === null` 확인).
- **피드 `?postType=` 필터 탭** — Swagger에서 query param 지원 확인. 현재는 UI 탭 미구현 = 후속 백로그. 도입 시 PostCard·feed 라우팅·Zustand store 영향.
- **모달 닫힘 시 폼 입력 내용 휘발** — 컴포넌트 unmount = 입력 잃음. 현재 의도 (프로토타입). 향후 draft 저장 도입 시 ConcernForm·PostWriteForm 양쪽에 동일 처리.
- **분석 이벤트 신규 추가 보류** — `concern_created` / `concern_write` screen name 모두 PM 합의 전 추가 금지([[project_analytics_event_ownership]]).

## 트레이드오프

- **Cursor 일괄 위임**: Task 7 ConcernForm 전체 ~200줄을 Cursor 한 번에 만듦. 학습 모드 비교 시 시간 약 1/5. 대가 = 본인 흡수도 낮음. Speed Mode 합의에 따라 본 메모리로 보완.
- **컨테이너 useState vs Zustand store**: 모드 상태를 컨테이너 로컬 state로 둠(전역 X). 장점=단순, 단점=PostWriteModal 외부에서 모드 직접 트리거 불가. 향후 "글쓰기 버튼이 고민 카드 모드로 바로 열기" 요구사항이 생기면 store 이관 검토.
- **두 폼 자체 헤더 보유 vs 컨테이너 공통 헤더**: 현재는 폼이 헤더를 가짐(스펙 §4 + PostWriteForm 기존 패턴 유지). 컨테이너 공통 헤더 패턴이면 토글 위치 일관성↑이지만 큰 리팩토링. 현 상태 유지.

---

# 검증 미완 (Task 10 게이트)

- staging E2E 체크리스트: 고민 카드 작성 → 응답 형태 일치 → 피드 노출 → 상세 진입 → THERAPIST/USER 마스킹 → 댓글·리액션·스크랩 회귀 없음 → 자동완성 시드 매칭(name + aliases) → 자유 입력 저장. 백엔드 MEL-54 main 머지 후 진행.

---

# 관련 메모리

- [[project_concern_card_feature]] — 전체 기능 컨텍스트 + 결정 이력
- [[project_concern_autocomplete_dropdown_card]] — 자동완성 UX 결정 (드롭다운 카드형)
- [[feedback_speed_mode_ai_first_task_split]] — Speed Mode 운영 정의 (본 세션에서 합의)
- [[feedback_ai_written_code_cognitive_debt]] — 본 메모리 작성 규칙
- [[feedback_direct_coding_default]] — 하이브리드 작성 정책 (Speed Mode 기본)
- [[feedback_abstract_to_code_resolution_levels]] — 학습 모드 4단계 (Task 6에 적용)
- [[user_react_internals_learning]] — React 단편 규칙 누적 (Task 6에서 7·8번 추가)
- [[project_comment_duplicate_post_fix_2026_05_11]] — IME isComposing 가드 선례
- [[project_analytics_event_ownership]] — 신규 이벤트/screen name PM 게이트
- [[feedback_review_triage_workflow]] — HIGH/MEDIUM/LOW severity 정정 흐름

---

# 다음 만지기 전 자기점검 질문 7개

1. "왜 suggestions는 useState 안 쓰고 매 렌더 계산하나?"
2. "DiagnosisTagInput에서 가드(중복·최대10)를 자식이 하려면 무엇이 필요한가?"
3. "PostWriteForm 헤더 토글이 노출되는 조건은? 노출 안 됐을 때 무엇이 보이나?"
4. "PostWriteModal에서 mode를 'post'로 리셋하는 시점은? 왜 컴포넌트 unmount만으로는 부족한가?"
5. "handleClose에 useCallback을 쓴 이유는?"
6. "ConcernForm 모달 variant 루트에 왜 `flex-1 min-h-0`이 필요한가? 모달 부모는 어떤 height 설정을 가지나? 이게 빠지면 어떤 버그가 나나?"
7. "Backspace 빈 input에서 마지막 태그 제거 동작을 왜 제거했나? 재도입한다면 어떤 패턴을 선택해야 하나?"

각 질문에 본인 문장으로 한 줄씩 답할 수 있어야 합니다. 막히면 위 핵심 메커니즘 섹션을 다시 읽기.

---

# 세션 중 발견·정정 이력 (2026-05-29)

- **UI 버그 발견 (브라우저 검증 중)**: 모달에서 ConcernForm 하단(진단명 input 아래)이 잘리고 스크롤 불가. 원인 = 폼 루트 높이 무제약 + 모달 `max-h-[90vh] overflow-hidden`. 정정 = 모달 variant 루트에 `flex-1 min-h-0` 추가(`ConcernForm.tsx:69`). PostWriteForm은 콘텐츠가 짧아 우연히 안 깨졌음(잠재 함정 — 미래 회귀 대비).
- **UX 결정 — Backspace 분기 제거 (옵션 C)**: 사용자 지적 "이거 UX별로다". 트레이드오프 표(A/B/C) 제시 후 C 채택. 실수 비용 > 키보드 효율(평균 진단명 1~3개라 ✕ 버튼만으로 충분).

---

# 코드 리뷰 라운드 (2026-05-29 후속, /code-review high → 15 finding 동기 정정)

extra-high 다각도 리뷰(7 finder × 1 sweep)로 15 finding 발생, HIGH→MEDIUM→LOW+Altitude 순서로 동기 수정. tsc 통과. 인지부채 추가됨 — AI(Claude) 일괄 작성, 본인 미흡수 영역 多.

## 신규 파일

- `frontend/src/components/post/WriteFormHeader.tsx` — `← 토글 ✏️` 헤더 공통 컴포넌트. PostWriteForm/ConcernForm가 자체 헤더 마크업을 갖던 중복을 제거. submit 버튼은 `aria-disabled` 채택(disabled 미사용) → 폼이 클릭을 받아 누락 필드 토스트 안내 가능.

## 메커니즘 추가 (앞 섹션 7개에 이어)

### 8. dirty 가드 + mode 전환 confirm

mode 토글이 폼 컴포넌트를 통째 unmount → state 소실 문제. 양 폼이 자체 dirty 계산 + window.confirm으로 가드. `handleModeChange = (next) => { if (next === mode) return; if (dirty && !confirm(...)) return; onModeChange(next); }` → WriteTypeToggle에 전달.

- ConcernForm dirty: `content||ageGroup||therapyArea||diagnoses.length||otherNotes`
- PostWriteForm dirty: `content||pendingFiles||therapyArea !== 'UNSPECIFIED'||visibility !== 'PUBLIC'`

native confirm 선택 이유: MVP 가벼움. sonner toast.confirm 부재. 향후 커스텀 다이얼로그 도입 시 후속 변경.

### 9. submit race guard 명시화

`disabled={!canSubmit}`만으로는 React batch 안 두 번째 클릭이 stale canSubmit=true로 통과 가능. handleSubmit 첫 줄 `if (submitting) return` 가드. ConcernForm/PostWriteForm 동일 적용. canSubmit과 별개로 작동.

### 10. ~~alias 정규화~~ — 폐기 (2026-05-29 UX 결정)

코드 리뷰 #3에서 의미적 중복(`'ASD'` vs `'자폐스펙트럼장애'`) 방지 목적으로 normalizeDiagnosis 도입. 그러나 사용자 지적: **임상가 진단명 표기 자유 침해**(한글 강제). 정규화 폐기, raw 입력 그대로 박음.

- Enter → 입력값 trim 후 그대로 태그(`'ASD'` 입력 → `'ASD'` 태그)
- 드롭다운 항목 클릭 → seed name(한글) 박힘 — 사용자 명시적 선택
- 의미적 중복(`'ASD'` + `'자폐스펙트럼장애'` 공존)은 의도된 사용자 책임 영역. 백엔드 통계/검색 영향은 PM/백엔드 협의.

트레이드오프 [[feedback_ui_designer_confirm]] 「사용자 자유 > 일관 데이터」 — UX 우선.

### 11. popover capture phase + stopPropagation

PostWriteForm 공개범위 popover 외부 클릭 + PostWriteModal backdrop mousedown 충돌 → 같은 이벤트로 popover와 모달이 함께 닫혀 draft 손실. `document.addEventListener('mousedown', onDocClick, true)` capture 단계 등록 + 외부 클릭일 때 `e.stopPropagation()` 호출 → 모달 backdrop의 React 합성 onMouseDown까지 도달하지 않음.

순서 이해: capture는 document→target 방향. stopPropagation은 이후 phase(target/bubble) 모두 차단. React 17+ 합성 onMouseDown은 root listener bubble이므로 차단됨.

### 12. aria-disabled submit + 누락 필드 토스트

WriteFormHeader 가 `disabled` 대신 `aria-disabled` 채택. ConcernForm.handleSubmit이 click을 받아 누락 필드 목록을 sonner toast로 안내. PostWriteForm은 본문 단일 필수라 기존 침묵 유지(같은 가드 후 return).

### 13. modal close 일관 reset (외부 호출 커버)

기존 handleClose useCallback 패턴 폐기 → PostWriteModal에 `useEffect(() => { if (!open) setMode('post') }, [open])`. SideNav/auth logout 등 미래 외부 closeModal() 직접 호출도 일관 커버. open 상태가 단일 truth.

### 14. sr-only dialog title anchor

PostWriteModal `aria-labelledby="post-write-modal-title"`의 id anchor가 없던 문제. 모달 내부에 `<h2 id="..." className="sr-only">{mode === 'post' ? '새 시그널 작성' : '고민 카드 작성'}</h2>` 추가. 시각 영향 X, 스크린리더 dialog 이름 announce 가능.

## 회귀 위험 체크리스트 (앞 9건에 추가)

10. **WriteFormHeader 시그니처**: `mode`/`onModeChange`가 required. ConcernForm·PostWriteForm 두 폼만 호출자(현재). 다른 호출자 추가 시 둘 다 전달 필수.
11. **handleModeChange 우회 금지**: WriteTypeToggle에 raw `onModeChange`를 직접 넘기면 confirm 가드 우회. 항상 폼이 wrap한 `handleModeChange`를 전달.
12. **popover capture listener cleanup**: useEffect cleanup에서 동일 `{ capture: true }` 옵션 전달 필수. 옵션 불일치 시 removeEventListener가 작동 안 함(전형적 함정).
13. **PostWriteForm dirty 비교 기준**: `therapyArea !== 'UNSPECIFIED'`/`visibility !== 'PUBLIC'`을 기본값으로 채택. 기본값 상수 바뀌면 dirty 판정도 함께 갱신해야 함.
14. **정규화 비도입(폐기) 유지**: 향후 의미적 중복 이슈 재제기 시 정규화 재도입 금지 — UX 자유 우선(2026-05-29 결정). 대안 검토 시 옵션 부드러운 힌트(드롭다운 표시 보강 등) 우선, 자동 변환 X.
15. **mode reset useEffect 의존성**: `[open]`만 의존. 외부에서 mode를 외부 store로 이관하면 의존성 갱신 필요.

## 자기점검 질문 추가 (앞 7개에 이어)

8. "dirty 가드를 컨테이너가 아니라 폼이 들고 있는 이유는? 컨테이너에 dirty 알리는 방법은?"
9. "submit race가 `disabled` 만으로 막히지 않는 이유 — React state 업데이트 타이밍을 설명해보라."
10. "진단명 alias 자동 정규화를 폐기한 이유는? 의미적 중복(같은 진단의 다른 표기) 발생 시 어떻게 처리하나?"
11. "capture phase + stopPropagation이 React onMouseDown을 차단하는 메커니즘은? React 17+ 합성 이벤트 root listener 위치는?"
12. "PostWriteModal에서 handleClose useCallback을 제거하고 useEffect로 바꾼 이유는? 어떤 케이스가 새로 커버되나?"

## 트레이드오프 추가

- **native window.confirm**: MVP 가벼움 vs UX 정제도 낮음. 사용자가 의식 못하고 OK 누르면 손실은 여전. 향후 커스텀 다이얼로그 도입 시 두 폼 동시 갱신.
- **screen_name 'concern_write' 미분기 (#10)**: PM 게이트로 보류. TODO 코멘트만 코드에 남김. PM 합의 후 useScreenExit mode 분기 + analytics 스펙 24종에 등록.
- **PostWriteForm submit click 거동 변화**: 기존 `disabled`로 click 자체 차단 → 이제 click이 와도 `!canSubmit`이면 silent return. 외부 동작은 동일하나 onClick 핸들러가 호출됨. 부수효과 없으니 안전.
- **WriteFormHeader 추출 = 양 폼의 시각 동기**: 한 폼만 헤더 디자인 바꿀 수 없음. 의도된 통일.

## 검증 한계

- tsc -b 통과 ✓
- **브라우저 실측 미수행** — 다음 확인 필요:
  - confirm 다이얼로그 PC/모바일 표출
  - popover+backdrop 동시 클릭 (모달 유지, popover만 닫힘)
  - DiagnosisTagInput suggestion 키보드 접근 (Tab 진입, Enter 선택)
  - alias 'ASD' 입력 → 'ASD' 그대로 박힘 (정규화 폐기)
  - missing-field 토스트 — 부분 채움으로 PencilLine 클릭
  - 모드 전환 시 dirty confirm
  - PostWriteForm 모달에서 본문/첨부 길게 → flex-1 min-h-0 스크롤 정상

---

# 후속 추가 (2026-05-29 동일 세션)

## 모바일 작성 완료 리다이렉트 — `/posts/${id}` → `/posts` + feed invalidate

`PostCreatePage.tsx:17` onSuccess가 detail 페이지 대신 홈 피드로 navigate. PC 모달(`PostWriteModal.handleSuccess`)이 closeModal로 피드 위에 잔존하던 흐름과 일관. 사용자가 본인 새 글의 컨텍스트(피드 상단 시각 결과)를 즉시 확인. 첨부 업로드 실패 시 fallback navigate(`/posts/${createdPostId}`)는 PostWriteForm 내부 보존(`PostWriteForm.tsx:149`) — 사용자 복구 경로 유지.

**브라우저 검증 중 발견 — feed invalidate 누락 (PostCreatePage.tsx)**: 단순 navigate('/posts')는 SPA 라우팅이라 React Query 피드 캐시(`['feed', ...]`)가 stale 그대로 → 작성된 새 글이 안 보임. PostWriteModal은 `qc.invalidateQueries({ queryKey: ['feed'] })`를 호출했으나 PostCreatePage(모바일)는 미호출이 차이. 수정: PostCreatePage에 useQueryClient + onSuccess 안 invalidate 명시. 회귀 위험: ConcernEditForm/PostEditPage 경로는 PostEditPage.onSuccess가 이미 invalidate를 호출하여 무관.

## 정책 갱신 — 고민카드도 공개범위 변경 가능 (create + edit 모두)

기존 결정(메모리 박힘): "고민카드는 visibility UI 미노출, 항상 PUBLIC 강제". 사용자 지적으로 번복 — 일반 글과 동일하게 공개범위 4종(PUBLIC/PRIVATE/FOLLOWERS_ONLY/VERIFIED_FOLLOWERS_ONLY) 선택 가능.

- **공통 추출**: `VisibilityPicker.tsx` 신규 — PostEditPage 로컬 함수 정의를 통째 추출. PostEditPage·ConcernForm·ConcernEditForm 3곳 공유. 추가 개선: onChange 후 자동 setOpen(false)(PostEditPage엔 없던 동작 — 회귀 무관, UX 자연스러움).
- **ConcernForm (create)**: visibility state(기본 PUBLIC) + isDirty에 포함 + payload에 `visibility: toApiVisibility(visibility)` 동봉 + 푸터(공개범위만, image/file 버튼 없음). USER 롤 isPublicOnly = true.
- **ConcernEditForm (edit)**: 동일 패턴 + `initialUIVisibility = fromApiVisibility(initial.visibility)`로 초기화. isDirty에 `visibility !== initialUIVisibility` 추가. payload에 `toApiVisibility(visibility)`.
- **PostEditPage 정리**: 로컬 VisibilityPicker 함수 삭제(75줄) + import 변경. 동작 동일(visibility state 그대로 사용).
- 백엔드 정합: staging Swagger UpdateTherapyPostRequest/CreateTherapyPostRequest 모두 visibility enum 4종 동봉 ✓.

회귀 위험 추가 (앞 19건에 이어):
20. **VisibilityPicker onChange 후 자동 close**: 기존 PostEditPage는 옵션 클릭 후 popover 유지(다음 옵션도 같은 시점에 보이는 UX). 추출본은 닫음. 사용자 선호 변경 시 prop으로 옵션화 검토.
21. **ConcernForm USER 롤 isPublicOnly 호환**: 메모리 [[project_user_role_post_create_policy]]에 따라 USER 롤은 PUBLIC만 가능. 고민카드 작성 시 isPublicOnly=true면 칩이 회색·클릭 불가. 백엔드 검증 시 visibility 무시되어도 무해.

## 🔄 검토 보류 — PostWriteForm 모바일 인라인 툴바 (워킹트리에서 제외, 2026-05-29)

**상태**: 사용자 결정으로 develop push 대상에서 제외. 도전적 UI 변경이라 검토 필요. 코드는 워킹트리에서 되돌렸고, 변경 내용은 본 섹션에 박혀있어 재적용 시 재현 가능.

변경 내용(다시 적용 시 참조):

- **위치**: 프로필 ↔ 치료영역 칩 사이로 이동. variant === 'page'(모바일 페이지) 일 때만.
- **아이콘 크기**: 푸터 size={20} → 인라인 size={24} (모바일 터치 도달성).
- **color**: text-gray-500 → text-gray-600 (인라인은 약간 강조).
- **PC 모달**: 기존 푸터(`variant === 'modal'`) 유지. variant conditional render로 분기.
- **시각 구분**: 인라인 div에 `-mx-4 px-4 py-2 border-y border-gray-100` — 본문 패딩 밖까지 풀너비 border-y로 영역 구분(헤더·푸터와 같은 회색 톤).

재적용 시 코드 위치:
- PostWriteForm.tsx 본문 스크롤 영역 내 `{user && <프로필 div>}` 직후, `{치료영역 칩}` 직전에 `{variant === 'page' && <인라인 툴바>}` 삽입.
- 푸터를 `{variant === 'modal' && <footer>}` conditional로 변경.

**유지된 부수 정리**(워킹트리에 살아있음, develop에 함께 올라감):
- PostWriteForm 자체 인라인 popover/visibilityRef/visibilityOpen state/useEffect 제거 → 공통 `VisibilityPicker` 사용. 코드 응집 보존.
- **VisibilityPicker fix 이관**: PostWriteForm:#4(popover+backdrop 충돌)의 capture+stopPropagation을 공통 컴포넌트로 옮김. PostEditPage·ConcernForm modal에서도 동일 fix 자동 적용 — ConcernForm modal variant의 미발견 회귀 잠재 위험 해소.

검토 시 고려할 트레이드오프:
- 모바일/PC 정책 비대칭(모바일=인라인, PC=푸터) — 디자인 변경 시 두 위치 동기 필요.
- ConcernForm/ConcernEditForm는 현재 둘 다 푸터만 — 일관성 위해 같은 패턴 이관 검토.
- 푸터 자체가 안 보이는 디자인이 모바일에선 자연스러운지(아래쪽 비어 보이는지) 사용자 검증 필요.

회귀 위험 추가 (앞 21건에 이어 — 워킹트리 유지분만):
22. **VisibilityPicker capture phase 이관 부수효과**: PostEditPage·ConcernEditForm 등 모달 밖 페이지에서도 capture phase로 fire. 모달 밖에서 다른 React onMouseDown 핸들러가 backdrop close류로 등록되면 stopPropagation이 의도치 않게 차단할 수 있음. 현재 그런 핸들러 없으므로 무해.

## 고민카드 수정 기능 — `ConcernEditForm` 신규 + PostEditPage 분기

**구조 결정**: PostEditPage 내부에서 fetchPost 후 postType === 'CONCERN_CARD' 분기 → `ConcernEditForm` 위임. 라우트 `/posts/:postId/edit` 단일 유지(호출자 `PostDetailPage.tsx:343` 진입점 무변경). 백엔드 `UpdateTherapyPostRequest`가 ageGroup/diagnoses/otherNotes 모두 포함하여 단일 `updatePost(pid, payload)` 재사용.

### 메커니즘

- **ConcernEditForm** = ConcernForm 본문 구조 그대로(고민지점·연령대·치료영역·진단명·기타) + 헤더만 inline `← 고민카드 수정 ✏️` + mode 토글 없음(postType 불변, Swagger UpdateTherapyPostRequest에 postType 미포함).
- **initial 보관**: PostEditPage가 `concernPost: PostDetail | null` state에 fetchPost 결과 보관 → render 시 분기. 일반 글 state 초기화는 분기 시 skip(useEffect early return).
- **isDirty = initial 대비 5필드 비교**(content/ageGroup/therapyArea/diagnoses/otherNotes). diagnoses는 `arrayEquals` 헬퍼로 길이+순서+내용 비교. visibility는 UI 노출 없어 dirty 비교 제외 — 기존 값 그대로 PATCH 동봉.
- **isValid 정책**: UNSPECIFIED 허용 X. 백엔드에서 UNSPECIFIED 내려와도 사용자가 변경하도록 강제(create와 일관).
- **canSubmit = isValid && isDirty && !submitting** — 변경 없으면 제출 차단.
- **누락 필드 토스트** — ConcernForm과 동일 패턴(aria-disabled + onClick 검사 + sonner toast).
- **visibility UI 미노출**: ConcernForm(create) 정책 일관. `initial.visibility` 그대로 PATCH 동봉.
- **첨부파일 미지원**: 첨부 입력/리스트 없음. PostEditPage가 imagesData fetch는 하나 분기 후 미사용(무해).
- **analytics 미발사**: 기존 PostEditPage가 trackEvent 호출 없음과 일관. `post_edited` 이벤트는 PM 합의 게이트 — 향후 추가 검토(코드 주석 박제).

### 회귀 위험 추가 (앞 15건에 이어)

16. **`PostEditPage.concernPost` setter 누락 방지**: useEffect 안 early return 위치가 `if (post.postType === 'CONCERN_CARD') { setConcernPost(post); return; }`로 모든 일반 글 state 초기화 전. 향후 리팩 시 setConcernPost와 일반 state 초기화 순서가 섞이면 일반 글 입력 폼이 빈 상태로 깜빡일 수 있음.
17. **PostDetail flat 필드 null 처리**: `concernPost.ageGroup ?? 'UNSPECIFIED'`, `diagnoses ?? []`, `otherNotes ?? ''` 기본값. 백엔드가 USER 권한 마스킹으로 diagnoses=null 내려주면 빈 배열로 폼 진입 → isValid가 false라 제출 차단. 단 마스킹 게시글은 canEdit=false라 일반적으로 도달 불가(추정).
18. **dirty 비교의 diagnoses 순서 민감**: `arrayEquals`가 순서까지 비교. 사용자가 같은 태그를 제거→다시 추가하면 순서 바뀌어 dirty 판정. 의도된 동작이지만 UX 혼란 가능.
19. **navigate(`/posts/${pid}`) on edit success**: 작성은 홈 피드, 수정은 상세 페이지로 — 의도된 비대칭(수정은 본인 글 변경 확인이 자연스러움). 향후 일관화 요구 시 검토.

### 자기점검 질문 추가 (앞 12개에 이어)

13. "ConcernEditForm이 ConcernForm을 재사용하지 않고 별도 컴포넌트로 만든 이유는? 어떤 props가 분기되어야 했나?"
14. "수정 후 navigate 도착지가 작성(`/posts`)과 다른 이유는?"
15. "visibility UI를 ConcernEditForm에 노출하지 않은 정책 일관성은 어디서 오나? 변경하려면 어떤 절차가 필요한가?"
