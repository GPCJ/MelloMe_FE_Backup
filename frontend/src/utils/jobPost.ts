import type {
  EmploymentType,
  JobPostDetail,
  JobPostStatus,
  JobPostSummary,
  JobRegion,
} from '../types/jobPost';
import type { TherapyArea } from '../types/post';
import { ALWAYS_OPEN_DEADLINE } from '../constants/jobPost';

// 상시모집 판별 — BE alwaysOpen 우선, 미배포 구간엔 sentinel 날짜/ null dday로 방어적 폴백.
// (dday===null은 Phase 1 타입 주석의 "상시/미정" 관례. sentinel 합의 이전 데이터 호환용.)
export function isAlwaysOpen(
  job: Pick<JobPostSummary, 'alwaysOpen' | 'deadlineDate' | 'dday'>,
): boolean {
  return (
    job.alwaysOpen === true ||
    job.deadlineDate === ALWAYS_OPEN_DEADLINE ||
    job.dday === null
  );
}

// 마감 판정: 상시모집은 절대 마감 아님, 그 외엔 명시 CLOSED 또는 dday 음수.
export function isClosed(
  status: JobPostStatus,
  dday: number | null,
  alwaysOpen = false,
): boolean {
  if (alwaysOpen) return false;
  return status === 'CLOSED' || (dday !== null && dday < 0);
}

// D-day 라벨: 상시/마감/D-DAY/D-n.
export function ddayLabel(
  status: JobPostStatus,
  dday: number | null,
  alwaysOpen = false,
): string {
  if (alwaysOpen) return '상시모집';
  if (isClosed(status, dday)) return '마감';
  if (dday === null) return '상시모집';
  if (dday === 0) return 'D-DAY';
  return `D-${dday}`;
}

// 마감일 표시 텍스트 — 상시모집이면 sentinel 날짜(9999-12-31) 대신 "상시모집".
export function deadlineText(
  job: Pick<JobPostSummary, 'alwaysOpen' | 'deadlineDate' | 'dday'>,
): string {
  return isAlwaysOpen(job) ? '상시모집' : job.deadlineDate;
}

// 원문 링크(sourceUrl)가 http/https 절대 URL인지 검증.
// 스킴 없는 값(예: example.com)은 상세의 <a href>에서 SPA 내부 상대경로로 오인되고,
// javascript: 등 위험 스킴은 클릭 시 실행되므로 http(s)만 허용한다.
export function isHttpUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

// 작성/수정 공용 폼(JobPostForm)의 원시 필드 상태 shape.
// payload와 다른 점: therapyArea/employmentType은 미선택(null)·region은 미선택('')을 표현하고,
// alwaysRecruiting은 체크박스라 deadlineDate와 별도로 들고 감(제출 시 payload로 정규화).
export interface JobPostFormValues {
  organizationName: string;
  therapyArea: TherapyArea | null;
  region: JobRegion | '';
  employmentType: EmploymentType | null;
  alwaysRecruiting: boolean;
  deadlineDate: string;
  content: string;
  qualification: string;
  preferred: string;
  salaryText: string;
  sourceUrl: string;
}

// 수정 화면 prefill용 — 상세 응답을 폼 값으로 변환.
// 상시모집이면 alwaysRecruiting=true로 켜고 deadlineDate는 비움(체크박스가 sentinel을 담당,
// 실제 저장된 sentinel '9999-12-31'을 date input에 넣지 않으려는 것).
export function jobPostToFormValues(job: JobPostDetail): JobPostFormValues {
  const always = isAlwaysOpen(job);
  return {
    organizationName: job.organizationName,
    therapyArea: job.therapyArea,
    region: job.region,
    employmentType: job.employmentType,
    alwaysRecruiting: always,
    deadlineDate: always ? '' : job.deadlineDate,
    content: job.content,
    qualification: job.qualification ?? '',
    preferred: job.preferred ?? '',
    salaryText: job.salaryText ?? '',
    sourceUrl: job.sourceUrl,
  };
}
