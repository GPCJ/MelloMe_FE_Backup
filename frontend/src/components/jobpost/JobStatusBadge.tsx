import type { JobPostStatus } from '../../types/jobPost';
import { isClosed } from '../../utils/jobPost';

export default function JobStatusBadge({
  status,
  dday,
}: {
  status: JobPostStatus;
  dday: number | null;
}) {
  const closed = isClosed(status, dday);
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
        closed ? 'bg-gray-100 text-gray-400' : 'bg-emerald-50 text-emerald-600'
      }`}
    >
      {closed ? '마감' : '모집중'}
    </span>
  );
}
