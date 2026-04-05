import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Image, Lock, LockOpen, Paperclip, X } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import SimpleTextEditor from '../components/SimpleTextEditor';
import { fetchPost, updatePost, uploadPostAttachment, deletePostAttachment } from '../api/posts';
import type { Attachment, TherapyArea } from '../types/post';
import { THERAPY_CHIPS } from '../constants/post';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

interface PendingFile {
  file: File;
  previewUrl: string | null;
}

export default function PostEditPage() {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();

  const [content, setContent] = useState('');
  const [initialContent, setInitialContent] = useState('');
  const [therapyArea, setTherapyArea] = useState<TherapyArea>('UNSPECIFIED');
  const [initialTherapyArea, setInitialTherapyArea] = useState<TherapyArea>('UNSPECIFIED');
  const [loading, setLoading] = useState(true);
  const [isPublic, setIsPublic] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [existingAttachments, setExistingAttachments] = useState<Attachment[]>([]);
  const [removedAttachmentIds, setRemovedAttachmentIds] = useState<number[]>([]);
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasChanges =
    content !== initialContent ||
    therapyArea !== initialTherapyArea ||
    removedAttachmentIds.length > 0 ||
    pendingFiles.length > 0;

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
        setExistingAttachments(post.attachments ?? []);
      })
      .catch(() => setError('게시글을 불러오는 데 실패했습니다.'))
      .finally(() => setLoading(false));
  }, [postId]);

  const canSubmit = content.trim().length > 0 && hasChanges && !submitting;

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

  function removePendingFile(index: number) {
    setPendingFiles((prev) => {
      const removed = prev[index];
      if (removed.previewUrl) URL.revokeObjectURL(removed.previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  }

  function removeExistingAttachment(attachmentId: number) {
    setRemovedAttachmentIds((prev) => [...prev, attachmentId]);
  }

  async function handleSubmit() {
    if (!postId || !canSubmit) return;
    const pid = Number(postId);
    setSubmitting(true);
    setError(null);
    try {
      await updatePost(pid, { title: '', content, therapyArea });

      const totalOps = removedAttachmentIds.length + pendingFiles.length;
      if (totalOps > 0) {
        let done = 0;
        setUploadProgress(`첨부파일 처리 중... (0/${totalOps})`);

        for (const attachmentId of removedAttachmentIds) {
          done++;
          setUploadProgress(`첨부파일 처리 중... (${done}/${totalOps})`);
          await deletePostAttachment(pid, attachmentId);
        }

        for (const pf of pendingFiles) {
          done++;
          setUploadProgress(`첨부파일 업로드 중... (${done}/${totalOps})`);
          await uploadPostAttachment(pid, pf.file);
        }
      }

      navigate(`/posts/${postId}`);
    } catch {
      setError('게시글 수정에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setSubmitting(false);
      setUploadProgress(null);
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

        {/* 기존 + 새 첨부파일 프리뷰 */}
        {(existingAttachments.filter((a) => !removedAttachmentIds.includes(a.id)).length > 0 || pendingFiles.length > 0) && (
          <div className="flex flex-wrap gap-2">
            {existingAttachments
              .filter((a) => !removedAttachmentIds.includes(a.id))
              .map((a) => (
                <div key={a.id} className="relative group border border-gray-200 rounded-lg overflow-hidden">
                  {IMAGE_TYPES.includes(a.contentType) ? (
                    <img src={a.downloadUrl} alt={a.originalFilename} className="w-24 h-24 object-cover" />
                  ) : (
                    <div className="w-24 h-24 flex flex-col items-center justify-center bg-gray-50 px-1">
                      <Paperclip size={16} className="text-gray-400 mb-1" />
                      <span className="text-xs text-gray-500 text-center truncate w-full">{a.originalFilename}</span>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => removeExistingAttachment(a.id)}
                    className="absolute top-0.5 right-0.5 bg-black/60 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            {pendingFiles.map((pf, i) => (
              <div key={`new-${i}`} className="relative group border border-blue-200 rounded-lg overflow-hidden">
                {pf.previewUrl ? (
                  <img src={pf.previewUrl} alt={pf.file.name} className="w-24 h-24 object-cover" />
                ) : (
                  <div className="w-24 h-24 flex flex-col items-center justify-center bg-blue-50 px-1">
                    <Paperclip size={16} className="text-blue-400 mb-1" />
                    <span className="text-xs text-blue-500 text-center truncate w-full">{pf.file.name}</span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => removePendingFile(i)}
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

          {/* 모바일: 풀너비 수정하기 */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="md:hidden w-full py-3 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {submitting ? (uploadProgress ?? '수정 중...') : '수정하기'}
          </button>

          {/* 데스크탑: 한 줄 (아이콘들 | 자물쇠 + 수정하기) */}
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
                {submitting ? (uploadProgress ?? '수정 중...') : '수정하기'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
