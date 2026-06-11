import { useState } from 'react'
import { X, ThermometerSun } from 'lucide-react'
import { useStore } from '../store'
import type { Batch } from 'shared/types'

export default function TestModal({
  batch,
  onClose,
}: {
  batch: Batch
  onClose: () => void
}) {
  const testMoisture = useStore((s) => s.testMoisture)
  const [loading, setLoading] = useState(false)
  const [moisture, setMoisture] = useState<number>(batch.currentMoisture - 2)
  const [result, setResult] = useState<any>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setResult(null)
    try {
      const r = await testMoisture(batch.id, { moisture, operator: '管理员' })
      setResult(r)
      if (r.qualified || r.downgraded) {
        setTimeout(onClose, 1800)
      }
    } catch {
      /* noop */
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-bamboo-600 to-bamboo-700">
          <div className="flex items-center gap-2 text-white">
            <ThermometerSun className="w-5 h-5" />
            <h3 className="font-serif text-lg font-semibold">
              出棚含水率检测 · {batch.batchNo}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="rounded-xl bg-bamboo-50 p-3">
              <div className="text-bamboo-500 text-xs">来源</div>
              <div className="text-bamboo-800 font-medium">{batch.source}</div>
            </div>
            <div className="rounded-xl bg-sun-50 p-3">
              <div className="text-sun-500 text-xs">已返晒次数</div>
              <div className="text-sun-700 font-medium">{batch.reSunCount} / 2</div>
            </div>
          </div>

          <form onSubmit={submit}>
            <label className="label-text">本次出棚含水率 (%)</label>
            <input
              type="number"
              step="0.1"
              min="0"
              required
              className="input-field text-lg font-semibold"
              value={moisture}
              onChange={(e) => setMoisture(Number(e.target.value))}
            />
            <p className="text-xs text-bamboo-500 mt-1.5">合格标准：≤ 12%；返晒超过 2 次将自动降级为粗编用途</p>

            {result && (
              <div
                className={`mt-4 rounded-xl p-4 text-sm ${
                  result.qualified
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                    : result.downgraded
                      ? 'bg-amber-50 border border-amber-200 text-amber-800'
                      : 'bg-sun-50 border border-sun-200 text-sun-700'
                }`}
              >
                {result.remark}
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button type="button" onClick={onClose} className="btn-secondary flex-1">
                关闭
              </button>
              <button type="submit" className="btn-primary flex-1" disabled={loading}>
                {loading ? '检测中...' : '确认检测'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
