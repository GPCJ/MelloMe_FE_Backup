import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Eye, MessageSquare, ThumbsUp } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { fetchPosts } from '../api/posts';
import type { PostSummary, BoardType } from '../types/post';

const BOARD_LABELS: Record<BoardType, string> = {
  therapy_board: '임상 톡톡',
  document_board: '자료실',
  anonymous_board: '익명 게시판',
};

const BOARDS: BoardType[] = ['therapy_board', 'document_board', 'anonymous_board'];

export default function PostListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const board = (searchParams.get('board') as BoardType) ?? 'therapy_board';

  const [posts, setPosts] = useState<PostSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchPosts({ board })
      .then((data) => setPosts(data.items))
      .catch(() => setError('게시글을 불러오는 데 실패했습니다.'))
      .finally(() => setLoading(false));
  }, [board]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 pb-20 md:pb-8">
      {/* 탭 */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        {BOARDS.map((b) => (
          <button
            key={b}
            onClick={() => setSearchParams({ board: b })}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              board === b
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {BOARD_LABELS[b]}
          </button>
        ))}
      </div>

      {/* 작성 버튼 */}
      <div className="flex justify-end mb-4">
        <Link to={`/posts/new?board=${board}`} className={buttonVariants()}>
          글쓰기
        </Link>
      </div>

      {/* 목록 */}
      {loading && <p className="text-center text-gray-500 py-12">불러오는 중...</p>}
      {error && <p className="text-center text-red-500 py-12">{error}</p>}
      {!loading && !error && posts.length === 0 && (
        <p className="text-center text-gray-500 py-12">아직 게시글이 없어요.</p>
      )}
      <div className="flex flex-col gap-3">
        {posts.map((post) => (
          <Link key={post.id} to={`/posts/${post.id}`}>
            <Card className="hover:border-gray-400 transition-colors cursor-pointer">
              <CardContent className="p-5">
                <h2 className="text-base font-semibold text-gray-900 mb-2">{post.title}</h2>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span>{post.author.nickname}</span>
                  <span>•</span>
                  <span>{new Date(post.createdAt).toLocaleDateString('ko-KR')}</span>
                </div>
                <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
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
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
