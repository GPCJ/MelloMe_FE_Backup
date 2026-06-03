---
name: project_concern_card_prod_followup_2026_05_30
description: "고민카드 prod 머지/배포 후속 — 회귀 대응 절차 + PM 핸드오프 + 백업 브랜치 위치, 사용자 트리거 시 바로 실행"
metadata: 
  node_type: memory
  type: project
  originSessionId: 94754fcd-1b35-49f6-b186-e83a95e63830
---

**상황 (2026-05-29 저녁)**

- develop→main 머지 완료: `b1e944d Merge remote-tracking branch 'origin/develop'`
- main push 완료 (Vercel prod 자동 배포)
- 충돌 3건 해결: `frontend/src/api/posts.ts`, `frontend/src/components/post/PostWriteForm.tsx`, `frontend/src/pages/post/PostEditPage.tsx` — 전부 **develop본 채택** 정책 ([[project_cherry_pick_retry_logging_to_main_2026_05_28]])
- GA4 prod 실측: `post_created { postType: 'CONCERN_CARD' }` 발사 확인 ✅ (실시간 보고서 매개변수 카드)
- 백업 브랜치 **로컬에만** 존재: `main-backup-before-merge-2026-05-29` (origin/main 412a25c 시점). origin push 안 됨 → 필요 시 별도 push.

---

## 트리거 시 바로 실행할 절차들

### 트리거 A — "고민카드 prod 회귀" / "롤백" / "운영 문제 생겼다"

prod에서 회귀(작성 실패, 표시 깨짐, 인증 분기 오류 등) 발견 시.

**1단계 — 증상 확인**
- prod 도메인 재현 1회 + 브라우저 콘솔/네트워크 캡처
- develop staging에선 동일 증상 재현되는지 확인 (배포 차이 가설 컷)

**2단계 — 결정 분기**
- 영향 작음(시각만, 회피 가능) → 핫픽스 커밋 → push
- 영향 큼(작성 자체 불가/USER 노출 데이터 위반) → **즉시 롤백**

**3단계 — 롤백 (즉시 옵션)**
```bash
git checkout main
git reset --hard main-backup-before-merge-2026-05-29
git push origin main --force-with-lease
```
→ 백업이 로컬에만 있으니 push 전 한 번 더 확인. force-with-lease는 [[feedback_force_push_safety_protocol]] 준수. main이 412a25c로 되돌아감.

**3-alt — 롤백 (선택, 머지만 revert)**
```bash
git revert -m 1 b1e944d
git push origin main
```
→ force-push 없음, 히스토리에 revert 커밋 추가. 안전성 ↑ 직선성 ↓.

기본 권고: **3-alt(revert)** 먼저. force reset은 백업 브랜치 push 후 시도.

### 트리거 B — "GA4 PM 핸드오프" / "Custom Dimension"

postType 매개변수를 보고서 차원으로 활용하려면 GA4 콘솔에서 **맞춤 측정기준** 등록 필요. 등록 권한이 PM에 있으니 핸드오프.

**전달 문구 (그대로 복붙용)**:

> 고민카드 작성 이벤트는 `post_created`에 `postType: CONCERN_CARD` 매개변수로 발사 중입니다 (prod 발사 확인 완료, 2026-05-29). GA4 보고서·탐색에서 postType 차원으로 분할/필터하려면 **관리 → 맞춤 정의 → 맞춤 측정기준 만들기**에서 다음 등록 부탁드립니다:
> - 측정기준 이름: `postType` (또는 PM 표기 선호)
> - 범위: 이벤트
> - 이벤트 매개변수: `postType`
>
> 등록 후 발생한 이벤트부터 차원 적용됩니다(소급 X). 보고서 분석 표 정의도 PM 결정 부탁드립니다.

### 트리거 C — "concern QA 피드백 받았다" / "다른 직군 컴플레인"

develop 머지로 다른 직군(디자이너 부재, PM/백엔드)이 prod에서 검증 가능 상태. 피드백 받으면:

1. 피드백 분류: 시각 정정(자체) vs 명세 변경(PM/백엔드 합의)
2. 시각/UX 정정은 develop 브랜치에서 진행 후 main cherry-pick 또는 다음 머지 사이클
3. develop→main 머지 사이클은 이번 패턴 반복: 백업 → 머지 → 충돌 시 develop본 채택 → push

---

## 트리거 C 실현 #1 — 모바일 UT 작성완료 버튼 가시성 (2026-06-01)

**피드백**: 모바일에서 고민카드 작성 시, 작성 완료 버튼이 헤더(상단)에 `PencilLine` 아이콘 단독으로만 있어 → 아래로 스크롤하며 폼을 채운 뒤 완료 버튼을 찾기 어렵다. 시선 종점(하단)과 액션 위치(상단)가 어긋남 + 아이콘 의미 약함.

**대응 결정 (분류 = 시각/UX 자체 정정)**:
- 항상 노출되는 하단 푸터(`shrink-0`, 스크롤 무관)에 `작성 완료` **텍스트 버튼** 추가 — 모바일 스크롤 종점에 배치. `ConcernForm.tsx` footer만 수정.
- 스타일: 활성 시 **채움**(`bg-gray-900`/`text-white`, 연령대·치료영역 칩 active 톤 재사용) / 비활성 outline(`border-gray-200`/`text-gray-300`). 색상 신규 도입 X.
- `aria-disabled` + `handleSubmit` 재사용 → 헤더 버튼과 동일하게 누락 필드 토스트 유지.
- **헤더 ✏️ 아이콘은 의도적 유지 (이중 배치 확정 — 사용자 결정)**. 추후 "중복이니 제거" 판단 금지, 의도된 것.

**상태**: develop push `c7f9f10` (`bf24bfe..c7f9f10`) → staging 팀 피드백 수집 중. main은 미반영(다음 develop→main 머지 때 동반). main 워킹트리의 타 세션 `notion_draft.md`는 stash로 보존, 미오염.

**보류 (팀 피드백 후 결정)**:
- [ ] 버튼 위치: 양끝 배치(현재 `[공개범위]…[작성완료]`) vs 전체폭
- [ ] PostWriteForm(일반 글쓰기)도 동일 패턴 통일 여부 — 현재 ConcernForm만. 공유 `WriteFormHeader` 미수정이라 일반 글쓰기 영향 없음.

---

## 트리거 C 실현 #2 — 작성 폼 입력 구조를 View와 일치 (2026-06-02)

**피드백 (UT 2차)**: 고민카드 작성 폼 입력 순서가 View(ConcernCard 표시)와 어긋남. 작성/조회 정신모델을 맞춰달라는 요청.

**대응 결정 (분류 = 시각/UX 자체 정정)**:
- `ConcernForm.tsx` 본문 입력 순서를 ConcernCard와 동일하게 재배치 — **연령대 → 치료영역 → 진단명(필터칩 입력 3종 상단) → 고민지점 본문 textarea(최하단)**. 기존엔 고민지점 본문이 맨 위였음.
- **기타(otherNotes) 입력 폼 삭제** — `otherNotes` state·onChange·`createConcern` 전달·`isDirty` 체크·`OTHER_NOTES_MAX_LENGTH` import 전부 제거. ⚠️ `otherNotes`는 API(`api/concerns.ts`, 옵셔널)·ConcernCard View엔 그대로 잔존 → 작성 입구만 닫음. `OTHER_NOTES_MAX_LENGTH` 상수는 `constants/concern.ts`에 미사용으로 남음(승인 시 정리 후보).

**상태**: 브랜치 `feat/concern-form-reorder`, **미커밋·승인 전** — dev 서버(`localhost:3000`)로 검증 중, tsc `-b` 통과. 사용자 승인 후 상수 정리 + 커밋 → develop 머지 사이클. AI 작성+리뷰 분담(기계적 재배치, deadline-unlock 사용).

---

## 잔여 후속

- [ ] postType Custom Dimension PM 등록 (트리거 B)
- [ ] `first_post_created` 신규 계정 실측 (선택, KPI 정확도 확인용)
- [ ] 백업 브랜치 origin push 여부 결정 (현재 로컬만)
- [ ] [[project_concern_card_feature]] 잔여 검증 줄 ✅ 갱신 (post_created postType 발사 확인 완료)

---

## 재개 트리거 모음

| 사용자 한 줄 | 진입 절차 |
|---|---|
| "고민카드 운영 문제 생겼다" / "롤백" | 트리거 A → 3-alt 우선 |
| "GA4 PM 핸드오프" / "Custom Dimension" | 트리거 B 문구 전달 |
| "concern QA 피드백" | 트리거 C |
| "백업 브랜치 push" | `git push origin main-backup-before-merge-2026-05-29` (승인 후) |

오늘 작업 박제 본체: [[project_concern_card_feature]] / [[project_concern_card_implementation_2026_05_29]]
