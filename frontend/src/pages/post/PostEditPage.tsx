import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Image, Lock, LockOpen, Paperclip, PencilLine } from 'lucide-react';
import { Skeleton } from '@/components/shadcn-ui/skeleton';
import SimpleTextEditor from '../../components/post/SimpleTextEditor';
import FilePreviewGrid from '../../components/post/FilePreviewGrid';
import {
  fetchPost,
  fetchPostImages,
  updatePost,
  initUpload,
  uploadToS3,
  confirmUpload,
  deletePostAttachment,
  deletePostImage,
} from '../../api/posts';
import {
  useFileAttachment,
  IMAGE_ACCEPT,
  FILE_ACCEPT,
  resolveUploadContentType,
} from '../../hooks/useFileAttachment';
import { useAuthStore } from '../../stores/useAuthStore';
import type { Attachment, PostImage, TherapyArea, UIVisibility } from '../../types/post';
import {
  THERAPY_CHIPS,
  VISIBILITY_OPTIONS,
  toApiVisibility,
  fromApiVisibility,
} from '../../constants/post';
import { useQueryClient } from '@tanstack/react-query';

// 공개 범위 chip + popover — PostWriteForm 푸터와 동일 패턴.
// 모바일/데스크탑 두 곳에서 재사용하므로 로컬 헬퍼로 분리(각 인스턴스가 자체 open/ref 보유 → 외부 클릭 가드 단순).
function VisibilityPicker({
  visibility,
  onChange,
  isPublicOnly,
}: {
  visibility: UIVisibility;
  onChange: (v: UIVisibility) => void;
  isPublicOnly: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

  const current = isPublicOnly
    ? VISIBILITY_OPTIONS[0]
    : (VISIBILITY_OPTIONS.find((o) => o.value === visibility) ?? VISIBILITY_OPTIONS[0]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => !isPublicOnly && setOpen((v) => !v)}
        disabled={isPublicOnly}
        aria-haspopup="menu"
        aria-expanded={open}
        title={isPublicOnly ? '치료사 인증 후 공개 범위 설정 가능' : undefined}
        className={`flex items-center gap-1.5 text-xs ${
          isPublicOnly
            ? 'text-gray-400 cursor-not-allowed'
            : 'text-gray-700 hover:text-gray-900 cursor-pointer'
        }`}
      >
        <span>{current.chipLabel}</span>
        {current.value === 'PUBLIC' ? <LockOpen size={14} /> : <Lock size={14} />}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute bottom-full right-0 mb-2 w-64 bg-white rounded-xl shadow-[0px_4px_10px_0px_rgba(136,136,136,0.20)] border border-gray-100 py-2 z-10"
        >
          {VISIBILITY_OPTIONS.map((opt) => {
            const selected = visibility === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                role="menuitemradio"
                aria-checked={selected}
                onClick={() => onChange(opt.value)}
                className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 transition-colors"
              >
                <span className="text-sm text-gray-900">{opt.label}</span>
                <span className="relative inline-flex w-9 h-5 rounded-full bg-white border border-gray-200">
                  <span
                    className={`absolute top-0.5 w-4 h-4 rounded-full bg-gray-900 transition-transform ${
                      selected ? 'translate-x-4' : 'translate-x-0.5'
                    }`}
                  />
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function PostEditPage() {
  const qc = useQueryClient();
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const isPublicOnly = user?.role === 'USER';

  const [content, setContent] = useState('');
  const [initialContent, setInitialContent] = useState('');
  const [therapyArea, setTherapyArea] = useState<TherapyArea>('UNSPECIFIED');
  const [initialTherapyArea, setInitialTherapyArea] = useState<TherapyArea>('UNSPECIFIED');
  const [loading, setLoading] = useState(true);
  const [visibility, setVisibility] = useState<UIVisibility>('PUBLIC');
  const [initialVisibility, setInitialVisibility] = useState<UIVisibility>('PUBLIC');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [existingAttachments, setExistingAttachments] = useState<Attachment[]>([]);
  const [existingImages, setExistingImages] = useState<PostImage[]>([]);
  const [removedAttachmentIds, setRemovedAttachmentIds] = useState<number[]>([]);
  const [removedImageIds, setRemovedImageIds] = useState<number[]>([]);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);

  const {
    pendingFiles,
    fileError,
    imageInputRef,
    fileInputRef,
    addFiles,
    removeFile: removePendingFile,
    clearFileError,
  } = useFileAttachment(
    existingImages.length - removedImageIds.length,
    existingAttachments.length - removedAttachmentIds.length,
  );

  const hasChanges =
    content !== initialContent ||
    therapyArea !== initialTherapyArea ||
    visibility !== initialVisibility ||
    removedAttachmentIds.length > 0 ||
    removedImageIds.length > 0 ||
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
    const pid = Number(postId);
    Promise.all([fetchPost(pid), fetchPostImages(pid).catch(() => [] as PostImage[])])
      .then(([post, imagesData]) => {
        if (!post.canEdit) {
          setError('수정 권한이 없습니다.');
          return;
        }
        setContent(post.content);
        setInitialContent(post.content);
        setTherapyArea(post.therapyArea ?? 'UNSPECIFIED');
        setInitialTherapyArea(post.therapyArea ?? 'UNSPECIFIED');
        const uiVis = fromApiVisibility(post.visibility);
        setVisibility(uiVis);
        setInitialVisibility(uiVis);
        setExistingAttachments(post.attachments ?? []);
        setExistingImages(imagesData);
      })
      .catch(() => setError('게시글을 불러오는 데 실패했습니다.'))
      .finally(() => setLoading(false));
  }, [postId]);

  const canSubmit = content.trim().length > 0 && hasChanges && !submitting;

  function removeExistingAttachment(attachmentId: number) {
    setRemovedAttachmentIds((prev) => [...prev, attachmentId]);
  }
  function removeExistingImage(imageId: number) {
    setRemovedImageIds((prev) => [...prev, imageId]);
  }

  async function handleSubmit() {
    if (!postId || !canSubmit) return;
    const pid = Number(postId);
    setSubmitting(true);
    setError(null);
    clearFileError();

    try {
      await updatePost(pid, {
        content,
        therapyArea,
        visibility: toApiVisibility(visibility),
      });

      const totalOps = removedAttachmentIds.length + removedImageIds.length + pendingFiles.length;
      let failedCount = 0;
      if (totalOps > 0) {
        let done = 0;
        setUploadProgress(`첨부파일 처리 중... (0/${totalOps})`);

        for (const attachmentId of removedAttachmentIds) {
          done++;
          setUploadProgress(`첨부파일 처리 중... (${done}/${totalOps})`);
          try {
            await deletePostAttachment(pid, attachmentId);
          } catch {
            failedCount++;
          }
        }

        for (const imageId of removedImageIds) {
          done++;
          setUploadProgress(`첨부파일 처리 중... (${done}/${totalOps})`);
          try {
            await deletePostImage(pid, imageId);
          } catch {
            failedCount++;
          }
        }

        for (const pf of pendingFiles) {
          done++;
          setUploadProgress(`첨부파일 업로드 중... (${done}/${totalOps})`);
          const contentType = resolveUploadContentType(pf.file);
          try {
            const { uploadUrl, storedKey } = await initUpload(pid, {
              kind: pf.kind,
              originalFilename: pf.file.name,
              contentType,
              sizeBytes: pf.file.size,
            });
            await uploadToS3(uploadUrl, pf.file, contentType);
            await confirmUpload(pid, {
              kind: pf.kind,
              storedKey,
              originalFilename: pf.file.name,
            });
          } catch {
            failedCount++;
          }
        }
      }

      if (failedCount > 0) {
        alert(`게시글은 수정되었지만 ${failedCount}개 첨부파일 처리에 실패했습니다.`);
      }
      qc.invalidateQueries({ queryKey: ['feed'] });
      navigate(`/posts/${postId}`);
    } catch {
      setError('게시글 수정에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setSubmitting(false);
      setUploadProgress(null);
    }
  }

  if (!loading && error) return <p className="text-center text-destructive py-20">{error}</p>;

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
      {/* 헤더 — PostWriteForm과 동일: ← 글 수정 ✏️(submit) */}
      <div className="flex items-center justify-between mb-6">
        <button
          type="button"
          onClick={() => navigate(`/posts/${postId}`)}
          aria-label="닫기"
          className="p-1 -ml-1 text-gray-700 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold text-gray-900">글 수정</h1>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit}
          aria-label="수정하기"
          className="p-1 -mr-1 text-gray-900 hover:text-black transition-colors disabled:text-gray-300 disabled:cursor-not-allowed"
        >
          <PencilLine size={20} />
        </button>
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
        <FilePreviewGrid
          pendingFiles={pendingFiles}
          onRemovePending={removePendingFile}
          existingAttachments={existingAttachments}
          removedAttachmentIds={removedAttachmentIds}
          onRemoveExisting={removeExistingAttachment}
          existingImages={existingImages}
          removedImageIds={removedImageIds}
          onRemoveExistingImage={removeExistingImage}
        />

        {/* 숨겨진 file inputs */}
        <input
          ref={imageInputRef}
          type="file"
          accept={IMAGE_ACCEPT}
          multiple
          className="hidden"
          onChange={(e) => {
            addFiles(e.target.files);
            e.target.value = '';
          }}
        />
        <input
          ref={fileInputRef}
          type="file"
          accept={FILE_ACCEPT}
          multiple
          className="hidden"
          onChange={(e) => {
            addFiles(e.target.files);
            e.target.value = '';
          }}
        />

        {(error || fileError) && <p className="text-sm text-red-500">{error || fileError}</p>}
        {uploadProgress && <p className="text-sm text-blue-600">{uploadProgress}</p>}

        {/* 하단 액션 */}
        <div className="pt-2 border-t border-gray-200 flex flex-col gap-3">
          {/* 모바일: 아이콘 행 */}
          <div className="flex items-center md:hidden">
            <button
              type="button"
              aria-label="이미지 첨부"
              onClick={() => imageInputRef.current?.click()}
              disabled={submitting}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Image size={20} />
            </button>
            <button
              type="button"
              aria-label="파일 첨부"
              onClick={() => fileInputRef.current?.click()}
              disabled={submitting}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Paperclip size={20} />
            </button>
            <div className="flex-1" />
            <VisibilityPicker
              visibility={visibility}
              onChange={setVisibility}
              isPublicOnly={isPublicOnly}
            />
          </div>

          {/* 데스크탑: 한 줄 (아이콘들 | 자물쇠) — 수정하기는 헤더로 이동 */}
          <div className="hidden md:flex items-center justify-between">
            <div className="flex items-center">
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                disabled={submitting}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Image size={20} />
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={submitting}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Paperclip size={20} />
              </button>
            </div>
            <VisibilityPicker
              visibility={visibility}
              onChange={setVisibility}
              isPublicOnly={isPublicOnly}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
