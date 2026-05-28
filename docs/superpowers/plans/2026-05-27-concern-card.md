# 고민 카드(Concern Card) 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

> **2026-05-28 정정**: 백엔드 명세 확정(MEL-55)에 맞춰 **flat 구조로 전면 정정**했습니다.
> 구 가정(중첩 `concern` 객체 + `CONCERN` + FE 뷰모델/변환 어댑터)을 폐기하고, 고민 카드 필드를
> Post 타입에 flat하게 추가하는 방식으로 변경했습니다. 권한 마스킹·진단명 시드(22종)·배열
> 제약(최대 10·각 100자)이 반영됐습니다.

**Goal:** 치료사가 임상 고민을 구조화된 카드로 작성하고, 피드/상세에서 일반 게시글과 함께 노출하는 프로토타입 기능을 구현한다.

**Architecture:** 고민 카드는 `postType: 'CONCERN_CARD'`인 게시글이며, 구조화 필드(`ageGroup`/`diagnoses`/`otherNotes`)가 Post 최상위에 **flat**하게 실린다. 고민 본문은 기존 `content`를 그대로 쓴다. 백엔드 계약이 Post 모양과 1:1이라 **변환 어댑터/뷰모델 없이** 타입에 필드만 추가하면 작성(`createPost`)·읽기(`fetchFeed`/`fetchPost`)가 그대로 흐른다. 작성 폼·표시 카드·진단명 태그 입력·타입 토글만 신규로 추가하고, 나머지(댓글/리액션/스크랩)는 기존 파이프라인을 재사용한다.

**Tech Stack:** React 19 + TypeScript, Vite, Tailwind CSS, lucide-react, React Query(기존 피드 invalidate), Zustand(기존 모달 store).

**Spec:** `docs/superpowers/specs/2026-05-27-concern-card-design.md`

**백엔드 계약:** Jira MEL-55 (백엔드 MEL-54 구현 완료, 현재 staging/prod 미배포 추정).

---

## 코딩 정책 / 검증 방식 (필독)

- **하이브리드 작성 분담** (메모리 `feedback_direct_coding_default`):
  - **기계적(AI 작성 + 리뷰 가능)**: Task 1(타입), Task 2(상수), Task 3(작성 헬퍼), Task 4(ConcernCard 표시), Task 5(분기 배선), Task 8 WriteTypeToggle.
  - **새 로직(본인 작성 대상)**: Task 6(DiagnosisTagInput), Task 7(ConcernForm). 이 계획의 코드는 **정답이 아니라 참조 가이드**입니다. pseudocode부터 본인 작성한 뒤 대조용으로만 보세요.
- **테스트 러너 없음**: 이 프로젝트는 vitest/jest가 없습니다. 검증은 `npx tsc -b`(타입) + `npm run lint` + `npm run dev` 시각 확인으로 합니다. 테스트 러너 신규 도입은 범위 밖(인프라 드리프트).
- 모든 명령은 `frontend/` 디렉터리에서 실행합니다.
- 커밋 메시지는 한국어, 서명 없이(메모리 `feedback_git_workflow`).
- 작성/읽기 경로의 실제 동작은 백엔드 배포 후 staging에서 검증합니다(MSW=false 환경). 그 전까지는 타입/린트 통과 + 목 데이터 시각 확인까지가 완료 기준입니다(Task 1~9). Task 10은 배포 후.

---

## File Structure

생성:
- `frontend/src/constants/concern.ts` — 연령대 칩/라벨, 진단명 시드 목록(aliases 포함)
- `frontend/src/api/concerns.ts` — 고민 카드 작성 헬퍼(flat PostCreateRequest 조립 → createPost)
- `frontend/src/components/post/WriteTypeToggle.tsx` — 일반 글/고민 카드 토글
- `frontend/src/components/post/DiagnosisTagInput.tsx` — 진단명 자동완성 + 자유 입력 태그
- `frontend/src/components/post/ConcernCard.tsx` — 피드/상세 공용 표시 카드(B안)
- `frontend/src/components/post/ConcernForm.tsx` — 고민 카드 작성 폼

수정:
- `frontend/src/types/post.ts` — `CONCERN_CARD` postType, Post 타입에 flat 필드, 작성/수정 요청 타입 확장
- `frontend/src/components/post/PostWriteForm.tsx` — 헤더에 토글 슬롯(옵셔널 props)
- `frontend/src/components/post/PostWriteModal.tsx` — 모드 상태 + 폼 스왑
- `frontend/src/pages/post/PostCreatePage.tsx` — 모드 상태 + 폼 스왑(모바일)
- `frontend/src/components/post/PostCard.tsx` — CONCERN_CARD이면 ConcernCard 렌더
- `frontend/src/pages/post/PostDetailPage.tsx` — CONCERN_CARD이면 ConcernCard 렌더

> 코드 위치는 grep으로 먼저 확인한 뒤 수정합니다(메모리 `feedback_code_change_process`). 아래 라인 번호는 참고치이며, 드리프트 가능.

---

## Task 1: 타입 정의 (기계적)

**Files:**
- Modify: `frontend/src/types/post.ts`

- [ ] **Step 1: `PostType`에 `CONCERN_CARD` 추가**

`frontend/src/types/post.ts:2` 를 다음으로 교체:

```ts
export type PostType = 'COMMUNITY' | 'RESOURCE' | 'CONCERN_CARD';
```

- [ ] **Step 2: `PostSummary`에 flat 필드 추가**

`PostSummary`의 `scrapped?: boolean;` 바로 위에 추가(`therapyArea`는 이미 존재):

```ts
  // 고민 카드(postType==='CONCERN_CARD')일 때만 의미. flat 동봉(MEL-55).
  ageGroup?: AgeGroup;
  // USER 롤은 권한 마스킹으로 null이 내려옴(스펙 3.4) → 진단명 영역 "치료사 인증 후 확인 가능" 처리.
  diagnoses?: string[] | null;
  otherNotes?: string | null;
```

- [ ] **Step 3: `PostDetail`에 flat 필드 추가**

`PostDetail`의 `scrapped?: boolean;` 바로 위에 동일하게 추가:

```ts
  // 고민 카드일 때만 의미. flat 동봉(MEL-55). diagnoses/otherNotes는 USER 롤에서 null(마스킹).
  ageGroup?: AgeGroup;
  diagnoses?: string[] | null;
  otherNotes?: string | null;
```

- [ ] **Step 4: 작성/수정 요청 타입 확장**

`PostCreateRequest`(현재 `:124-128`)를 다음으로 교체:

```ts
export interface PostCreateRequest {
  content: string;
  therapyArea?: TherapyArea;
  visibility?: Visibility;
  // 고민 카드 작성 시에만 채움. postType 생략/null이면 백엔드가 COMMUNITY로 생성.
  postType?: PostType;
  ageGroup?: AgeGroup;
  diagnoses?: string[];
  otherNotes?: string;
}
```

`PostUpdateRequest`(현재 `:130-134`)에도 동일 필드 추가(`postType` 제외 — 수정 시 타입 변경 불가):

```ts
export interface PostUpdateRequest {
  content: string;
  therapyArea?: TherapyArea;
  visibility?: Visibility;
  ageGroup?: AgeGroup;
  diagnoses?: string[];
  otherNotes?: string;
}
```

- [ ] **Step 5: 타입 체크**

Run: `cd frontend && npx tsc -b`
Expected: 에러 없음(기존 코드는 새 필드를 아직 안 쓰므로 영향 없음).

- [ ] **Step 6: 커밋**

```bash
git add frontend/src/types/post.ts
git commit -m "feat(concern): 고민 카드 타입 추가 — CONCERN_CARD, flat 필드(ageGroup/diagnoses/otherNotes)"
```

---

## Task 2: 상수 (연령대/진단명 시드) (기계적)

**Files:**
- Create: `frontend/src/constants/concern.ts`

- [ ] **Step 1: 상수 파일 생성**

진단명 시드는 **PM 22종**을 한글 저장값 + 검색용 aliases(영문·이칭) 구조로 둡니다. 저장값은 한글명.

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

// 진단명 배열 제약(MEL-55).
export const DIAGNOSIS_MAX_COUNT = 10;
export const DIAGNOSIS_MAX_LENGTH = 100;
export const OTHER_NOTES_MAX_LENGTH = 200;

// 진단명 시드(PM 제공 22종, 2026-05-27). name=저장값(한글), aliases=검색 인덱스(영문·이칭).
export interface DiagnosisSeed {
  name: string;
  aliases?: string[];
}

export const SEED_DIAGNOSES: DiagnosisSeed[] = [
  { name: '자폐스펙트럼장애', aliases: ['ASD', '오티즘', 'autism', '자폐증', '자폐성장애', '자폐'] },
  { name: '주의력결핍과잉행동장애', aliases: ['ADHD', 'AD'] },
  { name: '학습장애', aliases: ['LD'] },
  { name: '뇌병변장애', aliases: ['CP', '뇌성마비', '뇌병변'] },
  { name: '발달지연', aliases: ['DD'] },
  { name: '언어지연' },
  { name: '언어장애', aliases: ['SLD', 'SD'] },
  { name: '지적장애', aliases: ['ID', 'MR'] },
  { name: '경계선 지능', aliases: ['BIF', '경계선', '느린 학습자'] },
  { name: '틱 장애', aliases: ['tic disorder', '틱'] },
  { name: '뚜렛 증후군', aliases: ['tourette syndrome'] },
  { name: '뇌전증', aliases: ['epilepsy', '간질'] },
  { name: '다운증후군', aliases: ['down syndrome'] },
  { name: '사시', aliases: ['strabismus'] },
  { name: '취약 X 증후군', aliases: ['fragile X syndrome'] },
  { name: '레트 증후군', aliases: ['rett syndrome'] },
  { name: '윌리엄스 증후군', aliases: ['williams syndrome'] },
  { name: '엔젤만 증후군', aliases: ['angelman syndrome'] },
  { name: '선택적 함구증', aliases: ['selective mutism'] },
  { name: '연하장애', aliases: ['dysphagia', '삼킴장애'] },
  { name: '난독증', aliases: ['dyslexia', '난독'] },
  { name: '사회적 의사소통장애', aliases: ['SPCD', '사회성 떨어짐', '사회성 안좋음'] },
];
```

- [ ] **Step 2: 타입 체크**

Run: `cd frontend && npx tsc -b`
Expected: 에러 없음.

- [ ] **Step 3: 커밋**

```bash
git add frontend/src/constants/concern.ts
git commit -m "feat(concern): 연령대 칩·라벨·진단명 시드 22종(aliases)·배열 제약 상수 추가"
```

---

## Task 3: 작성 헬퍼 (기계적)

**Files:**
- Create: `frontend/src/api/concerns.ts`

> 변환 어댑터가 아니라 **flat PostCreateRequest를 조립해 createPost를 호출하는 얇은 의미 래퍼**입니다. 호출부(ConcernForm)는 `createConcern` 시그니처에만 의존합니다.

- [ ] **Step 1: 작성 헬퍼 생성**

`frontend/src/api/concerns.ts`:

```ts
import { createPost } from './posts';
import type { AgeGroup, PostDetail, TherapyArea, Visibility } from '../types/post';

// ConcernForm이 넘기는 입력. 고민 본문은 content로 전송된다.
export interface CreateConcernInput {
  content: string;
  therapyArea: TherapyArea;
  ageGroup: AgeGroup;
  diagnoses: string[];
  otherNotes?: string;
  visibility?: Visibility;
}

// flat PostCreateRequest 조립 → 기존 createPost. 백엔드 계약(MEL-55)이 Post와 1:1이라 변환 없음.
export async function createConcern(input: CreateConcernInput): Promise<PostDetail> {
  return createPost({
    content: input.content,
    postType: 'CONCERN_CARD',
    therapyArea: input.therapyArea,
    ageGroup: input.ageGroup,
    diagnoses: input.diagnoses,
    otherNotes: input.otherNotes?.trim() || undefined,
    visibility: input.visibility ?? 'PUBLIC',
  });
}
```

- [ ] **Step 2: 타입 체크**

Run: `cd frontend && npx tsc -b`
Expected: 에러 없음.

- [ ] **Step 3: 커밋**

```bash
git add frontend/src/api/concerns.ts
git commit -m "feat(concern): 작성 헬퍼 추가 — flat PostCreateRequest 조립"
```

---

## Task 4: ConcernCard 표시 컴포넌트 (B안) (기계적)

**Files:**
- Create: `frontend/src/components/post/ConcernCard.tsx`

> Post 필드를 직독합니다. 피드는 `contentPreview`, 상세는 `content`로 본문이 다르므로 `body` prop으로 받습니다. 마스킹: `diagnoses === null`이면 "치료사 인증 후 확인 가능", `otherNotes === null`이면 숨김(스펙 3.4).

- [ ] **Step 1: 컴포넌트 생성**

`frontend/src/components/post/ConcernCard.tsx`:

```tsx
import type { AgeGroup, TherapyArea } from '../../types/post';
import { AGE_GROUP_LABELS } from '../../constants/concern';
import { THERAPY_AREA_LABELS } from '../../constants/post';

interface ConcernCardProps {
  ageGroup?: AgeGroup;
  therapyArea?: TherapyArea;
  diagnoses?: string[] | null; // null = USER 마스킹
  otherNotes?: string | null;  // null = USER 마스킹
  body?: string;               // 고민 본문(피드=contentPreview, 상세=content)
  clamp?: boolean;             // 피드=true(line-clamp-3), 상세=false
}

export default function ConcernCard({
  ageGroup,
  therapyArea,
  diagnoses,
  otherNotes,
  body,
  clamp = false,
}: ConcernCardProps) {
  const masked = diagnoses === null;
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
          {ageGroup && (
            <div className="flex">
              <dt className="w-16 shrink-0 font-semibold text-gray-600">연령대</dt>
              <dd className="text-gray-700">{AGE_GROUP_LABELS[ageGroup] ?? '-'}</dd>
            </div>
          )}
          {therapyArea && (
            <div className="flex">
              <dt className="w-16 shrink-0 font-semibold text-gray-600">치료영역</dt>
              <dd className="text-gray-700">{THERAPY_AREA_LABELS[therapyArea] ?? '-'}</dd>
            </div>
          )}
          <div className="flex">
            <dt className="w-16 shrink-0 font-semibold text-gray-600">진단명</dt>
            <dd className="flex flex-wrap gap-1">
              {masked ? (
                <span className="text-xs text-gray-400">치료사 인증 후 확인 가능</span>
              ) : (
                (diagnoses ?? []).map((d) => (
                  <span key={d} className="bg-gray-100 text-gray-700 text-xs rounded-full px-2 py-0.5">
                    {d}
                  </span>
                ))
              )}
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
            {body}
          </p>
        </div>
        {otherNotes && (
          <p className="mt-2 text-xs text-gray-500 whitespace-pre-wrap break-words">
            {otherNotes}
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
git commit -m "feat(concern): 고민 카드 표시 컴포넌트 추가 — B안 + 마스킹 분기"
```

---

## Task 5: 읽기 경로 배선 (PostCard + PostDetailPage) (기계적)

**Files:**
- Modify: `frontend/src/components/post/PostCard.tsx`
- Modify: `frontend/src/pages/post/PostDetailPage.tsx`

> 먼저 grep으로 본문 렌더 분기 위치를 확인합니다. CONCERN_CARD 분기는 `accessLocked`(차단) 분기 **다음**, 일반 본문 분기 **앞**에 둡니다.

- [ ] **Step 1: PostCard에 import + 본문 분기**

`PostCard`의 본문 렌더에서 `accessLocked` 차단 분기 뒤에 CONCERN_CARD 분기를 추가:

```tsx
import ConcernCard from './ConcernCard';
```

```tsx
        ) : post.postType === 'CONCERN_CARD' ? (
          <ConcernCard
            ageGroup={post.ageGroup}
            therapyArea={post.therapyArea}
            diagnoses={post.diagnoses}
            otherNotes={post.otherNotes}
            body={post.contentPreview}
            clamp
          />
        ) : (
          <>
            {/* 기존 일반 본문(contentPreview + 더보기 + 이미지 + 첨부) 그대로 */}
          </>
        )}
```

(주: 기존 일반 본문 블록은 그대로 유지. CONCERN_CARD 분기만 그 앞에 삽입.)

- [ ] **Step 2: PostDetailPage에 import + 본문 분기**

`PostDetailPage`의 본문 삼항에서 `accessLocked` 분기 뒤에 추가:

```tsx
import ConcernCard from '../../components/post/ConcernCard';
```

```tsx
          ) : post.postType === 'CONCERN_CARD' ? (
            <ConcernCard
              ageGroup={post.ageGroup}
              therapyArea={post.therapyArea}
              diagnoses={post.diagnoses}
              otherNotes={post.otherNotes}
              body={post.content}
            />
          ) : (
            {/* 기존 일반 content 렌더 그대로 */}
          )}
```

- [ ] **Step 3: 상세 메타 중복 숨김 (CONCERN_CARD는 카드 안에 치료영역 표시)**

PostDetailPage에서 치료영역 라벨을 본문 위에 따로 표시하는 부분이 있으면, CONCERN_CARD일 때 숨깁니다(카드 메타와 중복 방지). grep `therapyLabel` 또는 치료영역 표시 위치 확인 후:

```tsx
          {therapyLabel && post.postType !== 'CONCERN_CARD' && (
```

- [ ] **Step 4: 타입 체크 + 린트**

Run: `cd frontend && npx tsc -b && npm run lint`
Expected: 에러 없음.

- [ ] **Step 5: 시각 확인(목 데이터)**

`npm run dev` 후, 임시로 한 게시글 객체에 `postType: 'CONCERN_CARD'` 와 `ageGroup`/`diagnoses`/`otherNotes` 목 데이터를 넣어 피드/상세에서 ConcernCard가 렌더되는지, `diagnoses: null`일 때 마스킹 문구가 뜨는지 확인(확인 후 임시 목 데이터 제거). 백엔드 미배포 상태에서는 이 시각 확인까지가 한계.

- [ ] **Step 6: 커밋**

```bash
git add frontend/src/components/post/PostCard.tsx frontend/src/pages/post/PostDetailPage.tsx
git commit -m "feat(concern): 피드/상세에서 CONCERN_CARD를 ConcernCard로 렌더"
```

---

## Task 6: DiagnosisTagInput (자동완성 태그) — 새 로직(본인 작성)

> 이 컴포넌트는 새 로직입니다. 아래 코드는 **참조 가이드**입니다. 먼저 pseudocode로 동작(입력→필터→후보 클릭/Enter 추가→✕ 제거→중복·최대개수·길이 가드)을 직접 설계한 뒤, 본인 구현과 대조하세요.

**Files:**
- Create: `frontend/src/components/post/DiagnosisTagInput.tsx`

- [ ] **Step 1: pseudocode 작성(본인)**

입력 상태 `input`, 부모가 소유한 `value: string[]`. 동작:
- `suggestions` = `input` 비어있지 않으면 `SEED_DIAGNOSES` 중 (name 또는 aliases가 `input` 포함) && name이 `value`에 없는 것 상위 6개. 표시·추가값은 **name(한글)**.
- `addTag(raw)`: trim, 빈 값 무시, 100자 초과 무시, 이미 있으면 무시, `value.length >= 10`이면 무시, 아니면 `onChange([...value, tag])` + 입력 비움.
- `removeTag(tag)`: `onChange(value.filter(t => t !== tag))`.
- Enter → addTag(input) + preventDefault. Backspace + 빈 입력 → 마지막 태그 제거.

- [ ] **Step 2: 구현(참조 가이드)**

```tsx
import { useState } from 'react';
import { X } from 'lucide-react';
import {
  SEED_DIAGNOSES,
  DIAGNOSIS_MAX_COUNT,
  DIAGNOSIS_MAX_LENGTH,
} from '../../constants/concern';

interface DiagnosisTagInputProps {
  value: string[];
  onChange: (next: string[]) => void;
  maxCount?: number;
}

export default function DiagnosisTagInput({
  value,
  onChange,
  maxCount = DIAGNOSIS_MAX_COUNT,
}: DiagnosisTagInputProps) {
  const [input, setInput] = useState('');

  const q = input.trim().toLowerCase();
  const suggestions = q
    ? SEED_DIAGNOSES.filter(
        (d) =>
          !value.includes(d.name) &&
          (d.name.toLowerCase().includes(q) ||
            (d.aliases ?? []).some((a) => a.toLowerCase().includes(q))),
      )
        .map((d) => d.name)
        .slice(0, 6)
    : [];

  function addTag(raw: string) {
    const tag = raw.trim();
    if (
      !tag ||
      tag.length > DIAGNOSIS_MAX_LENGTH ||
      value.includes(tag) ||
      value.length >= maxCount
    ) {
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
          maxLength={DIAGNOSIS_MAX_LENGTH}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addTag(input);
            } else if (e.key === 'Backspace' && !input && value.length) {
              removeTag(value[value.length - 1]);
            }
          }}
          placeholder={atMax ? '최대 10개까지 입력 가능' : '진단명 입력 후 Enter'}
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
git commit -m "feat(concern): 진단명 자동완성+자유입력 태그 — aliases 검색, 최대 10개·100자 가드"
```

---

## Task 7: ConcernForm (작성 폼) — 새 로직(본인 작성)

> 새 로직입니다. 아래는 **참조 가이드**. PostWriteForm(`frontend/src/components/post/PostWriteForm.tsx`)의 헤더/푸터(공개범위) 구조를 그대로 본떠, 본문만 고민 카드 필드로 바꾼 형태입니다. 제출 시 `createConcern` 호출. pseudocode(필수 검증: content/ageGroup/therapyArea/diagnoses≥1)부터 본인 설계 후 대조하세요.

**Files:**
- Create: `frontend/src/components/post/ConcernForm.tsx`

- [ ] **Step 1: pseudocode 작성(본인)**

상태: `content`, `ageGroup: AgeGroup | null`, `therapyArea: TherapyArea | null`, `diagnoses: string[]`, `otherNotes`, `visibility`, `submitting`, `error`.
- `canSubmit` = content.trim() 있음 && ageGroup && therapyArea && diagnoses.length>0 && !submitting.
- `handleSubmit`: createConcern({ content, therapyArea, ageGroup, diagnoses, otherNotes: otherNotes||undefined, visibility: toApiVisibility(visibility) }) → trackEvent('post_created') → onSuccess(post.id).
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
import { AGE_GROUP_CHIPS, OTHER_NOTES_MAX_LENGTH } from '../../constants/concern';
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

  const [content, setContent] = useState('');
  const [ageGroup, setAgeGroup] = useState<AgeGroup | null>(null);
  const [therapyArea, setTherapyArea] = useState<TherapyArea | null>(null);
  const [diagnoses, setDiagnoses] = useState<string[]>([]);
  const [otherNotes, setOtherNotes] = useState('');
  const [visibility] = useState<UIVisibility>('PUBLIC');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit =
    content.trim().length > 0 &&
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
        content,
        therapyArea,
        ageGroup,
        diagnoses,
        otherNotes: otherNotes.trim() || undefined,
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

        {/* 고민(본문) → content */}
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-gray-600">고민</span>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
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

        {/* 기타 — 선택, 200자 */}
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-gray-600">
            기타 <span className="text-[10px] text-gray-400">선택</span>
          </span>
          <textarea
            value={otherNotes}
            onChange={(e) => setOtherNotes(e.target.value)}
            rows={2}
            maxLength={OTHER_NOTES_MAX_LENGTH}
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
git commit -m "feat(concern): 고민 카드 작성 폼 추가 — 필수 검증, 무채색 칩, 기타 200자"
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

`PostWriteForm.tsx`에 `WriteTypeToggle` import 추가, `PostWriteFormProps`(현재 `:35-42`)에 옵셔널 props 추가:

```tsx
import WriteTypeToggle from './WriteTypeToggle';
```

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

`PostWriteForm.tsx:164` 의 `<h1 ...>새 시그널</h1>` 를 다음으로 교체:

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

`useState` import, `ConcernForm` import 추가, 컴포넌트 상단에 모드 상태 추가:

```tsx
import { useEffect, useState } from 'react';
import ConcernForm from './ConcernForm';
```

```tsx
  const [mode, setMode] = useState<'post' | 'concern'>('post');
```

`<PostWriteForm variant="modal" onClose={closeModal} onSuccess={handleSuccess} />` 를 다음으로 교체:

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

`frontend/src/pages/post/PostCreatePage.tsx` 전체를 다음으로 교체(현재 useScreenExit/navigate 구조 유지 확인 후):

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
- PC: 글쓰기 모달에서 헤더 토글로 "고민 카드" 전환 → 폼 필드(고민/연령대/치료영역/진단명/기타) 표시, 칩 무채색, 진단명 자동완성(한글·영문·이칭 검색) 동작 확인.
- 모바일 뷰포트: `/posts/create` 페이지에서 동일 확인.
- 필수 미입력 시 작성 아이콘(✏️) 비활성 확인.

- [ ] **Step 5: 커밋**

```bash
git add frontend/src/components/post/PostWriteModal.tsx frontend/src/pages/post/PostCreatePage.tsx
git commit -m "feat(concern): 작성 모달/페이지에 일반·고민 카드 토글 배선"
```

---

## Task 10: 백엔드 연동 검증 (staging) — 백엔드 배포 후

> 백엔드 배포(MEL-54 main 머지) 전에는 수행 불가. 배포 시 진행.

- [ ] **Step 1: 작성 왕복 확인**

고민 카드 작성 → staging 응답이 `postType: 'CONCERN_CARD'` + flat 필드로 내려오는지, `createConcern`이 그대로 통하는지 확인. (변환 어댑터 없음 — 실패 시 `api/concerns.ts`에서 흡수)

- [ ] **Step 2: 읽기 응답 형태 확인**

피드(`/posts/feed`)·상세(`/posts/:id`) 응답에 `ageGroup`/`diagnoses`/`otherNotes`가 스펙대로 내려오는지, USER 롤에서 `diagnoses`/`otherNotes`가 `null`로 마스킹되는지 staging에서 확인. `content` 평문/HTML 여부 + 상세 렌더 정합 확인.

- [ ] **Step 3: E2E 체크리스트(staging)**

- [ ] 고민 카드 작성 → 저장 성공
- [ ] 홈피드에 일반 글과 함께 카드로 노출(고민 line-clamp)
- [ ] 카드 클릭 → 상세 진입, 고민 전체 노출
- [ ] THERAPIST 계정: 진단명/기타 정상 노출
- [ ] USER 계정: 진단명 "치료사 인증 후 확인 가능" + 기타 숨김
- [ ] 댓글/리액션/스크랩 기존대로 동작
- [ ] 진단명 자동완성(목록) + 자유 입력 모두 저장 확인

- [ ] **Step 4: 커밋(필요 시)**

```bash
git add frontend/src/api/concerns.ts
git commit -m "fix(concern): 백엔드 배포 응답에 맞춰 작성/읽기 매핑 보정"
```

---

## Self-Review 결과 (2026-05-28 정정본)

- **Spec coverage**: 데이터 모델 flat(Task 1), 진단명 시드 22종/자동완성(Task 2·6), 작성 모달/토글/필드(Task 7·8·9), 표시 B안+마스킹(Task 4·5), 작성 헬퍼(Task 3), staging 검증+마스킹(Task 10) — 스펙 각 절 대응.
- **아키텍처 일관성**: flat 직결. `Concern` 중첩 타입/변환 어댑터 없음. ConcernCard는 Post 필드 직독(`ageGroup`/`diagnoses`/`otherNotes`/`body`), 마스킹은 `diagnoses === null`로 판정.
- **Type consistency**: `PostType`에 `CONCERN_CARD`, `PostCreateRequest`/`PostUpdateRequest`/`PostSummary`/`PostDetail` flat 필드, `createConcern(input: CreateConcernInput)`, `DiagnosisTagInput({value,onChange,maxCount})`, `WriteTypeToggle({mode,onChange})`, 폼 props(`mode`/`onModeChange`) 일치.
- **제약 반영**: 진단명 최대 10·각 100자, 기타 200자, UNSPECIFIED 제외.
- **알려진 미결**: 백엔드 배포 시점(Task 10 게이트), `content` 평문/HTML 정합(Task 10 Step 2), 피드 `postType` 필터 탭은 후속 백로그.
