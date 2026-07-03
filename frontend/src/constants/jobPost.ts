import type { EmploymentType, JobRegion } from '../types/jobPost';

// 상시모집 sentinel 날짜 — BE 합의(2026-07-03). deadlineDate가 non-null 필수라
// "마감 없음"을 표현할 수 없어, 상시모집은 이 먼 미래 날짜로 약속. FE는 이 값을 "상시모집"으로 렌더.
export const ALWAYS_OPEN_DEADLINE = '9999-12-31';

export const REGION_LABELS: Record<JobRegion, string> = {
  SEOUL: '서울',
  BUSAN: '부산',
  DAEGU: '대구',
  INCHEON: '인천',
  GWANGJU: '광주',
  DAEJEON: '대전',
  ULSAN: '울산',
  SEJONG: '세종',
  GYEONGGI: '경기',
  GANGWON: '강원',
  CHUNGBUK: '충북',
  CHUNGNAM: '충남',
  JEONBUK: '전북',
  JEONNAM: '전남',
  GYEONGBUK: '경북',
  GYEONGNAM: '경남',
  JEJU: '제주',
  REMOTE: '재택',
  NATIONWIDE: '전국',
};

export const EMPLOYMENT_TYPE_LABELS: Record<EmploymentType, string> = {
  FULL_TIME: '정규직',
  CONTRACT: '계약직',
  PART_TIME: '파트타임',
  FREELANCE: '프리랜서',
  INTERN: '인턴',
};

// 필터 드롭다운 옵션 ('' = 전체)
export const REGION_FILTER_OPTIONS: { value: JobRegion | ''; label: string }[] = [
  { value: '', label: '지역 전체' },
  ...(Object.keys(REGION_LABELS) as JobRegion[]).map((v) => ({
    value: v,
    label: REGION_LABELS[v],
  })),
];

export const EMPLOYMENT_FILTER_OPTIONS: { value: EmploymentType | ''; label: string }[] = [
  { value: '', label: '고용형태 전체' },
  ...(Object.keys(EMPLOYMENT_TYPE_LABELS) as EmploymentType[]).map((v) => ({
    value: v,
    label: EMPLOYMENT_TYPE_LABELS[v],
  })),
];
