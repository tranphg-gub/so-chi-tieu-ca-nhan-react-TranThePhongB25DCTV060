import { Component } from 'react'

const CATEGORIES = ['Ăn uống', 'Đi lại', 'Học tập', 'Giải trí']
const MONEY = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })

class Clock extends Component {
  state = { now: new Date() }
  componentDidMount() { this.timer = setInterval(() => this.setState({ now: new Date() }), 1000) }
  componentWillUnmount() { clearInterval(this.timer) }
  render() { return <time>{this.state.now.toLocaleTimeString('vi-VN')}</time> }
}

class Header extends Component {
  render() {
    return <header><div><p className="version">Phần A / Class Component</p><h1>Sổ chi tiêu cá nhân</h1></div><div className="clock-box">{this.props.showClock ? <Clock /> : <span>Đồng hồ đang ẩn</span>}<button className="link-button" onClick={this.props.onToggleClock}>{this.props.showClock ? 'Ẩn đồng hồ' : 'Hiện đồng hồ'}</button></div></header>
  }
}

class ExpenseForm extends Component {
  state = { content: '', amount: '', category: CATEGORIES[0], date: new Date().toISOString().slice(0, 10), errors: {} }
  validate = () => {
    const errors = {}
    if (!this.state.content.trim()) errors.content = 'Vui lòng nhập nội dung.'
    if (!this.state.amount || Number(this.state.amount) <= 0) errors.amount = 'Số tiền phải lớn hơn 0.'
    if (!this.state.date) errors.date = 'Vui lòng chọn ngày chi.'
    return errors
  }
  handleSubmit = (event) => {
    event.preventDefault()
    const errors = this.validate()
    if (Object.keys(errors).length) return this.setState({ errors })
    this.props.onAdd({ id: Date.now(), content: this.state.content.trim(), amount: Number(this.state.amount), category: this.state.category, date: this.state.date })
    this.setState({ content: '', amount: '', errors: {} })
  }
  handleChange = ({ target }) => this.setState({ [target.name]: target.value, errors: { ...this.state.errors, [target.name]: '' } })
  render() {
    return <form className="card form" onSubmit={this.handleSubmit} noValidate><div className="section-title"><h2>Ghi khoản chi</h2></div><div className="form-grid"><label className="wide">Nội dung<input name="content" value={this.state.content} onChange={this.handleChange} placeholder="Ví dụ: Ăn trưa" />{this.state.errors.content && <small>{this.state.errors.content}</small>}</label><label>Số tiền (đ)<input name="amount" type="number" min="1" value={this.state.amount} onChange={this.handleChange} placeholder="50000" />{this.state.errors.amount && <small>{this.state.errors.amount}</small>}</label><label>Loại<select name="category" value={this.state.category} onChange={this.handleChange}>{CATEGORIES.map(item => <option key={item}>{item}</option>)}</select></label><label>Ngày chi<input name="date" type="date" value={this.state.date} onChange={this.handleChange} />{this.state.errors.date && <small>{this.state.errors.date}</small>}</label><button className="primary" type="submit">Thêm khoản chi</button></div></form>
  }
}

class Filters extends Component {
  render() { return <div className="filters" aria-label="Lọc theo loại">{['Tất cả', ...CATEGORIES].map(item => <button key={item} className={this.props.value === item ? 'active' : ''} aria-pressed={this.props.value === item} onClick={() => this.props.onChange(item)}>{item}</button>)}</div> }
}

class ExpenseList extends Component {
  render() {
    const { expenses, onDelete } = this.props
    return <div className="card list-card"><div className="section-title"><h2>Danh sách khoản chi</h2><strong>{expenses.length} khoản</strong></div>{expenses.length === 0 ? <p className="empty">Không có khoản chi phù hợp.</p> : <div className="expense-list">{expenses.map(item => <article className="expense" key={item.id}><div><h3>{item.content}</h3><time>{new Date(`${item.date}T00:00:00`).toLocaleDateString('vi-VN')}</time></div><span className="category">{item.category}</span><strong>{MONEY.format(item.amount)}</strong><button className="delete" aria-label={`Xóa ${item.content}`} onClick={() => onDelete(item)}>Xóa</button></article>)}</div>}</div>
  }
}

class Statistics extends Component {
  render() {
    return <section className="stats"><div className="total"><span>Tổng đang hiển thị</span><strong>{MONEY.format(this.props.total)}</strong></div>{CATEGORIES.map(category => <div key={category}><span>{category}</span><strong>{MONEY.format(this.props.expenses.filter(item => item.category === category).reduce((sum, item) => sum + item.amount, 0))}</strong></div>)}</section>
  }
}

export default class App extends Component {
  state = { filter: 'Tất cả', search: '', debouncedSearch: '', showClock: true, expenses: [
    { id: 1, content: 'Ăn sáng', amount: 30000, category: 'Ăn uống', date: '2026-11-24' },
    { id: 2, content: 'Vé xe buýt', amount: 15000, category: 'Đi lại', date: '2026-11-25' },
    { id: 3, content: 'Mua giáo trình', amount: 120000, category: 'Học tập', date: '2026-11-26' },
    { id: 4, content: 'Xem phim', amount: 85000, category: 'Giải trí', date: '2026-11-26' }
  ] }
  getVisible = () => {
    const { filter, debouncedSearch, expenses } = this.state
    const keyword = debouncedSearch.trim().toLocaleLowerCase('vi')
    return expenses.filter(item => (filter === 'Tất cả' || item.category === filter)
      && item.content.toLocaleLowerCase('vi').includes(keyword))
  }
  handleSearch = event => {
    const search = event.target.value
    this.setState({ search })
    clearTimeout(this.searchTimer)
    this.searchTimer = setTimeout(() => this.setState({ debouncedSearch: search }), 400)
  }
  getTotal = () => this.getVisible().reduce((sum, item) => sum + item.amount, 0)
  componentDidMount() { document.title = `${MONEY.format(this.getTotal())} · Sổ chi tiêu` }
  componentWillUnmount() { clearTimeout(this.searchTimer) }
  componentDidUpdate(prevProps, prevState) {
    if (prevState.expenses !== this.state.expenses || prevState.filter !== this.state.filter
      || prevState.debouncedSearch !== this.state.debouncedSearch) {
      document.title = `${MONEY.format(this.getTotal())} · Sổ chi tiêu`
    }
  }
  handleAdd = expense => this.setState(state => ({ expenses: [expense, ...state.expenses] }))
  handleDelete = expense => { if (window.confirm(`Xóa khoản chi “${expense.content}”?`)) this.setState(state => ({ expenses: state.expenses.filter(item => item.id !== expense.id) })) }
  render() {
    const visible = this.getVisible()
    return (
      <>
        <Header showClock={this.state.showClock} onToggleClock={() => this.setState(state => ({ showClock: !state.showClock }))} />
        <main className="ledger">
          <div className="entry-column">
            <ExpenseForm onAdd={this.handleAdd} />
            <Statistics total={this.getTotal()} expenses={this.state.expenses} />
          </div>
          <section className="history" aria-label="Tra cứu khoản chi">
            <div className="toolbar">
              <label className="search">Tìm theo nội dung<input type="search" value={this.state.search} onChange={this.handleSearch} placeholder="Ví dụ: giáo trình" /></label>
              <Filters value={this.state.filter} onChange={filter => this.setState({ filter })} />
            </div>
            <ExpenseList expenses={visible} onDelete={this.handleDelete} />
          </section>
        </main>
      </>
    )
  }
}

