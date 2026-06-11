import { create } from 'zustand'
import type { Batch, BatchDetail, ProductionRecord } from 'shared/types'
import { api } from '../lib/api'

interface Store {
  batches: Batch[]
  batchDetail: BatchDetail | null
  productions: ProductionRecord[]
  loading: boolean
  error: string | null
  fetchBatches: () => Promise<void>
  fetchBatchDetail: (id: string) => Promise<void>
  fetchProductions: () => Promise<void>
  createBatch: (data: any) => Promise<void>
  testMoisture: (id: string, data: any) => Promise<any>
  createProduction: (data: any) => Promise<void>
  setError: (msg: string | null) => void
}

export const useStore = create<Store>((set, get) => ({
  batches: [],
  batchDetail: null,
  productions: [],
  loading: false,
  error: null,

  setError: (msg) => set({ error: msg }),

  fetchBatches: async () => {
    set({ loading: true })
    try {
      const data = await api.getBatches()
      set({ batches: data as Batch[] })
    } catch (e) {
      set({ error: (e as Error).message })
    } finally {
      set({ loading: false })
    }
  },

  fetchBatchDetail: async (id) => {
    set({ loading: true })
    try {
      const data = await api.getBatch(id)
      set({ batchDetail: data as BatchDetail })
    } catch (e) {
      set({ error: (e as Error).message })
    } finally {
      set({ loading: false })
    }
  },

  fetchProductions: async () => {
    set({ loading: true })
    try {
      const data = await api.getProductions()
      set({ productions: data as ProductionRecord[] })
    } catch (e) {
      set({ error: (e as Error).message })
    } finally {
      set({ loading: false })
    }
  },

  createBatch: async (data) => {
    set({ loading: true })
    try {
      await api.createBatch(data)
      await get().fetchBatches()
    } catch (e) {
      set({ error: (e as Error).message })
      throw e
    } finally {
      set({ loading: false })
    }
  },

  testMoisture: async (id, data) => {
    set({ loading: true })
    try {
      const result = await api.testMoisture(id, data)
      await Promise.all([get().fetchBatches(), get().fetchBatchDetail(id)])
      return result
    } catch (e) {
      set({ error: (e as Error).message })
      throw e
    } finally {
      set({ loading: false })
    }
  },

  createProduction: async (data) => {
    set({ loading: true })
    try {
      await api.createProduction(data)
      await Promise.all([get().fetchBatches(), get().fetchProductions()])
    } catch (e) {
      set({ error: (e as Error).message })
      throw e
    } finally {
      set({ loading: false })
    }
  },
}))
