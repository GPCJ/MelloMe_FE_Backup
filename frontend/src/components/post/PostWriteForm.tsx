import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Image, Paperclip, X } from 'lucide-react';
import VerifiedBadge from './VerifiedBadge';
import UserAvatar from '../common/UserAvatar';
import WriteFormHeader from './WriteFormHeader';
import VisibilityPicker from './VisibilityPicker';
import { createPost, uploadOneAttachment } from '../../api/posts';
import {
  useFileAttachment,
  IMAGE_ACCEPT,
  FILE_ACCEPT,
} from '../../hooks/useFileAttachment';
import { useAuthStore } from '../../stores/useAuthStore';
import type { TherapyArea, UIVisibility } from '../../types/post';
import { THERAPY_CHIPS, toApiVisibility } from '../../constants/post';
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
  // 작성 타입 토글 — 컨테이너가 모드를 소유, 폼은 헤더에 토글을 렌더.
  mode: 'post' | 'concern';
  onModeChange: (m: 'post' | 'concern') => void;
}

export default function PostWriteForm({ variant, onClose, onSuccess, mode, onModeChange }: PostWriteFormProps) {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  // 미인증(USER) 사용자는 비공개/인증치료사 전용 작성 불가 — UI 칩 비활성.
  const isPublicOnly = user?.role === 'USER';

  const [content, setContent] = useState('');
  const [therapyArea, setTherapyArea] = useState<TherapyArea>('UNSPECIFIED');
  const [visibility, setVisibility] = useState<UIVisibility>('PUBLIC');
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

  // 사용자가 한 줄이라도 작성/첨부/세팅했으면 dirty — mode 토글 시 confirm으로 손실 방지.
  const isDirty =
    content.trim().length > 0 ||
    pendingFiles.length > 0 ||
    therapyArea !== 'UNSPECIFIED' ||
    visibility !== 'PUBLIC';

  const handleModeChange = (next: 'post' | 'concern') => {
    if (next === mode) return;
    // USER 권한은 고민카드 작성 불가(백엔드 400). 토스트로 안내 + 인증 페이지 진입 동선 제공.
    // 텍스트 위, 버튼 아래로 세로 정렬 — sonner 기본 가로 action 대신 message에 ReactNode 직접 전달.
    if (next === 'concern' && isPublicOnly) {
      toast.error(
        <div className="flex flex-col items-start gap-2">
          <span>이 기능은 치료사 인증이 필요한 기능입니다.</span>
          <button
            type="button"
            onClick={() => {
              toast.dismiss();
              navigate('/therapist-verifications');
            }}
            className="self-center rounded-md bg-gray-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-black"
          >
            치료사 인증하러 가기
          </button>
        </div>
      );
      return;
    }
    if (isDirty && !window.confirm('작성 중인 내용이 사라집니다. 전환할까요?')) return;
    onModeChange(next);
  };

  // 첫 게시글 여부 (가입→첫글 전환 KPI). 실패 시 조용히 무시.
  const [wasFirstPost, setWasFirstPost] = useState(false);
  useEffect(() => {
    fetchMyPosts(0, 1)
      .then((res) => setWasFirstPost(res.totalElements === 0))
      .catch(() => {});
  }, []);

  // 폼 unmount 시(라우트 이동·모달 닫기 등) 띄워둔 토스트도 함께 dismiss — 컨텍스트 사라진 토스트가 잔존하지 않게.
  useEffect(() => {
    return () => {
      toast.dismiss();
    };
  }, []);

  // 가로 드래그 스크롤 헬퍼 — 카테고리 칩, 이미지 미리보기에서 공유.
  const chipsScroll = useDragScroll();
  const imagesScroll = useDragScroll();

  async function handleSubmit() {
    if (submitting) return;
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
          try {
            await uploadOneAttachment(post.id, pf, { maxAttempts: 3 })
          } catch (err) {
            failedCount++;
            console.error('[image-attach] uploadOneAttachment 호출부 실패(PostWriteForm)', {
              postId: post.id,
              fileName: pf.file.name,
              kind: pf.kind,
              err,
            });
          }
        }
      }

      if (failedCount > 0) {
        toast.error(`게시글은 등록되었지만 ${failedCount}개 첨부파일 업로드에 실패했습니다.`);
      }
      trackEvent('post_created');
      if (wasFirstPost) trackEvent('first_post_created');
      onSuccess?.(post.id);
    } catch (err) {
      console.error('[image-attach] 게시글 작성 흐름 실패(PostWriteForm)', {
        createdPostId,
        err,
      });
      if (createdPostId) {
        toast.error('첨부파일 업로드에 실패했습니다. 게시글 상세로 이동합니다.');
        navigate(`/posts/${createdPostId}`);
      } else {
        setError('게시글 작성에 실패했습니다. 다시 시도해주세요.');
      }
    } finally {
      setSubmitting(false);
      setUploadProgress(null);
    }
  }

  // 컨테이너 패딩: 페이지 variant는 자체 여백 필요, 모달은 모달 카드 안에서 렌더되므로 0.
  // 모달 모드: 부모(PostWriteModal)가 max-h-[90vh] flex-col이므로 flex-1 min-h-0으로 채워
  // 내부 body의 overflow-y-auto가 발동(스크롤)되도록 한다. (ConcernForm과 동일 패턴)
  const containerCls =
    variant === 'page' ? 'flex flex-col h-[100dvh] bg-white' : 'flex flex-col flex-1 min-h-0';

  return (
    <div className={containerCls}>
      <WriteFormHeader
        onClose={onClose}
        onSubmit={handleSubmit}
        canSubmit={canSubmit}
        mode={mode}
        onModeChange={handleModeChange}
      />

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

      {/* 하단 툴바: 🖼️ 📎 | 공개범위 — 모바일(page)·PC(modal) 동일 위치 (기존 동작 유지). */}
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
        <VisibilityPicker
          visibility={visibility}
          onChange={setVisibility}
          isPublicOnly={isPublicOnly}
        />
      </footer>
    </div>
  );
}
