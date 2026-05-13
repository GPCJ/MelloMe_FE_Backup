import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Image, Lock, LockOpen, Paperclip, PencilLine, X } from 'lucide-react';
import VerifiedBadge from './VerifiedBadge';
import UserAvatar from '../common/UserAvatar';
import { createPost, initUpload, uploadToS3, confirmUpload } from '../../api/posts';
import {
  useFileAttachment,
  IMAGE_ACCEPT,
  FILE_ACCEPT,
  resolveUploadContentType,
} from '../../hooks/useFileAttachment';
import { useAuthStore } from '../../stores/useAuthStore';
import type { TherapyArea, UIVisibility } from '../../types/post';
import {
  THERAPY_CHIPS,
  VISIBILITY_OPTIONS,
  toApiVisibility,
} from '../../constants/post';
import { fetchMyPosts } from '../../api/mypage';
import { trackEvent } from '../../lib/analytics';
import { useDragScroll } from '../../hooks/useDragScroll';

const MAX_LENGTH = 2000;
// 시안 1373:8834(PC 모달) — 짧은 한 줄.
const PLACEHOLDER_MODAL = '치료사님의 시그널을 남겨보세요!';
// 시안 1367:6119(모바일 페이지) — 긴 예시 안내.
const PLACEHOLDER_PAGE = `궁금한 점이나 나누고 싶은 이야기를 자유롭게 작성해보세요.

예시:
- 치료 중 어려운 케이스 상담
- 교구 및 활동지 추천 요청
- 일상적인 치료 경험 공유
- 감정 노동에 대한 이야기`;

interface PostWriteFormProps {
  // 'modal'은 PC 모달 컨테이너 안에서, 'page'는 모바일 단독 페이지에서 사용.
  // 헤더 동작(back→close vs back→navigate)과 외곽 패딩이 분기됨.
  variant: 'modal' | 'page';
  onClose: () => void;
  // 작성 성공 후 호출. 모달은 보통 close + 피드 invalidate, 페이지는 detail로 navigate.
  onSuccess?: (postId: number) => void;
}

export default function PostWriteForm({ variant, onClose, onSuccess }: PostWriteFormProps) {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  // 미인증(USER) 사용자는 비공개/인증치료사 전용 작성 불가 — UI 칩 비활성.
  const isPublicOnly = user?.role === 'USER';

  const [content, setContent] = useState('');
  const [therapyArea, setTherapyArea] = useState<TherapyArea>('UNSPECIFIED');
  const [visibility, setVisibility] = useState<UIVisibility>('PUBLIC');
  const [visibilityOpen, setVisibilityOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);

  const {
    pendingFiles,
    fileError,
    imageInputRef,
    fileInputRef,
    addFiles,
    removeFile,
    clearFileError,
  } = useFileAttachment();

  const canSubmit = content.trim().length > 0 && !submitting;

  // 첫 게시글 여부 (가입→첫글 전환 KPI). 실패 시 조용히 무시.
  const [wasFirstPost, setWasFirstPost] = useState(false);
  useEffect(() => {
    fetchMyPosts(0, 1)
      .then((res) => setWasFirstPost(res.totalElements === 0))
      .catch(() => {});
  }, []);

  // 공개범위 popover 외부 클릭 시 닫기.
  const visibilityRef = useRef<HTMLDivElement>(null);

  // 가로 드래그 스크롤 헬퍼 — 카테고리 칩, 이미지 미리보기에서 공유.
  const chipsScroll = useDragScroll();
  const imagesScroll = useDragScroll();
  useEffect(() => {
    if (!visibilityOpen) return;
    function onDocClick(e: MouseEvent) {
      if (visibilityRef.current && !visibilityRef.current.contains(e.target as Node)) {
        setVisibilityOpen(false);
      }
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [visibilityOpen]);

  async function handleSubmit() {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    clearFileError();

    let createdPostId: number | null = null;
    try {
      const post = await createPost({
        content,
        therapyArea,
        visibility: toApiVisibility(visibility),
      });
      createdPostId = post.id;

      // 첨부파일 순차 업로드 (presigned 3단계: init → S3 PUT → confirm)
      let failedCount = 0;
      if (pendingFiles.length > 0) {
        setUploadProgress(`첨부파일 업로드 중... (0/${pendingFiles.length})`);
        for (let i = 0; i < pendingFiles.length; i++) {
          setUploadProgress(`첨부파일 업로드 중... (${i + 1}/${pendingFiles.length})`);
          const pf = pendingFiles[i];
          const contentType = resolveUploadContentType(pf.file);
          try {
            const { uploadUrl, storedKey } = await initUpload(post.id, {
              kind: pf.kind,
              originalFilename: pf.file.name,
              contentType,
              sizeBytes: pf.file.size,
            });
            await uploadToS3(uploadUrl, pf.file, contentType);
            await confirmUpload(post.id, {
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
        alert(`게시글은 등록되었지만 ${failedCount}개 첨부파일 업로드에 실패했습니다.`);
      }
      trackEvent('post_created');
      if (wasFirstPost) trackEvent('first_post_created');
      onSuccess?.(post.id);
    } catch {
      if (createdPostId) {
        alert('첨부파일 업로드에 실패했습니다. 게시글 상세로 이동합니다.');
        navigate(`/posts/${createdPostId}`);
      } else {
        setError('게시글 작성에 실패했습니다. 다시 시도해주세요.');
      }
    } finally {
      setSubmitting(false);
      setUploadProgress(null);
    }
  }

  // USER는 PUBLIC만 가능 — VISIBILITY_OPTIONS 첫 항목 강제.
  const currentVisibility = isPublicOnly
    ? VISIBILITY_OPTIONS[0]
    : VISIBILITY_OPTIONS.find((o) => o.value === visibility) ?? VISIBILITY_OPTIONS[0];

  // 컨테이너 패딩: 페이지 variant는 자체 여백 필요, 모달은 모달 카드 안에서 렌더되므로 0.
  const containerCls = variant === 'page' ? 'flex flex-col h-[100dvh] bg-white' : 'flex flex-col';

  return (
    <div className={containerCls}>
      {/* 헤더: ← 새 시그널 ✏️(submit) */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-gray-100 shrink-0">
        <button
          type="button"
          onClick={onClose}
          aria-label="닫기"
          className="p-1 -ml-1 text-gray-700 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-base font-semibold text-gray-900">새 시그널</h1>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit}
          aria-label="게시하기"
          className="p-1 -mr-1 text-gray-900 hover:text-black transition-colors disabled:text-gray-300 disabled:cursor-not-allowed"
        >
          <PencilLine size={20} />
        </button>
      </header>

      {/* 본문 스크롤 영역 */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4">
        {/* 작성자 정보 */}
        {user && (
          <div className="flex items-center gap-2">
            <UserAvatar nickname={user.nickname} imageUrl={user.profileImageUrl} size="sm" />
            <span className="text-sm font-semibold text-gray-900">{user.nickname}</span>
            <VerifiedBadge status={user.therapistVerification?.status} />
          </div>
        )}

        {/* 치료영역 칩 — PC 마우스 드래그 스크롤 + 모바일 터치 swipe 자연 동작 */}
        <div
          ref={chipsScroll.ref}
          {...chipsScroll.handlers}
          className="flex gap-2 overflow-x-auto -mx-4 px-4 cursor-grab select-none"
        >
          {THERAPY_CHIPS.map((chip) => {
            const active = therapyArea === chip.value;
            return (
              <button
                key={chip.value}
                type="button"
                onClick={(e) => {
                  // 드래그 거리 > 5px면 클릭 무시 (드래그 끝에 칩이 우연히 선택되는 것 방지)
                  if (chipsScroll.state.current.moved > 5) {
                    e.preventDefault();
                    return;
                  }
                  setTherapyArea(chip.value);
                }}
                className={`shrink-0 px-3.5 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                  active
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'
                }`}
              >
                {chip.label}
              </button>
            );
          })}
        </div>

        {/* 본문 — 시안 1367:6119: 옅은 회색 배경, border 없음, placeholder 멀티라인 예시. */}
        <div className="flex flex-col gap-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={variant === 'page' ? PLACEHOLDER_PAGE : PLACEHOLDER_MODAL}
            maxLength={MAX_LENGTH}
            rows={9}
            className="w-full resize-none rounded-lg bg-gray-100 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 placeholder:whitespace-pre-line focus:outline-none focus:ring-2 focus:ring-gray-300"
          />
          <p className="text-xs text-gray-400 text-right">
            {content.length} / {MAX_LENGTH}
          </p>
        </div>

        {/* 비이미지 첨부(PDF 등) — 시안 1427:22534: 세로 리스트, ⊗ + 파일명 */}
        {(() => {
          const otherRows = pendingFiles
            .map((pf, originalIndex) => ({ pf, originalIndex }))
            .filter((row) => row.pf.kind !== 'IMAGE');
          if (otherRows.length === 0) return null;
          return (
            <ul className="flex flex-col gap-1.5">
              {otherRows.map(({ pf, originalIndex }) => (
                <li
                  key={`${pf.file.name}-${pf.file.lastModified}-${originalIndex}`}
                  className="flex items-center gap-2 text-sm text-gray-900"
                >
                  <button
                    type="button"
                    aria-label={`${pf.file.name} 삭제`}
                    onClick={() => removeFile(originalIndex)}
                    className="shrink-0 bg-black text-white rounded-full p-0.5 hover:bg-gray-800 transition-colors"
                  >
                    <X size={12} />
                  </button>
                  <span className="truncate">{pf.file.name}</span>
                </li>
              ))}
            </ul>
          );
        })()}

        {/* 이미지 미리보기 — 가로 드래그 스크롤 (시안 1427:22534), 원본 인덱스 기억해서 removeFile에 전달 */}
        {(() => {
          const imageRows = pendingFiles
            .map((pf, originalIndex) => ({ pf, originalIndex }))
            .filter((row) => row.pf.kind === 'IMAGE');
          if (imageRows.length === 0) return null;
          return (
            <div
              ref={imagesScroll.ref}
              {...imagesScroll.handlers}
              className="flex gap-2 overflow-x-auto -mx-4 px-4 cursor-grab select-none"
            >
              {imageRows.map(({ pf, originalIndex }) => (
                <div
                  key={`${pf.file.name}-${pf.file.lastModified}-${originalIndex}`}
                  className="relative shrink-0"
                >
                  <img
                    src={pf.previewUrl ?? ''}
                    alt={pf.file.name}
                    draggable={false}
                    className="w-24 h-24 rounded-lg object-cover border border-gray-200"
                  />
                  <button
                    type="button"
                    aria-label="이미지 삭제"
                    onClick={(e) => {
                      if (imagesScroll.state.current.moved > 5) {
                        e.preventDefault();
                        return;
                      }
                      removeFile(originalIndex);
                    }}
                    className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 hover:bg-black/80 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          );
        })()}

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

        {(error || fileError) && (
          <p className="text-sm text-red-500">{error || fileError}</p>
        )}
        {uploadProgress && <p className="text-sm text-blue-600">{uploadProgress}</p>}
      </div>

      {/* 하단 툴바: 🖼️ 📎 | 공개범위 칩 + 자물쇠 */}
      <footer className="border-t border-gray-100 px-4 py-2.5 flex items-center gap-2 shrink-0">
        <button
          type="button"
          aria-label="이미지 첨부"
          onClick={() => imageInputRef.current?.click()}
          disabled={submitting}
          className="p-2 text-gray-500 hover:text-gray-900 transition-colors disabled:opacity-40"
        >
          <Image size={20} />
        </button>
        <button
          type="button"
          aria-label="파일 첨부"
          onClick={() => fileInputRef.current?.click()}
          disabled={submitting}
          className="p-2 text-gray-500 hover:text-gray-900 transition-colors disabled:opacity-40"
        >
          <Paperclip size={20} />
        </button>

        <div className="flex-1" />

        {/* 공개범위 트리거 + popover */}
        <div className="relative" ref={visibilityRef}>
          <button
            type="button"
            onClick={() => !isPublicOnly && setVisibilityOpen((v) => !v)}
            disabled={isPublicOnly}
            aria-haspopup="menu"
            aria-expanded={visibilityOpen}
            title={isPublicOnly ? '치료사 인증 후 공개 범위 설정 가능' : undefined}
            className={`flex items-center gap-1.5 text-xs ${
              isPublicOnly
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-700 hover:text-gray-900 cursor-pointer'
            }`}
          >
            <span>{currentVisibility.chipLabel}</span>
            {currentVisibility.value === 'PUBLIC' ? (
              <LockOpen size={14} />
            ) : (
              <Lock size={14} />
            )}
          </button>

          {visibilityOpen && (
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
                    onClick={() => setVisibility(opt.value)}
                    className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-sm text-gray-900">{opt.label}</span>
                    {/* 토글 — 시안 1367:6227: 흰 배경 pill + 검은 점이 좌/우 이동. */}
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
      </footer>
    </div>
  );
}
