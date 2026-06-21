import { useState } from 'react'
import { createJade } from '../api'

const FINENESS_OPTIONS = ['极细腻', '细腻', '一般', '偏粗']

export default function JadeForm({ categories, onCreated }) {
  const [form, setForm] = useState({
    category: categories[0] || '切米蓝',
    weight: '',
    purchase_price: '',
    note: '',
    transparency: 7,
    fineness: '细腻',
    bead_count: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState(null)

  const set = (field) => (e) => {
    const value = e.target.value
    setForm((f) => ({ ...f, [field]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setMessage(null)
    try {
      const payload = {
        category: form.category,
        weight: Number(form.weight),
        purchase_price: Number(form.purchase_price),
        note: form.note || null,
        quality: {
          transparency: Number(form.transparency),
          fineness: form.fineness,
          bead_count: form.bead_count === '' ? null : Number(form.bead_count),
        },
      }
      await createJade(payload)
      setMessage({ type: 'ok', text: '录入成功' })
      setForm((f) => ({
        ...f,
        weight: '',
        purchase_price: '',
        note: '',
        bead_count: '',
      }))
      onCreated?.()
    } catch (err) {
      setMessage({ type: 'error', text: err.message })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="form-card" onSubmit={handleSubmit}>
      <div className="form-section-title">基本信息</div>
      <div className="grid">
        <label className="field">
          <span>品类</span>
          <select value={form.category} onChange={set('category')}>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>克重 (g)</span>
          <input type="number" step="0.01" min="0" required value={form.weight} onChange={set('weight')} placeholder="如 38.5" />
        </label>
        <label className="field">
          <span>买入价 (元)</span>
          <input type="number" step="0.01" min="0" required value={form.purchase_price} onChange={set('purchase_price')} placeholder="如 1200" />
        </label>
        <label className="field field-wide">
          <span>备注</span>
          <input type="text" value={form.note} onChange={set('note')} placeholder="选填，如料子来源、皮色等" />
        </label>
      </div>

      <div className="form-section-title">质地鉴定</div>
      <div className="grid">
        <label className="field">
          <span>透光度 (0-10分)</span>
          <input type="number" min="0" max="10" required value={form.transparency} onChange={set('transparency')} />
        </label>
        <label className="field">
          <span>细度</span>
          <select value={form.fineness} onChange={set('fineness')}>
            {FINENESS_OPTIONS.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>珠子数量</span>
          <input type="number" min="0" value={form.bead_count} onChange={set('bead_count')} placeholder="手串填，料子可空" />
        </label>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? '录入中…' : '录入藏品'}
        </button>
        {message && (
          <span className={`form-msg ${message.type}`}>{message.text}</span>
        )}
      </div>
    </form>
  )
}
