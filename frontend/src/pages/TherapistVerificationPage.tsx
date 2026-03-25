import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { applyTherapistVerification, getMe } from '../api/auth';
import { useAuthStore } from '../stores/useAuthStore';

// TODO: 백엔드 논의 필요 — 인증용 치료영역 enum 확정 전 와이어프레임 기준 임시 정의
// 게시글 필터용 TherapyArea(5개)와 별개로 인증 전용 목록(9개)
const VERIFICATION_THERAPY_CHIPS = [
  '감각통합',
  '언어치료',
  '작업치료',
  '인지치료',
  '물리치료',
  '미술치료',
  '음악치료',
  '놀이치료',
  '행동치료',
] as const;

export default function TherapistVerificationPage() {
  const navigate = useNavigate();
  const { user, tokens, setAuth } = useAuthStore();

  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [licenseCode, setLicenseCode] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getMe().then((freshUser) => {
      if (tokens) setAuth(freshUser, tokens);
    });
  }, []);

  function toggleArea(area: string) {
    setSelectedAreas((prev) =>
      prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area],
    );
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files?.[0]) setFile(e.target.files[0]);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]) setFile(e.dataTransfer.files[0]);
  }

  const verificationStatus = user?.therapistVerification?.status;
  const canSubmit = file !== null && licenseCode.trim() !== '' && selectedAreas.length > 0 && !submitting;

  async function handleSubmit() {
    if (!canSubmit) return;
    setSubmitting(true);
    setError('');
    try {
      await applyTherapistVerification(licenseCode, file!);
      const freshUser = await getMe();
      if (tokens) setAuth(freshUser, tokens);
      navigate('/posts');
    } catch {
      setError('인증 신청에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setSubmitting(false);
    }
  }

  if (verificationStatus === 'APPROVED') {
    return (
      <div className="max-w-3xl mx-auto px-4 py-6 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="text-5xl mb-4">✅</div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">인증이 완료되었습니다</h2>
        <p className="text-sm text-gray-500 mb-6">치료사 인증이 승인되어 커뮤니티를 이용할 수 있어요.</p>
        <Button onClick={() => navigate('/posts')} className="bg-violet-500 hover:bg-violet-600 text-white">
          커뮤니티 바로가기
        </Button>
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
        <h1 className="text-xl font-bold text-gray-900">치료사 인증</h1>
      </div>

      {/* 메인 카드 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
        <h2 className="text-xl font-bold text-gray-900 mb-1">치료사 인증 페이지</h2>
        <p className="text-sm text-gray-500 mb-6">
          치료사 자격증을 인증하고 전문 치료사로 활동해보세요.
        </p>

        <div className="flex flex-col gap-6">
          {/* 면허번호 */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="licenseCode">
              면허번호 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="licenseCode"
              value={licenseCode}
              onChange={(e) => setLicenseCode(e.target.value)}
              placeholder="면허번호를 입력해주세요"
            />
          </div>

          {/* 면허증 첨부 */}
          <div className="flex flex-col gap-2">
            <Label>
              준비물: 면허증 첨부 <span className="text-red-500">*</span>
            </Label>
            <label
              className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center gap-2 cursor-pointer transition-colors ${
                isDragging
                  ? 'border-violet-400 bg-violet-50'
                  : file
                  ? 'border-green-400 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
            >
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                className="hidden"
                onChange={handleFileChange}
              />
              <Upload size={24} className={file ? 'text-green-500' : 'text-gray-400'} />
              {file ? (
                <span className="text-sm font-medium text-green-700">{file.name}</span>
              ) : (
                <>
                  <span className="text-sm text-gray-500">파일을 선택하거나 드래그하세요</span>
                  <span className="text-xs text-gray-400">JPG, PNG, PDF (최대 10MB)</span>
                </>
              )}
            </label>
          </div>

          {/* 치료영역 */}
          <div className="flex flex-col gap-2">
            <div>
              <Label>
                추가 수집 정보: 치료영역 <span className="text-red-500">*</span>
              </Label>
              <p className="text-xs text-gray-400 mt-0.5">
                인정하시는 치료 영역을 선택하세요 (중복 선택 가능)
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {VERIFICATION_THERAPY_CHIPS.map((area) => (
                <button
                  key={area}
                  type="button"
                  onClick={() => toggleArea(area)}
                  className={`py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                    selectedAreas.includes(area)
                      ? 'bg-gray-900 text-white border-gray-900'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                  }`}
                >
                  {area}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          {/* 버튼 */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="flex-1 py-3 rounded-xl bg-violet-500 hover:bg-violet-600 text-white text-sm font-medium h-auto disabled:opacity-40"
            >
              {submitting ? '신청 중...' : '인증 신청하기'}
            </Button>
          </div>
        </div>
      </div>

      {/* 안내 사항 */}
      <div className="bg-blue-50 rounded-xl p-4">
        <p className="text-sm font-semibold text-gray-900 mb-2">안내 사항</p>
        <ul className="flex flex-col gap-1.5">
          {[
            '제출하신 면허증은 검토 후 3~5 영업일 내에 승인됩니다.',
            '면허증 이미지는 명확하게 촬영되어야 합니다.',
            '개인정보는 안전하게 보호됩니다.',
            '인증 완료 후 아래와 같은 혜택이 있습니다.',
          ].map((text) => (
            <li key={text} className="flex items-start gap-2 text-sm text-gray-600">
              <span className="mt-2 w-1 h-1 rounded-full bg-gray-400 shrink-0" />
              {text}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
