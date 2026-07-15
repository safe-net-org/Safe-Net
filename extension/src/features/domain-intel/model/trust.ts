import type { DomainIntel } from './types'

export interface TrustBreakdown {
  score: number
  level: 'high' | 'medium' | 'low'
  factors: Array<{ key: string; ok: boolean; weight: number; label: string }>
}

const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000

export function computeTrust(intel: DomainIntel, isHttps: boolean): TrustBreakdown {
  const createdMs = intel.rdap?.createdAt ?? intel.cert?.firstSeen ?? 0
  const ageMs = createdMs ? Date.now() - createdMs : 0
  const factors = [
    { key: 'age',     ok: ageMs >= ONE_YEAR_MS,                                  weight: 25, label: 'Возраст ≥ 1 года' },
    { key: 'https',   ok: isHttps,                                               weight: 20, label: 'HTTPS' },
    { key: 'dnssec',  ok: Boolean(intel.dns?.dnssecValid),                       weight: 15, label: 'DNSSEC' },
    { key: 'threat',  ok: (intel.threats?.totalListings ?? 0) === 0,             weight: 25, label: 'Нет в threat-feeds' },
    { key: 'cert',    ok: Boolean(intel.cert?.issuer),                           weight: 10, label: 'TLS-cert найден' },
    { key: 'resolve', ok: Boolean(intel.dns?.resolved),                          weight: 5,  label: 'DNS резолвится' },
  ]
  const score = factors.reduce((sum, f) => sum + (f.ok ? f.weight : 0), 0)
  const level = score >= 75 ? 'high' : score >= 45 ? 'medium' : 'low'
  return { score, level, factors }
}
