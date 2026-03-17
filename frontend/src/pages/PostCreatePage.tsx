import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { createPost } from '../api/posts';
import type { TherapyArea, AgeGroup } from '../types/post';

const THERAPY_CHIPS: { value: TherapyArea; label: string }[] = [
  { value: 'OCCUPATIONAL_THERAPY', label: '작업치료' },
  { value: 'SPEECH_THERAPY', label: '언어치료' },
  { value: 'COGNITIVE_THERAPY', label: '인지치료' },
  { value: 'PLAY_THERAPY', label: '놀이치료' },
];

const AGE_CHIPS: { value: AgeGroup; label: string }[] = [
  { value: 'AGE_0_2', label: '만 0~2세' },
  { value: 'AGE_3_5', label: '만 3~5세' },
  { value: 'AGE_6_12', label: '만 6~12세' },
  { value: 'AGE_13_18', label: '만 13~18세' },
];

export default function PostCreatePage() {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [therapyArea, setTherapyArea] = useState<TherapyArea | null>(null);
  const [ageGroup, setAgeGroup] = useState<AgeGroup | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = title.trim() && content.trim() && therapyArea && !submitting;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      const post = await createPost({
        board: 'therapy_board',
        title,
        content,
        therapyArea,
        ...(ageGroup ? { ageGroup } : {}),
      });
      navigate(`/posts/${post.id}`);
    } catch {
      setError('게시글 작성에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 pb-20 md:pb-8">
      <Button
        variant="ghost"
        size="sm"
        className="mb-6 -ml-2 text-muted-foreground"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft size={16} />
        뒤로가기
      </Button>

      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">케이스 공유하기</h1>
        <p className="text-sm text-muted-foreground">
          아동의 개인정보가 노출되지 않도록 주의해주세요
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* 치료영역 */}
        <div className="flex flex-col gap-2">
          <Label>
            치료영역 <span className="text-destructive">*</span>
          </Label>
          <div className="flex flex-wrap gap-2">
            {THERAPY_CHIPS.map((chip) => (
              <Button
                key={chip.value}
                type="button"
                variant={therapyArea === chip.value ? 'default' : 'outline'}
                size="sm"
                className="rounded-full"
                onClick={() =>
                  setTherapyArea(therapyArea === chip.value ? null : chip.value)
                }
              >
                {chip.label}
              </Button>
            ))}
          </div>
        </div>

        {/* 제목 */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="title">
            제목 <span className="text-destructive">*</span>
          </Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="케이스의 주요 고민을 간단히 적어주세요"
            maxLength={100}
          />
        </div>

        {/* 내용 */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="content">
            내용 <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={`케이스에 대해 자세히 설명해주세요\n\n예시\n- 아동의 현재 상태\n- 주요 어려움\n- 시도해본 접근법\n- 궁금한 점`}
            rows={10}
          />
        </div>

        {/* 연령대 (선택) */}
        <div className="flex flex-col gap-2">
          <Label>
            연령대{' '}
            <span className="text-muted-foreground text-xs font-normal">(선택)</span>
          </Label>
          <div className="flex flex-wrap gap-2">
            {AGE_CHIPS.map((chip) => (
              <Button
                key={chip.value}
                type="button"
                variant={ageGroup === chip.value ? 'default' : 'outline'}
                size="sm"
                className="rounded-full"
                onClick={() =>
                  setAgeGroup(ageGroup === chip.value ? null : chip.value)
                }
              >
                {chip.label}
              </Button>
            ))}
          </div>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        {/* 버튼 */}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            취소
          </Button>
          <Button type="submit" disabled={!canSubmit}>
            {submitting ? '등록 중...' : '게시글 등록하기'}
          </Button>
        </div>
      </form>
    </div>
  );
}
