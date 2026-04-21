const apiBase = import.meta.env.VITE_API_BASE_URL ?? ''
const backendOrigin = (() => {
  try {
    return new URL(apiBase).origin
  } catch {
    return ''
  }
})()

export function resolveImageUrl(url: string | null | undefined): string | null {
  if (!url) return null
  if (!backendOrigin) return url
  try {
    return new URL(url, backendOrigin).toString()
  } catch {
    return null
  }
}
