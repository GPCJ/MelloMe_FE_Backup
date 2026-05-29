import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Image, Paperclip, PencilLine } from 'lucide-react';
import { Skeleton } from '@/components/shadcn-ui/skeleton';
import SimpleTextEditor from '../../components/post/SimpleTextEditor';
import FilePreviewGrid from '../../components/post/FilePreviewGrid';
import VisibilityPicker from '../../components/post/VisibilityPicker';
import {
  fetchPost,
  fetchPostImages,
  updatePost,
  deletePostAttachment,
  deletePostImage,
  uploadOneAttachment,
} from '../../api/posts';
import {
  useFileAttachment,
  IMAGE_ACCEPT,
  FILE_ACCEPT,
} from '../../hooks/useFileAttachment';
import { useAuthStore } from '../../stores/useAuthStore';
import ConcernEditForm from '../../components/post/ConcernEditForm';
import type { Attachment, PostDetail, PostImage, TherapyArea, UIVisibility } from '../../types/post';
import {
  THERAPY_CHIPS,
  toApiVisibility,
  fromApiVisibility,
} from '../../constants/post';
import { useQueryClient } from '@tanstack/react-query';

export default function PostEditPage() {
  const qc = useQueryClient();
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const isPublicOnly = user?.role === 'USER';

  // 고민카드 수정 분기 — fetchPost 결과 postType === 'CONCERN_CARD'면 ConcernEditForm로 위임.
  // 일반 글(COMMUNITY/RESOURCE) state는 그대로 유지(분기 후 미사용이지만 초기값으로 무해).
  const [concernPost, setConcernPost] = useState<PostDetail | null>(null);

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
        // 고민카드는 별도 폼으로 분기 — 첨부 미지원이라 imagesData 무시.
        if (post.postType === 'CONCERN_CARD') {
          setConcernPost(post);
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
          } catch (err) {
            failedCount++;
            console.error('[image-attach] deletePostAttachment 호출부 실패(PostEditPage)', {
              postId: pid,
              attachmentId,
              err,
            });
          }
        }

        for (const imageId of removedImageIds) {
          done++;
          setUploadProgress(`첨부파일 처리 중... (${done}/${totalOps})`);
          try {
            await deletePostImage(pid, imageId);
          } catch (err) {
            failedCount++;
            console.error('[image-attach] deletePostImage 호출부 실패(PostEditPage)', {
              postId: pid,
              imageId,
              err,
            });
          }
        }

        for (const pf of pendingFiles) {
          done++;
          setUploadProgress(`첨부파일 업로드 중... (${done}/${totalOps})`);
          try {
            await uploadOneAttachment(pid, pf, {maxAttempts: 3})
          } catch (err) {
            failedCount++;
            console.error('[image-attach] uploadOneAttachment 호출부 실패(PostEditPage)', {
              postId: pid,
              fileName: pf.file.name,
              kind: pf.kind,
              err,
            });
          }
        }
      }

      if (failedCount > 0) {
        alert(`게시글은 수정되었지만 ${failedCount}개 첨부파일 처리에 실패했습니다.`);
      }
      qc.invalidateQueries({ queryKey: ['feed'] });
      navigate(`/posts/${postId}`);
    } catch (err) {
      console.error('[image-attach] 게시글 수정 흐름 실패(PostEditPage)', { err });
      setError('게시글 수정에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setSubmitting(false);
      setUploadProgress(null);
    }
  }

  if (!loading && error) return <p className="text-center text-destructive py-20">{error}</p>;

  // 고민카드 수정 분기 — postType이 CONCERN_CARD면 전용 폼으로 위임.
  if (!loading && concernPost) {
    const pid = Number(postId);
    return (
      <ConcernEditForm
        postId={pid}
        initial={{
          content: concernPost.content,
          ageGroup: concernPost.ageGroup ?? 'UNSPECIFIED',
          therapyArea: concernPost.therapyArea ?? 'UNSPECIFIED',
          diagnoses: concernPost.diagnoses ?? [],
          otherNotes: concernPost.otherNotes ?? '',
          visibility: concernPost.visibility ?? 'PUBLIC',
        }}
        onClose={() => navigate(`/posts/${pid}`)}
        onSuccess={() => {
          qc.invalidateQueries({ queryKey: ['feed'] });
          navigate(`/posts/${pid}`);
        }}
      />
    );
  }

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
