import type { TherapyArea } from '../types/post';

export const THERAPY_AREA_LABELS: Record<string, string> = {
  UNSPECIFIED: '전체',
  SENSORY_INTEGRATION: '감각통합치료',
  SPEECH: '언어치료',
  OCCUPATIONAL: '작업치료',
  COGNITIVE: '인지치료',
  PHYSICAL: '물리치료',
  ART: '미술치료',
  MUSIC: '음악치료',
  PLAY: '놀이치료',
  BEHAVIOR: '행동치료',
};

export const FILTER_CHIPS: { value: TherapyArea | ''; label: string }[] = [
  { value: '', label: '전체' },
  { value: 'SENSORY_INTEGRATION', label: '감각통합치료' },
  { value: 'SPEECH', label: '언어치료' },
  { value: 'OCCUPATIONAL', label: '작업치료' },
  { value: 'COGNITIVE', label: '인지치료' },
  { value: 'PHYSICAL', label: '물리치료' },
  { value: 'ART', label: '미술치료' },
  { value: 'MUSIC', label: '음악치료' },
  { value: 'PLAY', label: '놀이치료' },
  { value: 'BEHAVIOR', label: '행동치료' },
];

export const THERAPY_CHIPS: { value: TherapyArea; label: string }[] = [
  { value: 'UNSPECIFIED', label: '선택안함' },
  { value: 'SENSORY_INTEGRATION', label: '감각통합' },
  { value: 'SPEECH', label: '언어' },
  { value: 'OCCUPATIONAL', label: '작업' },
  { value: 'COGNITIVE', label: '인지' },
  { value: 'PHYSICAL', label: '물리' },
  { value: 'ART', label: '미술' },
  { value: 'MUSIC', label: '음악' },
  { value: 'PLAY', label: '놀이' },
  { value: 'BEHAVIOR', label: '행동' },
];
