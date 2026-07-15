import type { GeoInfo } from './types'

const TIMEOUT_MS = 5000

interface IpApiResponse {
  ip?: string
  country_name?: string
  country_code?: string
  city?: string
  org?: string
  asn?: string
  error?: boolean
  reason?: string
}

export async function fetchGeo(ip: string): Promise<GeoInfo | null> {
  if (!ip) return null
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
    const res = await fetch(`https://ipapi.co/${encodeURIComponent(ip)}/json/`, {
      signal: controller.signal,
    })
    clearTimeout(timer)
    if (!res.ok) return null
    const data = (await res.json()) as IpApiResponse
    if (data.error) return null
    return {
      ip,
      country: data.country_name ?? null,
      countryCode: data.country_code ?? null,
      city: data.city ?? null,
      org: data.org ?? null,
      asn: data.asn ?? null,
    }
  } catch {
    return null
  }
}

export function flagEmoji(countryCode: string | null): string {
  if (!countryCode || countryCode.length !== 2) return '🌐'
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map((c) => 0x1f1e6 + c.charCodeAt(0) - 65)
  return String.fromCodePoint(...codePoints)
}
