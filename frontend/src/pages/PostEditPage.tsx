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
  const [initialContent, setInitialContent] = useState('');
  const [therapyArea, setTherapyArea] = useState<TherapyArea>('UNSPECIFIED');
  const [initialTherapyArea, setInitialTherapyArea] = useState<TherapyArea>('UNSPECIFIED');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasChanges = content !== initialContent || therapyArea !== initialTherapyArea;

  useEffect(() => {
    if (!hasChanges) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [hasChanges]);

  useEffect(() => {
    if (!postId || isNaN(Number(postId))) {
      setError('게시글을 찾을 수 없어요.');
      setLoading(false);
      return;
    }
    fetchPost(Number(postId))
      .then((post) => {
        if (!post.canEdit) {
          setError('수정 권한이 없습니다.');
          return;
        }
        setContent(post.content);
        setInitialContent(post.content);
        setTherapyArea(post.therapyArea ?? 'UNSPECIFIED');
        setInitialTherapyArea(post.therapyArea ?? 'UNSPECIFIED');
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
        title: '',
        content,
        therapyArea,
        ageGroup: '',
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
          onClick={() => navigate(`/posts/${postId}`)}
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
            {submitting ? '수정 중...' : '수정하기'}
          </button>
        </div>
      </div>
    </div>
  );
}
