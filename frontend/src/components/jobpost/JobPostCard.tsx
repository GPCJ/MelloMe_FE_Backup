import { Link } from 'react-router-dom';
import { Building2 } from 'lucide-react';
import type { JobPostSummary } from '../../types/jobPost';
import JobStatusBadge from './JobStatusBadge';
import { ddayLabel, isAlwaysOpen, isClosed } from '../../utils/jobPost';

interface JobPostCardProps {
  job: JobPostSummary;
  // 상세 진입 후 뒤로가기 목적지(탭 보존). 미전달 시 상세는 '/posts?tab=jobs' 폴백.
  backTo?: string;
}

export default function JobPostCard({ job, backTo }: JobPostCardProps) {
  const alwaysOpen = isAlwaysOpen(job);
  const closed = isClosed(job.status, job.dday, alwaysOpen);
  return (
    <Link
      to={`/job-posts/${job.id}`}
      state={backTo ? { from: backTo } : undefined}
      className="block"
    >
      <div className="px-6 py-5 border-b border-gray-200 hover:bg-gray-50 transition-colors">
        {/* 1행: 상태 배지 + D-day */}
        <div className="flex items-center justify-between mb-2">
          <JobStatusBadge status={job.status} dday={job.dday} alwaysOpen={alwaysOpen} />
          {!closed && (
            <span className="text-xs font-semibold text-emerald-600">
              {ddayLabel(job.status, job.dday, alwaysOpen)}
            </span>
          )}
        </div>

        {/* 2행: 제목 */}
        <h3 className="text-base font-bold text-neutral-950 mb-1 line-clamp-1">{job.title}</h3>

        {/* 3행: 기관명 */}
        <div className="flex items-center gap-1 text-sm text-gray-500 mb-2.5">
          <Building2 size={14} className="shrink-0" />
          <span className="line-clamp-1">{job.organizationName}</span>
        </div>

        {/* 4행: 라벨 칩 3종 */}
        <div className="flex flex-wrap gap-1.5">
          <Tag>{job.therapyAreaLabel}</Tag>
          <Tag>{job.regionLabel}</Tag>
          <Tag>{job.employmentTypeLabel}</Tag>
        </div>
      </div>
    </Link>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="bg-gray-100 text-gray-600 text-xs rounded-full px-2 py-0.5">{children}</span>
  );
}
