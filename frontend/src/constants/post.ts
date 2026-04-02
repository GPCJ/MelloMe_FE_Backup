import type { TherapyArea } from '../types/post';

export const THERAPY_AREA_LABELS: Record<string, string> = {
  UNSPECIFIED: '전체',
  OCCUPATIONAL: '작업치료',
  SPEECH: '언어치료',
  COGNITIVE: '인지치료',
  PLAY: '놀이치료',
};

export const THERAPY_CHIPS: { value: TherapyArea; label: string }[] = [
  { value: 'UNSPECIFIED', label: '선택안함' },
  { value: 'OCCUPATIONAL', label: '작업' },
  { value: 'SPEECH', label: '언어' },
  { value: 'PLAY', label: '놀이' },
  { value: 'COGNITIVE', label: '인지' },
];
