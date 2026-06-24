import type { TherapyArea } from './post';

// 구인공고 — staging `/api/v1/job-posts` 실측 계약 기반 (AI 큐레이션 읽기 전용, Phase 1).
// region/employmentType enum 값은 staging `/v3/api-docs` 스키마로 실측 확정(2026-06-24).
//   서버가 `*Label` 필드를 동봉하므로 화면 표시엔 라벨을 쓰고, raw enum은 필터 쿼리에만 쓴다.

export type JobPostStatus = 'OPEN' | 'CLOSED';

export type EmploymentType =
  | 'FULL_TIME'
  | 'CONTRACT'
  | 'PART_TIME'
  | 'FREELANCE'
  | 'INTERN';

export type JobRegion =
  | 'SEOUL'
  | 'BUSAN'
  | 'DAEGU'
  | 'INCHEON'
  | 'GWANGJU'
  | 'DAEJEON'
  | 'ULSAN'
  | 'SEJONG'
  | 'GYEONGGI'
  | 'GANGWON'
  | 'CHUNGBUK'
  | 'CHUNGNAM'
  | 'JEONBUK'
  | 'JEONNAM'
  | 'GYEONGBUK'
  | 'GYEONGNAM'
  | 'JEJU'
  | 'REMOTE'
  | 'NATIONWIDE';

// 목록(피드) 항목 — 서버가 라벨 동봉.
export interface JobPostSummary {
  id: number;
  title: string;
  organizationName: string;
  therapyArea: TherapyArea;
  therapyAreaLabel: string;
  region: JobRegion;
  regionLabel: string;
  employmentType: EmploymentType;
  employmentTypeLabel: string;
  status: JobPostStatus;
  // 서버 계산값. 양수=남은 일수, 0=오늘 마감, 음수=마감, null=상시/미정.
  dday: number | null;
  deadlineDate: string; // ISO date (YYYY-MM-DD)
}

// 상세 — Summary + 본문/자격/우대/급여/원문 링크.
export interface JobPostDetail extends JobPostSummary {
  content: string;
  qualification?: string | null;
  preferred?: string | null;
  salaryText?: string | null;
  sourceUrl: string; // AI 큐레이션 원문 URL. Phase 1의 "지원" = 이 링크로 아웃링크.
  authorNickname?: string | null;
}

export interface CursorPagedJobPosts {
  items: JobPostSummary[];
  nextCursor: string | null;
  hasNext: boolean;
  size: number;
}

export interface JobPostListParams {
  status?: JobPostStatus;
  therapyArea?: TherapyArea;
  region?: JobRegion;
  employmentType?: EmploymentType;
  cursor?: string;
  size?: number;
}
