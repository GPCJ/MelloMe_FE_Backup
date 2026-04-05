import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Image, Lock, LockOpen, Paperclip, X } from 'lucide-react';
import SimpleTextEditor from '../components/SimpleTextEditor';
import { createPost, uploadPostAttachment } from '../api/posts';
import type { TherapyArea } from '../types/post';
import { THERAPY_CHIPS } from '../constants/post';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

interface PendingFile {
  file: File;
  previewUrl: string | null; // 이미지일 때만
}

export default function PostCreatePage() {
  const navigate = useNavigate();

  const [content, setContent] = useState('');
  const [therapyArea, setTherapyArea] = useState<TherapyArea>('UNSPECIFIED');
  const [isPublic, setIsPublic] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canSubmit = content.trim().length > 0 && !submitting;

  function addFiles(files: FileList | null) {
    if (!files) return;
    const newFiles: PendingFile[] = [];
    for (const file of Array.from(files)) {
      if (file.size > MAX_FILE_SIZE) {
        setError(`${file.name}: 10MB 이하 파일만 첨부할 수 있습니다.`);
        continue;
      }
      const isImage = IMAGE_TYPES.includes(file.type);
      newFiles.push({
        file,
        previewUrl: isImage ? URL.createObjectURL(file) : null,
      });
    }
    setPendingFiles((prev) => [...prev, ...newFiles]);
  }

  function removeFile(index: number) {
    setPendingFiles((prev) => {
      const removed = prev[index];
      if (removed.previewUrl) URL.revokeObjectURL(removed.previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  }

  async function handleSubmit() {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      const post = await createPost({
        title: '',
        content,
        therapyArea,
        ageGroup: '',
      });

      // 첨부파일 순차 업로드
      if (pendingFiles.length > 0) {
        setUploadProgress(`첨부파일 업로드 중... (0/${pendingFiles.length})`);
        for (let i = 0; i < pendingFiles.length; i++) {
          setUploadProgress(`첨부파일 업로드 중... (${i + 1}/${pendingFiles.length})`);
          await uploadPostAttachment(post.id, pendingFiles[i].file);
        }
      }

      navigate(`/posts/${post.id}`);
    } catch {
      setError('게시글 작성에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setSubmitting(false);
      setUploadProgress(null);
    }
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
        <h1 className="text-xl font-bold text-gray-900">글쓰기</h1>
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

        {/* 첨부파일 프리뷰 */}
        {pendingFiles.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {pendingFiles.map((pf, i) => (
              <div key={i} className="relative group border border-gray-200 rounded-lg overflow-hidden">
                {pf.previewUrl ? (
                  <img src={pf.previewUrl} alt={pf.file.name} className="w-24 h-24 object-cover" />
                ) : (
                  <div className="w-24 h-24 flex flex-col items-center justify-center bg-gray-50 px-1">
                    <Paperclip size={16} className="text-gray-400 mb-1" />
                    <span className="text-xs text-gray-500 text-center truncate w-full">{pf.file.name}</span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  className="absolute top-0.5 right-0.5 bg-black/60 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* 숨겨진 file inputs */}
        <input
          ref={imageInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          multiple
          className="hidden"
          onChange={(e) => { addFiles(e.target.files); e.target.value = ''; }}
        />
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => { addFiles(e.target.files); e.target.value = ''; }}
        />

        {error && <p className="text-sm text-red-500">{error}</p>}
        {uploadProgress && <p className="text-sm text-blue-600">{uploadProgress}</p>}

        {/* 하단 액션 */}
        <div className="pt-2 border-t border-gray-200 flex flex-col gap-3">
          {/* 모바일: 아이콘 행 */}
          <div className="flex items-center md:hidden">
            <button type="button" aria-label="이미지 첨부" onClick={() => imageInputRef.current?.click()} className="p-2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
              <Image size={20} />
            </button>
            <button type="button" aria-label="파일 첨부" onClick={() => fileInputRef.current?.click()} className="p-2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
              <Paperclip size={20} />
            </button>
            <div className="flex-1" />
            <button
              type="button"
              aria-label={isPublic ? '비공개로 전환' : '공개로 전환'}
              onClick={() => setIsPublic((v) => !v)}
              className={`p-2 transition-colors cursor-pointer ${isPublic ? 'text-gray-400 hover:text-gray-600' : 'text-gray-900'}`}
            >
              {isPublic ? <LockOpen size={20} /> : <Lock size={20} />}
            </button>
          </div>

          {/* 모바일: 풀너비 게시하기 */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="md:hidden w-full py-3 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {submitting ? (uploadProgress ?? '등록 중...') : '게시하기'}
          </button>

          {/* 데스크탑: 한 줄 (아이콘들 | 자물쇠 + 게시하기) */}
          <div className="hidden md:flex items-center justify-between">
            <div className="flex items-center">
              <button type="button" onClick={() => imageInputRef.current?.click()} className="p-2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
                <Image size={20} />
              </button>
              <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
                <Paperclip size={20} />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsPublic((v) => !v)}
                className={`p-2 transition-colors cursor-pointer ${isPublic ? 'text-gray-400 hover:text-gray-600' : 'text-gray-900'}`}
              >
                {isPublic ? <LockOpen size={20} /> : <Lock size={20} />}
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!canSubmit}
                className="px-6 py-2.5 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {submitting ? (uploadProgress ?? '등록 중...') : '게시하기'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
