import type { VirusTotalInfo } from './types'

const VT_DOMAIN_ENDPOINT = 'https://www.virustotal.com/api/v3/domains/'
const TIMEOUT_MS = 6000

interface VtAnalysisStats {
  harmless?: number
  malicious?: number
  suspicious?: number
  undetected?: number
  timeout?: number
}

interface VtEngineResult {
  category?: string // 'malicious' | 'suspicious' | 'harmless' | 'undetected'
  result?: string
  engine_name?: string
}

interface VtAttributes {
  last_analysis_stats?: VtAnalysisStats
  last_analysis_results?: Record<string, VtEngineResult>
  reputation?: number
  total_votes?: { harmless?: number; malicious?: number }
  categories?: Record<string, string>
  popularity_ranks?: Record<string, { rank?: number }>
  last_analysis_date?: number
}

interface VtResponse {
  data?: { attributes?: VtAttributes }
  error?: { code?: string; message?: string }
}

/**
 * Live VirusTotal v3 domain report. Aggregates ~90 security engines plus
 * crowd-sourced votes and reputation. Requires a user-supplied API key
 * (free tier works). Returns null when no key, on error, or on rate-limit so
 * the rest of the intel panel still renders.
 */
export async function fetchVirusTotal(
  domain: string,
  apiKey: string,
): Promise<VirusTotalInfo | null> {
  if (!apiKey) return null
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
    const res = await fetch(`${VT_DOMAIN_ENDPOINT}${encodeURIComponent(domain)}`, {
      signal: controller.signal,
      headers: { 'x-apikey': apiKey, Accept: 'application/json' },
    })
    clearTimeout(timer)

    // 401 = bad key, 429 = rate limited, 404 = domain never scanned.
    if (res.status === 404) {
      return {
        available: false,
        malicious: 0, suspicious: 0, harmless: 0, undetected: 0, total: 0,
        reputation: 0, votesHarmless: 0, votesMalicious: 0,
        categories: [], topRank: null, flaggedEngines: [],
        scannedAt: null, error: 'домен ещё не сканировался',
      }
    }
    if (!res.ok) {
      const detail = res.status === 401 ? 'неверный API-ключ'
        : res.status === 429 ? 'лимит запросов исчерпан'
          : `HTTP ${res.status}`
      return { ...empty(), error: detail }
    }

    const json = (await res.json()) as VtResponse
    const attr = json.data?.attributes
    if (!attr) return { ...empty(), error: 'пустой ответ' }

    const stats = attr.last_analysis_stats ?? {}
    const malicious = stats.malicious ?? 0
    const suspicious = stats.suspicious ?? 0
    const harmless = stats.harmless ?? 0
    const undetected = stats.undetected ?? 0
    const total = malicious + suspicious + harmless + undetected + (stats.timeout ?? 0)

    const flaggedEngines = Object.values(attr.last_analysis_results ?? {})
      .filter((e) => e.category === 'malicious' || e.category === 'suspicious')
      .map((e) => e.engine_name ?? 'engine')
      .slice(0, 12)

    const ranks = Object.values(attr.popularity_ranks ?? {})
      .map((r) => r.rank)
      .filter((r): r is number => typeof r === 'number')
    const topRank = ranks.length > 0 ? Math.min(...ranks) : null

    return {
      available: true,
      malicious, suspicious, harmless, undetected, total,
      reputation: attr.reputation ?? 0,
      votesHarmless: attr.total_votes?.harmless ?? 0,
      votesMalicious: attr.total_votes?.malicious ?? 0,
      categories: [...new Set(Object.values(attr.categories ?? {}))].slice(0, 4),
      topRank,
      flaggedEngines,
      scannedAt: attr.last_analysis_date ? attr.last_analysis_date * 1000 : null,
      error: null,
    }
  } catch {
    return null
  }
}

function empty(): VirusTotalInfo {
  return {
    available: false,
    malicious: 0, suspicious: 0, harmless: 0, undetected: 0, total: 0,
    reputation: 0, votesHarmless: 0, votesMalicious: 0,
    categories: [], topRank: null, flaggedEngines: [],
    scannedAt: null, error: null,
  }
}
