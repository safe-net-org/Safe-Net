import type { ThreatHit, ThreatInfo } from './types'

const TIMEOUT_MS = 4500

interface DohAnswer { data: string }
interface DohResponse { Status: number; Answer?: DohAnswer[] }

interface ThreatProvider {
  source: string
  endpoint: string
  label: string
}

const PROVIDERS: ThreatProvider[] = [
  {
    source: 'cloudflare-security',
    endpoint: 'https://security.cloudflare-dns.com/dns-query',
    label: 'Cloudflare Security (malware)',
  },
  {
    source: 'quad9',
    endpoint: 'https://dns.quad9.net/dns-query',
    label: 'Quad9 (malicious feed)',
  },
  {
    source: 'adguard',
    endpoint: 'https://dns.adguard-dns.com/dns-query',
    label: 'AdGuard (filter)',
  },
]

async function doh(endpoint: string, domain: string): Promise<DohResponse | null> {
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
    const res = await fetch(
      `${endpoint}?name=${encodeURIComponent(domain)}&type=A`,
      { signal: controller.signal, headers: { Accept: 'application/dns-json' } },
    )
    clearTimeout(timer)
    if (!res.ok) return null
    return (await res.json()) as DohResponse
  } catch {
    return null
  }
}

function isBlocked(data: DohResponse | null): boolean {
  if (!data) return false
  if (data.Status === 3) return true
  if (!data.Answer || data.Answer.length === 0) return data.Status === 0
  return data.Answer.some((a) => a.data === '0.0.0.0' || a.data === '::')
}

async function checkProvider(p: ThreatProvider, domain: string, control: DohResponse | null): Promise<ThreatHit> {
  const result = await doh(p.endpoint, domain)
  if (!result) return { source: p.label, listed: false, detail: 'no response' }
  const controlResolved = Boolean(control?.Answer && control.Answer.length > 0)
  const providerResolved = Boolean(result.Answer && result.Answer.length > 0)
  const listed = controlResolved && (!providerResolved || isBlocked(result))
  return {
    source: p.label,
    listed,
    detail: listed ? 'domain blocked by feed' : 'not listed',
  }
}

interface UrlhausResponse {
  query_status?: string
  urls?: Array<{ url_status?: string; threat?: string }>
}

/**
 * abuse.ch URLhaus host lookup — free, no API key, CORS-enabled.
 * Reports whether the domain hosts known malware / payload URLs.
 */
async function checkUrlhaus(domain: string): Promise<ThreatHit> {
  const label = 'URLhaus (abuse.ch)'
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
    const res = await fetch('https://urlhaus-api.abuse.ch/v1/host/', {
      method: 'POST',
      signal: controller.signal,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ host: domain }).toString(),
    })
    clearTimeout(timer)
    if (!res.ok) return { source: label, listed: false, detail: 'no response' }
    const data = (await res.json()) as UrlhausResponse
    if (data.query_status !== 'ok' || !data.urls?.length) {
      return { source: label, listed: false, detail: 'not listed' }
    }
    const active = data.urls.filter((u) => u.url_status === 'online').length
    const threat = data.urls[0]?.threat ?? 'malware'
    return {
      source: label,
      listed: true,
      detail: `${data.urls.length} вредоносных URL (${threat}${active ? `, ${active} активны` : ''})`,
    }
  } catch {
    return { source: label, listed: false, detail: 'no response' }
  }
}

export async function checkThreatFeeds(domain: string): Promise<ThreatInfo | null> {
  try {
    const control = await doh('https://cloudflare-dns.com/dns-query', domain)
    const [dohHits, urlhaus] = await Promise.all([
      Promise.all(PROVIDERS.map((p) => checkProvider(p, domain, control))),
      checkUrlhaus(domain),
    ])
    const hits = [...dohHits, urlhaus]
    return {
      hits,
      totalSourcesChecked: PROVIDERS.length + 1,
      totalListings: hits.filter((h) => h.listed).length,
    }
  } catch {
    return null
  }
}
