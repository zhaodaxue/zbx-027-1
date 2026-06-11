import { useEffect, useState } from 'react'
import { Plus, Search, Filter } from 'lucide-react'
import { useStore } from '../store'
import type { Batch, BatchStatus } from 'shared/types'
import BatchCard from '../components/BatchCard'
import TestModal from '../components/TestModal'
import NewBatchModal from '../components/NewBatchModal'

const statusFilters: (BatchStatus | '全部')[] = [
  '全部',
  '入棚中',
  '晾晒中',
  '可投产',
  '已投产',
]

export default function Home() {
  const { batches, fetchBatches, error, setError } = useStore()
  const [filter, setFilter] = useState<BatchStatus | '全部'>('全部')
  const [keyword, setKeyword] = useState('')
  const [showNew, setShowNew] = useState(false)
  const [testBatch, setTestBatch] = useState<Batch | null>(null)

  useEffect(() => {
    fetchBatches()
  }, [])

  useEffect(() => {
    if (error) {
      const t = setTimeout(() => setError(null), 3000)
      return () => clearTimeout(t)
    }
  }, [error])

  const filtered = batches.filter((b) => {
    const matchStatus = filter === '全部' || b.status === filter
    const matchKw =
      !keyword ||
      b.batchNo.toLowerCase().includes(keyword.toLowerCase()) ||
      b.source.includes(keyword)
    return matchStatus && matchKw
  })

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h2 className="font-serif text-2xl font-bold text-bamboo-900">批次列表</h2>
          <p className="text-sm text-bamboo-500 mt-1">管理篾条晾晒批次，追踪含水率与投产状态</p>
        </div>
        <button onClick={() => setShowNew(true)} className="btn-primary self-start">
          <Plus className="w-4 h-4 mr-1.5" />
          新批次入棚
        </button>
      </div>

      <div className="card mb-6 bamboo-texture">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-bamboo-400" />
            <input
              className="input-field pl-9"
              placeholder="搜索批次号、篾条来源..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-1 overflow-x-auto">
            <Filter className="w-4 h-4 text-bamboo-400 mr-1 flex-shrink-0" />
            {statusFilters.map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  filter === s
                    ? 'bg-bamboo-600 text-white'
                    : 'bg-bamboo-50 text-bamboo-700 hover:bg-bamboo-100'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-bamboo-400 mb-2">暂无匹配的批次</div>
          <div className="text-xs text-bamboo-400">试试更换筛选条件或新增批次</div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((b) => (
            <BatchCard key={b.id} batch={b} onTest={setTestBatch} />
          ))}
        </div>
      )}

      {showNew && <NewBatchModal onClose={() => setShowNew(false)} />}
      {testBatch && <TestModal batch={testBatch} onClose={() => setTestBatch(null)} />}
    </div>
  )
}
