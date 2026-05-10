import type { TherapyArea, UIVisibility, Visibility } from '../types/post';

// UIVisibility → API Visibility 매핑.
// PRIVATE_ONLY(나만 보기)는 백엔드 미지원 → 임시로 PRIVATE(인증치료사 전용)에 흡수. 추후 백엔드 분리 시 수정.
export function toApiVisibility(ui: UIVisibility): Visibility {
  return ui === 'PUBLIC' ? 'PUBLIC' : 'PRIVATE';
}

// API Visibility → UIVisibility 매핑 (편집 화면 초기값 복원용).
// PRIVATE는 의미상 'VERIFIED_ONLY'로 우선 복원 (현 백엔드 의미와 일치).
export function fromApiVisibility(api: Visibility | undefined): UIVisibility {
  if (api === 'PUBLIC') return 'PUBLIC';
  return 'VERIFIED_ONLY';
}

export const VISIBILITY_OPTIONS: { value: UIVisibility; label: string; chipLabel: string }[] = [
  { value: 'PUBLIC', label: '전체 공개', chipLabel: '모든 사람이 볼 수 있어요.' },
  {
    value: 'VERIFIED_ONLY',
    label: '인증된 치료사에게 공개',
    chipLabel: '인증된 치료사만 볼 수 있어요.',
  },
  { value: 'PRIVATE_ONLY', label: '비공개', chipLabel: '나만 볼 수 있어요.' },
];

export const THERAPY_AREA_LABELS: Record<string, string> = {
  UNSPECIFIED: '전체',
  SENSORY_INTEGRATION: '감각통합',
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
  { value: 'SENSORY_INTEGRATION', label: '감각통합' },
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
  { value: 'UNSPECIFIED', label: '전체' },
  { value: 'SENSORY_INTEGRATION', label: '감각통합' },
  { value: 'SPEECH', label: '언어치료' },
  { value: 'OCCUPATIONAL', label: '작업치료' },
  { value: 'COGNITIVE', label: '인지치료' },
  { value: 'PHYSICAL', label: '물리치료' },
  { value: 'ART', label: '미술치료' },
  { value: 'MUSIC', label: '음악치료' },
  { value: 'PLAY', label: '놀이치료' },
  { value: 'BEHAVIOR', label: '행동치료' },
];
