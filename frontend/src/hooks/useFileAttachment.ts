import { useEffect, useRef, useState } from 'react';

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_FILE_COUNT = 10;
export const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
export const IMAGE_ACCEPT = IMAGE_TYPES.join(',');
export const FILE_ACCEPT = '.pdf,application/pdf';

export interface PendingFile {
  file: File;
  previewUrl: string | null;
}

export function useFileAttachment(existingCount = 0) {
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

  function addFiles(files: FileList | null) {
    if (!files) return;
    if (existingCount + pendingFiles.length + files.length > MAX_FILE_COUNT) {
      setFileError(`첨부파일은 최대 ${MAX_FILE_COUNT}개까지 가능합니다.`);
      return;
    }
    const newFiles: PendingFile[] = [];
    for (const file of Array.from(files)) {
      if (file.size > MAX_FILE_SIZE) {
        setFileError(`${file.name}: 10MB 이하 파일만 첨부할 수 있습니다.`);
        continue;
      }
      const isImage = IMAGE_TYPES.includes(file.type);
      const isPdf = file.type === 'application/pdf' || /\.pdf$/i.test(file.name);
      if (!isImage && !isPdf) {
        setFileError(`${file.name}: 이미지(jpg, png, gif, webp) 또는 PDF 파일만 첨부할 수 있습니다.`);
        continue;
      }
      const previewUrl = isImage ? URL.createObjectURL(file) : null;
      if (previewUrl) pendingUrlsRef.current.push(previewUrl);
      newFiles.push({ file, previewUrl });
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

export function isImageFile(file: File): boolean {
  return IMAGE_TYPES.includes(file.type);
}
