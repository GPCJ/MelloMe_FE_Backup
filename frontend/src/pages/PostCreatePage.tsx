import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import RichTextEditor from '../components/RichTextEditor';
import { createPost } from '../api/posts';
import type { TherapyArea, AgeGroup } from '../types/post';

const THERAPY_CHIPS: { value: TherapyArea; label: string }[] = [
  { value: 'UNSPECIFIED', label: '선택안함' },
  { value: 'OCCUPATIONAL', label: '작업' },
  { value: 'SPEECH', label: '언어' },
  { value: 'PLAY', label: '놀이' },
  { value: 'COGNITIVE', label: '인지' },
];

const AGE_CHIPS: { value: AgeGroup; label: string }[] = [
  { value: 'UNSPECIFIED', label: '선택안함' },
  { value: 'AGE_0_2', label: '0-2세' },
  { value: 'AGE_3_5', label: '3-5세' },
  { value: 'AGE_6_12', label: '6-12세' },
  { value: 'AGE_13_18', label: '13-18세' },
  { value: 'AGE_19_64', label: '19-64세' },
  { value: 'AGE_65_PLUS', label: '65세 이상' },
];

export default function PostCreatePage() {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [therapyArea, setTherapyArea] = useState<TherapyArea>('UNSPECIFIED');
  const [ageGroup, setAgeGroup] = useState<AgeGroup>('UNSPECIFIED');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isContentEmpty = content === '' || content === '<p></p>';
  const canSubmit = title.trim() && !isContentEmpty && !submitting;

  async function handleSubmit() {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      const post = await createPost({
        title,
        content,
        postType: 'COMMUNITY',
        therapyArea,
        ageGroup,
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
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => navigate(-1)}
          className="p-1 text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold text-gray-900">글쓰기</h1>
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
          <RichTextEditor
            content={content}
            onChange={setContent}
            placeholder="내용을 입력해주세요"
          />
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

        {/* 연령대 */}
        <div className="flex flex-col gap-2">
          <Label>
            연령대 <span className="text-gray-400 text-xs font-normal">(선택)</span>
          </Label>
          <div className="flex flex-wrap gap-2">
            {AGE_CHIPS.map((chip) => (
              <button
                key={chip.value}
                type="button"
                onClick={() => setAgeGroup(chip.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  ageGroup === chip.value
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
            {submitting ? '등록 중...' : '작성 완료'}
          </button>
        </div>
      </div>
    </div>
  );
}
