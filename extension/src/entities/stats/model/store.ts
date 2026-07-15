import type { AnalysisResult } from '@/src/entities/analysis'
import { STORAGE_KEYS } from '@/src/shared/lib/storage-keys'
import { EMPTY_STATS, type GlobalStats } from './types'

export async function getStats(): Promise<GlobalStats> {
  const stored = await browser.storage.local.get(STORAGE_KEYS.globalStats)
  const s = stored[STORAGE_KEYS.globalStats] as GlobalStats | undefined
  if (s) return s
  const fresh: GlobalStats = { ...EMPTY_STATS, installedAt: Date.now() }
  await browser.storage.local.set({ [STORAGE_KEYS.globalStats]: fresh })
  return fresh
}

export async function bumpStats(result: AnalysisResult): Promise<void> {
  const s = await getStats()
  const next: GlobalStats = {
    ...s,
    totalChecked: s.totalChecked + 1,
    totalBlocked: s.totalBlocked + (result.level === 'danger' ? 1 : 0),
    totalSuspicious: s.totalSuspicious + (result.level === 'suspicious' ? 1 : 0),
    totalSafe: s.totalSafe + (result.level === 'safe' ? 1 : 0),
    mlHits: s.mlHits + (result.mlEnhanced ? 1 : 0),
    domHits: s.domHits + (result.domScore && result.domScore > 0 ? 1 : 0),
  }

  const cutoff = Date.now() - 24 * 60 * 60 * 1000
  next.last24h = [
    ...s.last24h.filter((e) => e.ts > cutoff),
    { ts: Date.now(), level: result.level },
  ]

  if (result.score >= 50) {
    try {
      const host = new URL(result.url).hostname
      next.topThreats = [
        { domain: host, score: result.score, ts: Date.now() },
        ...s.topThreats.filter((t) => t.domain !== host),
      ].slice(0, 5)
    } catch { /* skip bad URL */ }
  }

  await browser.storage.local.set({ [STORAGE_KEYS.globalStats]: next })
}
