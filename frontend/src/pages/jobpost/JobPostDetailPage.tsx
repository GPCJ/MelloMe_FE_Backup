import { useParams, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ExternalLink } from 'lucide-react';
import NarrowPage from '../../components/common/NarrowPage';
import PageHeader from '../../components/common/PageHeader';
import JobStatusBadge from '../../components/jobpost/JobStatusBadge';
import { ddayLabel, deadlineText, isAlwaysOpen, isClosed, isHttpUrl } from '../../utils/jobPost';
import { fetchJobPostDetail } from '../../api/jobPosts';

export default function JobPostDetailPage() {
  const { jobPostId } = useParams();
  const location = useLocation();
  const backTo = (location.state as { from?: string } | null)?.from ?? '/posts?tab=jobs';
  const id = Number(jobPostId);

  const {
    data: job,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['job-post', id],
    queryFn: ({ signal }) => fetchJobPostDetail(id, signal),
    enabled: !Number.isNaN(id),
  });

  const alwaysOpen = job ? isAlwaysOpen(job) : false;
  const closed = job ? isClosed(job.status, job.dday, alwaysOpen) : false;

  return (
    <NarrowPage>
      <PageHeader title="구인공고" backTo={backTo} />

      {isLoading && <p className="text-center py-16 text-gray-400">불러오는 중…</p>}
      {isError && <p className="text-center py-16 text-destructive">공고를 불러오지 못했어요.</p>}

      {job && (
        <div className="px-5 pb-10">
          {/* 상태 + D-day */}
          <div className="flex items-center gap-2 mb-2 mt-1">
            <JobStatusBadge status={job.status} dday={job.dday} alwaysOpen={alwaysOpen} />
            {!closed && (
              <span className="text-sm font-semibold text-emerald-600">
                {ddayLabel(job.status, job.dday, alwaysOpen)}
              </span>
            )}
          </div>

          {/* 제목 + 기관 */}
          <h1 className="text-xl font-bold text-neutral-950 mb-1">{job.title}</h1>
          <p className="text-sm text-gray-500 mb-5">{job.organizationName}</p>

          {/* 메타 */}
          <dl className="space-y-2 text-sm border-y border-gray-100 py-4">
            <MetaRow label="치료영역" value={job.therapyAreaLabel} />
            <MetaRow label="지역" value={job.regionLabel} />
            <MetaRow label="고용형태" value={job.employmentTypeLabel} />
            {job.salaryText && <MetaRow label="급여" value={job.salaryText} />}
            <MetaRow label="마감" value={deadlineText(job)} />
          </dl>

          {/* 본문 */}
          <Section title="상세 내용" body={job.content} />
          {job.qualification && <Section title="자격요건" body={job.qualification} />}
          {job.preferred && <Section title="우대사항" body={job.preferred} />}

          {/* 아웃링크 CTA — http(s) 절대 URL일 때만 렌더. 스킴 없는 값은 SPA 내부 상대경로로
              오인되고 javascript: 등은 클릭 시 실행되므로 isHttpUrl로 방어(폼 검증과 이중). */}
          {isHttpUrl(job.sourceUrl) && (
            <a
              href={job.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 flex w-full items-center justify-center gap-1.5 rounded-lg bg-gray-900 py-3 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
            >
              원문에서 지원하기
              <ExternalLink size={16} />
            </a>
          )}
        </div>
      )}
    </NarrowPage>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex">
      <dt className="w-16 shrink-0 font-semibold text-gray-600">{label}</dt>
      <dd className="text-gray-700">{value}</dd>
    </div>
  );
}

function Section({ title, body }: { title: string; body: string }) {
  return (
    <div className="mt-5">
      <h2 className="text-sm font-bold text-gray-800 mb-1.5">{title}</h2>
      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap break-words">
        {body}
      </p>
    </div>
  );
}
