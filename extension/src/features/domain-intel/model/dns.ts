import type { DnsInfo } from './types'

const DOH_ENDPOINT = 'https://cloudflare-dns.com/dns-query'
const TIMEOUT_MS = 4500

const TYPE_MAP: Record<string, number> = {
  A: 1, AAAA: 28, MX: 15, NS: 2, TXT: 16,
}

interface DohAnswer { name: string; type: number; TTL: number; data: string }
interface DohResponse { Status: number; AD?: boolean; Answer?: DohAnswer[] }

async function query(domain: string, type: keyof typeof TYPE_MAP): Promise<DohResponse | null> {
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
    const url = `${DOH_ENDPOINT}?name=${encodeURIComponent(domain)}&type=${TYPE_MAP[type]}&do=1`
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'application/dns-json' },
    })
    clearTimeout(timer)
    if (!res.ok) return null
    return (await res.json()) as DohResponse
  } catch {
    return null
  }
}

function unwrap(data: DohResponse | null): string[] {
  if (!data?.Answer) return []
  return data.Answer.map((a) => a.data.replace(/^"|"$/g, ''))
}

export async function fetchDns(domain: string): Promise<DnsInfo | null> {
  try {
    const [a, aaaa, mx, ns, txt] = await Promise.all([
      query(domain, 'A'),
      query(domain, 'AAAA'),
      query(domain, 'MX'),
      query(domain, 'NS'),
      query(domain, 'TXT'),
    ])

    const aRecords = unwrap(a)
    const aaaaRecords = unwrap(aaaa)
    const resolved = aRecords.length > 0 || aaaaRecords.length > 0

    if (!a && !aaaa && !ns) return null

    return {
      a: aRecords,
      aaaa: aaaaRecords,
      mx: unwrap(mx).map((s) => s.replace(/^\d+\s+/, '').replace(/\.$/, '')),
      ns: unwrap(ns).map((s) => s.replace(/\.$/, '')),
      txt: unwrap(txt).slice(0, 4),
      dnssecValid: Boolean(a?.AD || aaaa?.AD || ns?.AD),
      resolved,
    }
  } catch {
    return null
  }
}
