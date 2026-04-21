const baseUrl = import.meta.env.VITE_API_BASE_URL ?? ''
const backendOrigin = baseUrl.replace(/\/api\/v1$/, '')

export function resolveImageUrl(url: string | null | undefined): string | null {
  if (!url) return null
  if (url.startsWith('http')) return url
  return `${backendOrigin}${url}`
}
