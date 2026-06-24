import type { JobPostStatus } from '../types/jobPost';

// 마감 판정: 명시 CLOSED 또는 dday 음수.
export function isClosed(status: JobPostStatus, dday: number | null): boolean {
  return status === 'CLOSED' || (dday !== null && dday < 0);
}

// D-day 라벨: 마감/상시/D-DAY/D-n.
export function ddayLabel(status: JobPostStatus, dday: number | null): string {
  if (isClosed(status, dday)) return '마감';
  if (dday === null) return '상시모집';
  if (dday === 0) return 'D-DAY';
  return `D-${dday}`;
}
