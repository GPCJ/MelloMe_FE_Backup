import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Eye, MessageSquare, ThumbsUp, Plus } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchPosts } from '../api/posts';
import type { PostSummary, TherapyArea } from '../types/post';

const THERAPY_AREA_LABELS: Record<string, string> = {
  OCCUPATIONAL_THERAPY: '작업치료',
  SPEECH_THERAPY: '언어치료',
  COGNITIVE_THERAPY: '인지치료',
  PLAY_THERAPY: '놀이치료',
};

const AGE_GROUP_LABELS: Record<string, string> = {
  AGE_0_2: '만 0~2세',
  AGE_3_5: '만 3~5세',
  AGE_6_12: '만 6~12세',
  AGE_13_18: '만 13~18세',
  AGE_19_64: '만 19~64세',
  AGE_65_PLUS: '만 65세 이상',
};

const FILTER_CHIPS: { value: TherapyArea | ''; label: string }[] = [
  { value: '', label: '전체' },
  { value: 'OCCUPATIONAL_THERAPY', label: '작업치료' },
  { value: 'SPEECH_THERAPY', label: '언어치료' },
  { value: 'COGNITIVE_THERAPY', label: '인지치료' },
  { value: 'PLAY_THERAPY', label: '놀이치료' },
];

function formatRelativeTime(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${Math.max(1, minutes)}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}일 전`;
  return new Date(isoString).toLocaleDateString('ko-KR');
}

function PostCardSkeleton() {
  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex gap-2 mb-3">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
        <Skeleton className="h-5 w-3/4 mb-4" />
        <div className="flex justify-between">
          <div className="flex gap-3">
            <Skeleton className="h-4 w-10" />
            <Skeleton className="h-4 w-10" />
            <Skeleton className="h-4 w-10" />
          </div>
          <Skeleton className="h-4 w-12" />
        </div>
      </CardContent>
    </Card>
  );
}

function PostCard({ post }: { post: PostSummary }) {
  const therapyLabel = post.therapyArea ? THERAPY_AREA_LABELS[post.therapyArea] : null;
  const ageLabel = post.ageGroup ? AGE_GROUP_LABELS[post.ageGroup] : null;

  return (
    <Link to={`/posts/${post.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="pt-4">
          {(therapyLabel || ageLabel) && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {therapyLabel && (
                <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                  {therapyLabel}
                </Badge>
              )}
              {ageLabel && (
                <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">
                  {ageLabel}
                </Badge>
              )}
            </div>
          )}
          <h2 className="text-base font-semibold text-card-foreground mb-3 leading-snug">
            {post.title}
          </h2>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Eye size={13} /> {post.viewCount}
              </span>
              <span className="flex items-center gap-1">
                <ThumbsUp size={13} /> {post.likeCount}
              </span>
              <span className="flex items-center gap-1">
                <MessageSquare size={13} /> {post.commentCount}
              </span>
            </div>
            <span>{formatRelativeTime(post.createdAt)}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function PostListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const therapyArea = (searchParams.get('therapyArea') as TherapyArea) ?? '';

  const [posts, setPosts] = useState<PostSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchPosts({
      board: 'therapy_board',
      ...(therapyArea ? { therapyArea } : {}),
    })
      .then((data) => setPosts(data.items))
      .catch(() => setError('게시글을 불러오는 데 실패했습니다.'))
      .finally(() => setLoading(false));
  }, [therapyArea]);

  function handleFilterClick(value: TherapyArea | '') {
    if (value) {
      setSearchParams({ therapyArea: value });
    } else {
      setSearchParams({});
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 pb-20 md:pb-8">
      {/* 헤더 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">임상 톡톡</h1>
        <p className="text-sm text-muted-foreground">
          익명으로 케이스를 공유하고, 동료 치료사들의 조언을 받아보세요
        </p>
      </div>

      {/* 필터 칩 + 글쓰기 버튼 */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2 flex-wrap">
          {FILTER_CHIPS.map((chip) => (
            <Button
              key={chip.value}
              variant={therapyArea === chip.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleFilterClick(chip.value)}
              className="rounded-full"
            >
              {chip.label}
            </Button>
          ))}
        </div>
        <Link
          to="/posts/new"
          className={buttonVariants({ size: 'sm' }) + ' shrink-0 gap-1'}
        >
          <Plus size={15} />
          글쓰기
        </Link>
      </div>

      {/* 에러 */}
      {error && <p className="text-center text-destructive py-12">{error}</p>}

      {/* 목록 */}
      <div className="flex flex-col gap-3">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => <PostCardSkeleton key={i} />)
          : posts.map((post) => <PostCard key={post.id} post={post} />)}
      </div>

      {/* 빈 상태 */}
      {!loading && !error && posts.length === 0 && (
        <div className="text-center py-16">
          <p className="text-muted-foreground mb-4">아직 게시글이 없어요.</p>
          <Link
            to="/posts/new"
            className={buttonVariants({ size: 'sm' }) + ' gap-1'}
          >
            <Plus size={15} />
            첫 케이스 공유하기
          </Link>
        </div>
      )}
    </div>
  );
}
