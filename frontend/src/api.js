const BASE = '/api'

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (res.status === 204) return null
  const data = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(data?.detail || `请求失败 (${res.status})`)
  }
  return data
}

export async function fetchCategories() {
  return request('/categories')
}

export async function fetchForms() {
  return request('/forms')
}

export async function fetchJades(category) {
  const qs = category ? `?category=${encodeURIComponent(category)}` : ''
  return request(`/jades${qs}`)
}

export async function fetchJade(id) {
  return request(`/jades/${id}`)
}

export async function createJade(payload) {
  return request('/jades', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function deleteJade(id) {
  return request(`/jades/${id}`, { method: 'DELETE' })
}
