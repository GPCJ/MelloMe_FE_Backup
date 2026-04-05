import { useEffect, useState } from 'react'
import axiosInstance from '../api/axiosInstance'

const cache = new Map<string, string>()

export function useImageUrl(path: string | null | undefined): string | null {
  const [url, setUrl] = useState<string | null>(() =>
    path ? cache.get(path) ?? null : null,
  )

  useEffect(() => {
    if (!path) {
      setUrl(null)
      return
    }

    if (cache.has(path)) {
      setUrl(cache.get(path)!)
      return
    }

    let revoked = false

    const requestPath = path.replace(/^\/api\/v1/, '')

    axiosInstance
      .get(requestPath, { responseType: 'blob' })
      .then(({ data }) => {
        if (revoked) return
        const objectUrl = URL.createObjectURL(data)
        cache.set(path, objectUrl)
        setUrl(objectUrl)
      })
      .catch(() => {
        if (!revoked) setUrl(null)
      })

    return () => {
      revoked = true
    }
  }, [path])

  return url
}
