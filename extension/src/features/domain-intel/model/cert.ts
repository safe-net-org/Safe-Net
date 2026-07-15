import type { CertInfo } from './types'

const TIMEOUT_MS = 8000

interface CrtShEntry {
  issuer_name?: string
  name_value?: string
  not_before?: string
  not_after?: string
}

function parseIssuerCN(issuer: string): string | null {
  const m = issuer.match(/CN=([^,]+)/)
  return m ? m[1].trim() : issuer.split(',')[0]?.trim() ?? null
}

export async function fetchCertHistory(domain: string): Promise<CertInfo | null> {
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
    const res = await fetch(
      `https://crt.sh/?q=${encodeURIComponent(domain)}&output=json&exclude=expired`,
      { signal: controller.signal },
    )
    clearTimeout(timer)
    if (!res.ok) return null
    const data = (await res.json()) as CrtShEntry[]
    if (!Array.isArray(data) || data.length === 0) {
      return { issuer: null, totalCerts: 0, firstSeen: null, lastSeen: null, wildcardCount: 0 }
    }

    const dates = data
      .map((e) => Date.parse(e.not_before ?? ''))
      .filter((t) => Number.isFinite(t))
    const wildcardCount = data.filter((e) =>
      (e.name_value ?? '').split('\n').some((n) => n.startsWith('*.')),
    ).length

    const newest = data
      .slice()
      .sort((a, b) => Date.parse(b.not_before ?? '0') - Date.parse(a.not_before ?? '0'))[0]
    const issuer = newest?.issuer_name ? parseIssuerCN(newest.issuer_name) : null

    return {
      issuer,
      totalCerts: data.length,
      firstSeen: dates.length ? Math.min(...dates) : null,
      lastSeen: dates.length ? Math.max(...dates) : null,
      wildcardCount,
    }
  } catch {
    return null
  }
}
