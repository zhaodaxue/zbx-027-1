import { useState } from 'react'
import { X, Plus } from 'lucide-react'
import { useStore } from '../store'
import type { BambooSource, Usage } from 'shared/types'

export default function NewBatchModal({ onClose }: { onClose: () => void }) {
  const create = useStore((s) => s.createBatch)
  const setError = useStore((s) => s.setError)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    batchNo: '',
    source: '毛竹' as BambooSource,
    initialMoisture: 30,
    dryingDays: 5,
    usage: '细编' as Usage,
  })

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await create(form)
      onClose()
    } catch (err) {
      // 错误已被 store 捕获
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in">
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-bamboo-500 to-bamboo-600">
          <div className="flex items-center gap-2 text-white">
            <Plus className="w-5 h-5" />
            <h3 className="font-serif text-lg font-semibold">新批次入棚登记</h3>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={submit} className="p-6 space-y-4">
          <div>
            <label className="label-text">批次号</label>
            <input
              type="text"
              required
              placeholder="例如 ZB-20260611-001"
              className="input-field"
              value={form.batchNo}
              onChange={(e) => setForm({ ...form, batchNo: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-text">篾条来源</label>
              <select
                className="input-field"
                value={form.source}
                onChange={(e) => setForm({ ...form, source: e.target.value as BambooSource })}
              >
                <option value="毛竹">毛竹</option>
                <option value="慈竹">慈竹</option>
              </select>
            </div>
            <div>
              <label className="label-text">计划用途</label>
              <select
                className="input-field"
                value={form.usage}
                onChange={(e) => setForm({ ...form, usage: e.target.value as Usage })}
              >
                <option value="细编">细编</option>
                <option value="粗编">粗编</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-text">入棚含水率 (%)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                required
                className="input-field"
                value={form.initialMoisture}
                onChange={(e) => setForm({ ...form, initialMoisture: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="label-text">计划晾晒天数</label>
              <input
                type="number"
                min="1"
                required
                className="input-field"
                value={form.dryingDays}
                onChange={(e) => setForm({ ...form, dryingDays: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
              disabled={loading}
            >
              取消
            </button>
            <button type="submit" className="btn-primary flex-1" disabled={loading}>
              {loading ? '登记中...' : '确认登记'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
