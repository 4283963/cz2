import { useEffect, useState } from 'react'
import JadeForm from './components/JadeForm'
import JadeList from './components/JadeList'
import { fetchCategories } from './api'

export default function App() {
  const [tab, setTab] = useState('form')
  const [categories, setCategories] = useState(['切米蓝', '墨碧'])
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .catch(() => setCategories(['切米蓝', '墨碧']))
  }, [])

  const handleCreated = () => {
    setRefreshKey((k) => k + 1)
    setTab('list')
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="brand">
          <span className="brand-mark" />
          <div>
            <h1>和田玉藏品管理</h1>
            <p>切米蓝 · 墨碧 · 手串与料子档案</p>
          </div>
        </div>
        <nav className="tabs">
          <button className={tab === 'form' ? 'active' : ''} onClick={() => setTab('form')}>
            录入
          </button>
          <button className={tab === 'list' ? 'active' : ''} onClick={() => setTab('list')}>
            列表
          </button>
        </nav>
      </header>

      <main className="app-main">
        {tab === 'form' ? (
          <section className="panel">
            <div className="panel-head">
              <h2>藏品录入</h2>
              <p className="panel-sub">填写玉石基本信息与质地鉴定数据，两部分将一并保存。</p>
            </div>
            <JadeForm categories={categories} onCreated={handleCreated} />
          </section>
        ) : (
          <section className="panel">
            <div className="panel-head">
              <h2>藏品列表</h2>
              <p className="panel-sub">可按品类筛选切米蓝或墨碧藏品。</p>
            </div>
            <JadeList refreshKey={refreshKey} />
          </section>
        )}
      </main>

      <footer className="app-footer">
        和田玉藏品管理系统 · FastAPI + PostgreSQL + React
      </footer>
    </div>
  )
}
