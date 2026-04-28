// 백엔드(LocalDateTime)가 timezone designator 없이 UTC 시각을 보내는 케이스 보정.
// "2026-04-28T10:07:13.263226"처럼 Z/오프셋이 없으면 JS는 로컬(KST)로 파싱해 9시간 어긋남.
// 이미 Z 또는 ±HH:MM이 붙어 있으면 그대로 둔다.
export function parseServerDate(isoString: string): Date {
  const hasTz = /(Z|[+-]\d{2}:?\d{2})$/.test(isoString);
  return new Date(hasTz ? isoString : isoString + 'Z');
}

export function formatRelativeTime(isoString: string): string {
  const date = parseServerDate(isoString);
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${Math.max(1, minutes)}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}일 전`;
  return date.toLocaleDateString('ko-KR');
}
