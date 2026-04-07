import { Paperclip, X } from 'lucide-react';
import type { PendingFile } from '../../hooks/useFileAttachment';
import type { Attachment } from '../../types/post';

interface FilePreviewGridProps {
  pendingFiles: PendingFile[];
  onRemovePending: (index: number) => void;
  existingAttachments?: Attachment[];
  removedAttachmentIds?: number[];
  onRemoveExisting?: (attachmentId: number) => void;
}

export default function FilePreviewGrid({
  pendingFiles,
  onRemovePending,
  existingAttachments = [],
  removedAttachmentIds = [],
  onRemoveExisting,
}: FilePreviewGridProps) {
  const visibleExisting = existingAttachments.filter(
    (a) => !removedAttachmentIds.includes(a.id),
  );

  if (visibleExisting.length === 0 && pendingFiles.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {visibleExisting.map((a) => (
        <div key={a.id} className="relative group border border-gray-200 rounded-lg overflow-hidden">
          {a.contentType.startsWith('image/') ? (
            <img src={a.downloadUrl} alt={a.originalFilename} className="w-24 h-24 object-cover" />
          ) : (
            <div className="w-24 h-24 flex flex-col items-center justify-center bg-gray-50 px-1">
              <Paperclip size={16} className="text-gray-400 mb-1" />
              <span className="text-xs text-gray-500 text-center truncate w-full">{a.originalFilename}</span>
            </div>
          )}
          {onRemoveExisting && (
            <button
              type="button"
              onClick={() => onRemoveExisting(a.id)}
              className="absolute top-0.5 right-0.5 bg-black/60 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X size={14} />
            </button>
          )}
        </div>
      ))}
      {pendingFiles.map((pf, i) => (
        <div
          key={`${pf.file.name}-${pf.file.lastModified}-${i}`}
          className={`relative group border rounded-lg overflow-hidden ${
            existingAttachments.length > 0 ? 'border-blue-200' : 'border-gray-200'
          }`}
        >
          {pf.previewUrl ? (
            <img src={pf.previewUrl} alt={pf.file.name} className="w-24 h-24 object-cover" />
          ) : (
            <div className={`w-24 h-24 flex flex-col items-center justify-center px-1 ${
              existingAttachments.length > 0 ? 'bg-blue-50' : 'bg-gray-50'
            }`}>
              <Paperclip size={16} className={existingAttachments.length > 0 ? 'text-blue-400 mb-1' : 'text-gray-400 mb-1'} />
              <span className={`text-xs text-center truncate w-full ${
                existingAttachments.length > 0 ? 'text-blue-500' : 'text-gray-500'
              }`}>{pf.file.name}</span>
            </div>
          )}
          <button
            type="button"
            onClick={() => onRemovePending(i)}
            className="absolute top-0.5 right-0.5 bg-black/60 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
