const baseUrl = import.meta.env.VITE_API_BASE_URL ?? ''
const backendOrigin = baseUrl.replace(/\/api\/v1$/, '')

export function resolveImageUrl(url: string | null | undefined): string | null {
  if (!url) return null
  // 임시 대응: 백엔드 APP_BASE_URL 환경변수 누락으로 응답에 http://localhost:8080이 박혀 내려옴 (backlog B-01)
  // 백엔드 수정 배포되면 이 줄 제거.
  const normalized = url.replace(/^http:\/\/localhost:8080/, backendOrigin)
  if (normalized.startsWith('http')) return normalized
  return `${backendOrigin}${normalized}`
}
