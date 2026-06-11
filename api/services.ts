import { getDb, saveDb } from './db.js'
import type {
  Batch,
  TimelineEvent,
  ProductionRecord,
  BatchDetail,
  CreateBatchRequest,
  TestMoistureRequest,
  CreateProductionRequest,
  Usage,
} from '../shared/types.js'

const MAX_MOISTURE = 12
const MAX_RESUN = 2

function uuid(): string {
  return crypto.randomUUID()
}

function now(): string {
  return new Date().toISOString()
}

function rowToBatch(row: Record<string, any>): Batch {
  return {
    id: row.id,
    batchNo: row.batch_no,
    source: row.source,
    initialMoisture: row.initial_moisture,
    dryingDays: row.drying_days,
    currentMoisture: row.current_moisture,
    usage: row.usage,
    status: row.status,
    reSunCount: row.re_sun_count,
    isDowngraded: Boolean(row.is_downgraded),
    createdAt: row.created_at,
  }
}

function rowToEvent(row: Record<string, any>): TimelineEvent {
  return {
    id: row.id,
    batchId: row.batch_id,
    type: row.type,
    timestamp: row.timestamp,
    moisture: row.moisture ?? undefined,
    remark: row.remark ?? undefined,
  }
}

function rowToProduction(row: Record<string, any>): ProductionRecord {
  return {
    id: row.id,
    batchId: row.batch_id,
    batchNo: row.batch_no ?? undefined,
    process: row.process,
    operator: row.operator,
    createdAt: row.created_at,
  }
}

function getAsObjects(db: any, sql: string, params: any[] = []): Record<string, any>[] {
  const stmt = db.prepare(sql)
  stmt.bind(params)
  const results: Record<string, any>[] = []
  while (stmt.step()) {
    results.push(stmt.getAsObject())
  }
  stmt.free()
  return results
}

function getOne(db: any, sql: string, params: any[] = []): Record<string, any> | undefined {
  return getAsObjects(db, sql, params)[0]
}

function run(db: any, sql: string, params: any[] = []) {
  db.run(sql, params)
  saveDb()
}

export const batchService = {
  async getAll(): Promise<Batch[]> {
    const db = await getDb()
    const rows = getAsObjects(db, 'SELECT * FROM batches ORDER BY created_at DESC')
    return rows.map(rowToBatch)
  },

  async getById(id: string): Promise<BatchDetail | null> {
    const db = await getDb()
    const batchRow = getOne(db, 'SELECT * FROM batches WHERE id = ?', [id])
    if (!batchRow) return null

    const eventRows = getAsObjects(
      db,
      'SELECT * FROM timeline_events WHERE batch_id = ? ORDER BY timestamp ASC',
      [id],
    )

    const prodRow = getOne(db, 'SELECT * FROM production_records WHERE batch_id = ?', [id])

    return {
      ...rowToBatch(batchRow),
      timeline: eventRows.map(rowToEvent),
      production: prodRow ? rowToProduction(prodRow) : undefined,
    }
  },

  async create(req: CreateBatchRequest): Promise<Batch> {
    const db = await getDb()
    const existing = getOne(db, 'SELECT id FROM batches WHERE batch_no = ?', [req.batchNo])
    if (existing) {
      throw new Error('批次号已存在')
    }

    const batch: Batch = {
      id: uuid(),
      batchNo: req.batchNo,
      source: req.source,
      initialMoisture: req.initialMoisture,
      dryingDays: req.dryingDays,
      currentMoisture: req.initialMoisture,
      usage: req.usage,
      status: '入棚中',
      reSunCount: 0,
      isDowngraded: false,
      createdAt: now(),
    }

    run(
      db,
      `INSERT INTO batches (id, batch_no, source, initial_moisture, drying_days, current_moisture, usage, status, re_sun_count, is_downgraded, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        batch.id,
        batch.batchNo,
        batch.source,
        batch.initialMoisture,
        batch.dryingDays,
        batch.currentMoisture,
        batch.usage,
        batch.status,
        batch.reSunCount,
        batch.isDowngraded ? 1 : 0,
        batch.createdAt,
      ],
    )

    run(
      db,
      `INSERT INTO timeline_events (id, batch_id, type, timestamp, moisture, remark)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        uuid(),
        batch.id,
        '入棚',
        batch.createdAt,
        batch.initialMoisture,
        `篾条入棚晾晒，计划晾晒 ${batch.dryingDays} 天`,
      ],
    )

    return batch
  },

  async testMoisture(batchId: string, req: TestMoistureRequest) {
    const db = await getDb()
    const batch = await this.getById(batchId)
    if (!batch) throw new Error('批次不存在')
    if (batch.status === '已投产') throw new Error('批次已投产，不可再检测')

    const isQualified = req.moisture <= MAX_MOISTURE
    let newStatus: Batch['status'] = batch.status
    let newUsage: Usage = batch.usage
    let isDowngraded = batch.isDowngraded
    let reSunCount = batch.reSunCount
    let remark = ''
    const events: Omit<TimelineEvent, 'id' | 'batchId'>[] = []

    events.push({
      type: '出棚检测',
      timestamp: now(),
      moisture: req.moisture,
      remark: '',
    })

    if (isQualified) {
      newStatus = '可投产'
      remark = `含水率 ${req.moisture}%，达标可投产`
      events[0].remark = remark
    } else {
      reSunCount = batch.reSunCount + 1
      if (reSunCount > MAX_RESUN) {
        newStatus = '可投产'
        isDowngraded = true
        newUsage = '粗编'
        remark = `含水率 ${req.moisture}%，返晒超过 ${MAX_RESUN} 次，自动降级为粗编用途`
        events[0].remark = remark
        events.push({
          type: '降级',
          timestamp: now(),
          moisture: undefined,
          remark: `用途由【${batch.usage}】强制降级为【粗编】`,
        })
      } else {
        newStatus = '晾晒中'
        remark = `含水率 ${req.moisture}%，不达标，返晒第 ${reSunCount} 次`
        events[0].remark = remark
        events.push({
          type: '返晒',
          timestamp: now(),
          moisture: undefined,
          remark: `第 ${reSunCount} 次返晒`,
        })
      }
    }

    run(
      db,
      `UPDATE batches
       SET current_moisture = ?, status = ?, re_sun_count = ?, is_downgraded = ?, usage = ?
       WHERE id = ?`,
      [req.moisture, newStatus, reSunCount, isDowngraded ? 1 : 0, newUsage, batchId],
    )

    for (const ev of events) {
      run(
        db,
        `INSERT INTO timeline_events (id, batch_id, type, timestamp, moisture, remark)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [uuid(), batchId, ev.type, ev.timestamp, ev.moisture ?? null, ev.remark ?? null],
      )
    }

    return {
      qualified: isQualified,
      downgraded: isDowngraded && !batch.isDowngraded,
      reSunCount,
      newStatus,
      newUsage,
      remark,
    }
  },
}

export const productionService = {
  async getAll(): Promise<ProductionRecord[]> {
    const db = await getDb()
    const rows = getAsObjects(
      db,
      `SELECT p.*, b.batch_no
       FROM production_records p
       LEFT JOIN batches b ON p.batch_id = b.id
       ORDER BY p.created_at DESC`,
    )
    return rows.map(rowToProduction)
  },

  async create(req: CreateProductionRequest): Promise<ProductionRecord> {
    const db = await getDb()
    const batch = await batchService.getById(req.batchId)
    if (!batch) throw new Error('批次不存在')
    if (batch.status !== '可投产') throw new Error(`批次当前状态为【${batch.status}】，不可投产`)

    if (batch.isDowngraded && req.process === '细编') {
      throw new Error('该批次已降级用途，仅可用于【粗编】工序，不可用于细编')
    }

    const existing = getOne(db, 'SELECT id FROM production_records WHERE batch_id = ?', [
      req.batchId,
    ])
    if (existing) throw new Error('该批次已投产，不可重复登记')

    const record: ProductionRecord = {
      id: uuid(),
      batchId: req.batchId,
      process: req.process,
      operator: req.operator,
      createdAt: now(),
    }

    run(
      db,
      `INSERT INTO production_records (id, batch_id, process, operator, created_at)
       VALUES (?, ?, ?, ?, ?)`,
      [record.id, record.batchId, record.process, record.operator, record.createdAt],
    )

    run(db, "UPDATE batches SET status = '已投产' WHERE id = ?", [req.batchId])

    run(
      db,
      `INSERT INTO timeline_events (id, batch_id, type, timestamp, moisture, remark)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        uuid(),
        req.batchId,
        '投产',
        record.createdAt,
        null,
        `用于【${req.process}】工序，操作人：${req.operator}`,
      ],
    )

    return record
  },
}
