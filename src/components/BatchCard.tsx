import { Link } from 'react-router-dom'
import { TreeDeciduous, CalendarDays, Eye, ThermometerSun } from 'lucide-react'
import type { Batch } from 'shared/types'
import { statusColor, formatDateTime } from '../lib/format'
import MoistureBar from './MoistureBar'

export default function BatchCard({
  batch,
  onTest,
}: {
  batch: Batch
  onTest: (b: Batch) => void
}) {
  const canTest = batch.status === '入棚中' || batch.status === '晾晒中'

  return (
    <div className="card card-hover bamboo-texture">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="font-serif text-lg font-semibold text-bamboo-900">
            {batch.batchNo}
          </div>
          <div className="flex items-center gap-3 mt-1 text-xs text-bamboo-500">
            <span className="inline-flex items-center gap-1">
              <TreeDeciduous className="w-3 h-3" />
              {batch.source}
            </span>
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="w-3 h-3" />
              {formatDateTime(batch.createdAt)}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {batch.isDowngraded && (
            <span className="tag bg-amber-100 text-amber-700 border border-amber-200">
              已降级
            </span>
          )}
          {batch.reSunCount > 0 && (
            <span className="tag bg-sun-100 text-sun-700 border border-sun-200">
              返晒 {batch.reSunCount} 次
            </span>
          )}
          <span className={`tag border ${statusColor(batch.status)}`}>{batch.status}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="rounded-xl bg-rice-50 p-3 border border-bamboo-100/60">
          <div className="text-[11px] text-bamboo-500 mb-0.5">计划用途</div>
          <div className="text-bamboo-800 font-semibold">{batch.usage}</div>
        </div>
        <div className="rounded-xl bg-rice-50 p-3 border border-bamboo-100/60">
          <div className="text-[11px] text-bamboo-500 mb-0.5">晾晒天数</div>
          <div className="text-bamboo-800 font-semibold">{batch.dryingDays} 天</div>
        </div>
      </div>

      <MoistureBar value={batch.currentMoisture} />

      <div className="flex items-center gap-2 mt-5 pt-4 border-t border-bamboo-100">
        <Link
          to={`/batches/${batch.id}`}
          className="btn-secondary flex-1"
        >
          <Eye className="w-4 h-4 mr-1.5" />
          追溯详情
        </Link>
        {canTest && (
          <button onClick={() => onTest(batch)} className="btn-primary flex-1">
            <ThermometerSun className="w-4 h-4 mr-1.5" />
            出棚检测
          </button>
        )}
      </div>
    </div>
  )
}
