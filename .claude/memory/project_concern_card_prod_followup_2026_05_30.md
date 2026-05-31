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
