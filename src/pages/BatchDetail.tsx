import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft,
  TreeDeciduous,
  CalendarDays,
  Tag,
  RotateCcw,
  ThermometerSun,
  CheckCircle2,
  AlertTriangle,
  Factory,
  Droplets,
} from 'lucide-react'
import { useStore } from '../store'
import { eventColor, formatDateTime, statusColor } from '../lib/format'
import MoistureBar from '../components/MoistureBar'
import type { TimelineEvent } from 'shared/types'

function IconForType(type: TimelineEvent['type']) {
  switch (type) {
    case '入棚':
      return <TreeDeciduous className="w-4 h-4 text-white" />
    case '出棚检测':
      return <ThermometerSun className="w-4 h-4 text-white" />
    case '返晒':
      return <RotateCcw className="w-4 h-4 text-white" />
    case '降级':
      return <AlertTriangle className="w-4 h-4 text-white" />
    case '投产':
      return <Factory className="w-4 h-4 text-white" />
  }
}

export default function BatchDetail() {
  const { id } = useParams()
  const { batchDetail, fetchBatchDetail, loading } = useStore()

  useEffect(() => {
    if (id) fetchBatchDetail(id)
  }, [id])

  if (loading && !batchDetail) {
    return <div className="text-bamboo-500 text-center py-20">加载中...</div>
  }
  if (!batchDetail) {
    return <div className="text-center py-20">批次不存在</div>
  }

  const b = batchDetail

  return (
    <div>
      <Link to="/" className="inline-flex items-center gap-1.5 text-bamboo-600 hover:text-bamboo-800 text-sm mb-4">
        <ArrowLeft className="w-4 h-4" />
        返回批次列表
      </Link>

      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="card bamboo-texture">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="font-serif text-2xl font-bold text-bamboo-900">{b.batchNo}</h2>
                <div className="flex items-center gap-3 mt-1.5 text-xs text-bamboo-500">
                  <span className="inline-flex items-center gap-1">
                    <CalendarDays className="w-3 h-3" />
                    {formatDateTime(b.createdAt)}
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <span className={`tag border ${statusColor(b.status)}`}>{b.status}</span>
                {b.isDowngraded && (
                  <span className="tag bg-amber-100 text-amber-700 border border-amber-200">
                    已降级
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="rounded-xl bg-rice-50 p-3 border border-bamboo-100/60">
                <div className="text-[11px] text-bamboo-500 mb-0.5 flex items-center gap-1">
                  <TreeDeciduous className="w-3 h-3" />
                  篾条来源
                </div>
                <div className="text-bamboo-800 font-semibold">{b.source}</div>
              </div>
              <div className="rounded-xl bg-rice-50 p-3 border border-bamboo-100/60">
                <div className="text-[11px] text-bamboo-500 mb-0.5 flex items-center gap-1">
                  <Tag className="w-3 h-3" />
                  当前用途
                </div>
                <div className="text-bamboo-800 font-semibold">{b.usage}</div>
              </div>
              <div className="rounded-xl bg-rice-50 p-3 border border-bamboo-100/60">
                <div className="text-[11px] text-bamboo-500 mb-0.5 flex items-center gap-1">
                  <Droplets className="w-3 h-3" />
                  入棚含水率
                </div>
                <div className="text-bamboo-800 font-semibold">{b.initialMoisture}%</div>
              </div>
              <div className="rounded-xl bg-rice-50 p-3 border border-bamboo-100/60">
                <div className="text-[11px] text-bamboo-500 mb-0.5 flex items-center gap-1">
                  <RotateCcw className="w-3 h-3" />
                  返晒次数
                </div>
                <div className="text-bamboo-800 font-semibold">{b.reSunCount} / 2</div>
              </div>
            </div>

            <MoistureBar value={b.currentMoisture} />
          </div>

          {b.production && (
            <div className="card border-blue-100 bg-blue-50/30">
              <div className="flex items-center gap-2 mb-2">
                <Factory className="w-4 h-4 text-blue-600" />
                <h3 className="font-serif font-semibold text-bamboo-900">投产信息</h3>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-[11px] text-bamboo-500">工序</div>
                  <div className="font-medium text-bamboo-800">{b.production.process}</div>
                </div>
                <div>
                  <div className="text-[11px] text-bamboo-500">操作人</div>
                  <div className="font-medium text-bamboo-800">{b.production.operator}</div>
                </div>
                <div className="col-span-2">
                  <div className="text-[11px] text-bamboo-500">投产时间</div>
                  <div className="font-medium text-bamboo-800">
                    {formatDateTime(b.production.createdAt)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-3">
          <div className="card">
            <div className="flex items-center gap-2 mb-5">
              <CheckCircle2 className="w-5 h-5 text-bamboo-600" />
              <h3 className="font-serif text-lg font-semibold text-bamboo-900">批次追溯时间线</h3>
            </div>

            <div className="relative pl-2">
              <div className="absolute left-[17px] top-1 bottom-1 w-0.5 bg-gradient-to-b from-bamboo-300 via-bamboo-200 to-bamboo-100 rounded-full" />
              <div className="space-y-5">
                {b.timeline.map((ev, idx) => {
                  const isSun = ev.type === '返晒'
                  return (
                    <div key={ev.id} className="relative flex gap-4">
                      <div
                        className={`relative z-10 flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center shadow-md ${isSun ? 'bg-sun-500 ring-4 ring-sun-100' : eventColor(ev.type)}`}
                      >
                        {IconForType(ev.type)}
                      </div>
                      <div
                        className={`flex-1 rounded-xl p-4 border transition-all ${isSun ? 'bg-sun-50/60 border-sun-200' : 'bg-white border-bamboo-100/80 hover:border-bamboo-200'}`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-sm font-semibold ${isSun ? 'text-sun-700' : 'text-bamboo-800'}`}
                            >
                              {ev.type}
                            </span>
                            {isSun && (
                              <span className="tag bg-sun-200/60 text-sun-700">返晒节点</span>
                            )}
                          </div>
                          <span className="text-xs text-bamboo-400 tabular-nums">
                            {formatDateTime(ev.timestamp)}
                          </span>
                        </div>
                        {ev.moisture != null && (
                          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-bamboo-50 text-bamboo-700 text-xs mb-1.5">
                            <Droplets className="w-3 h-3" />
                            含水率 {ev.moisture}%
                          </div>
                        )}
                        {ev.remark && (
                          <div className="text-sm text-bamboo-600 leading-relaxed">{ev.remark}</div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
