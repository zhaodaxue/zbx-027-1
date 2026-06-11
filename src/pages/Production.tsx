import { useEffect, useState } from 'react'
import { Factory, AlertTriangle, CheckCircle2, ClipboardList } from 'lucide-react'
import { useStore } from '../store'
import type { Batch, Usage } from 'shared/types'
import { formatDateTime, statusColor } from '../lib/format'

export default function Production() {
  const { batches, productions, fetchBatches, fetchProductions, createProduction, error, setError } =
    useStore()

  const [form, setForm] = useState({
    batchId: '',
    process: '细编' as Usage,
    operator: '',
  })
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => {
    fetchBatches()
    fetchProductions()
  }, [])

  useEffect(() => {
    if (error) {
      const t = setTimeout(() => setError(null), 4000)
      return () => clearTimeout(t)
    }
  }, [error])

  const availableBatches = batches.filter((b) => b.status === '可投产')
  const selectedBatch: Batch | undefined = batches.find((b) => b.id === form.batchId)

  const processOptions: Usage[] = selectedBatch?.isDowngraded ? ['粗编'] : ['细编', '粗编']
  const processHint = selectedBatch?.isDowngraded
    ? '该批次已降级，仅可用于【粗编】工序'
    : null

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    try {
      await createProduction(form)
      setSuccessMsg(`投产登记成功：${selectedBatch?.batchNo} → ${form.process}`)
      setForm({ batchId: '', process: '细编', operator: '' })
      setTimeout(() => setSuccessMsg(''), 3500)
    } catch {
      /* noop */
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-serif text-2xl font-bold text-bamboo-900">投产登记</h2>
        <p className="text-sm text-bamboo-500 mt-1">绑定可投产批次，登记编织工序；降级批次自动限制工序选择</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2">
          <form onSubmit={submit} className="card bamboo-texture space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-bamboo-100">
              <Factory className="w-5 h-5 text-bamboo-600" />
              <h3 className="font-serif font-semibold text-bamboo-900">投产登记表单</h3>
            </div>

            <div>
              <label className="label-text">选择批次</label>
              <select
                className="input-field"
                value={form.batchId}
                onChange={(e) => setForm({ ...form, batchId: e.target.value, process: '细编' })}
                required
              >
                <option value="">请选择可投产批次...</option>
                {availableBatches.length === 0 && (
                  <option disabled>暂无可投产批次</option>
                )}
                {availableBatches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.batchNo} · {b.source} · 当前含水率 {b.currentMoisture}%
                    {b.isDowngraded ? ' · 已降级' : ''}
                  </option>
                ))}
              </select>
              {selectedBatch && (
                <div className="mt-2 text-xs flex items-center gap-2">
                  <span className={`tag border ${statusColor(selectedBatch.status)}`}>
                    {selectedBatch.status}
                  </span>
                  <span className="text-bamboo-500">用途：{selectedBatch.usage}</span>
                  {selectedBatch.isDowngraded && (
                    <span className="tag bg-amber-100 text-amber-700 border border-amber-200">
                      已降级
                    </span>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="label-text">编织工序</label>
              <div className="grid grid-cols-2 gap-2">
                {(['细编', '粗编'] as Usage[]).map((p) => {
                  const disabled = selectedBatch?.isDowngraded && p === '细编'
                  const selected = form.process === p
                  return (
                    <button
                      key={p}
                      type="button"
                      disabled={disabled}
                      onClick={() => setForm({ ...form, process: p })}
                      className={`relative px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                        selected
                          ? 'border-bamboo-500 bg-bamboo-50 text-bamboo-800 shadow-sm'
                          : disabled
                            ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                            : 'border-bamboo-100 bg-white text-bamboo-600 hover:border-bamboo-300 hover:bg-bamboo-50/50'
                      }`}
                    >
                      {p}
                      {disabled && (
                        <span className="absolute -top-1.5 -right-1.5 text-[9px] bg-sun-500 text-white px-1.5 py-0.5 rounded-full">
                          不可选
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
              {processHint && (
                <div className="mt-2 inline-flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {processHint}
                </div>
              )}
            </div>

            <div>
              <label className="label-text">操作人</label>
              <input
                type="text"
                required
                className="input-field"
                placeholder="请输入操作人姓名"
                value={form.operator}
                onChange={(e) => setForm({ ...form, operator: e.target.value })}
              />
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
            {successMsg && (
              <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <button
              type="submit"
              className="btn-primary w-full"
              disabled={availableBatches.length === 0}
            >
              <Factory className="w-4 h-4 mr-1.5" />
              确认投产登记
            </button>
          </form>
        </div>

        <div className="lg:col-span-3">
          <div className="card">
            <div className="flex items-center gap-2 pb-3 border-b border-bamboo-100 mb-4">
              <ClipboardList className="w-5 h-5 text-bamboo-600" />
              <h3 className="font-serif font-semibold text-bamboo-900">投产记录</h3>
            </div>

            {productions.length === 0 ? (
              <div className="text-center py-10 text-bamboo-400 text-sm">暂无投产记录</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-bamboo-500 text-xs">
                      <th className="px-3 py-2 font-medium">批次号</th>
                      <th className="px-3 py-2 font-medium">工序</th>
                      <th className="px-3 py-2 font-medium">操作人</th>
                      <th className="px-3 py-2 font-medium">登记时间</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productions.map((p) => (
                      <tr key={p.id} className="border-t border-bamboo-50 hover:bg-bamboo-50/50">
                        <td className="px-3 py-3 font-medium text-bamboo-800">{p.batchNo || p.batchId}</td>
                        <td className="px-3 py-3">
                          <span className="tag bg-bamboo-100 text-bamboo-700">{p.process}</span>
                        </td>
                        <td className="px-3 py-3 text-bamboo-700">{p.operator}</td>
                        <td className="px-3 py-3 text-bamboo-500 tabular-nums">
                          {formatDateTime(p.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
