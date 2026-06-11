import { getDb, saveDb } from './db.js'
import type { Batch, TimelineEvent, ProductionRecord } from '../shared/types.js'

function uuid(): string {
  return crypto.randomUUID()
}

function now(offsetMinutes = 0): string {
  const d = new Date()
  d.setMinutes(d.getMinutes() - offsetMinutes)
  return d.toISOString()
}

export async function seedData() {
  const db = await getDb()
  const countRow = db.exec('SELECT COUNT(*) as cnt FROM batches')[0]
  const cnt = countRow ? countRow.values[0][0] : 0
  if ((cnt as number) > 0) {
    console.log('Database already seeded, skipping.')
    return
  }

  function insertBatch(b: Batch) {
    db.run(
      `INSERT INTO batches (id, batch_no, source, initial_moisture, drying_days, current_moisture, usage, status, re_sun_count, is_downgraded, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        b.id,
        b.batchNo,
        b.source,
        b.initialMoisture,
        b.dryingDays,
        b.currentMoisture,
        b.usage,
        b.status,
        b.reSunCount,
        b.isDowngraded ? 1 : 0,
        b.createdAt,
      ],
    )
  }

  function insertEvent(e: TimelineEvent) {
    db.run(
      `INSERT INTO timeline_events (id, batch_id, type, timestamp, moisture, remark)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [e.id, e.batchId, e.type, e.timestamp, e.moisture ?? null, e.remark ?? null],
    )
  }

  function insertProduction(p: ProductionRecord) {
    db.run(
      `INSERT INTO production_records (id, batch_id, process, operator, created_at)
       VALUES (?, ?, ?, ?, ?)`,
      [p.id, p.batchId, p.process, p.operator, p.createdAt],
    )
  }

  // Batch 1: 正常批次 - 一次晾晒合格，已投产（细编）
  const b1: Batch = {
    id: uuid(),
    batchNo: 'ZB-20260601-001',
    source: '毛竹',
    initialMoisture: 28,
    dryingDays: 5,
    currentMoisture: 9.5,
    usage: '细编',
    status: '已投产',
    reSunCount: 0,
    isDowngraded: false,
    createdAt: now(60 * 24 * 5),
  }
  insertBatch(b1)
  insertEvent({ id: uuid(), batchId: b1.id, type: '入棚', timestamp: b1.createdAt, moisture: b1.initialMoisture, remark: '篾条入棚晾晒' })
  insertEvent({ id: uuid(), batchId: b1.id, type: '出棚检测', timestamp: now(60 * 24), moisture: b1.currentMoisture, remark: '含水率达标，可投产' })
  insertEvent({ id: uuid(), batchId: b1.id, type: '投产', timestamp: now(60), moisture: undefined, remark: '用于细编工艺' })
  insertProduction({ id: uuid(), batchId: b1.id, process: '细编', operator: '李师傅', createdAt: now(60) })

  // Batch 2: 正常批次 - 一次晾晒合格，可投产（细编）
  const b2: Batch = {
    id: uuid(),
    batchNo: 'ZB-20260603-002',
    source: '慈竹',
    initialMoisture: 32,
    dryingDays: 7,
    currentMoisture: 10.2,
    usage: '细编',
    status: '可投产',
    reSunCount: 0,
    isDowngraded: false,
    createdAt: now(60 * 24 * 3),
  }
  insertBatch(b2)
  insertEvent({ id: uuid(), batchId: b2.id, type: '入棚', timestamp: b2.createdAt, moisture: b2.initialMoisture, remark: '篾条入棚晾晒' })
  insertEvent({ id: uuid(), batchId: b2.id, type: '出棚检测', timestamp: now(60 * 6), moisture: b2.currentMoisture, remark: '含水率达标，可投产' })

  // Batch 3: 返晒 2 次后降级 - 仅可粗编
  const b3: Batch = {
    id: uuid(),
    batchNo: 'ZB-20260602-003',
    source: '毛竹',
    initialMoisture: 35,
    dryingDays: 6,
    currentMoisture: 14.8,
    usage: '粗编',
    status: '可投产',
    reSunCount: 2,
    isDowngraded: true,
    createdAt: now(60 * 24 * 4),
  }
  insertBatch(b3)
  insertEvent({ id: uuid(), batchId: b3.id, type: '入棚', timestamp: b3.createdAt, moisture: b3.initialMoisture, remark: '原用途：细编' })
  insertEvent({ id: uuid(), batchId: b3.id, type: '出棚检测', timestamp: now(60 * 24 * 3), moisture: 18.5, remark: '含水率不达标，返晒第1次' })
  insertEvent({ id: uuid(), batchId: b3.id, type: '返晒', timestamp: now(60 * 24 * 3), moisture: undefined, remark: '第1次返晒' })
  insertEvent({ id: uuid(), batchId: b3.id, type: '出棚检测', timestamp: now(60 * 24 * 2), moisture: 16.2, remark: '含水率不达标，返晒第2次' })
  insertEvent({ id: uuid(), batchId: b3.id, type: '返晒', timestamp: now(60 * 24 * 2), moisture: undefined, remark: '第2次返晒' })
  insertEvent({ id: uuid(), batchId: b3.id, type: '出棚检测', timestamp: now(60 * 12), moisture: b3.currentMoisture, remark: '返晒超过2次，自动降级用途' })
  insertEvent({ id: uuid(), batchId: b3.id, type: '降级', timestamp: now(60 * 12), moisture: undefined, remark: '用途由细编降级为粗编' })

  // Batch 4: 正在晾晒中（返晒1次）
  const b4: Batch = {
    id: uuid(),
    batchNo: 'ZB-20260605-004',
    source: '慈竹',
    initialMoisture: 30,
    dryingDays: 4,
    currentMoisture: 15.3,
    usage: '细编',
    status: '晾晒中',
    reSunCount: 1,
    isDowngraded: false,
    createdAt: now(60 * 24 * 2),
  }
  insertBatch(b4)
  insertEvent({ id: uuid(), batchId: b4.id, type: '入棚', timestamp: b4.createdAt, moisture: b4.initialMoisture, remark: '篾条入棚晾晒' })
  insertEvent({ id: uuid(), batchId: b4.id, type: '出棚检测', timestamp: now(60 * 20), moisture: 15.3, remark: '含水率不达标，返晒第1次' })
  insertEvent({ id: uuid(), batchId: b4.id, type: '返晒', timestamp: now(60 * 20), moisture: undefined, remark: '第1次返晒' })

  // Batch 5: 已投产 - 降级用途的批次尝试细编被拒绝，最后用粗编投产
  const b5: Batch = {
    id: uuid(),
    batchNo: 'ZB-20260604-005',
    source: '毛竹',
    initialMoisture: 33,
    dryingDays: 8,
    currentMoisture: 13.5,
    usage: '粗编',
    status: '已投产',
    reSunCount: 2,
    isDowngraded: true,
    createdAt: now(60 * 24 * 4),
  }
  insertBatch(b5)
  insertEvent({ id: uuid(), batchId: b5.id, type: '入棚', timestamp: b5.createdAt, moisture: b5.initialMoisture, remark: '原用途：细编' })
  insertEvent({ id: uuid(), batchId: b5.id, type: '出棚检测', timestamp: now(60 * 24 * 3), moisture: 17.8, remark: '含水率不达标，返晒第1次' })
  insertEvent({ id: uuid(), batchId: b5.id, type: '返晒', timestamp: now(60 * 24 * 3), moisture: undefined, remark: '第1次返晒' })
  insertEvent({ id: uuid(), batchId: b5.id, type: '出棚检测', timestamp: now(60 * 24 * 2), moisture: 15.1, remark: '含水率不达标，返晒第2次' })
  insertEvent({ id: uuid(), batchId: b5.id, type: '返晒', timestamp: now(60 * 24 * 2), moisture: undefined, remark: '第2次返晒' })
  insertEvent({ id: uuid(), batchId: b5.id, type: '出棚检测', timestamp: now(60 * 18), moisture: b5.currentMoisture, remark: '返晒超过2次，自动降级用途' })
  insertEvent({ id: uuid(), batchId: b5.id, type: '降级', timestamp: now(60 * 18), moisture: undefined, remark: '用途由细编降级为粗编' })
  insertEvent({ id: uuid(), batchId: b5.id, type: '投产', timestamp: now(60 * 2), moisture: undefined, remark: '已尝试细编被系统拒绝，改粗编投产' })
  insertProduction({ id: uuid(), batchId: b5.id, process: '粗编', operator: '王师傅', createdAt: now(60 * 2) })

  saveDb()
  console.log('Seed data inserted successfully.')
}
