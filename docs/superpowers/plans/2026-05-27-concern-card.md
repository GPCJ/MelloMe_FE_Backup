# 고민 카드(Concern Card) 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 치료사가 임상 고민을 구조화된 카드로 작성하고, 피드/상세에서 일반 게시글과 함께 노출하는 프로토타입 기능을 구현한다.

**Architecture:** 고민 카드는 `postType: 'CONCERN'`인 특수 게시글이며 구조화된 `concern` 객체를 동반한다. 기존 피드/상세/댓글/리액션 파이프라인을 그대로 재사용하고, 작성 폼·표시 카드·진단명 태그 입력만 신규로 추가한다. 백엔드 계약은 제작 중이므로 API 매핑을 `api/concerns.ts` 어댑터 한 곳에 격리해, 계약 확정 시 호출부를 건드리지 않고 어댑터만 수정한다.

**Tech Stack:** React 19 + TypeScript, Vite, Tailwind CSS, lucide-react, React Query(기존 피드 invalidate), Zustand(기존 모달 store).

**Spec:** `docs/superpowers/specs/2026-05-27-concern-card-design.md`

---

## 코딩 정책 / 검증 방식 (필독)

- **하이브리드 작성 분담** (메모리 `feedback_direct_coding_default`):
  - **기계적(AI 작성 + 리뷰 가능)**: Task 1(타입), Task 2(상수), Task 3(API 어댑터), Task 4(ConcernCard 표시), Task 5(분기 배선), Task 8 WriteTypeToggle.
  - **새 로직(본인 작성 대상)**: Task 6(DiagnosisTagInput), Task 7(ConcernForm). 이 계획의 코드는 **정답이 아니라 참조 가이드**입니다. pseudocode부터 본인 작성한 뒤 대조용으로만 보세요.
- **테스트 러너 없음**: 이 프로젝트는 vitest/jest가 없습니다. 검증은 `npx tsc -b`(타입) + `npm run lint` + `npm run dev` 시각 확인으로 합니다. 테스트 러너 신규 도입은 범위 밖(인프라 드리프트).
- 모든 명령은 `frontend/` 디렉터리에서 실행합니다.
- 커밋 메시지는 한국어, 서명 없이(메모리 `feedback_git_workflow`).
- 작성(create) 경로의 실제 동작은 백엔드 엔드포인트 완성 후 staging에서 검증합니다(MSW=false 환경). 그 전까지는 타입/린트 통과 + 시각 확인까지가 완료 기준입니다.

---

## File Structure

생성:
- `frontend/src/constants/concern.ts` — 연령대 칩/라벨, 진단명 시드 목록
- `frontend/src/api/concerns.ts` — 고민 카드 작성 API 어댑터(계약 격리)
- `frontend/src/components/post/WriteTypeToggle.tsx` — 일반 글/고민 카드 토글
- `frontend/src/components/post/DiagnosisTagInput.tsx` — 진단명 자동완성 + 자유 입력 태그
- `frontend/src/components/post/ConcernCard.tsx` — 피드/상세 공용 표시 카드(B안)
- `frontend/src/components/post/ConcernForm.tsx` — 고민 카드 작성 폼

수정:
- `frontend/src/types/post.ts` — `CONCERN` postType, `Concern`, `concern?` 필드, 작성 요청 타입
- `frontend/src/components/post/PostWriteForm.tsx` — 헤더에 토글 슬롯(옵셔널 props)
- `frontend/src/components/post/PostWriteModal.tsx` — 모드 상태 + 폼 스왑
- `frontend/src/pages/post/PostCreatePage.tsx` — 모드 상태 + 폼 스왑(모바일)
- `frontend/src/components/post/PostCard.tsx` — CONCERN이면 ConcernCard 렌더
- `frontend/src/pages/post/PostDetailPage.tsx` — CONCERN이면 ConcernCard 렌더

---

## Task 1: 타입 정의 (기계적)

**Files:**
- Modify: `frontend/src/types/post.ts`

- [ ] **Step 1: `PostType`에 `CONCERN` 추가**

`frontend/src/types/post.ts:2` 를 다음으로 교체:

```ts
export type PostType = 'COMMUNITY' | 'RESOURCE' | 'CONCERN';
```

- [ ] **Step 2: `Concern` 인터페이스와 작성 요청 타입 추가**

`AgeGroup` 타입 정의(현재 `frontend/src/types/post.ts:32-39`) 바로 아래에 추가:

```ts
// 고민 카드 — postType==='CONCERN'인 게시글에 동반되는 구조화 데이터.
// ageGroup/therapyArea는 기존 enum 재사용, diagnoses는 자유 문자열 배열(백엔드 enum 검증 X).
export interface Concern {
  worry: string; // 고민(본문)
  ageGroup: AgeGroup;
  therapyArea: TherapyArea;
  diagnoses: string[];
  note?: string; // 기타(선택)
}

// 작성 요청. 작성 엔드포인트 형태는 백엔드 확정 대기 → api/concerns.ts 어댑터에서 흡수.
export interface ConcernCreateRequest {
  concern: Concern;
  visibility?: Visibility;
}
```

- [ ] **Step 3: `PostSummary`와 `PostDetail`에 `concern` 필드 추가**

`PostSummary`(현재 `:41-61`) 의 `scrapped?: boolean;` 바로 위에 추가:

```ts
  // postType==='CONCERN'일 때만 존재. 피드 응답 동봉 여부는 백엔드 확정 대기(스펙 Q2).
  concern?: Concern;
```

`PostDetail`(현재 `:81-106`) 의 `scrapped?: boolean;` 바로 위에 동일하게 추가:

```ts
  // postType==='CONCERN'일 때만 존재.
  concern?: Concern;
```

- [ ] **Step 4: 타입 체크**

Run: `cd frontend && npx tsc -b`
Expected: 에러 없음(기존 코드는 `concern`을 아직 안 쓰므로 영향 없음).

- [ ] **Step 5: 커밋**

```bash
git add frontend/src/types/post.ts
git commit -m "feat(concern): 고민 카드 타입 추가 — postType CONCERN, Concern, concern 필드"
```

---

## Task 2: 상수 (연령대/진단명 시드) (기계적)

**Files:**
- Create: `frontend/src/constants/concern.ts`

- [ ] **Step 1: 상수 파일 생성**

`frontend/src/constants/concern.ts`:

```ts
import type { AgeGroup } from '../types/post';

// 연령대 칩 — UNSPECIFIED 제외, 사용자 확정 6단계. (기존 AgeGroup enum 재사용)
export const AGE_GROUP_CHIPS: { value: AgeGroup; label: string }[] = [
  { value: 'AGE_0_2', label: '영아기' },
  { value: 'AGE_3_5', label: '유아기' },
  { value: 'AGE_6_12', label: '아동기' },
  { value: 'AGE_13_18', label: '청소년기' },
  { value: 'AGE_19_64', label: '성년기' },
  { value: 'AGE_65_PLUS', label: '노령기' },
];

// 표시용 라벨 매핑(ConcernCard에서 사용).
export const AGE_GROUP_LABELS: Record<string, string> = {
  AGE_0_2: '영아기',
  AGE_3_5: '유아기',
  AGE_6_12: '아동기',
  AGE_13_18: '청소년기',
  AGE_19_64: '성년기',
  AGE_65_PLUS: '노령기',
};

// 진단명 자동완성 시드. PM 제공 목록으로 추후 교체/확장.
// 목록 내 진단명 = 표기 통일(정제 불필요), 목록 외 자유 입력 = 별도 정제 대상.
export const SEED_DIAGNOSES: string[] = [
  '자폐스펙트럼장애(ASD)',
  '주의력결핍 과잉행동장애(ADHD)',
  '지적장애',
  '발달지연',
  '언어발달지연',
  '의사소통장애',
  '학습장애',
  '뇌성마비',
  '발달성협응장애(DCD)',
  '다운증후군',
  '틱장애',
  '감각처리장애(SPD)',
  '청각장애',
  '시각장애',
];
```

- [ ] **Step 2: 타입 체크**

Run: `cd frontend && npx tsc -b`
Expected: 에러 없음.

- [ ] **Step 3: 커밋**

```bash
git add frontend/src/constants/concern.ts
git commit -m "feat(concern): 연령대 칩·라벨 매핑·진단명 시드 상수 추가"
```

---

## Task 3: API 어댑터 (계약 격리) (기계적)

**Files:**
- Create: `frontend/src/api/concerns.ts`

- [ ] **Step 1: 작성 어댑터 생성**

`frontend/src/api/concerns.ts`:

```ts
import axiosInstance from './axiosInstance';
import type { ConcernCreateRequest, PostDetail } from '../types/post';

// 백엔드 계약 대기(스펙 3절 Q1): 작성 엔드포인트 형태 미확정.
// 현재 가정 = 기존 게시글 작성에 postType=CONCERN + concern을 실어 보냄.
// 엔드포인트가 별도(POST /concerns 등)로 확정되면 이 함수 본문만 수정한다.
// 호출부(ConcernForm)는 createConcern 시그니처에만 의존하므로 영향받지 않는다.
export async function createConcern(req: ConcernCreateRequest): Promise<PostDetail> {
  const res = await axiosInstance.post('/posts', {
    postType: 'CONCERN',
    visibility: req.visibility ?? 'PUBLIC',
    concern: req.concern,
  });
  return res.data;
}
```

- [ ] **Step 2: 타입 체크**

Run: `cd frontend && npx tsc -b`
Expected: 에러 없음.

- [ ] **Step 3: 커밋**

```bash
git add frontend/src/api/concerns.ts
git commit -m "feat(concern): 작성 API 어댑터 추가 — 백엔드 계약 격리"
```

---

## Task 4: ConcernCard 표시 컴포넌트 (B안) (기계적)

**Files:**
- Create: `frontend/src/components/post/ConcernCard.tsx`

- [ ] **Step 1: 컴포넌트 생성**

B안 순서(메타 → 구분선 → 고민지점 → 기타). `clamp`로 피드(true)/상세(false) 분기.

`frontend/src/components/post/ConcernCard.tsx`:

```tsx
import type { Concern } from '../../types/post';
import { AGE_GROUP_LABELS } from '../../constants/concern';
import { THERAPY_AREA_LABELS } from '../../constants/post';

interface ConcernCardProps {
  concern: Concern;
  // 피드=true(line-clamp-3), 상세=false(전체 노출)
  clamp?: boolean;
}

export default function ConcernCard({ concern, clamp = false }: ConcernCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden mb-2.5">
      <div className="flex items-center gap-1.5 px-3 py-2 bg-gray-50 border-b border-gray-100">
        <span className="w-5 h-5 rounded-full bg-gray-800 flex items-center justify-center text-white text-[10px]">
          ?
        </span>
        <span className="text-sm font-bold text-gray-800">고민카드</span>
      </div>
      <div className="px-3 py-2.5">
        <dl className="space-y-1.5 text-sm">
          <div className="flex">
            <dt className="w-16 shrink-0 font-semibold text-gray-600">연령대</dt>
            <dd className="text-gray-700">{AGE_GROUP_LABELS[concern.ageGroup] ?? '-'}</dd>
          </div>
          <div className="flex">
            <dt className="w-16 shrink-0 font-semibold text-gray-600">치료영역</dt>
            <dd className="text-gray-700">{THERAPY_AREA_LABELS[concern.therapyArea] ?? '-'}</dd>
          </div>
          <div className="flex">
            <dt className="w-16 shrink-0 font-semibold text-gray-600">진단명</dt>
            <dd className="flex flex-wrap gap-1">
              {concern.diagnoses.map((d) => (
                <span key={d} className="bg-gray-100 text-gray-700 text-xs rounded-full px-2 py-0.5">
                  {d}
                </span>
              ))}
            </dd>
          </div>
        </dl>
        <div className="my-2.5 border-t border-gray-100" />
        <div>
          <span className="text-sm font-bold text-gray-800">고민지점</span>
          <p
            className={`mt-1 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap break-words ${
              clamp ? 'line-clamp-3' : ''
            }`}
          >
            {concern.worry}
          </p>
        </div>
        {concern.note && (
          <p className="mt-2 text-xs text-gray-500 whitespace-pre-wrap break-words">
            {concern.note}
          </p>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 타입 체크 + 린트**

Run: `cd frontend && npx tsc -b && npm run lint`
Expected: 에러 없음.

- [ ] **Step 3: 커밋**

```bash
git add frontend/src/components/post/ConcernCard.tsx
git commit -m "feat(concern): 고민 카드 표시 컴포넌트 추가 — B안 레이아웃"
```

---

## Task 5: 읽기 경로 배선 (PostCard + PostDetailPage) (기계적)

**Files:**
- Modify: `frontend/src/components/post/PostCard.tsx`
- Modify: `frontend/src/pages/post/PostDetailPage.tsx`

- [ ] **Step 1: PostCard에 import 추가**

`frontend/src/components/post/PostCard.tsx:10` (`import UserAvatar ...`) 아래에 추가:

```tsx
import ConcernCard from './ConcernCard';
```

- [ ] **Step 2: PostCard 본문 분기**

`frontend/src/components/post/PostCard.tsx` 의 비차단(`: (`) 분기 내부, 현재 `<>` 직후의 본문 `<p ref={contentRef} ...>` 블록을 CONCERN 분기로 감싼다. 현재 `125-180` 구간의 `) : (` 부터 `</>` 까지를 다음 구조로 교체:

```tsx
        ) : post.postType === 'CONCERN' && post.concern ? (
          <ConcernCard concern={post.concern} clamp />
        ) : (
          <>
            <p
              ref={contentRef}
              className={`text-sm text-gray-600 leading-5 whitespace-pre-wrap break-words mb-2.5 ${
                expanded ? '' : 'line-clamp-3'
              }`}
            >
              {post.contentPreview}
            </p>
            {truncated && !expanded && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setExpanded(true);
                }}
                className="-mt-1 mb-2.5 text-xs text-blue-600 hover:text-blue-700 hover:font-semibold transition-all"
              >
                더보기
              </button>
            )}
            {post.imageUrls && post.imageUrls.length > 0 && (
              <div
                ref={imagesScroll.ref}
                {...imagesScroll.handlers}
                onDragStart={(e) => e.preventDefault()}
                onClickCapture={(e) => {
                  if (imagesScroll.state.current.moved > 5) {
                    e.preventDefault();
                    e.stopPropagation();
                  }
                }}
                className="flex gap-2 overflow-x-auto -mx-6 px-6 mb-2.5 cursor-grab select-none"
              >
                {post.imageUrls.map((url, i) => (
                  <img
                    key={`${post.id}-img-${i}`}
                    crossOrigin="anonymous"
                    src={resolveImageUrl(url) ?? ''}
                    alt=""
                    draggable={false}
                    className="shrink-0 w-60 h-60 rounded-lg object-cover bg-gray-100"
                  />
                ))}
              </div>
            )}
            {post.hasAttachment && (
              <p className="text-[10px] text-gray-900 mb-2.5">첨부파일 있음</p>
            )}
          </>
        )}
```

(주: `accessLocked` 분기는 그대로 둔다. CONCERN 분기는 비차단 케이스 안에서만 동작.)

- [ ] **Step 3: PostDetailPage에 import 추가**

`frontend/src/pages/post/PostDetailPage.tsx` 상단 import 묶음에 추가(다른 컴포넌트 import 옆):

```tsx
import ConcernCard from '../../components/post/ConcernCard';
```

- [ ] **Step 4: PostDetailPage 본문 분기**

`frontend/src/pages/post/PostDetailPage.tsx:372-385` 의 본문 삼항을 다음으로 교체:

```tsx
          {post.accessLocked ? (
            <div className="bg-stone-50 rounded-lg py-12 px-4">
              <p className="text-center text-gray-600 text-sm">
                인증된 회원에게만 공개된 게시물입니다.
              </p>
            </div>
          ) : post.postType === 'CONCERN' && post.concern ? (
            <ConcernCard concern={post.concern} />
          ) : (
            <div
              className="post-content"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(post.content),
              }}
            />
          )}
```

- [ ] **Step 5: 해시태그 중복 숨김 (CONCERN은 카드 안에 치료영역 표시)**

`frontend/src/pages/post/PostDetailPage.tsx:362` 의 `{therapyLabel && (` 를 다음으로 교체:

```tsx
          {therapyLabel && post.postType !== 'CONCERN' && (
```

- [ ] **Step 6: 타입 체크 + 린트**

Run: `cd frontend && npx tsc -b && npm run lint`
Expected: 에러 없음.

- [ ] **Step 7: 시각 확인(목 데이터)**

`npm run dev` 후, 임시로 한 게시글 객체에 `postType: 'CONCERN'` 과 `concern` 목 데이터를 넣어 피드/상세에서 ConcernCard가 렌더되는지 확인(확인 후 임시 목 데이터 제거). 백엔드 미완 상태에서는 이 시각 확인까지가 한계.

- [ ] **Step 8: 커밋**

```bash
git add frontend/src/components/post/PostCard.tsx frontend/src/pages/post/PostDetailPage.tsx
git commit -m "feat(concern): 피드/상세에서 CONCERN 게시글을 ConcernCard로 렌더"
```

---

## Task 6: DiagnosisTagInput (자동완성 태그) — 새 로직(본인 작성)

> 이 컴포넌트는 새 로직입니다. 아래 코드는 **참조 가이드**입니다. 먼저 pseudocode로 동작(입력→필터→후보 클릭/Enter 추가→✕ 제거→중복·최대개수 가드)을 직접 설계한 뒤, 본인 구현과 대조하세요.

**Files:**
- Create: `frontend/src/components/post/DiagnosisTagInput.tsx`

- [ ] **Step 1: pseudocode 작성(본인)**

입력 상태 `input`, 부모가 소유한 `value: string[]`. 동작:
- `suggestions` = `input` 비어있지 않으면 `SEED_DIAGNOSES` 중 `input` 포함 && `value`에 없는 것 상위 6개.
- `addTag(raw)`: trim, 빈 값 무시, 이미 있으면 무시, `value.length >= maxCount`면 무시, 아니면 `onChange([...value, tag])` + 입력 비움.
- `removeTag(tag)`: `onChange(value.filter(t => t !== tag))`.
- Enter → addTag(input) + preventDefault. Backspace + 빈 입력 → 마지막 태그 제거.

- [ ] **Step 2: 구현(참조 가이드)**

```tsx
import { useState } from 'react';
import { X } from 'lucide-react';
import { SEED_DIAGNOSES } from '../../constants/concern';

interface DiagnosisTagInputProps {
  value: string[];
  onChange: (next: string[]) => void;
  maxCount?: number;
}

export default function DiagnosisTagInput({
  value,
  onChange,
  maxCount = 5,
}: DiagnosisTagInputProps) {
  const [input, setInput] = useState('');

  const suggestions = input.trim()
    ? SEED_DIAGNOSES.filter((d) => d.includes(input.trim()) && !value.includes(d)).slice(0, 6)
    : [];

  function addTag(raw: string) {
    const tag = raw.trim();
    if (!tag || value.includes(tag) || value.length >= maxCount) {
      setInput('');
      return;
    }
    onChange([...value, tag]);
    setInput('');
  }

  function removeTag(tag: string) {
    onChange(value.filter((t) => t !== tag));
  }

  const atMax = value.length >= maxCount;

  return (
    <div className="relative">
      <div className="rounded-lg border border-gray-200 px-2 py-2 flex flex-wrap gap-1.5 items-center">
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 text-xs rounded-full pl-2.5 pr-1.5 py-1"
          >
            {tag}
            <button
              type="button"
              aria-label={`${tag} 삭제`}
              onClick={() => removeTag(tag)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={12} />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addTag(input);
            } else if (e.key === 'Backspace' && !input && value.length) {
              removeTag(value[value.length - 1]);
            }
          }}
          placeholder={atMax ? '최대 개수에 도달했습니다' : '진단명 입력 후 Enter'}
          disabled={atMax}
          className="flex-1 min-w-[100px] text-sm focus:outline-none py-1 disabled:bg-transparent"
        />
      </div>
      {suggestions.length > 0 && (
        <ul className="absolute z-10 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto py-1">
          {suggestions.map((s) => (
            <li key={s}>
              <button
                type="button"
                onClick={() => addTag(s)}
                className="w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
              >
                {s}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

- [ ] **Step 3: 타입 체크 + 린트**

Run: `cd frontend && npx tsc -b && npm run lint`
Expected: 에러 없음.

- [ ] **Step 4: 커밋**

```bash
git add frontend/src/components/post/DiagnosisTagInput.tsx
git commit -m "feat(concern): 진단명 자동완성+자유입력 태그 컴포넌트 추가"
```

---

## Task 7: ConcernForm (작성 폼) — 새 로직(본인 작성)

> 새 로직입니다. 아래는 **참조 가이드**. PostWriteForm(`frontend/src/components/post/PostWriteForm.tsx`)의 헤더/푸터(공개범위) 구조를 그대로 본떠, 본문만 고민 카드 필드로 바꾼 형태입니다. 제출 시 `createConcern` 호출. pseudocode(필수 검증: worry/ageGroup/therapyArea/diagnoses≥1)부터 본인 설계 후 대조하세요.

**Files:**
- Create: `frontend/src/components/post/ConcernForm.tsx`

- [ ] **Step 1: pseudocode 작성(본인)**

상태: `worry`, `ageGroup: AgeGroup | null`, `therapyArea: TherapyArea | null`, `diagnoses: string[]`, `note`, `visibility`, `submitting`, `error`.
- `canSubmit` = worry.trim() 있음 && ageGroup && therapyArea && diagnoses.length>0 && !submitting.
- `handleSubmit`: createConcern({ concern: { worry, ageGroup, therapyArea, diagnoses, note: note||undefined }, visibility: toApiVisibility(visibility) }) → onSuccess(post.id).
- 헤더 중앙: `onModeChange` 있으면 `<WriteTypeToggle>`, 없으면 제목.

- [ ] **Step 2: 구현(참조 가이드)**

```tsx
import { useState } from 'react';
import { ArrowLeft, PencilLine } from 'lucide-react';
import VerifiedBadge from './VerifiedBadge';
import UserAvatar from '../common/UserAvatar';
import WriteTypeToggle from './WriteTypeToggle';
import DiagnosisTagInput from './DiagnosisTagInput';
import { createConcern } from '../../api/concerns';
import { useAuthStore } from '../../stores/useAuthStore';
import type { AgeGroup, TherapyArea, UIVisibility } from '../../types/post';
import { AGE_GROUP_CHIPS } from '../../constants/concern';
import { THERAPY_CHIPS, toApiVisibility } from '../../constants/post';
import { trackEvent } from '../../lib/analytics';

interface ConcernFormProps {
  variant: 'modal' | 'page';
  onClose: () => void;
  onSuccess?: (postId: number) => void;
  mode?: 'post' | 'concern';
  onModeChange?: (m: 'post' | 'concern') => void;
}

export default function ConcernForm({
  variant,
  onClose,
  onSuccess,
  mode,
  onModeChange,
}: ConcernFormProps) {
  const user = useAuthStore((s) => s.user);

  const [worry, setWorry] = useState('');
  const [ageGroup, setAgeGroup] = useState<AgeGroup | null>(null);
  const [therapyArea, setTherapyArea] = useState<TherapyArea | null>(null);
  const [diagnoses, setDiagnoses] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [visibility] = useState<UIVisibility>('PUBLIC');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit =
    worry.trim().length > 0 &&
    !!ageGroup &&
    !!therapyArea &&
    diagnoses.length > 0 &&
    !submitting;

  async function handleSubmit() {
    if (!canSubmit || !ageGroup || !therapyArea) return;
    setSubmitting(true);
    setError(null);
    try {
      const post = await createConcern({
        concern: { worry, ageGroup, therapyArea, diagnoses, note: note.trim() || undefined },
        visibility: toApiVisibility(visibility),
      });
      trackEvent('post_created');
      onSuccess?.(post.id);
    } catch {
      setError('고민 카드 작성에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setSubmitting(false);
    }
  }

  const containerCls = variant === 'page' ? 'flex flex-col h-[100dvh] bg-white' : 'flex flex-col';

  // 칩 공통 클래스 — 선택 시 무채색(bg-gray-900). FilterChips 컨벤션.
  const chipCls = (active: boolean) =>
    `shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
      active ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-500 border-gray-200'
    }`;

  return (
    <div className={containerCls}>
      <header className="flex items-center justify-between px-4 py-3 border-b border-gray-100 shrink-0">
        <button type="button" onClick={onClose} aria-label="닫기" className="p-1 -ml-1 text-gray-700">
          <ArrowLeft size={20} />
        </button>
        {onModeChange ? (
          <WriteTypeToggle mode={mode ?? 'concern'} onChange={onModeChange} />
        ) : (
          <h1 className="text-base font-semibold text-gray-900">고민 카드</h1>
        )}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit}
          aria-label="게시하기"
          className="p-1 -mr-1 text-gray-900 disabled:text-gray-300 disabled:cursor-not-allowed"
        >
          <PencilLine size={20} />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4">
        {user && (
          <div className="flex items-center gap-2">
            <UserAvatar nickname={user.nickname} imageUrl={user.profileImageUrl} size="sm" />
            <span className="text-sm font-semibold text-gray-900">{user.nickname}</span>
            <VerifiedBadge status={user.therapistVerification?.status} />
          </div>
        )}

        {/* 고민(본문) */}
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-gray-600">고민</span>
          <textarea
            value={worry}
            onChange={(e) => setWorry(e.target.value)}
            rows={4}
            placeholder="어떤 점이 고민인가요? 동료에게 묻고 싶은 내용을 적어주세요."
            className="w-full resize-none rounded-lg border border-gray-200 text-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-gray-400"
          />
        </div>

        {/* 연령대 — 단일 선택 */}
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-gray-600">연령대</span>
          <div className="flex flex-wrap gap-1.5">
            {AGE_GROUP_CHIPS.map((chip) => (
              <button
                key={chip.value}
                type="button"
                onClick={() => setAgeGroup(chip.value)}
                className={chipCls(ageGroup === chip.value)}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>

        {/* 치료영역 — 단일 선택 (UNSPECIFIED 제외) */}
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-gray-600">치료영역</span>
          <div className="flex flex-wrap gap-1.5">
            {THERAPY_CHIPS.filter((c) => c.value !== 'UNSPECIFIED').map((chip) => (
              <button
                key={chip.value}
                type="button"
                onClick={() => setTherapyArea(chip.value)}
                className={chipCls(therapyArea === chip.value)}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>

        {/* 진단명 — 자동완성 + 자유 입력 */}
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-gray-600">진단명</span>
          <DiagnosisTagInput value={diagnoses} onChange={setDiagnoses} />
        </div>

        {/* 기타 — 선택 */}
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-gray-600">
            기타 <span className="text-[10px] text-gray-400">선택</span>
          </span>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            placeholder="배경, 시도해 본 방법 등 추가로 공유할 내용"
            className="w-full resize-none rounded-lg border border-gray-200 text-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-gray-400"
          />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: 타입 체크 + 린트**

Run: `cd frontend && npx tsc -b && npm run lint`
Expected: 에러 없음. (WriteTypeToggle은 Task 8에서 생성되므로, Task 8을 먼저 하거나 이 Step에서 import 에러가 나면 Task 8 완료 후 재실행.)

- [ ] **Step 4: 커밋**

```bash
git add frontend/src/components/post/ConcernForm.tsx
git commit -m "feat(concern): 고민 카드 작성 폼 추가 — 필수 검증, 무채색 칩"
```

---

## Task 8: WriteTypeToggle + PostWriteForm 헤더 슬롯 (기계적)

> Task 7의 import 의존 때문에, Task 7보다 먼저 수행해도 된다(순서 유연).

**Files:**
- Create: `frontend/src/components/post/WriteTypeToggle.tsx`
- Modify: `frontend/src/components/post/PostWriteForm.tsx`

- [ ] **Step 1: WriteTypeToggle 생성**

`frontend/src/components/post/WriteTypeToggle.tsx`:

```tsx
interface WriteTypeToggleProps {
  mode: 'post' | 'concern';
  onChange: (m: 'post' | 'concern') => void;
}

export default function WriteTypeToggle({ mode, onChange }: WriteTypeToggleProps) {
  return (
    <div className="inline-flex rounded-lg bg-gray-100 p-0.5 text-xs">
      <button
        type="button"
        onClick={() => onChange('post')}
        className={`px-3 py-1.5 rounded-md transition-colors ${
          mode === 'post' ? 'bg-white shadow-sm font-semibold text-gray-900' : 'text-gray-500'
        }`}
      >
        일반 글
      </button>
      <button
        type="button"
        onClick={() => onChange('concern')}
        className={`px-3 py-1.5 rounded-md transition-colors ${
          mode === 'concern' ? 'bg-white shadow-sm font-semibold text-gray-900' : 'text-gray-500'
        }`}
      >
        고민 카드
      </button>
    </div>
  );
}
```

- [ ] **Step 2: PostWriteForm에 옵셔널 props 추가**

`frontend/src/components/post/PostWriteForm.tsx:3` import 줄에 `WriteTypeToggle` import 추가:

```tsx
import WriteTypeToggle from './WriteTypeToggle';
```

`PostWriteFormProps`(현재 `:35-42`)에 옵셔널 props 추가:

```tsx
interface PostWriteFormProps {
  variant: 'modal' | 'page';
  onClose: () => void;
  onSuccess?: (postId: number) => void;
  // 작성 타입 토글(고민 카드 도입). 컨테이너가 모드를 소유하고 헤더에 토글을 렌더.
  mode?: 'post' | 'concern';
  onModeChange?: (m: 'post' | 'concern') => void;
}
```

함수 시그니처(현재 `:44`)도 분해 추가:

```tsx
export default function PostWriteForm({ variant, onClose, onSuccess, mode, onModeChange }: PostWriteFormProps) {
```

- [ ] **Step 3: 헤더 제목을 토글로 교체**

`frontend/src/components/post/PostWriteForm.tsx:164` 의 `<h1 ...>새 시그널</h1>` 를 다음으로 교체:

```tsx
        {onModeChange ? (
          <WriteTypeToggle mode={mode ?? 'post'} onChange={onModeChange} />
        ) : (
          <h1 className="text-base font-semibold text-gray-900">새 시그널</h1>
        )}
```

- [ ] **Step 4: 타입 체크 + 린트**

Run: `cd frontend && npx tsc -b && npm run lint`
Expected: 에러 없음. (기존 호출부는 `onModeChange`를 안 넘기므로 기존 동작 유지 — 제목 표시.)

- [ ] **Step 5: 커밋**

```bash
git add frontend/src/components/post/WriteTypeToggle.tsx frontend/src/components/post/PostWriteForm.tsx
git commit -m "feat(concern): 작성 타입 토글 추가 + PostWriteForm 헤더 슬롯화"
```

---

## Task 9: 컨테이너 배선 (PostWriteModal + PostCreatePage) (기계적)

**Files:**
- Modify: `frontend/src/components/post/PostWriteModal.tsx`
- Modify: `frontend/src/pages/post/PostCreatePage.tsx`

- [ ] **Step 1: PostWriteModal — 모드 상태 + 폼 스왑**

`frontend/src/components/post/PostWriteModal.tsx:1` 의 `import { useEffect } from 'react';` 를 다음으로 교체:

```tsx
import { useEffect, useState } from 'react';
```

`import PostWriteForm from './PostWriteForm';`(현재 `:3`) 아래에 추가:

```tsx
import ConcernForm from './ConcernForm';
```

컴포넌트 본문 상단(현재 `:9` `const qc = ...` 아래)에 모드 상태 추가:

```tsx
  const [mode, setMode] = useState<'post' | 'concern'>('post');
```

`<PostWriteForm variant="modal" onClose={closeModal} onSuccess={handleSuccess} />`(현재 `:49`) 를 다음으로 교체:

```tsx
        {mode === 'post' ? (
          <PostWriteForm
            variant="modal"
            onClose={closeModal}
            onSuccess={handleSuccess}
            mode={mode}
            onModeChange={setMode}
          />
        ) : (
          <ConcernForm
            variant="modal"
            onClose={closeModal}
            onSuccess={handleSuccess}
            mode={mode}
            onModeChange={setMode}
          />
        )}
```

- [ ] **Step 2: PostCreatePage — 모드 상태 + 폼 스왑(모바일)**

`frontend/src/pages/post/PostCreatePage.tsx` 전체를 다음으로 교체:

```tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PostWriteForm from '../../components/post/PostWriteForm';
import ConcernForm from '../../components/post/ConcernForm';
import { useScreenExit } from '../../hooks/useScreenExit';

export default function PostCreatePage() {
  // 체류 시간 측정 — 글쓰기 화면 이탈 시 duration 발송.
  useScreenExit('post_write');

  const navigate = useNavigate();
  const [mode, setMode] = useState<'post' | 'concern'>('post');

  const common = {
    variant: 'page' as const,
    onClose: () => navigate('/posts'),
    onSuccess: (postId: number) => navigate(`/posts/${postId}`),
    mode,
    onModeChange: setMode,
  };

  return mode === 'post' ? <PostWriteForm {...common} /> : <ConcernForm {...common} />;
}
```

- [ ] **Step 3: 타입 체크 + 린트**

Run: `cd frontend && npx tsc -b && npm run lint`
Expected: 에러 없음.

- [ ] **Step 4: 시각 확인**

`npm run dev` 후:
- PC: 글쓰기 모달에서 헤더 토글로 "고민 카드" 전환 → 폼 필드(고민/연령대/치료영역/진단명/기타) 표시, 칩 무채색, 진단명 자동완성 동작 확인.
- 모바일 뷰포트: `/posts/create` 페이지에서 동일 확인.
- 필수 미입력 시 작성 아이콘(✏️) 비활성 확인.

- [ ] **Step 5: 커밋**

```bash
git add frontend/src/components/post/PostWriteModal.tsx frontend/src/pages/post/PostCreatePage.tsx
git commit -m "feat(concern): 작성 모달/페이지에 일반·고민 카드 토글 배선"
```

---

## Task 10: 백엔드 연동 검증 (staging) — 백엔드 엔드포인트 완성 후

> 백엔드 계약(스펙 3절 Q1·Q2·Q3) 확정 전에는 수행 불가. 확정 시 진행.

- [ ] **Step 1: 어댑터를 확정 계약에 맞춤**

`frontend/src/api/concerns.ts` 의 `createConcern` 본문(엔드포인트 경로/바디 형태)을 백엔드 확정 계약에 맞게 수정. 호출부(ConcernForm)는 수정 불필요.

- [ ] **Step 2: 읽기 응답 형태 확인**

피드(`/posts/feed`)·상세(`/posts/:id`) 응답에 `postType: 'CONCERN'` 과 `concern` 객체가 스펙대로 내려오는지 staging에서 확인. 형태가 다르면 `fetchFeed`/`fetchPost` 응답을 정규화하는 매핑을 `api/concerns.ts`에 추가하고 해당 API 함수에서 적용.

- [ ] **Step 3: E2E 체크리스트(staging)**

- [ ] 고민 카드 작성 → 저장 성공
- [ ] 홈피드에 일반 글과 함께 카드로 노출(고민 line-clamp)
- [ ] 카드 클릭 → 상세 진입, 고민 전체 노출
- [ ] 댓글/리액션/스크랩 기존대로 동작
- [ ] 진단명 자동완성(목록) + 자유 입력 모두 저장 확인

- [ ] **Step 4: 커밋**

```bash
git add frontend/src/api/concerns.ts
git commit -m "fix(concern): 백엔드 확정 계약에 맞춰 작성/읽기 매핑 조정"
```

---

## Self-Review 결과

- **Spec coverage**: 데이터 모델(Task 1), 진단명 시드/자동완성(Task 2·6), 작성 모달/토글/필드(Task 7·8·9), 표시 B안(Task 4·5), 어댑터 격리(Task 3·10) — 스펙 각 절에 대응 태스크 존재.
- **Placeholder scan**: SEED_DIAGNOSES는 실제 값 제공 + "PM 목록으로 교체" 주석(플레이스홀더 아님). 그 외 TODO/TBD 없음.
- **Type consistency**: `Concern`/`AgeGroup`/`TherapyArea` 필드명, `createConcern(req: ConcernCreateRequest)`, `ConcernCard({concern, clamp})`, `WriteTypeToggle({mode, onChange})`, 폼 props(`mode`/`onModeChange`)가 태스크 전반에서 일치.
- **알려진 미결**: 백엔드 계약 3개(Task 10에서 흡수), 진단명 시드 실제 목록은 PM 확정본으로 교체 예정.
