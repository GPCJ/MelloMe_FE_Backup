import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { fetchPost, updatePost } from '../api/posts';

export default function PostEditPage() {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!postId) return;
    fetchPost(Number(postId))
      .then((post) => {
        setTitle(post.title);
        setContent(post.content);
      })
      .catch(() => setError('게시글을 불러오는 데 실패했습니다.'))
      .finally(() => setLoading(false));
  }, [postId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!postId || !title.trim() || !content.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      await updatePost(Number(postId), { title, content });
      navigate(`/posts/${postId}`);
    } catch {
      setError('게시글 수정에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading)
    return <p className="text-center text-gray-500 py-20">불러오는 중...</p>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 pb-20 md:pb-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6 cursor-pointer"
      >
        <ArrowLeft size={16} /> 뒤로가기
      </button>

      <Card>
        <CardContent className="p-6">
          <h1 className="text-lg font-bold text-gray-900 mb-6">게시글 수정</h1>

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
                {submitting ? '수정 중...' : '수정 완료'}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
