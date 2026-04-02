# Figma UI Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 피그마 와이어프레임 기반으로 프론트엔드 UI를 일괄 수정 — ReactionBar 3종, VerifiedBadge, SimpleTextEditor 도입, SearchPage 신설, ProfilePage 리뉴얼, 라우팅 가드 변경

**Architecture:** 공통 컴포넌트 3개를 먼저 생성한 뒤 각 페이지에 적용. PostCreate/EditPage에서 TipTap을 SimpleTextEditor로 교체하고 title/AgeGroup을 제거. MyPage를 ProfilePage로 전면 교체. 라우트 가드를 ProtectedRoute→AuthRoute로 변경하여 게시물 열람 조건 완화.

**Tech Stack:** React 19, TypeScript, Tailwind CSS, Zustand, React Router, Lucide Icons, shadcn/ui

---

## File Map

### 신규 생성
| 파일 | 역할 |
|------|------|
| `src/components/ReactionBar.tsx` | 3종 리액션 (EMPATHY/APPRECIATE/HELPFUL) 토글 + 카운트 |
| `src/components/VerifiedBadge.tsx` | 닉네임 옆 인증 텍스트 배지 |
| `src/components/SimpleTextEditor.tsx` | textarea + 글자수 카운트 (TipTap 대체) |
| `src/pages/SearchPage.tsx` | `/search` 검색 페이지 |
| `src/pages/ProfilePage.tsx` | 프로필 페이지 (MyPage 대체) |

### 수정
| 파일 | 변경 내용 |
|------|----------|
| `src/pages/PostCreatePage.tsx` | title/AgeGroup 제거, SimpleTextEditor 적용, 하단 레이아웃 변경 |
| `src/pages/PostEditPage.tsx` | PostCreatePage와 동일 변경 |
| `src/pages/PostDetailPage.tsx` | ReactionBar 3종 교체, VerifiedBadge 추가 |
| `src/components/PostCard.tsx` | ReactionBar 추가, VerifiedBadge 추출 |
| `src/components/Layout.tsx` | 모바일 헤더에 검색 아이콘 추가, 텍스트 변경 |
| `src/App.tsx` | 라우트 가드 변경, SearchPage/ProfilePage 추가 |
| `src/constants/post.ts` | AGE_CHIPS 제거 |
| `src/types/post.ts` | PostCreateRequest에서 ageGroup 제거 |

### 삭제
| 파일 | 이유 |
|------|------|
| `src/components/RichTextEditor.tsx` | SimpleTextEditor로 대체 |
| `src/pages/MyPage.tsx` | ProfilePage로 대체 |
| TipTap 패키지 3개 | `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-placeholder` |

---

## Task 1: VerifiedBadge 공통 컴포넌트 생성

**Files:**
- Create: `src/components/VerifiedBadge.tsx`

- [ ] **Step 1: VerifiedBadge 컴포넌트 생성**

```tsx
// src/components/VerifiedBadge.tsx
interface VerifiedBadgeProps {
  status?: 'NOT_REQUESTED' | 'PENDING' | 'APPROVED' | 'REJECTED';
}

export default function VerifiedBadge({ status }: VerifiedBadgeProps) {
  if (status !== 'APPROVED') return null;

  return (
    <span className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-900 text-[10px] font-medium leading-tight">
      인증
    </span>
  );
}
```

- [ ] **Step 2: 빌드 확인**

Run: `cd /home/jin24/my-project/frontend && npx tsc -b`
Expected: 에러 없이 통과

- [ ] **Step 3: Commit**

```bash
git add src/components/VerifiedBadge.tsx
git commit -m "feat: VerifiedBadge 공통 컴포넌트 생성"
```

---

## Task 2: ReactionBar 공통 컴포넌트 생성

**Files:**
- Create: `src/components/ReactionBar.tsx`

- [ ] **Step 1: ReactionBar 컴포넌트 생성**

```tsx
// src/components/ReactionBar.tsx
import { Heart, Star, Lightbulb } from 'lucide-react';
import type { ReactionType, PostReaction } from '../types/post';

const REACTIONS: {
  type: ReactionType;
  icon: typeof Heart;
  label: string;
  countKey: keyof Pick<PostReaction, 'empathyCount' | 'appreciateCount' | 'helpfulCount'>;
}[] = [
  { type: 'EMPATHY', icon: Heart, label: '공감', countKey: 'empathyCount' },
  { type: 'APPRECIATE', icon: Star, label: '감사', countKey: 'appreciateCount' },
  { type: 'HELPFUL', icon: Lightbulb, label: '도움', countKey: 'helpfulCount' },
];

interface ReactionBarProps {
  reaction: PostReaction | null;
  onToggle: (type: ReactionType) => void;
  disabled?: boolean;
}

export default function ReactionBar({ reaction, onToggle, disabled }: ReactionBarProps) {
  return (
    <div className="flex items-center gap-4">
      {REACTIONS.map(({ type, icon: Icon, label, countKey }) => {
        const isActive = reaction?.myReactionType === type;
        const count = reaction?.[countKey] ?? 0;

        return (
          <button
            key={type}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggle(type);
            }}
            disabled={disabled}
            className={`flex items-center gap-1 text-sm transition-colors ${
              isActive ? 'text-red-500' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <Icon size={16} fill={isActive ? 'currentColor' : 'none'} />
            <span className="text-xs">{count > 0 ? count : label}</span>
          </button>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: 빌드 확인**

Run: `cd /home/jin24/my-project/frontend && npx tsc -b`
Expected: 에러 없이 통과

- [ ] **Step 3: Commit**

```bash
git add src/components/ReactionBar.tsx
git commit -m "feat: ReactionBar 3종 리액션 공통 컴포넌트 생성"
```

---

## Task 3: SimpleTextEditor 공통 컴포넌트 생성

**Files:**
- Create: `src/components/SimpleTextEditor.tsx`

- [ ] **Step 1: SimpleTextEditor 컴포넌트 생성**

```tsx
// src/components/SimpleTextEditor.tsx
interface SimpleTextEditorProps {
  content: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
}

export default function SimpleTextEditor({
  content,
  onChange,
  placeholder = '내용을 입력해주세요',
  maxLength = 2000,
}: SimpleTextEditorProps) {
  return (
    <div className="flex flex-col gap-1">
      <textarea
        value={content}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        rows={12}
        className="w-full resize-none rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
      />
      <p className="text-xs text-gray-400 text-right">
        {content.length}/{maxLength}
      </p>
    </div>
  );
}
```

- [ ] **Step 2: 빌드 확인**

Run: `cd /home/jin24/my-project/frontend && npx tsc -b`
Expected: 에러 없이 통과

- [ ] **Step 3: Commit**

```bash
git add src/components/SimpleTextEditor.tsx
git commit -m "feat: SimpleTextEditor 컴포넌트 생성 — TipTap 대체"
```

---

## Task 4: PostCreatePage 수정

**Files:**
- Modify: `src/pages/PostCreatePage.tsx`
- Modify: `src/types/post.ts` (PostCreateRequest에서 ageGroup 제거)

- [ ] **Step 1: PostCreateRequest 타입에서 ageGroup 제거**

`src/types/post.ts`에서 `PostCreateRequest` 수정:

```typescript
export interface PostCreateRequest {
  title: string;
  content: string;
  postType: string;
  therapyArea: TherapyArea;
}
```

- [ ] **Step 2: PostCreatePage 전면 교체**

`src/pages/PostCreatePage.tsx`를 다음으로 교체:

```tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Paperclip } from 'lucide-react';
import SimpleTextEditor from '../components/SimpleTextEditor';
import { createPost } from '../api/posts';
import type { TherapyArea } from '../types/post';
import { THERAPY_CHIPS } from '../constants/post';

export default function PostCreatePage() {
  const navigate = useNavigate();

  const [content, setContent] = useState('');
  const [therapyArea, setTherapyArea] = useState<TherapyArea>('UNSPECIFIED');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = content.trim().length > 0 && !submitting;

  async function handleSubmit() {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      const post = await createPost({
        title: '',
        content,
        postType: 'COMMUNITY',
        therapyArea,
      });
      navigate(`/posts/${post.id}`);
    } catch {
      setError('게시글 작성에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 pb-20 md:pb-8">
      {/* 헤더 */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-1 text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold text-gray-900">글쓰기</h1>
      </div>

      <div className="flex flex-col gap-6">
        {/* 치료영역 칩 */}
        <div className="flex flex-wrap gap-2">
          {THERAPY_CHIPS.map((chip) => (
            <button
              key={chip.value}
              type="button"
              onClick={() => setTherapyArea(chip.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                therapyArea === chip.value
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* 내용 */}
        <SimpleTextEditor
          content={content}
          onChange={setContent}
          placeholder="내용을 입력해주세요"
        />

        {error && <p className="text-sm text-red-500">{error}</p>}

        {/* 하단: 첨부 아이콘 + 게시 버튼 */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-200">
          <button
            type="button"
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Paperclip size={20} />
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="px-6 py-2.5 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {submitting ? '등록 중...' : '게시 하기'}
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: 빌드 확인**

Run: `cd /home/jin24/my-project/frontend && npx tsc -b`
Expected: 에러 없이 통과

- [ ] **Step 4: Commit**

```bash
git add src/pages/PostCreatePage.tsx src/types/post.ts
git commit -m "feat: PostCreatePage — title/AgeGroup 제거, SimpleTextEditor 적용, 하단 레이아웃 변경"
```

---

## Task 5: PostEditPage 수정

**Files:**
- Modify: `src/pages/PostEditPage.tsx`

- [ ] **Step 1: PostEditPage 전면 교체**

`src/pages/PostEditPage.tsx`를 다음으로 교체:

```tsx
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Paperclip } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import SimpleTextEditor from '../components/SimpleTextEditor';
import { fetchPost, updatePost } from '../api/posts';
import type { TherapyArea } from '../types/post';
import { THERAPY_CHIPS } from '../constants/post';

export default function PostEditPage() {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();

  const [content, setContent] = useState('');
  const [therapyArea, setTherapyArea] = useState<TherapyArea>('UNSPECIFIED');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!postId || isNaN(Number(postId))) {
      setError('게시글을 찾을 수 없어요.');
      setLoading(false);
      return;
    }
    fetchPost(Number(postId))
      .then((post) => {
        setContent(post.content);
        setTherapyArea(post.therapyArea ?? 'UNSPECIFIED');
      })
      .catch(() => setError('게시글을 불러오는 데 실패했습니다.'))
      .finally(() => setLoading(false));
  }, [postId]);

  const canSubmit = content.trim().length > 0 && !submitting;

  async function handleSubmit() {
    if (!postId || !canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      await updatePost(Number(postId), {
        content,
        ...(therapyArea !== 'UNSPECIFIED' ? { therapyArea } : {}),
      });
      navigate(`/posts/${postId}`);
    } catch {
      setError('게시글 수정에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setSubmitting(false);
    }
  }

  if (!loading && error)
    return <p className="text-center text-destructive py-20">{error}</p>;

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-6">
        <Skeleton className="h-7 w-24 mb-8" />
        <div className="flex flex-col gap-6">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 pb-20 md:pb-8">
      {/* 헤더 */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-1 text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold text-gray-900">글 수정</h1>
      </div>

      <div className="flex flex-col gap-6">
        {/* 치료영역 칩 */}
        <div className="flex flex-wrap gap-2">
          {THERAPY_CHIPS.map((chip) => (
            <button
              key={chip.value}
              type="button"
              onClick={() => setTherapyArea(chip.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                therapyArea === chip.value
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* 내용 */}
        <SimpleTextEditor
          content={content}
          onChange={setContent}
          placeholder="내용을 입력해주세요"
        />

        {error && <p className="text-sm text-red-500">{error}</p>}

        {/* 하단: 첨부 아이콘 + 게시 버튼 */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-200">
          <button
            type="button"
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Paperclip size={20} />
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="px-6 py-2.5 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {submitting ? '수정 중...' : '게시 하기'}
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 빌드 확인**

Run: `cd /home/jin24/my-project/frontend && npx tsc -b`
Expected: 에러 없이 통과

- [ ] **Step 3: Commit**

```bash
git add src/pages/PostEditPage.tsx
git commit -m "feat: PostEditPage — title/AgeGroup 제거, SimpleTextEditor 적용"
```

---

## Task 6: PostCard에 ReactionBar 적용 + VerifiedBadge 교체

**Files:**
- Modify: `src/components/PostCard.tsx`

- [ ] **Step 1: PostCard 수정**

`src/components/PostCard.tsx`를 다음으로 교체:

```tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, MessageCircle, Eye } from 'lucide-react';
import type { PostSummary, PostReaction, ReactionType } from '../types/post';
import { THERAPY_AREA_LABELS } from '../constants/post';
import { formatRelativeTime } from '../utils/formatDate';
import VerifiedBadge from './VerifiedBadge';
import ReactionBar from './ReactionBar';
import { toggleReaction } from '../api/posts';

// 목데이터 — 백엔드 태그 필드 구현 전까지 사용
const MOCK_HASHTAGS: Record<string, string[]> = {};

interface PostCardProps {
  post: PostSummary;
}

function ProfileAvatar({
  nickname,
  imageUrl,
}: {
  nickname: string;
  imageUrl?: string | null;
}) {
  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={nickname}
        className="w-5 h-5 rounded-full object-cover"
      />
    );
  }
  return (
    <div className="w-5 h-5 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center">
      <span className="text-white text-[8px] font-medium">{nickname[0]}</span>
    </div>
  );
}

export default function PostCard({ post }: PostCardProps) {
  const therapyLabel =
    post.therapyArea && post.therapyArea !== 'UNSPECIFIED'
      ? THERAPY_AREA_LABELS[post.therapyArea]
      : null;

  const hashtags = MOCK_HASHTAGS[post.id] ?? (therapyLabel ? [`#${therapyLabel}`] : []);

  // 리액션 로컬 상태 (목데이터 — 백엔드 API 반환값으로 교체 예정)
  const [reaction, setReaction] = useState<PostReaction>({
    postId: post.id,
    empathyCount: 0,
    appreciateCount: 0,
    helpfulCount: 0,
    myReactionType: null,
  });
  const [toggling, setToggling] = useState(false);

  async function handleToggle(type: ReactionType) {
    if (toggling) return;
    setToggling(true);

    const wasActive = reaction.myReactionType === type;
    const countKey = type === 'EMPATHY' ? 'empathyCount' : type === 'APPRECIATE' ? 'appreciateCount' : 'helpfulCount';

    // 낙관적 업데이트
    const prev = { ...reaction };
    setReaction({
      ...reaction,
      myReactionType: wasActive ? null : type,
      [countKey]: reaction[countKey] + (wasActive ? -1 : 1),
      // 이전 리액션이 있었고 다른 타입으로 변경 시 이전 카운트 감소
      ...(reaction.myReactionType && !wasActive && reaction.myReactionType !== type
        ? {
            [reaction.myReactionType === 'EMPATHY' ? 'empathyCount' : reaction.myReactionType === 'APPRECIATE' ? 'appreciateCount' : 'helpfulCount']:
              reaction[reaction.myReactionType === 'EMPATHY' ? 'empathyCount' : reaction.myReactionType === 'APPRECIATE' ? 'appreciateCount' : 'helpfulCount'] - 1,
          }
        : {}),
    });

    try {
      await toggleReaction(post.id, type);
    } catch {
      setReaction(prev);
    } finally {
      setToggling(false);
    }
  }

  return (
    <Link to={`/posts/${post.id}`} className="block">
      <div className="px-6 py-5 border-b border-gray-200">
        {/* 1행: 프로필 + 닉네임 + 인증뱃지 + 시간 + 북마크 */}
        <div className="flex items-center gap-1.5 mb-2.5">
          <ProfileAvatar
            nickname={post.authorNickname}
            imageUrl={post.authorProfileImageUrl}
          />
          <span className="text-sm font-medium text-neutral-950">
            {post.authorNickname}
          </span>
          <VerifiedBadge status={post.authorVerificationStatus} />
          <span className="text-[11px] text-gray-500">
            {formatRelativeTime(post.createdAt)}
          </span>
          <button
            onClick={(e) => {
              e.preventDefault();
              // TODO: 스크랩 API 연동
            }}
            className="ml-auto text-gray-400 hover:text-gray-600"
          >
            <Bookmark size={16} />
          </button>
        </div>

        {/* 2행: 해시태그 */}
        {hashtags.length > 0 && (
          <div className="flex gap-2 mb-2.5">
            {hashtags.map((tag) => (
              <span
                key={tag}
                className="px-1.5 py-0.5 rounded-full border border-gray-900 text-[11px] font-medium text-gray-900"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* 3행: 본문 미리보기 또는 블러 */}
        {post.isBlurred ? (
          <div className="bg-stone-50 rounded-lg py-6 px-4 mb-2.5">
            <p className="text-center text-gray-600 text-xs">
              인증된 회원에게만 공개된 게시물입니다.
            </p>
          </div>
        ) : (
          <p className="text-sm text-gray-600 leading-5 line-clamp-3 mb-2.5">
            {post.contentPreview}
          </p>
        )}

        {/* 4행: 첨부파일 */}
        {post.hasAttachment && (
          <p className="text-[10px] text-gray-900 mb-2.5">첨부파일 있음</p>
        )}

        {/* 5행: 리액션 + 댓글 수 + 조회수 */}
        <div className="flex items-center gap-3 text-gray-500">
          <ReactionBar
            reaction={reaction}
            onToggle={handleToggle}
            disabled={toggling}
          />
          <span className="flex items-center gap-1 text-xs font-medium ml-auto">
            <MessageCircle size={14} />
            {post.commentCount ?? 0}
          </span>
          <span className="flex items-center gap-1 text-xs font-medium">
            <Eye size={14} />
            {post.viewCount}
          </span>
        </div>
      </div>
    </Link>
  );
}
```

- [ ] **Step 2: 빌드 확인**

Run: `cd /home/jin24/my-project/frontend && npx tsc -b`
Expected: 에러 없이 통과

- [ ] **Step 3: Commit**

```bash
git add src/components/PostCard.tsx
git commit -m "feat: PostCard — ReactionBar 3종 + VerifiedBadge 적용"
```

---

## Task 7: PostDetailPage에 ReactionBar + VerifiedBadge 적용

**Files:**
- Modify: `src/pages/PostDetailPage.tsx`

- [ ] **Step 1: import 변경**

기존 import에서 `Heart` 제거, 새 컴포넌트 import 추가:

```tsx
// 제거: Heart
import {
  Eye,
  MessageSquare,
  ArrowLeft,
  MoreVertical,
  Pencil,
  Trash2,
} from 'lucide-react';

// 추가
import ReactionBar from '../components/ReactionBar';
import VerifiedBadge from '../components/VerifiedBadge';
import { getReaction, toggleReaction } from '../api/posts';
import type { PostDetail, CommentResponse, PostReaction, ReactionType } from '../types/post';
```

- [ ] **Step 2: 리액션 상태를 PostReaction 기반으로 교체**

기존 `liked`, `likeCount`, `liking` 상태를 제거하고 다음으로 교체:

```tsx
const [reaction, setReaction] = useState<PostReaction | null>(null);
const [toggling, setToggling] = useState(false);
```

`useEffect` 안에서 `getReaction` 호출 추가:

```tsx
useEffect(() => {
  if (!postId || isNaN(Number(postId))) {
    setError('게시글을 찾을 수 없어요.');
    setLoading(false);
    return;
  }
  const id = Number(postId);
  Promise.all([fetchPost(id), fetchComments(id), getReaction(id)])
    .then(([postData, commentsData, reactionData]) => {
      setPost(postData);
      setComments(commentsData);
      setReaction(reactionData);
    })
    .catch(() => setError('게시글을 불러오는 데 실패했습니다.'))
    .finally(() => setLoading(false));
}, [postId]);
```

- [ ] **Step 3: handleToggleLike → handleToggleReaction 교체**

기존 `handleToggleLike` 제거, 다음으로 교체:

```tsx
async function handleToggleReaction(type: ReactionType) {
  if (!post || toggling || !reaction) return;
  setToggling(true);

  const wasActive = reaction.myReactionType === type;
  const countKey = type === 'EMPATHY' ? 'empathyCount' : type === 'APPRECIATE' ? 'appreciateCount' : 'helpfulCount';

  const prev = { ...reaction };
  setReaction({
    ...reaction,
    myReactionType: wasActive ? null : type,
    [countKey]: reaction[countKey] + (wasActive ? -1 : 1),
    ...(reaction.myReactionType && !wasActive && reaction.myReactionType !== type
      ? {
          [reaction.myReactionType === 'EMPATHY' ? 'empathyCount' : reaction.myReactionType === 'APPRECIATE' ? 'appreciateCount' : 'helpfulCount']:
            reaction[reaction.myReactionType === 'EMPATHY' ? 'empathyCount' : reaction.myReactionType === 'APPRECIATE' ? 'appreciateCount' : 'helpfulCount'] - 1,
        }
      : {}),
  });

  try {
    await toggleReaction(post.id, type);
  } catch {
    setReaction(prev);
  } finally {
    setToggling(false);
  }
}
```

- [ ] **Step 4: 작성자 정보에 VerifiedBadge 추가**

작성자 닉네임 뒤에 VerifiedBadge 추가 (PostDetail 타입에 authorVerificationStatus가 없으므로 임시 미표시 — 백엔드 필드 추가 후 활성화):

```tsx
<span className="text-sm font-semibold text-gray-900">
  {post.authorNickname}
</span>
{/* TODO: PostDetail에 authorVerificationStatus 필드 추가 후 활성화 */}
```

- [ ] **Step 5: 좋아요/댓글 영역을 ReactionBar로 교체**

기존 좋아요 버튼 + 댓글 수 영역을:

```tsx
{/* 리액션 + 댓글 수 */}
<div className="flex items-center gap-4 pt-4 border-t border-gray-100">
  <ReactionBar
    reaction={reaction}
    onToggle={handleToggleReaction}
    disabled={toggling}
  />
  <span className="flex items-center gap-1.5 text-sm text-gray-400 ml-auto">
    <MessageSquare size={16} />
    댓글 {comments.length}
  </span>
</div>
```

- [ ] **Step 6: 빌드 확인**

Run: `cd /home/jin24/my-project/frontend && npx tsc -b`
Expected: 에러 없이 통과

- [ ] **Step 7: Commit**

```bash
git add src/pages/PostDetailPage.tsx
git commit -m "feat: PostDetailPage — ReactionBar 3종 교체, VerifiedBadge 추가"
```

---

## Task 8: SearchPage 신설

**Files:**
- Create: `src/pages/SearchPage.tsx`

- [ ] **Step 1: SearchPage 컴포넌트 생성**

```tsx
// src/pages/SearchPage.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search } from 'lucide-react';
import PostCard from '../components/PostCard';
import { fetchPosts } from '../api/posts';
import type { TherapyArea, PostSummary } from '../types/post';

const FILTER_CHIPS: { value: TherapyArea | ''; label: string }[] = [
  { value: '', label: '전체' },
  { value: 'OCCUPATIONAL', label: '작업치료' },
  { value: 'SPEECH', label: '언어치료' },
  { value: 'PLAY', label: '놀이치료' },
  { value: 'COGNITIVE', label: '인지치료' },
];

export default function SearchPage() {
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [therapyArea, setTherapyArea] = useState<TherapyArea | ''>('');
  const [results, setResults] = useState<PostSummary[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function handleSearch() {
    if (!query.trim() && !therapyArea) return;
    setLoading(true);
    setSearched(true);
    try {
      const data = await fetchPosts({
        ...(therapyArea ? { therapyArea } : {}),
      });
      // 클라이언트 사이드 텍스트 필터 (백엔드 검색 API 없음)
      const filtered = query.trim()
        ? data.posts.filter(
            (p) =>
              p.contentPreview?.includes(query) ||
              p.authorNickname.includes(query),
          )
        : data.posts;
      setResults(filtered);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleSearch();
  }

  return (
    <div className="pb-20 md:pb-8">
      {/* 검색 헤더 */}
      <div className="sticky top-14 z-40 bg-white border-b border-gray-200">
        <div className="flex items-center gap-2 px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            className="p-1 text-gray-500 hover:text-gray-900 transition-colors shrink-0"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1 flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="검색어를 입력하세요"
              className="flex-1 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 outline-none"
              autoFocus
            />
            <button
              onClick={handleSearch}
              className="text-gray-500 hover:text-gray-900 transition-colors shrink-0"
            >
              <Search size={18} />
            </button>
          </div>
        </div>

        {/* 필터 칩 */}
        <div className="flex items-center gap-2 px-4 py-2 overflow-x-auto scrollbar-hide">
          {FILTER_CHIPS.map((chip) => (
            <button
              key={chip.value}
              onClick={() => setTherapyArea(chip.value)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                therapyArea === chip.value
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-neutral-950 border border-gray-200'
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* 검색 결과 */}
      <div className="bg-white">
        {loading && (
          <p className="text-center text-gray-400 text-sm py-12">검색 중...</p>
        )}

        {!loading && searched && results?.length === 0 && (
          <p className="text-center text-gray-400 text-sm py-12">
            검색 결과가 없습니다
          </p>
        )}

        {!loading &&
          results?.map((post) => <PostCard key={post.id} post={post} />)}

        {!searched && !loading && (
          <p className="text-center text-gray-400 text-sm py-12">
            검색어를 입력하고 돋보기 버튼을 눌러주세요
          </p>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 빌드 확인**

Run: `cd /home/jin24/my-project/frontend && npx tsc -b`
Expected: 에러 없이 통과

- [ ] **Step 3: Commit**

```bash
git add src/pages/SearchPage.tsx
git commit -m "feat: SearchPage 신설 — /search 라우트, 필터 칩 + 검색 결과"
```

---

## Task 9: ProfilePage 생성 (MyPage 대체)

**Files:**
- Create: `src/pages/ProfilePage.tsx`

- [ ] **Step 1: ProfilePage 컴포넌트 생성**

```tsx
// src/pages/ProfilePage.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import PostCard from '../components/PostCard';
import { fetchMyPosts, fetchMyActivity } from '../api/mypage';
import { useAuthStore } from '../stores/useAuthStore';
import type { MyActivity } from '../types/mypage';
import type { PostSummary } from '../types/post';

type Tab = 'posts' | 'commented' | 'scrapped';

const TABS: { key: Tab; label: string }[] = [
  { key: 'posts', label: '내가 쓴 글' },
  { key: 'commented', label: '답글 단 글' },
  { key: 'scrapped', label: '스크랩' },
];

export default function ProfilePage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const [activeTab, setActiveTab] = useState<Tab>('posts');
  const [myPosts, setMyPosts] = useState<PostSummary[] | null>(null);
  const [activity, setActivity] = useState<MyActivity | null>(null);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [loadingActivity, setLoadingActivity] = useState(false);
  const [errorPosts, setErrorPosts] = useState(false);
  const [errorActivity, setErrorActivity] = useState(false);

  function loadPosts() {
    setErrorPosts(false);
    setLoadingPosts(true);
    fetchMyPosts()
      .then(setMyPosts)
      .catch(() => setErrorPosts(true))
      .finally(() => setLoadingPosts(false));
  }

  function loadActivity() {
    setErrorActivity(false);
    setLoadingActivity(true);
    fetchMyActivity()
      .then(setActivity)
      .catch(() => setErrorActivity(true))
      .finally(() => setLoadingActivity(false));
  }

  useEffect(() => {
    if (activeTab === 'posts' && !myPosts) loadPosts();
    if ((activeTab === 'commented' || activeTab === 'scrapped') && !activity)
      loadActivity();
  }, [activeTab]);

  const isVerified =
    user?.therapistVerification?.status === 'APPROVED';

  const commentedPosts = activity?.commentedPosts ?? [];
  const scrappedPosts = activity?.scrappedPosts ?? [];

  return (
    <div className="pb-20 md:pb-8">
      {/* 프로필 헤더 */}
      <div className="px-6 py-6 bg-white border-b border-gray-200">
        <div className="flex items-center gap-4">
          {/* 아바타 */}
          {user?.profileImageUrl ? (
            <img
              src={user.profileImageUrl}
              alt={user.nickname}
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-purple-300 flex items-center justify-center text-white text-2xl font-bold shrink-0">
              {user?.nickname?.[0] ?? '?'}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg font-bold text-gray-900">
                {user?.nickname}
              </span>
              {isVerified ? (
                <span className="px-2 py-0.5 rounded-full bg-green-50 text-green-700 text-xs font-medium">
                  인증됨
                </span>
              ) : (
                <button
                  onClick={() => navigate('/therapist-verifications')}
                  className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 text-xs font-medium hover:bg-gray-200 transition-colors"
                >
                  인증하기
                </button>
              )}
            </div>
            {/* 팔로워/팔로잉 — 백엔드 대기, 0 표시 */}
            <div className="flex gap-4 text-sm text-gray-500">
              <span>
                팔로워 <span className="font-medium text-gray-900">0</span>
              </span>
              <span>
                팔로잉 <span className="font-medium text-gray-900">0</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 탭 */}
      <div className="sticky top-14 z-40 bg-white border-b border-gray-200">
        <div className="flex">
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex-1 py-2.5 text-xs font-medium text-center transition-colors ${
                activeTab === key
                  ? 'text-neutral-950 border-b-2 border-black'
                  : 'text-gray-400'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* 탭 콘텐츠 */}
      <div className="bg-white">
        {/* 내가 쓴 글 */}
        {activeTab === 'posts' && (
          <>
            {loadingPosts && <TabSkeleton />}
            {errorPosts && <TabError onRetry={loadPosts} />}
            {!loadingPosts && !errorPosts && myPosts?.length === 0 && (
              <TabEmpty message="작성한 글이 없어요." />
            )}
            {!loadingPosts &&
              myPosts?.map((post) => <PostCard key={post.id} post={post} />)}
          </>
        )}

        {/* 답글 단 글 */}
        {activeTab === 'commented' && (
          <>
            {loadingActivity && <TabSkeleton />}
            {errorActivity && <TabError onRetry={loadActivity} />}
            {!loadingActivity && !errorActivity && commentedPosts.length === 0 && (
              <TabEmpty message="답글 단 글이 없어요." />
            )}
            {!loadingActivity &&
              commentedPosts.map(({ post }) => (
                <PostCard key={post.id} post={post} />
              ))}
          </>
        )}

        {/* 스크랩 */}
        {activeTab === 'scrapped' && (
          <>
            {loadingActivity && <TabSkeleton />}
            {errorActivity && <TabError onRetry={loadActivity} />}
            {!loadingActivity && !errorActivity && scrappedPosts.length === 0 && (
              <TabEmpty message="스크랩한 글이 없어요." />
            )}
            {!loadingActivity &&
              scrappedPosts.map(({ post }) => (
                <PostCard key={post.id} post={post} />
              ))}
          </>
        )}
      </div>
    </div>
  );
}

function TabSkeleton() {
  return (
    <div className="flex flex-col">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="px-6 py-5 border-b border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <Skeleton className="w-5 h-5 rounded-full" />
            <Skeleton className="h-4 w-16" />
          </div>
          <Skeleton className="h-4 w-full mb-1.5" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      ))}
    </div>
  );
}

function TabError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="py-8 text-center">
      <p className="text-sm text-destructive mb-2">
        데이터를 불러오는 데 실패했습니다.
      </p>
      <button
        onClick={onRetry}
        className="text-sm text-gray-500 underline hover:text-gray-700"
      >
        다시 시도
      </button>
    </div>
  );
}

function TabEmpty({ message }: { message: string }) {
  return (
    <p className="text-sm text-gray-400 text-center py-12">{message}</p>
  );
}
```

- [ ] **Step 2: 빌드 확인**

Run: `cd /home/jin24/my-project/frontend && npx tsc -b`
Expected: 에러 없이 통과

- [ ] **Step 3: Commit**

```bash
git add src/pages/ProfilePage.tsx
git commit -m "feat: ProfilePage 생성 — 프로필 헤더 + 3탭(내 글/답글/스크랩) + PostCard 재사용"
```

---

## Task 10: Layout 모바일 헤더 수정

**Files:**
- Modify: `src/components/Layout.tsx`

- [ ] **Step 1: 모바일 헤더에 검색 아이콘 추가**

`src/components/Layout.tsx`의 import에 `Search` 추가:

```tsx
import { Bell, Home, PlusCircle, Search, User } from 'lucide-react';
```

`MessageSquare` 제거 (더 이상 미사용).

- [ ] **Step 2: 헤더 로고 영역을 반응형으로 변경**

헤더의 Logo 영역 (`<div className="flex items-center gap-2">`) 을 다음으로 교체:

```tsx
{/* Logo — 데스크탑: 멜로미 + MSW/LIVE, 모바일: 치료사 커뮤니티 + 검색 */}
<div className="flex items-center gap-2">
  {/* 데스크탑 로고 */}
  <Link to="/" className="hidden md:block text-2xl font-bold text-gray-900">
    멜로미
  </Link>
  {/* 모바일 타이틀 */}
  <span className="md:hidden text-lg font-bold text-gray-900">
    치료사 커뮤니티
  </span>
  {/* MSW ON/OFF 확인 UI — 데스크탑만 */}
  <span className="hidden md:inline-block">
    {import.meta.env.VITE_MSW_ENABLED === 'true' ? (
      <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-orange-100 text-orange-600">
        MSW
      </span>
    ) : (
      <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-green-100 text-green-600">
        LIVE
      </span>
    )}
  </span>
</div>
```

- [ ] **Step 3: Right Side에 모바일 검색 아이콘 추가**

Right Side div의 맨 앞 (Bell 앞)에 모바일 검색 버튼 추가:

```tsx
{/* 모바일 검색 아이콘 */}
<button
  onClick={() => navigate('/search')}
  className="md:hidden p-2 text-gray-500 hover:text-gray-900 rounded-md transition-colors"
>
  <Search size={20} />
</button>
```

- [ ] **Step 4: 하단 네비 my-page → profile로 변경**

하단 네비에서 `to={user ? '/my-page' : '/login'}` → `to={user ? '/profile' : '/login'}`, `isActive('/my-page')` → `isActive('/profile')` 로 변경.

- [ ] **Step 5: 드롭다운 프로필 메뉴 경로 변경**

`navigate('/my-page')` → `navigate('/profile')` 로 변경.

- [ ] **Step 6: 빌드 확인**

Run: `cd /home/jin24/my-project/frontend && npx tsc -b`
Expected: 에러 없이 통과

- [ ] **Step 7: Commit**

```bash
git add src/components/Layout.tsx
git commit -m "feat: Layout — 모바일 헤더 '치료사 커뮤니티' + 검색 아이콘, 프로필 경로 /profile로 변경"
```

---

## Task 11: App.tsx 라우팅 변경

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: import 변경**

```tsx
// 추가
import SearchPage from './pages/SearchPage';
import ProfilePage from './pages/ProfilePage';

// 제거
// import MyPage from './pages/MyPage';
```

- [ ] **Step 2: 라우트 가드 변경**

`/posts`와 `/posts/:postId`를 ProtectedRoute에서 AuthRoute로 이동.
`/search`를 AuthRoute에 추가.
`/my-page`를 `/profile`로 변경하고 ProfilePage 사용.
MyPage 제거.

최종 라우트 구조:

```tsx
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route element={<Layout />}>

          {/* 비로그인 전용 라우트 */}
          <Route element={<GuestRoute />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
          </Route>

          {/* 회원가입 후 전환 페이지 */}
          <Route element={<AuthRoute />}>
            <Route path="/welcome" element={<WelcomePage />} />
            <Route path="/verification-complete" element={<VerificationCompletePage />} />
          </Route>

          {/* 로그인만 필요 (치료사 인증 불필요) */}
          <Route element={<AuthRoute />}>
            <Route path="/therapist-verifications" element={<TherapistVerificationPage />} />
            <Route path="/posts" element={<PostListPage />} />
            <Route path="/posts/:postId" element={<PostDetailPage />} />
            <Route path="/search" element={<SearchPage />} />
          </Route>

          {/* 로그인 + 치료사 인증 필요 */}
          <Route element={<ProtectedRoute />}>
            <Route path="/posts/new" element={<PostCreatePage />} />
            <Route path="/posts/:postId/edit" element={<PostEditPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
```

- [ ] **Step 3: 빌드 확인**

Run: `cd /home/jin24/my-project/frontend && npx tsc -b`
Expected: 에러 없이 통과

- [ ] **Step 4: Commit**

```bash
git add src/App.tsx
git commit -m "feat: 라우팅 — posts 열람 AuthRoute로 변경, /search 추가, /profile 교체"
```

---

## Task 12: 정리 — RichTextEditor 삭제, TipTap 제거, AGE_CHIPS 제거, MyPage 삭제

**Files:**
- Delete: `src/components/RichTextEditor.tsx`
- Delete: `src/pages/MyPage.tsx`
- Modify: `src/constants/post.ts`

- [ ] **Step 1: RichTextEditor.tsx 삭제**

```bash
rm src/components/RichTextEditor.tsx
```

- [ ] **Step 2: MyPage.tsx 삭제**

```bash
rm src/pages/MyPage.tsx
```

- [ ] **Step 3: AGE_CHIPS 제거**

`src/constants/post.ts`에서 `AGE_CHIPS` export와 `AgeGroup` import 제거:

```typescript
import type { TherapyArea } from '../types/post';

export const THERAPY_AREA_LABELS: Record<string, string> = {
  UNSPECIFIED: '전체',
  OCCUPATIONAL: '작업치료',
  SPEECH: '언어치료',
  COGNITIVE: '인지치료',
  PLAY: '놀이치료',
};

export const THERAPY_CHIPS: { value: TherapyArea; label: string }[] = [
  { value: 'UNSPECIFIED', label: '선택안함' },
  { value: 'OCCUPATIONAL', label: '작업' },
  { value: 'SPEECH', label: '언어' },
  { value: 'PLAY', label: '놀이' },
  { value: 'COGNITIVE', label: '인지' },
];
```

- [ ] **Step 4: TipTap 패키지 제거**

```bash
cd /home/jin24/my-project/frontend && npm uninstall @tiptap/react @tiptap/starter-kit @tiptap/extension-placeholder
```

- [ ] **Step 5: 전체 빌드 확인**

Run: `cd /home/jin24/my-project/frontend && npx tsc -b`
Expected: 에러 없이 통과

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "chore: RichTextEditor/MyPage 삭제, TipTap 패키지 제거, AGE_CHIPS 제거"
```

---

## Task 13: 최종 dev 서버 확인

- [ ] **Step 1: dev 서버 실행 및 빌드 확인**

```bash
cd /home/jin24/my-project/frontend && npm run build
```

Expected: 에러 없이 빌드 완료

- [ ] **Step 2: 미사용 import/변수 정리 (있을 경우)**

빌드 경고 확인 후 필요 시 정리.

- [ ] **Step 3: 최종 Commit (정리가 있었을 경우)**

```bash
git add -A
git commit -m "chore: 미사용 import 정리"
```
