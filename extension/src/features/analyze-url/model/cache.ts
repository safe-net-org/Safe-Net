import type { AnalysisResult } from '@/src/entities/analysis'
import { STORAGE_KEYS } from '@/src/shared/lib/storage-keys'

const CACHE_TTL_MS = 60 * 60 * 1000

interface CacheEntry {
  result: AnalysisResult
  ts: number
}

export async function getCached(url: string): Promise<AnalysisResult | null> {
  const key = STORAGE_KEYS.cache(url)
  const result = await browser.storage.local.get(key)
  const entry = result[key] as CacheEntry | undefined
  if (!entry) return null
  if (Date.now() - entry.ts > CACHE_TTL_MS) return null
  return entry.result
}

export async function setCache(url: string, result: AnalysisResult): Promise<void> {
  const key = STORAGE_KEYS.cache(url)
  await browser.storage.local.set({ [key]: { result, ts: Date.now() } satisfies CacheEntry })
}
