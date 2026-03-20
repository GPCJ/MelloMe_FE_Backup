import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Upload } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import RichTextEditor from '../components/RichTextEditor';
import { fetchPost, updatePost } from '../api/posts';
import type { TherapyArea } from '../types/post';

const THERAPY_CHIPS: { value: TherapyArea | 'UNSPECIFIED'; label: string }[] = [
  { value: 'UNSPECIFIED', label: '선택안함' },
  { value: 'OCCUPATIONAL', label: '작업' },
  { value: 'SPEECH', label: '언어' },
  { value: 'PLAY', label: '놀이' },
  { value: 'COGNITIVE', label: '인지' },
];

export default function PostEditPage() {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [therapyArea, setTherapyArea] = useState<TherapyArea | 'UNSPECIFIED'>('UNSPECIFIED');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!postId) return;
    fetchPost(Number(postId))
      .then((post) => {
        setTitle(post.title);
        setContent(post.content);
        setTherapyArea(post.therapyArea ?? 'UNSPECIFIED');
      })
      .catch(() => setError('게시글을 불러오는 데 실패했습니다.'))
      .finally(() => setLoading(false));
  }, [postId]);

  const isContentEmpty = content === '' || content === '<p></p>';
  const canSubmit = title.trim() && !isContentEmpty && !submitting;

  async function handleSubmit() {
    if (!postId || !canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      await updatePost(Number(postId), {
        title,
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

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-6">
        <Skeleton className="h-7 w-24 mb-8" />
        <div className="flex flex-col gap-6">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 pb-20 md:pb-8">
      {/* 헤더 */}
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => navigate(-1)}
          className="p-1 text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold text-gray-900">글 수정</h1>
      </div>

      <div className="flex flex-col gap-6">
        {/* 제목 */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="title">
            제목 <span className="text-red-500">*</span>
          </Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="제목을 입력해주세요"
            maxLength={100}
          />
        </div>

        {/* 내용 */}
        <div className="flex flex-col gap-2">
          <Label>
            내용 <span className="text-red-500">*</span>
          </Label>
          {/* content 로드 후 에디터 마운트 (초기값 세팅 보장) */}
          {content !== '' && (
            <RichTextEditor
              content={content}
              onChange={setContent}
              placeholder="내용을 입력해주세요"
            />
          )}
        </div>

        {/* 치료영역 */}
        <div className="flex flex-col gap-2">
          <Label>
            치료영역 <span className="text-gray-400 text-xs font-normal">(선택)</span>
          </Label>
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
        </div>

        {/* 파일 첨부 (UI only) */}
        <div className="flex flex-col gap-2">
          <Label>
            파일 첨부 <span className="text-gray-400 text-xs font-normal">(선택)</span>
          </Label>
          <div className="border-2 border-dashed border-gray-200 rounded-xl p-10 flex flex-col items-center gap-2 text-gray-400 cursor-pointer hover:border-gray-300 transition-colors">
            <Upload size={24} />
            <span className="text-sm">클릭하여 파일을 업로드하세요</span>
            <span className="text-xs">이미지, PDF 파일 지원 (최대 10MB)</span>
          </div>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        {/* 버튼 */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="flex-1 py-3 rounded-xl bg-violet-500 text-white text-sm font-medium hover:bg-violet-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {submitting ? '수정 중...' : '작성 완료'}
          </button>
        </div>
      </div>
    </div>
  );
}
