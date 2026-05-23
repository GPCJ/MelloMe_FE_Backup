import { useEffect, useRef, useState } from 'react';

export const IMAGE_MAX_SIZE = 10 * 1024 * 1024; // 10MB
export const ATTACHMENT_MAX_SIZE = 50 * 1024 * 1024; // 50MB
export const MAX_IMAGE_COUNT = 10;
export const MAX_ATTACHMENT_COUNT = 5;
export const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const IMAGE_ACCEPT = IMAGE_TYPES.join(',');
export const FILE_ACCEPT = '.pdf,.hwp,.docx,.xlsx';

const ATTACHMENT_MIME_TYPES = [
  'application/pdf',
  'application/x-hwp',
  'application/haansofthwp',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];
const ATTACHMENT_EXTENSIONS = ['.pdf', '.hwp', '.docx', '.xlsx'];

export interface PendingFile {
  file: File;
  previewUrl: string | null;
  kind: 'IMAGE' | 'ATTACHMENT';
}

export function isImageFile(file: File): boolean {
  return IMAGE_TYPES.includes(file.type);
}

export function isAttachmentFile(file: File): boolean {
  const name = file.name.toLowerCase();
  if (ATTACHMENT_EXTENSIONS.some((ext) => name.endsWith(ext))) return true;
  return ATTACHMENT_MIME_TYPES.includes(file.type);
}

// HWP·docx·xlsx는 브라우저마다 MIME이 달라 확장자 기준으로 정규화
export function resolveUploadContentType(file: File): string {
  const name = file.name.toLowerCase();
  if (name.endsWith('.hwp')) return 'application/x-hwp';
  if (name.endsWith('.docx'))
    return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  if (name.endsWith('.xlsx'))
    return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
  return file.type;
}

export function useFileAttachment(existingImageCount = 0, existingAttachmentCount = 0) {
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingUrlsRef = useRef<string[]>([]);

  useEffect(() => {
    return () => {
      pendingUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  async function addFiles(files: FileList | null) {
    if (!files) return;
    const newFiles: PendingFile[] = [];

    for (const file of Array.from(files)) {
      const isImage = isImageFile(file);
      const isAttachment = isAttachmentFile(file);

      if (!isImage && !isAttachment) {
        setFileError(
          `${file.name}: 이미지(jpg·png·webp) 또는 문서(PDF·HWP·docx·xlsx) 파일만 첨부할 수 있습니다.`,
        );
        continue;
      }

      if (isImage) {
        const pendingImageCount =
          pendingFiles.filter((f) => f.kind === 'IMAGE').length +
          newFiles.filter((f) => f.kind === 'IMAGE').length;
        if (existingImageCount + pendingImageCount >= MAX_IMAGE_COUNT) {
          setFileError(`이미지는 최대 ${MAX_IMAGE_COUNT}장까지 첨부할 수 있습니다.`);
          continue;
        }
        if (file.size > IMAGE_MAX_SIZE) {
          setFileError(`${file.name}: 이미지는 10MB 이하만 첨부할 수 있습니다.`);
          continue;
        }
      }

      if (isAttachment) {
        const pendingAttachmentCount =
          pendingFiles.filter((f) => f.kind === 'ATTACHMENT').length +
          newFiles.filter((f) => f.kind === 'ATTACHMENT').length;
        if (existingAttachmentCount + pendingAttachmentCount >= MAX_ATTACHMENT_COUNT) {
          setFileError(`첨부파일은 최대 ${MAX_ATTACHMENT_COUNT}개까지 가능합니다.`);
          continue;
        }
        if (file.size > ATTACHMENT_MAX_SIZE) {
          setFileError(`${file.name}: 첨부파일은 50MB 이하만 가능합니다.`);
          continue;
        }
      }

      if (isAttachment && !isImage) {
        newFiles.push({ file, previewUrl: null, kind: 'ATTACHMENT' });
        continue;
      }

      const previewUrl = URL.createObjectURL(file);
      try {
        const img = new Image();
        img.src = previewUrl;
        await img.decode();
      } catch {
        URL.revokeObjectURL(previewUrl);
        setFileError(`${file.name}: 다른 사진을 선택하거나 다시 시도해 주세요.`);
        continue;
      }

      pendingUrlsRef.current.push(previewUrl);
      newFiles.push({ file, previewUrl, kind: 'IMAGE' });
    }

    setPendingFiles((prev) => [...prev, ...newFiles]);
  }

  function removeFile(index: number) {
    setPendingFiles((prev) => {
      const removed = prev[index];
      if (removed.previewUrl) {
        URL.revokeObjectURL(removed.previewUrl);
        pendingUrlsRef.current = pendingUrlsRef.current.filter((u) => u !== removed.previewUrl);
      }
      return prev.filter((_, i) => i !== index);
    });
  }

  function clearFileError() {
    setFileError(null);
  }

  return {
    pendingFiles,
    fileError,
    imageInputRef,
    fileInputRef,
    addFiles,
    removeFile,
    clearFileError,
  };
}
