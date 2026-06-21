import { useEffect, useState } from 'react'
import { fetchJades, deleteJade } from '../api'

const FILTERS = [
  { label: '全部', value: '' },
  { label: '切米蓝', value: '切米蓝' },
  { label: '墨碧', value: '墨碧' },
]

function fmt(n) {
  if (n === null || n === undefined) return '—'
  return Number(n).toFixed(2)
}

function formatDate(s) {
  if (!s) return '—'
  const d = new Date(s)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default function JadeList({ refreshKey }) {
  const [jades, setJades] = useState([])
  const [filter, setFilter] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchJades(filter || undefined)
      setJades(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, refreshKey])

  const handleDelete = async (id) => {
    if (!window.confirm('确认删除该藏品记录？')) return
    try {
      await deleteJade(id)
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="list-wrap">
      <div className="filter-bar">
        <span className="filter-label">按品类筛选</span>
        <div className="filter-group">
          {FILTERS.map((f) => (
            <button
              key={f.value || 'all'}
              className={`chip ${filter === f.value ? 'active' : ''}`}
              onClick={() => setFilter(f.value)}
            >
              {f.label}
            </button>
          ))}
        </div>
        <span className="count">{jades.length} 件</span>
      </div>

      {error && <div className="alert">加载失败：{error}</div>}

      {loading ? (
        <div className="empty">载入中…</div>
      ) : jades.length === 0 ? (
        <div className="empty">暂无藏品记录，去录入界面添加吧</div>
      ) : (
        <div className="table-scroll">
          <table className="jade-table">
            <thead>
              <tr>
                <th>编号</th>
                <th>品类</th>
                <th>克重(g)</th>
                <th>买入价(元)</th>
                <th>透光度</th>
                <th>细度</th>
                <th>珠子数</th>
                <th>备注</th>
                <th>录入日期</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {jades.map((j) => (
                <tr key={j.id}>
                  <td className="muted">#{j.id}</td>
                  <td>
                    <span className={`cat-tag ${j.category === '切米蓝' ? 'cat-blue' : 'cat-ink'}`}>
                      {j.category}
                    </span>
                  </td>
                  <td>{fmt(j.weight)}</td>
                  <td>¥{fmt(j.purchase_price)}</td>
                  <td>{j.quality ? `${j.quality.transparency}/10` : '—'}</td>
                  <td>{j.quality?.fineness || '—'}</td>
                  <td>{j.quality?.bead_count ?? '—'}</td>
                  <td className="muted">{j.note || '—'}</td>
                  <td className="muted">{formatDate(j.created_at)}</td>
                  <td>
                    <button className="link-danger" onClick={() => handleDelete(j.id)}>删除</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
