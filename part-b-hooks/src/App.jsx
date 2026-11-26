import { useEffect, useMemo, useRef, useState } from 'react'
import { useTheme } from './ThemeContext'
import { useClock } from './hooks/useClock'
import { useDebounce } from './hooks/useDebounce'
import { useFetch } from './hooks/useFetch'

const CATEGORIES = ['Ăn uống', 'Đi lại', 'Học tập', 'Giải trí']
const MONEY = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
const API_URL = import.meta.env.VITE_API_URL || ''

const normalizeExpense = item => ({ ...item, amount: Number(item.amount) || 0 })

function Clock() {
  const now = useClock()
  return <time>{now.toLocaleTimeString('vi-VN')}</time>
}

function Header({ showClock, onToggleClock }) {
  const { theme, toggleTheme } = useTheme()
  return <header><div><p className="eyebrow">PHẦN B · FUNCTION COMPONENT + HOOKS</p><h1>Sổ chi tiêu cá nhân</h1><p>Ghi chép gọn gàng, kiểm soát rõ ràng.</p></div><div className="header-actions"><div className="clock-box">{showClock ? <Clock /> : <span>Đồng hồ đang ẩn</span>}<button className="link-button" onClick={onToggleClock}>{showClock ? 'Ẩn đồng hồ' : 'Hiện đồng hồ'}</button></div><button className="theme-button" onClick={toggleTheme} aria-label="Đổi chế độ màu">{theme === 'light' ? 'Chế độ tối' : 'Chế độ sáng'}</button></div></header>
}

function ExpenseForm({ onAdd, submitting }) {
  const [form, setForm] = useState({ content: '', amount: '', category: CATEGORIES[0], date: new Date().toISOString().slice(0, 10) })
  const [errors, setErrors] = useState({})
  const contentRef = useRef(null)
  const handleChange = ({ target }) => { setForm(current => ({ ...current, [target.name]: target.value })); setErrors(current => ({ ...current, [target.name]: '' })) }
  const handleSubmit = async event => {
    event.preventDefault()
    const nextErrors = {}
    if (!form.content.trim()) nextErrors.content = 'Vui lòng nhập nội dung.'
    if (!form.amount || Number(form.amount) <= 0) nextErrors.amount = 'Số tiền phải lớn hơn 0.'
    if (!form.date) nextErrors.date = 'Vui lòng chọn ngày chi.'
    if (Object.keys(nextErrors).length) return setErrors(nextErrors)
    const added = await onAdd({ ...form, content: form.content.trim(), amount: Number(form.amount) })
    if (added) { setForm(current => ({ ...current, content: '', amount: '' })); contentRef.current?.focus() }
  }
  return <form className="card form" onSubmit={handleSubmit} noValidate><div className="section-title"><div><p className="eyebrow">KHOẢN CHI MỚI</p><h2>Thêm giao dịch</h2></div></div><div className="form-grid"><label className="wide">Nội dung<input ref={contentRef} name="content" value={form.content} onChange={handleChange} placeholder="Ví dụ: Ăn trưa" />{errors.content && <small>{errors.content}</small>}</label><label>Số tiền (đ)<input name="amount" type="number" min="1" value={form.amount} onChange={handleChange} placeholder="50000" />{errors.amount && <small>{errors.amount}</small>}</label><label>Loại<select name="category" value={form.category} onChange={handleChange}>{CATEGORIES.map(item => <option key={item}>{item}</option>)}</select></label><label>Ngày chi<input name="date" type="date" value={form.date} onChange={handleChange} />{errors.date && <small>{errors.date}</small>}</label><button className="primary" type="submit" disabled={submitting}>{submitting ? 'Đang thêm…' : 'Thêm khoản chi'}</button></div></form>
}

function Filters({ value, onChange, search, onSearch }) {
  return <div className="toolbar"><div className="filters" aria-label="Lọc theo loại">{['Tất cả', ...CATEGORIES].map(item => <button key={item} className={value === item ? 'active' : ''} onClick={() => onChange(item)}>{item}</button>)}</div><label className="search"><span>Tìm kiếm</span><input value={search} onChange={event => onSearch(event.target.value)} placeholder="Nhập nội dung…" /></label></div>
}

function ExpenseList({ expenses, onDelete, deletingId }) {
  if (!expenses.length) return <div className="card list-card"><p className="empty">Không có khoản chi phù hợp.</p></div>
  return <div className="card list-card"><div className="section-title"><div><p className="eyebrow">LỊCH SỬ</p><h2>Danh sách khoản chi</h2></div><strong>{expenses.length} khoản</strong></div><div className="expense-list">{expenses.map(item => <article className="expense" key={item.id}><span className={`category c-${CATEGORIES.indexOf(item.category)}`}>{item.category}</span><div><h3>{item.content}</h3><time>{new Date(`${item.date}T00:00:00`).toLocaleDateString('vi-VN')}</time></div><strong>{MONEY.format(item.amount)}</strong><button className="delete" disabled={deletingId === item.id} onClick={() => onDelete(item)}>{deletingId === item.id ? 'Đang xóa…' : 'Xóa'}</button></article>)}</div></div>
}

function Statistics({ total, expenses }) {
  return <section className="stats"><div className="total"><span>Tổng đang hiển thị</span><strong>{MONEY.format(total)}</strong></div>{CATEGORIES.map(category => <div key={category}><span>{category}</span><strong>{MONEY.format(expenses.filter(item => item.category === category).reduce((sum, item) => sum + item.amount, 0))}</strong></div>)}</section>
}

export default function App() {
  const [filter, setFilter] = useState('Tất cả')
  const [search, setSearch] = useState('')
  const [showClock, setShowClock] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const debouncedSearch = useDebounce(search, 400)
  const { data, setData, loading, error, setError, request } = useFetch(API_URL)
  const expenses = useMemo(() => data.map(normalizeExpense), [data])
  const visible = useMemo(() => expenses.filter(item => (filter === 'Tất cả' || item.category === filter) && item.content.toLocaleLowerCase('vi').includes(debouncedSearch.trim().toLocaleLowerCase('vi'))), [expenses, filter, debouncedSearch])
  const total = useMemo(() => visible.reduce((sum, item) => sum + item.amount, 0), [visible])
  useEffect(() => { document.title = `${MONEY.format(total)} · Sổ chi tiêu` }, [total])

  const handleAdd = async expense => {
    if (!API_URL) { setError('Chưa cấu hình VITE_API_URL nên không thể thêm dữ liệu.'); return false }
    setSubmitting(true)
    try { const created = await request({ method: 'POST', body: JSON.stringify(expense) }); setData(current => [created, ...current]); return true }
    catch (requestError) { setError(requestError.message); return false }
    finally { setSubmitting(false) }
  }
  const deleteExpense = async expense => {
    if (!window.confirm(`Xóa khoản chi “${expense.content}”?`)) return
    setDeletingId(expense.id); setError('')
    try {
      const response = await fetch(`${API_URL}/${expense.id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error(`Không thể xóa (HTTP ${response.status}).`)
      setData(current => current.filter(item => item.id !== expense.id))
    } catch (requestError) { setError(requestError.message || 'Đã xảy ra lỗi khi xóa dữ liệu.') }
    finally { setDeletingId(null) }
  }

  return <><Header showClock={showClock} onToggleClock={() => setShowClock(current => !current)} /><main><Statistics total={total} expenses={expenses} /><ExpenseForm onAdd={handleAdd} submitting={submitting} />{error && <div className="notice error" role="alert"><strong>Không thể đồng bộ MockAPI.</strong><span>{error}</span></div>}<Filters value={filter} onChange={setFilter} search={search} onSearch={setSearch} />{loading ? <div className="card loading">Đang tải dữ liệu…</div> : <ExpenseList expenses={visible} onDelete={deleteExpense} deletingId={deletingId} />}</main><footer>Function Components + Hooks · React</footer></>
}

