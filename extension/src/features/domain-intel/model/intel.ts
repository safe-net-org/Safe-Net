import { fetchCertHistory } from './cert'
import { fetchDns } from './dns'
import { fetchGeo } from './geo'
import { fetchRdap } from './rdap'
import { checkThreatFeeds } from './threats'
import { fetchVirusTotal } from './virustotal'
import { getSettings } from '@/src/shared/lib/settings'
import type { DomainIntel } from './types'

const TTL_MS = 6 * 60 * 60 * 1000

function cacheKey(domain: string): string {
  return `intel_${domain}`
}

export function extractDomain(rawUrl: string): string | null {
  try {
    const u = new URL(rawUrl)
    return u.hostname.toLowerCase().replace(/^www\./, '')
  } catch {
    return null
  }
}

export async function getCachedIntel(domain: string): Promise<DomainIntel | null> {
  try {
    const store = await browser.storage.local.get(cacheKey(domain))
    const data = store[cacheKey(domain)] as DomainIntel | undefined
    if (!data) return null
    if (Date.now() - data.fetchedAt > TTL_MS) return null
    return data
  } catch {
    return null
  }
}

async function persistIntel(intel: DomainIntel): Promise<void> {
  try {
    await browser.storage.local.set({ [cacheKey(intel.domain)]: intel })
  } catch {
    /* storage may be full */
  }
}

export async function fetchDomainIntel(domain: string): Promise<DomainIntel> {
  const errors: string[] = []
  const settings = await getSettings()

  if (!settings.intelEnabled) {
    return {
      domain, fetchedAt: Date.now(),
      rdap: null, dns: null, geo: null, cert: null, threats: null, virusTotal: null,
      errors: ['intel-disabled'],
    }
  }

  const [rdap, dns, cert, threats, virusTotal] = await Promise.all([
    fetchRdap(domain).catch(() => { errors.push('rdap'); return null }),
    fetchDns(domain).catch(() => { errors.push('dns'); return null }),
    fetchCertHistory(domain).catch(() => { errors.push('cert'); return null }),
    checkThreatFeeds(domain).catch(() => { errors.push('threats'); return null }),
    fetchVirusTotal(domain, settings.vtApiKey).catch(() => { errors.push('virustotal'); return null }),
  ])

  let geo = null
  const firstIp = dns?.a?.[0]
  if (firstIp) {
    geo = await fetchGeo(firstIp).catch(() => { errors.push('geo'); return null })
  }

  const intel: DomainIntel = {
    domain,
    fetchedAt: Date.now(),
    rdap, dns, geo, cert, threats, virusTotal,
    errors,
  }
  await persistIntel(intel)
  return intel
}

export async function loadIntel(domain: string, force = false): Promise<DomainIntel> {
  if (!force) {
    const cached = await getCachedIntel(domain)
    if (cached) return cached
  }
  return fetchDomainIntel(domain)
}
