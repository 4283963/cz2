import { useEffect, useState } from 'react'
import { fetchJade } from '../api'

const GRADE_CLASS = {
  特级: 'grade-special',
  一级: 'grade-first',
  二级: 'grade-second',
}

function fmt(n) {
  if (n === null || n === undefined) return '—'
  return Number(n).toFixed(2)
}

function formatDate(s) {
  if (!s) return '—'
  const d = new Date(s)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function escapeHtml(str) {
  return String(str ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))
}

function buildCardHtml(j) {
  const q = j.quality || {}
  const grade = q.grade || '—'
  const gradeColor = grade === '特级' ? '#c9a86a' : grade === '一级' ? '#2fbf95' : '#8aa89c'
  return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"/>
<title>质地鉴定卡 #${j.id}</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:"Noto Serif SC","Songti SC",serif; background:#f3f1ea; padding:24px; color:#1a2620; }
  .card { max-width:380px; margin:0 auto; background:#fffdf7; border:1px solid #e3ddca; border-radius:14px; overflow:hidden; box-shadow:0 12px 40px rgba(0,0,0,.12); }
  .card-head { background:linear-gradient(180deg,#0f6b53,#0a3d31); color:#e9f3ec; padding:18px 22px; display:flex; justify-content:space-between; align-items:center; }
  .card-head h1 { font-size:18px; letter-spacing:3px; font-weight:700; }
  .card-head .no { font-size:12px; opacity:.75; letter-spacing:1px; }
  .grade-box { background:linear-gradient(180deg,#0a3d31,#06251e); padding:26px 22px; text-align:center; }
  .grade-label { font-size:12px; color:#7fe3c0; letter-spacing:4px; }
  .grade-val { font-size:42px; font-weight:900; color:${gradeColor}; letter-spacing:6px; margin-top:6px; }
  .grade-score { font-size:13px; color:#c9a86a; margin-top:8px; letter-spacing:1px; }
  .rows { padding:8px 22px 18px; }
  .row { display:flex; justify-content:space-between; padding:9px 0; border-bottom:1px dashed #e3ddca; font-size:14px; }
  .row:last-child { border-bottom:0; }
  .row .k { color:#6b6557; letter-spacing:1px; }
  .row .v { font-weight:700; color:#1a2620; }
  .card-foot { padding:14px 22px; background:#f7f3e6; font-size:11px; color:#9a9384; text-align:center; letter-spacing:1px; border-top:1px solid #e3ddca; }
  @media print { body { background:#fff; padding:0; } .card { box-shadow:none; } }
</style></head>
<body>
  <div class="card">
    <div class="card-head">
      <h1>和田玉质地鉴定卡</h1>
      <span class="no">编号 #${j.id}</span>
    </div>
    <div class="grade-box">
      <div class="grade-label">综合等级</div>
      <div class="grade-val">${escapeHtml(grade)}</div>
      <div class="grade-score">综合评分 ${escapeHtml(q.score ?? '—')} ／ 14　（透光${escapeHtml(q.transparency ?? '—')}＋细度${escapeHtml(q.fineness ?? '—')}）</div>
    </div>
    <div class="rows">
      <div class="row"><span class="k">品类</span><span class="v">${escapeHtml(j.category)}</span></div>
      <div class="row"><span class="k">形态</span><span class="v">${escapeHtml(j.form)}</span></div>
      <div class="row"><span class="k">透光度</span><span class="v">${escapeHtml(q.transparency ?? '—')} / 10</span></div>
      <div class="row"><span class="k">细度</span><span class="v">${escapeHtml(q.fineness ?? '—')}</span></div>
      <div class="row"><span class="k">珠子数量</span><span class="v">${q.bead_count ?? '—'}</span></div>
      <div class="row"><span class="k">克重</span><span class="v">${fmt(j.weight)} g</span></div>
      <div class="row"><span class="k">买入价</span><span class="v">¥${fmt(j.purchase_price)}</span></div>
      <div class="row"><span class="k">备注</span><span class="v">${escapeHtml(j.note || '—')}</span></div>
    </div>
    <div class="card-foot">鉴定日期 ${formatDate(j.created_at)} · 和田玉藏品管理系统</div>
  </div>
  <script>window.onload=function(){setTimeout(function(){window.print();},300);}</script>
</body></html>`
}

export default function JadeDetail({ jadeId, onClose }) {
  const [jade, setJade] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let alive = true
    setLoading(true)
    fetchJade(jadeId)
      .then((d) => alive && setJade(d))
      .catch((e) => alive && setError(e.message))
      .finally(() => alive && setLoading(false))
    return () => { alive = false }
  }, [jadeId])

  const handlePrint = () => {
    if (!jade) return
    const w = window.open('', '_blank', 'width=440,height=720')
    if (!w) {
      alert('请允许弹出窗口以打印卡片')
      return
    }
    w.document.open()
    w.document.write(buildCardHtml(jade))
    w.document.close()
  }

  const q = jade?.quality

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2>藏品详情</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        {loading ? (
          <div className="empty">载入中…</div>
        ) : error ? (
          <div className="alert">加载失败：{error}</div>
        ) : jade ? (
          <div className="detail-body">
            <div className="grade-banner">
              <div className="grade-banner-label">综合等级</div>
              <div className={`grade-banner-val ${GRADE_CLASS[q?.grade] || ''}`}>{q?.grade || '—'}</div>
              <div className="grade-banner-score">综合评分 {q?.score ?? '—'} / 14</div>
            </div>

            <div className="detail-grid">
              <div className="detail-item"><span className="k">编号</span><span className="v">#{jade.id}</span></div>
              <div className="detail-item"><span className="k">品类</span><span className="v">{jade.category}</span></div>
              <div className="detail-item"><span className="k">形态</span><span className="v">{jade.form}</span></div>
              <div className="detail-item"><span className="k">克重</span><span className="v">{fmt(jade.weight)} g</span></div>
              <div className="detail-item"><span className="k">买入价</span><span className="v">¥{fmt(jade.purchase_price)}</span></div>
              <div className="detail-item"><span className="k">透光度</span><span className="v">{q?.transparency ?? '—'} / 10</span></div>
              <div className="detail-item"><span className="k">细度</span><span className="v">{q?.fineness || '—'}</span></div>
              <div className="detail-item"><span className="k">珠子数量</span><span className="v">{q?.bead_count ?? '—'}</span></div>
              <div className="detail-item detail-wide"><span className="k">备注</span><span className="v">{jade.note || '—'}</span></div>
              <div className="detail-item detail-wide"><span className="k">录入日期</span><span className="v">{formatDate(jade.created_at)}</span></div>
            </div>

            <div className="modal-actions">
              <button className="btn-primary" onClick={handlePrint}>打印质地卡片</button>
              <button className="btn-ghost" onClick={onClose}>关闭</button>
            </div>
            <p className="print-hint">点击后将弹出独立的卡片预览，可直接选择打印机打印。</p>
          </div>
        ) : null}
      </div>
    </div>
  )
}
