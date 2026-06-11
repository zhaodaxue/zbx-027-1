import { Droplets } from 'lucide-react'

export default function MoistureBar({
  value,
  max = 12,
  warn = 12,
}: {
  value: number
  max?: number
  warn?: number
}) {
  const pct = Math.min((value / (max * 1.5)) * 100, 100)
  const ok = value <= warn
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1 text-xs text-bamboo-600">
          <Droplets className="w-3.5 h-3.5" />
          <span>含水率</span>
        </div>
        <span
          className={`text-sm font-semibold ${ok ? 'text-bamboo-700' : 'text-sun-600'}`}
        >
          {value.toFixed(1)}%
        </span>
      </div>
      <div className="relative h-2 bg-bamboo-100 rounded-full overflow-hidden">
        <div
          className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ${ok ? 'bg-gradient-to-r from-bamboo-400 to-bamboo-600' : 'bg-gradient-to-r from-sun-400 to-sun-600'}`}
          style={{ width: `${pct}%` }}
        />
        <div
          className="absolute top-0 bottom-0 w-px bg-amber-500/80"
          style={{ left: `${(warn / (max * 1.5)) * 100}%` }}
          title={`合格线 ${warn}%`}
        />
      </div>
      <div className="flex justify-between text-[10px] text-bamboo-400 mt-1">
        <span>0</span>
        <span className="text-amber-500 font-medium">合格≤{warn}%</span>
        <span>{max * 1.5}</span>
      </div>
    </div>
  )
}
