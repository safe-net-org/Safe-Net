import type { RiskLevel } from '@/src/entities/analysis'

export interface RecentEvent {
  ts: number
  level: RiskLevel
}

export interface ThreatEntry {
  domain: string
  score: number
  ts: number
}

export interface GlobalStats {
  totalChecked: number
  totalBlocked: number
  totalSuspicious: number
  totalSafe: number
  last24h: RecentEvent[]
  installedAt: number
  mlHits: number
  domHits: number
  topThreats: ThreatEntry[]
}

export const EMPTY_STATS: GlobalStats = {
  totalChecked: 0,
  totalBlocked: 0,
  totalSuspicious: 0,
  totalSafe: 0,
  last24h: [],
  installedAt: Date.now(),
  mlHits: 0,
  domHits: 0,
  topThreats: [],
}
