import type { ApiResponse } from 'shared/types'

const API_BASE = '/api'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  })
  const json: ApiResponse<T> = await res.json()
  if (!json.success) {
    throw new Error(json.error || '请求失败')
  }
  return json.data as T
}

export const api = {
  getBatches: () => request<any>('/batches'),
  getBatch: (id: string) => request<any>(`/batches/${id}`),
  createBatch: (data: any) =>
    request<any>('/batches', { method: 'POST', body: JSON.stringify(data) }),
  testMoisture: (id: string, data: any) =>
    request<any>(`/batches/${id}/test`, { method: 'POST', body: JSON.stringify(data) }),
  getProductions: () => request<any>('/productions'),
  createProduction: (data: any) =>
    request<any>('/productions', { method: 'POST', body: JSON.stringify(data) }),
}
