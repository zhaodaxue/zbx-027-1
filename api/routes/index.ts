import { Router, type Request, type Response } from 'express'
import { batchService, productionService } from '../services.js'
import type {
  CreateBatchRequest,
  TestMoistureRequest,
  CreateProductionRequest,
} from '../../shared/types.js'

const router = Router()

function ok<T>(res: Response, data: T) {
  res.json({ success: true, data })
}

function fail(res: Response, message: string, status = 400) {
  res.status(status).json({ success: false, error: message })
}

router.get('/batches', async (_req: Request, res: Response) => {
  try {
    ok(res, await batchService.getAll())
  } catch (e) {
    fail(res, (e as Error).message, 500)
  }
})

router.get('/batches/:id', async (req: Request, res: Response) => {
  try {
    const batch = await batchService.getById(req.params.id)
    if (!batch) return fail(res, '批次不存在', 404)
    ok(res, batch)
  } catch (e) {
    fail(res, (e as Error).message, 500)
  }
})

router.post('/batches', async (req: Request<unknown, unknown, CreateBatchRequest>, res: Response) => {
  try {
    const { batchNo, source, initialMoisture, dryingDays, usage } = req.body
    if (!batchNo || !source || initialMoisture == null || !dryingDays || !usage) {
      return fail(res, '缺少必填字段')
    }
    ok(res, await batchService.create({ batchNo, source, initialMoisture, dryingDays, usage }))
  } catch (e) {
    fail(res, (e as Error).message)
  }
})

router.post(
  '/batches/:id/test',
  async (req: Request<{ id: string }, unknown, TestMoistureRequest>, res: Response) => {
    try {
      const { moisture, operator } = req.body
      if (moisture == null) return fail(res, '缺少含水率数据')
      if (typeof moisture !== 'number' || isNaN(moisture)) {
        return fail(res, '含水率必须为有效数字')
      }
      if (moisture < 0 || moisture > 100) {
        return fail(res, '含水率必须在 0% 到 100% 之间')
      }
      const result = await batchService.testMoisture(req.params.id, {
        moisture,
        operator: operator || '管理员',
      })
      ok(res, result)
    } catch (e) {
      fail(res, (e as Error).message)
    }
  },
)

router.get('/productions', async (_req: Request, res: Response) => {
  try {
    ok(res, await productionService.getAll())
  } catch (e) {
    fail(res, (e as Error).message, 500)
  }
})

router.post(
  '/productions',
  async (req: Request<unknown, unknown, CreateProductionRequest>, res: Response) => {
    try {
      const { batchId, process, operator } = req.body
      if (!batchId || !process || !operator) return fail(res, '缺少必填字段')
      ok(res, await productionService.create({ batchId, process, operator }))
    } catch (e) {
      fail(res, (e as Error).message)
    }
  },
)

export default router
