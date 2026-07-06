import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useJobPostMutations } from '../../hooks/useJobPostMutations';
import type { JobPostDetail } from '../../types/jobPost';

interface JobPostActionsProps {
  job: JobPostDetail;
}

// 상세 하단 수정/삭제 액션바. 권한은 BE가 내려준 canEdit로 분기 — 없거나 false면 아무것도 안 그림.
// 마감(close)은 이번 스코프 밖(2026-07-06) — 필요 시 여기에 '마감' 버튼을 추가하고
// job.canClose 게이트 + close mutation을 붙이면 됨(자리만 남겨둠).
export default function JobPostActions({ job }: JobPostActionsProps) {
  const navigate = useNavigate();
  const { remove } = useJobPostMutations();
  const [confirming, setConfirming] = useState(false);

  if (!job.canEdit) return null;

  const handleDelete = async () => {
    try {
      await remove.mutateAsync(job.id);
      toast.success('공고를 삭제했어요.');
      navigate('/posts?tab=jobs');
    } catch (err) {
      console.error('[jobpost] deleteJobPost 실패(JobPostActions)', err);
      toast.error('삭제에 실패했어요. 다시 시도해주세요.');
      setConfirming(false);
    }
  };

  return (
    <div className="mt-6 border-t border-gray-100 pt-4">
      {confirming ? (
        // 2단계 확인 — 오삭제 방지. window.confirm 대신 인라인으로 흐름 유지.
        <div className="flex flex-col gap-2">
          <p className="text-sm text-gray-700">이 공고를 삭제할까요? 되돌릴 수 없어요.</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleDelete}
              disabled={remove.isPending}
              className="flex-1 rounded-lg bg-red-500 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-600 disabled:opacity-50"
            >
              {remove.isPending ? '삭제 중…' : '삭제'}
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              disabled={remove.isPending}
              className="flex-1 rounded-lg border border-gray-200 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-50"
            >
              취소
            </button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() =>
              navigate(`/job-posts/${job.id}/edit`, { state: { from: '/posts?tab=jobs' } })
            }
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-gray-200 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            <Pencil size={15} />
            수정
          </button>
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-red-200 py-2.5 text-sm font-medium text-red-500 transition-colors hover:bg-red-50"
          >
            <Trash2 size={15} />
            삭제
          </button>
        </div>
      )}
    </div>
  );
}
