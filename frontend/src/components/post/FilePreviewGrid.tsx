import { X } from 'lucide-react';
import type { PendingFile } from '../../hooks/useFileAttachment';
import type { Attachment, PostImage } from '../../types/post';
import { resolveImageUrl } from '../../utils/resolveImageUrl';

interface FilePreviewGridProps {
  pendingFiles: PendingFile[];
  onRemovePending: (index: number) => void;
  existingAttachments?: Attachment[];
  removedAttachmentIds?: number[];
  onRemoveExisting?: (attachmentId: number) => void;
  existingImages?: PostImage[];
  removedImageIds?: number[];
  onRemoveExistingImage?: (imageId: number) => void;
}

// 글쓰기 모달(PostWriteForm)과 동일한 첨부 표시 패턴.
//   - 비이미지(PDF/HWP/docx/xlsx 등) → 세로 리스트, ⊗ + 파일명
//   - 이미지 → 가로 스크롤, 24x24 썸네일 우상단 ⊗
// 기존(server) 항목과 신규(pending) 항목을 한 리스트에 섞어 노출.
// 기존 항목 ⊗는 removed* IDs에 누적(서버 commit 시 일괄 DELETE), pending ⊗는 즉시 로컬에서 제거.
export default function FilePreviewGrid({
  pendingFiles,
  onRemovePending,
  existingAttachments = [],
  removedAttachmentIds = [],
  onRemoveExisting,
  existingImages = [],
  removedImageIds = [],
  onRemoveExistingImage,
}: FilePreviewGridProps) {
  const visibleExistingAttachments = existingAttachments.filter(
    (a) => !removedAttachmentIds.includes(a.id),
  );
  const visibleExistingImages = existingImages.filter((i) => !removedImageIds.includes(i.id));

  // contentType이 image/* 인 기존 첨부도 이미지 스크롤에 합류.
  const existingImageAttachments = visibleExistingAttachments.filter((a) =>
    a.contentType.startsWith('image/'),
  );
  const existingNonImageAttachments = visibleExistingAttachments.filter(
    (a) => !a.contentType.startsWith('image/'),
  );

  const otherRows: Array<
    | { src: 'existing-attachment'; attachment: Attachment }
    | { src: 'pending'; pf: PendingFile; originalIndex: number }
  > = [
    ...existingNonImageAttachments.map((a) => ({ src: 'existing-attachment' as const, attachment: a })),
    ...pendingFiles
      .map((pf, originalIndex) => ({ pf, originalIndex }))
      .filter((row) => row.pf.kind !== 'IMAGE')
      .map(({ pf, originalIndex }) => ({ src: 'pending' as const, pf, originalIndex })),
  ];

  const imageRows: Array<
    | { src: 'existing-image'; image: PostImage }
    | { src: 'existing-attachment-image'; attachment: Attachment }
    | { src: 'pending'; pf: PendingFile; originalIndex: number }
  > = [
    ...visibleExistingImages.map((img) => ({ src: 'existing-image' as const, image: img })),
    ...existingImageAttachments.map((a) => ({
      src: 'existing-attachment-image' as const,
      attachment: a,
    })),
    ...pendingFiles
      .map((pf, originalIndex) => ({ pf, originalIndex }))
      .filter((row) => row.pf.kind === 'IMAGE')
      .map(({ pf, originalIndex }) => ({ src: 'pending' as const, pf, originalIndex })),
  ];

  if (otherRows.length === 0 && imageRows.length === 0) return null;

  return (
    <div className="flex flex-col gap-4">
      {otherRows.length > 0 && (
        <ul className="flex flex-col gap-1.5">
          {otherRows.map((row) =>
            row.src === 'existing-attachment' ? (
              <li
                key={`ex-att-${row.attachment.id}`}
                className="flex items-center gap-2 text-sm text-gray-900"
              >
                {onRemoveExisting && (
                  <button
                    type="button"
                    aria-label={`${row.attachment.originalFilename} 삭제`}
                    onClick={() => onRemoveExisting(row.attachment.id)}
                    className="shrink-0 bg-black text-white rounded-full p-0.5 hover:bg-gray-800 transition-colors"
                  >
                    <X size={12} />
                  </button>
                )}
                <span className="truncate">{row.attachment.originalFilename}</span>
              </li>
            ) : (
              <li
                key={`pen-att-${row.pf.file.name}-${row.pf.file.lastModified}-${row.originalIndex}`}
                className="flex items-center gap-2 text-sm text-gray-900"
              >
                <button
                  type="button"
                  aria-label={`${row.pf.file.name} 삭제`}
                  onClick={() => onRemovePending(row.originalIndex)}
                  className="shrink-0 bg-black text-white rounded-full p-0.5 hover:bg-gray-800 transition-colors"
                >
                  <X size={12} />
                </button>
                <span className="truncate">{row.pf.file.name}</span>
              </li>
            ),
          )}
        </ul>
      )}

      {imageRows.length > 0 && (
        <div className="flex gap-2 overflow-x-auto -mx-4 px-4">
          {imageRows.map((row) => {
            if (row.src === 'existing-image') {
              return (
                <div key={`ex-img-${row.image.id}`} className="relative shrink-0">
                  <img
                    src={resolveImageUrl(row.image.imageUrl) ?? ''}
                    alt={row.image.originalFilename}
                    draggable={false}
                    className="w-24 h-24 rounded-lg object-cover border border-gray-200"
                  />
                  {onRemoveExistingImage && (
                    <button
                      type="button"
                      aria-label="이미지 삭제"
                      onClick={() => onRemoveExistingImage(row.image.id)}
                      className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 hover:bg-black/80 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              );
            }
            if (row.src === 'existing-attachment-image') {
              return (
                <div key={`ex-att-img-${row.attachment.id}`} className="relative shrink-0">
                  <img
                    src={row.attachment.downloadUrl}
                    alt={row.attachment.originalFilename}
                    draggable={false}
                    className="w-24 h-24 rounded-lg object-cover border border-gray-200"
                  />
                  {onRemoveExisting && (
                    <button
                      type="button"
                      aria-label="이미지 삭제"
                      onClick={() => onRemoveExisting(row.attachment.id)}
                      className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 hover:bg-black/80 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              );
            }
            return (
              <div
                key={`pen-img-${row.pf.file.name}-${row.pf.file.lastModified}-${row.originalIndex}`}
                className="relative shrink-0"
              >
                <img
                  src={row.pf.previewUrl ?? ''}
                  alt={row.pf.file.name}
                  draggable={false}
                  className="w-24 h-24 rounded-lg object-cover border border-gray-200"
                />
                <button
                  type="button"
                  aria-label="이미지 삭제"
                  onClick={() => onRemovePending(row.originalIndex)}
                  className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 hover:bg-black/80 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
