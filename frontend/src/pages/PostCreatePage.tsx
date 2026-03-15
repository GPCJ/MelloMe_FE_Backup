import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { createPost } from '../api/posts';
import type { BoardType } from '../types/post';

const BOARD_LABELS: Record<BoardType, string> = {
  therapy_board: '임상 톡톡',
  document_board: '자료실',
  anonymous_board: '익명 게시판',
};

export default function PostCreatePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const board = (searchParams.get('board') as BoardType) ?? 'therapy_board';

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const post = await createPost({ board, title, content });
      navigate(`/posts/${post.id}`);
    } catch {
      setError('게시글 작성에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 pb-20 md:pb-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        <ArrowLeft size={16} /> 뒤로가기
      </button>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
              {BOARD_LABELS[board]}
            </span>
            <h1 className="text-lg font-bold text-gray-900">새 게시글</h1>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="title">제목</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="제목을 입력하세요"
                maxLength={100}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="content">내용</Label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="내용을 입력하세요"
                rows={12}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-gray-400"
              />
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className={buttonVariants({ variant: 'outline' })}
              >
                취소
              </button>
              <button
                type="submit"
                disabled={submitting || !title.trim() || !content.trim()}
                className={buttonVariants()}
              >
                {submitting ? '등록 중...' : '등록'}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
