import { useEffect, useState } from 'react'

export function useFetch(url) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(Boolean(url))
  const [error, setError] = useState('')

  useEffect(() => {
    if (!url) return
    const controller = new AbortController()
    const { signal } = controller

    async function loadExpenses() {
      setLoading(true)
      setError('')
      try {
        const response = await fetch(url, { signal })
        if (!response.ok) throw new Error(`Không thể tải dữ liệu (HTTP ${response.status}).`)
        const result = await response.json()
        if (!Array.isArray(result) || result.some(item => item?.id == null)) {
          throw new Error('URL cần trả về danh sách khoản chi. Kiểm tra lại URL resource.')
        }
        if (!signal.aborted) setData(result)
      } catch (requestError) {
        if (!signal.aborted) setError(requestError.message || 'Đã xảy ra lỗi khi tải dữ liệu.')
      } finally {
        if (!signal.aborted) setLoading(false)
      }
    }

    loadExpenses()
    return () => controller.abort()
  }, [url])

  async function request(options, itemId) {
    setError('')
    const endpoint = itemId == null ? url : `${url}/${encodeURIComponent(itemId)}`
    const headers = options.body ? { 'Content-Type': 'application/json' } : undefined
    const response = await fetch(endpoint, { ...options, headers })
    if (!response.ok) throw new Error(`Yêu cầu thất bại (HTTP ${response.status}).`)
    return options.method === 'DELETE' || response.status === 204 ? null : response.json()
  }

  return { data, setData, loading, error, setError, request }
}

