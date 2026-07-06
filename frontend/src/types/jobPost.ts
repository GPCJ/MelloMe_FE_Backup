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
  deadlineDate: string; // ISO date (YYYY-MM-DD). 상시모집이면 sentinel(ALWAYS_OPEN_DEADLINE).
  // 상시모집 판별 필드. BE가 sentinel 날짜(9999-12-31)에서 파생해 내려주기로 합의(2026-07-03).
  // BE 미배포 구간에는 응답에 없을 수 있어 optional — utils/isAlwaysOpen이 sentinel/dday로 폴백.
  alwaysOpen?: boolean;
}

// 상세 — Summary + 본문/자격/우대/급여/원문 링크.
export interface JobPostDetail extends JobPostSummary {
  content: string;
  qualification?: string | null;
  preferred?: string | null;
  salaryText?: string | null;
  sourceUrl: string; // AI 큐레이션 원문 URL. Phase 1의 "지원" = 이 링크로 아웃링크.
  authorNickname?: string | null;
  // 권한 플래그(Phase 2) — BE가 상세 응답에 내려주는 "이 사용자가 수정/삭제할 수 있나".
  // FE는 롤을 직접 판정하지 않고 이 값으로 수정·삭제 버튼 노출을 분기. BE 미배포 구간엔
  // 응답에 없을 수 있어 optional — 없으면 버튼 미노출(JobPostActions가 falsy 처리).
  canEdit?: boolean;
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

// 작성(Create) 요청 바디 — Phase 2. staging /v3/api-docs 실측 CreateJobPostRequest 기준.
// 주의: title은 요청에 없음 — BE가 서버에서 파생(조직명+분야 등). 폼에 제목 입력칸 없음.
// 상시모집: alwaysRecruiting=true면 deadlineDate에 sentinel(ALWAYS_OPEN_DEADLINE)을 실어 보냄.
//   (alwaysRecruiting은 2026-07-03 BE 합의로 추가된 필드. 06-26 계약엔 없던 상시모집 지원.)
export interface JobPostCreatePayload {
  organizationName: string;
  content: string;
  therapyArea: TherapyArea;
  employmentType: EmploymentType;
  region: JobRegion;
  sourceUrl: string; // 필수(≤500).
  deadlineDate: string; // ISO(YYYY-MM-DD). 상시모집이면 ALWAYS_OPEN_DEADLINE.
  alwaysRecruiting: boolean;
  salaryText?: string;
  qualification?: string;
  preferred?: string;
}

// 수정(Update) 요청 바디 — staging 실측상 UpdateJobPostRequest는 CreateJobPostRequest와 동일 필드.
// 별도 인터페이스로 두면 계약이 갈라질 때 create만 바꿔도 update가 따라오지 않아 drift 위험 →
// 의도적으로 alias. 계약이 실제로 갈라지면 그때 독립 인터페이스로 분리.
export type JobPostUpdatePayload = JobPostCreatePayload;
