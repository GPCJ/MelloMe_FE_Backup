import type { TherapyArea, AgeGroup } from '../types/post';

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

export const AGE_CHIPS: { value: AgeGroup; label: string }[] = [
  { value: 'UNSPECIFIED', label: '선택안함' },
  { value: 'AGE_0_2', label: '0-2세' },
  { value: 'AGE_3_5', label: '3-5세' },
  { value: 'AGE_6_12', label: '6-12세' },
  { value: 'AGE_13_18', label: '13-18세' },
  { value: 'AGE_19_64', label: '19-64세' },
  { value: 'AGE_65_PLUS', label: '65세 이상' },
];
