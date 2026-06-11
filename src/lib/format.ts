import type { BatchStatus, EventType } from 'shared/types'

export function statusColor(status: BatchStatus) {
  switch (status) {
    case '入棚中':
      return 'bg-bamboo-100 text-bamboo-700 border-bamboo-200'
    case '晾晒中':
      return 'bg-sun-100 text-sun-700 border-sun-200'
    case '可投产':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200'
    case '已投产':
      return 'bg-blue-50 text-blue-700 border-blue-200'
    case '已降级':
      return 'bg-amber-50 text-amber-700 border-amber-200'
  }
}

export function eventColor(type: EventType) {
  switch (type) {
    case '入棚':
      return 'bg-bamboo-500'
    case '出棚检测':
      return 'bg-bamboo-600'
    case '返晒':
      return 'bg-sun-500'
    case '降级':
      return 'bg-amber-500'
    case '投产':
      return 'bg-blue-500'
  }
}

export function formatDateTime(iso: string) {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}
