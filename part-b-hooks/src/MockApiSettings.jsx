import { useState } from 'react'

const STORAGE_KEY = 'expense-tracker.mockapi-url'

function parseEndpoint(value) {
  try {
    const url = new URL(value.trim())
    const path = url.pathname.replace(/\/+$/, '')
    if (
      url.protocol !== 'https:' ||
      !/^[a-z0-9-]+\.mockapi\.io$/i.test(url.hostname) ||
      url.port ||
      url.username ||
      url.password ||
      url.search ||
      url.hash ||
      !/\/[a-z][\w-]*$/i.test(path)
    )
      return ''

    return `${url.origin}${path}`
  } catch {
    return ''
  }
}

export function readEndpoint() {
  const fallback = parseEndpoint(import.meta.env.VITE_API_URL || '')
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored === null ? fallback : parseEndpoint(stored)
  } catch {
    return fallback
  }
}

export default function MockApiSettings({ endpoint, onConnect, busy }) {
  const [draft, setDraft] = useState(endpoint)
  const [error, setError] = useState('')
  const [storageNotice, setStorageNotice] = useState('')

  function connect(value) {
    try {
      localStorage.setItem(STORAGE_KEY, value)
      setStorageNotice('')
    } catch {
      setStorageNotice('Trình duyệt không lưu được URL. Cấu hình chỉ dùng được cho lần mở này.')
    }
    setDraft(value)
    setError('')
    onConnect(value)
  }

  function handleSubmit(event) {
    event.preventDefault()
    if (busy) return
    const value = parseEndpoint(draft)
    if (!value) {
      setError(
        'Nhập URL HTTPS đầy đủ của resource trên MockAPI, ví dụ https://demo.mockapi.io/expenses.',
      )
      return
    }
    connect(value)
  }

  return (
    <details className="card api-settings" open={!endpoint}>
      <summary>Kết nối MockAPI</summary>
      <form className="form" onSubmit={handleSubmit} noValidate>
        <div className="form-grid api-grid">
          <label htmlFor="mockapi-url">
            URL resource MockAPI
            <input
              id="mockapi-url"
              type="url"
              value={draft}
              placeholder="https://demo.mockapi.io/expenses"
              autoComplete="off"
              spellCheck={false}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? 'mockapi-help mockapi-error' : 'mockapi-help'}
              onChange={event => {
                setDraft(event.target.value)
                setError('')
              }}
            />
          </label>
          <button type="submit" className="primary" disabled={busy}>
            Lưu và kết nối
          </button>
          {endpoint && (
            <button type="button" className="secondary" disabled={busy} onClick={() => connect('')}>
              Ngắt kết nối
            </button>
          )}
        </div>
        <p id="mockapi-help">
          Dán URL resource chứa các khoản chi. Ứng dụng lưu URL trên trình duyệt này.
        </p>
        {error && (
          <p id="mockapi-error" role="alert">
            {error}
          </p>
        )}
        {storageNotice && <p role="status">{storageNotice}</p>}
      </form>
    </details>
  )
}
