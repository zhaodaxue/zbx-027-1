export type BambooSource = '毛竹' | '慈竹'
export type Usage = '细编' | '粗编'
export type BatchStatus = '入棚中' | '晾晒中' | '可投产' | '已投产' | '已降级'
export type EventType = '入棚' | '出棚检测' | '返晒' | '降级' | '投产'

export interface Batch {
  id: string
  batchNo: string
  source: BambooSource
  initialMoisture: number
  dryingDays: number
  currentMoisture: number
  usage: Usage
  status: BatchStatus
  reSunCount: number
  isDowngraded: boolean
  createdAt: string
}

export interface TimelineEvent {
  id: string
  batchId: string
  type: EventType
  timestamp: string
  moisture?: number
  remark?: string
}

export interface ProductionRecord {
  id: string
  batchId: string
  batchNo?: string
  process: Usage
  operator: string
  createdAt: string
}

export interface BatchDetail extends Batch {
  timeline: TimelineEvent[]
  production?: ProductionRecord
}

export interface CreateBatchRequest {
  batchNo: string
  source: BambooSource
  initialMoisture: number
  dryingDays: number
  usage: Usage
}

export interface TestMoistureRequest {
  moisture: number
  operator: string
}

export interface CreateProductionRequest {
  batchId: string
  process: Usage
  operator: string
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}
