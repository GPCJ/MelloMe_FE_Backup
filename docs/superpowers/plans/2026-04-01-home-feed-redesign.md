# 홈 피드 리디자인 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 피그마 확정 디자인 기반으로 홈 피드(PostListPage) UI를 리스트형 피드로 리디자인한다.

**Architecture:** PostCard를 별도 컴포넌트로 분리하고, PostListPage에 탭 시스템(전체 피드/팔로우)을 추가한다. 백엔드 미지원 필드(commentCount, hasAttachment 등)는 타입에 optional로 추가하되 UI에서 fallback 처리한다. 해시태그는 목데이터로 표시한다.

**Tech Stack:** React 19, TypeScript, Tailwind CSS, shadcn/ui, lucide-react

---

## 파일 구조

| 파일 | 역할 |
|------|------|
| `types/post.ts` | PostSummary에 commentCount, hasAttachment, authorProfileImageUrl, authorVerificationStatus 추가 |
| `components/PostCard.tsx` | 신규 — 리스트형 게시글 카드 컴포넌트 |
| `pages/PostListPage.tsx` | 탭 + 필터칩 + 리스트 레이아웃으로 리디자인 |
| `components/Layout.tsx` | 헤더에 "치료사 커뮤니티" 타이틀 반영, 하단 네비에 글쓰기 탭 추가 |

---

### Task 1: PostSummary 타입 확장

**Files:**
- Modify: `frontend/src/types/post.ts:27-36`

- [ ] **Step 1: PostSummary 인터페이스에 optional 필드 추가**

```typescript
export interface PostSummary {
  id: number;
  title: string;
  contentPreview?: string;
  authorNickname: string;
  authorProfileImageUrl?: string | null;
  authorVerificationStatus?: 'NOT_REQUESTED' | 'PENDING' | 'APPROVED' | 'REJECTED';
  therapyArea?: TherapyArea;
  ageGroup?: AgeGroup;
  viewCount: number;
  commentCount?: number;
  hasAttachment?: boolean;
  isBlurred?: boolean;
  createdAt: string;
}
```

모든 신규 필드는 optional — 백엔드에서 내려주지 않아도 기존 코드가 깨지지 않는다.

- [ ] **Step 2: 타입 체크**

Run: `cd /home/jin24/my-project/frontend && npx tsc -b --noEmit`
Expected: 에러 없음 (기존 코드에 영향 없음)

- [ ] **Step 3: Commit**

```bash
git add frontend/src/types/post.ts
git commit -m "feat: PostSummary 타입에 피드 리디자인용 optional 필드 추가"
```

---

### Task 2: PostCard 컴포넌트 생성

**Files:**
- Create: `frontend/src/components/PostCard.tsx`

- [ ] **Step 1: PostCard 컴포넌트 작성**

```tsx
import { Link } from 'react-router-dom';
import { Bookmark, MessageCircle, Eye } from 'lucide-react';
import type { PostSummary } from '../types/post';
import { THERAPY_AREA_LABELS } from '../constants/post';
import { formatRelativeTime } from '../utils/formatDate';

// 목데이터 — 백엔드 태그 필드 구현 전까지 사용
const MOCK_HASHTAGS: Record<string, string[]> = {};

interface PostCardProps {
  post: PostSummary;
}

function VerificationBadge({ status }: { status?: string }) {
  const isVerified = status === 'APPROVED';
  return (
    <span
      className={`px-1.5 py-0.5 rounded text-[10px] font-medium leading-tight ${
        isVerified
          ? 'bg-gray-100 text-gray-900'
          : 'bg-gray-100 text-gray-500'
      }`}
    >
      {isVerified ? '인증완료' : '미인증'}
    </span>
  );
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
          <VerificationBadge status={post.authorVerificationStatus} />
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
              🔒 인증된 회원에게만 공개된 게시물입니다.
            </p>
          </div>
        ) : (
          <p className="text-sm text-gray-600 leading-5 line-clamp-3 mb-2.5">
            {post.contentPreview}
          </p>
        )}

        {/* 4행: 첨부파일 */}
        {post.hasAttachment && (
          <p className="text-[10px] text-gray-900 mb-2.5">📎 첨부파일 있음</p>
        )}

        {/* 5행: 댓글 수 + 조회수 */}
        <div className="flex items-center gap-3 text-gray-500">
          <span className="flex items-center gap-1 text-xs font-medium">
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

- [ ] **Step 2: 타입 체크**

Run: `cd /home/jin24/my-project/frontend && npx tsc -b --noEmit`
Expected: 에러 없음

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/PostCard.tsx
git commit -m "feat: PostCard 컴포넌트 분리 — 리스트형 피드 카드 UI"
```

---

### Task 3: PostListPage 리디자인

**Files:**
- Modify: `frontend/src/pages/PostListPage.tsx` (전체 재작성)

- [ ] **Step 1: PostListPage 전체 리디자인**

배너, 검색바, 그리드 레이아웃을 제거하고 탭 + 필터칩 + 리스트형으로 교체한다.

```tsx
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchPosts } from '../api/posts';
import type { PostSummary, TherapyArea, PaginatedPosts } from '../types/post';
import PostCard from '../components/PostCard';

const FILTER_CHIPS: { value: TherapyArea | ''; label: string }[] = [
  { value: '', label: '전체' },
  { value: 'OCCUPATIONAL', label: '작업치료' },
  { value: 'SPEECH', label: '언어치료' },
  { value: 'PLAY', label: '놀이치료' },
  { value: 'COGNITIVE', label: '인지치료' },
];

type FeedTab = 'all' | 'following';

function PostCardSkeleton() {
  return (
    <div className="px-6 py-5 border-b border-gray-200">
      <div className="flex items-center gap-2 mb-3">
        <Skeleton className="w-5 h-5 rounded-full" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-10" />
      </div>
      <div className="flex gap-2 mb-3">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-14 rounded-full" />
      </div>
      <Skeleton className="h-4 w-full mb-1.5" />
      <Skeleton className="h-4 w-3/4 mb-3" />
      <div className="flex gap-3">
        <Skeleton className="h-4 w-10" />
        <Skeleton className="h-4 w-10" />
      </div>
    </div>
  );
}

export default function PostListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const therapyArea = (searchParams.get('therapyArea') as TherapyArea) ?? '';
  const currentPage = Number(searchParams.get('page') ?? '1');

  const [activeTab, setActiveTab] = useState<FeedTab>('all');
  const [data, setData] = useState<PaginatedPosts | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const VALID_THERAPY_AREAS: (TherapyArea | '')[] = [
    '',
    'OCCUPATIONAL',
    'SPEECH',
    'PLAY',
    'COGNITIVE',
    'UNSPECIFIED',
  ];

  useEffect(() => {
    if (therapyArea && !VALID_THERAPY_AREAS.includes(therapyArea)) {
      setSearchParams({});
      return;
    }
  }, [therapyArea]);

  useEffect(() => {
    if (activeTab !== 'all') return; // 팔로우 탭은 아직 fetch 안 함
    setLoading(true);
    setError(null);
    fetchPosts({
      ...(therapyArea ? { therapyArea } : {}),
      page: currentPage - 1,
    })
      .then(setData)
      .catch(() => setError('게시글을 불러오는 데 실패했습니다.'))
      .finally(() => setLoading(false));
  }, [therapyArea, currentPage, activeTab]);

  function handleFilterClick(value: TherapyArea | '') {
    setSearchParams(value ? { therapyArea: value } : {});
  }

  function handlePageChange(page: number) {
    const params: Record<string, string> = { page: String(page) };
    if (therapyArea) params.therapyArea = therapyArea;
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const totalPages = data?.totalPages ?? 1;

  return (
    <div className="pb-20 md:pb-8">
      {/* 탭 */}
      <div className="sticky top-14 z-40 bg-white">
        <div className="flex">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 py-2 text-xs font-medium text-center transition-colors ${
              activeTab === 'all'
                ? 'text-neutral-950 border-b-2 border-black'
                : 'text-gray-400 border-b border-gray-200'
            }`}
          >
            전체 피드
          </button>
          <button
            onClick={() => setActiveTab('following')}
            className={`flex-1 py-2 text-xs font-medium text-center transition-colors ${
              activeTab === 'following'
                ? 'text-neutral-950 border-b-2 border-black'
                : 'text-gray-400 border-b border-gray-200'
            }`}
          >
            팔로우
          </button>
        </div>
      </div>

      {/* 필터 칩 */}
      <div className="flex items-center gap-2 p-4 border-b border-gray-200 overflow-x-auto scrollbar-hide">
        {FILTER_CHIPS.map((chip) => (
          <button
            key={chip.value}
            onClick={() => handleFilterClick(chip.value)}
            className={`shrink-0 px-3 py-2 rounded-full text-xs font-medium transition-colors ${
              therapyArea === chip.value
                ? 'bg-gray-900 text-white'
                : 'bg-white text-neutral-950 border border-gray-200'
            }`}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* 피드 콘텐츠 */}
      {activeTab === 'all' ? (
        <div className="bg-white">
          {/* 에러 */}
          {error && (
            <p className="text-center text-destructive py-12">{error}</p>
          )}

          {/* 목록 */}
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <PostCardSkeleton key={i} />
              ))
            : data?.posts.map((post) => <PostCard key={post.id} post={post} />)}

          {/* 빈 상태 */}
          {!loading && !error && data?.posts.length === 0 && (
            <div className="text-center py-16">
              <p className="text-gray-400 mb-4">아직 게시글이 없어요.</p>
              <Link
                to="/posts/new"
                className={buttonVariants({ size: 'sm' }) + ' gap-1'}
              >
                <Plus size={15} />첫 글 작성하기
              </Link>
            </div>
          )}

          {/* 페이지네이션 */}
          {!loading && totalPages > 1 && (
            <div className="flex items-center justify-center gap-1 py-6">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                      currentPage === page
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {page}
                  </button>
                ),
              )}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      ) : (
        /* 팔로우 탭 — 빈 상태 */
        <div className="text-center py-20">
          <p className="text-gray-400 text-sm">
            팔로우한 치료사의 글이 여기에 표시됩니다.
          </p>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: 타입 체크**

Run: `cd /home/jin24/my-project/frontend && npx tsc -b --noEmit`
Expected: 에러 없음

- [ ] **Step 3: 브라우저에서 확인**

Run: `cd /home/jin24/my-project/frontend && npm run dev`
확인 사항:
- 탭 전환 (전체 피드/팔로우)
- 필터칩 선택 시 스타일 변경
- PostCard 리스트형 렌더링
- 페이지네이션 동작

- [ ] **Step 4: Commit**

```bash
git add frontend/src/pages/PostListPage.tsx
git commit -m "feat: PostListPage 리디자인 — 탭 + 필터칩 + 리스트형 피드"
```

---

### Task 4: Layout 헤더 업데이트

**Files:**
- Modify: `frontend/src/components/Layout.tsx`

- [ ] **Step 1: 모바일 헤더에 "치료사 커뮤니티" 타이틀 + 검색 아이콘 추가, 하단 네비에 글쓰기 탭 추가**

변경 사항:
1. 모바일 헤더: `/posts` 경로일 때 "치료사 커뮤니티" 타이틀 + 검색 아이콘 표시
2. 하단 네비: 홈 / 글쓰기(+) / 프로필 3탭 구성

Layout.tsx의 모바일 하단 네비를 다음으로 교체:

```tsx
{/* Bottom Navigation (Mobile) */}
<nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-3">
  <Link
    to="/posts"
    className={`flex flex-col items-center gap-1 ${isActive('/posts') ? 'text-gray-900' : 'text-gray-500'}`}
  >
    <Home size={24} />
    <span className="text-xs">홈</span>
  </Link>
  <Link
    to="/posts/new"
    className={`flex flex-col items-center gap-1 ${isActive('/posts/new') ? 'text-gray-900' : 'text-gray-500'}`}
  >
    <PlusCircle size={24} />
    <span className="text-xs">글쓰기</span>
  </Link>
  <Link
    to={user ? '/my-page' : '/login'}
    className={`flex flex-col items-center gap-1 ${
      isActive('/my-page') || isActive('/login')
        ? 'text-gray-900'
        : 'text-gray-500'
    }`}
  >
    <User size={24} />
    <span className="text-xs">{user ? '프로필' : '로그인'}</span>
  </Link>
</nav>
```

import에 `Home`, `PlusCircle` 추가, 기존 `MessageSquare`는 제거 가능.

- [ ] **Step 2: 타입 체크**

Run: `cd /home/jin24/my-project/frontend && npx tsc -b --noEmit`
Expected: 에러 없음

- [ ] **Step 3: 브라우저에서 확인**

확인 사항:
- 하단 네비 3탭 (홈/글쓰기/프로필) 표시
- 각 탭 클릭 시 해당 경로 이동
- active 상태 하이라이트

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/Layout.tsx
git commit -m "feat: Layout 하단 네비 3탭 구성 (홈/글쓰기/프로필)"
```

---

### Task 5: 최종 확인 및 정리

- [ ] **Step 1: 전체 타입 체크**

Run: `cd /home/jin24/my-project/frontend && npx tsc -b --noEmit`
Expected: 에러 없음

- [ ] **Step 2: 빌드 확인**

Run: `cd /home/jin24/my-project/frontend && npm run build`
Expected: 빌드 성공

- [ ] **Step 3: 브라우저에서 전체 플로우 확인**

확인 사항:
- 홈 피드 전체 UI가 피그마와 일치
- 탭 전환, 필터칩, PostCard, 페이지네이션 정상
- 글쓰기 버튼 → /posts/new 이동
- 하단 네비 3탭 동작
- 반응형 (모바일/데스크탑)
