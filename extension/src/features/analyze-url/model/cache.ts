import type { AnalysisResult } from '@/src/entities/analysis'
import { CACHE_KEY_PREFIX, STORAGE_KEYS } from '@/src/shared/lib/storage-keys'

const CACHE_TTL_MS = 60 * 60 * 1000
// Cache entries were never cleaned up before — storage.local just grew until
// the 5 MB quota. A cheap sweep on service-worker start plus an occasional one
// on write keeps it bounded without a timer the worker can't hold anyway.
const PRUNE_ON_WRITE_CHANCE = 0.02

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
  if (Math.random() < PRUNE_ON_WRITE_CHANCE) void pruneExpiredCache()
}

/** Drops every expired cache entry, including entries in the old key format. */
export async function pruneExpiredCache(): Promise<void> {
  try {
    const store = await browser.storage.local.get(null)
    const now = Date.now()
    const expired = Object.entries(store)
      .filter(([key, value]) => {
        if (!key.startsWith(CACHE_KEY_PREFIX)) return false
        const ts = (value as Partial<CacheEntry>)?.ts
        return typeof ts !== 'number' || now - ts > CACHE_TTL_MS
      })
      .map(([key]) => key)
    if (expired.length > 0) await browser.storage.local.remove(expired)
  } catch {
    /* pruning is best-effort */
  }
}
