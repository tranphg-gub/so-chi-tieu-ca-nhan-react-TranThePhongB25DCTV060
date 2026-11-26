import { useCallback, useEffect, useState } from 'react'

export function useFetch(url) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const refetch = useCallback(async (signal) => {
    if (!url || url.includes('YOUR_PROJECT_ID')) {
      setLoading(false)
      setError('Chưa cấu hình VITE_API_URL. Hãy sao chép .env.example thành .env và nhập URL resource expenses trên MockAPI.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const response = await fetch(url, { signal })
      if (!response.ok) throw new Error(`Không thể tải dữ liệu (HTTP ${response.status}).`)
      const result = await response.json()
      setData(Array.isArray(result) ? result : [])
    } catch (requestError) {
      if (requestError.name !== 'AbortError') setError(requestError.message || 'Đã xảy ra lỗi khi tải dữ liệu.')
    } finally {
      if (!signal?.aborted) setLoading(false)
    }
  }, [url])

  useEffect(() => {
    const controller = new AbortController()
    refetch(controller.signal)
    return () => controller.abort()
  }, [refetch])

  const request = useCallback(async (options, itemId) => {
    setError('')
    const endpoint = itemId == null ? url : `${url}/${encodeURIComponent(itemId)}`
    const headers = options.body ? { 'Content-Type': 'application/json' } : undefined
    const response = await fetch(endpoint, { ...options, headers })
    if (!response.ok) throw new Error(`Yêu cầu thất bại (HTTP ${response.status}).`)
    return options.method === 'DELETE' || response.status === 204 ? null : response.json()
  }, [url])

  return { data, setData, loading, error, setError, request, refetch }
}

