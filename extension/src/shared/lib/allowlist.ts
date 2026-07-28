/**
 * User-managed trusted hosts.
 *
 * A trusted host skips every check and always scores safe — the escape hatch
 * for false positives, so a user is never stuck behind the danger overlay on a
 * site they know. Keyed by exact hostname (www. stripped): trusting a lookalike
 * domain must never extend to the real one, so no eTLD+1 widening here.
 */

const TRUSTED_HOSTS_KEY = 'safenet_trusted_hosts'

export function normalizeHost(urlOrHost: string): string {
  let host = urlOrHost
  try {
    host = new URL(urlOrHost).hostname
  } catch {
    /* already a bare host */
  }
  return host.toLowerCase().replace(/^www\./, '')
}

export async function getTrustedHosts(): Promise<string[]> {
  try {
    const store = await browser.storage.local.get(TRUSTED_HOSTS_KEY)
    const hosts = store[TRUSTED_HOSTS_KEY]
    return Array.isArray(hosts) ? (hosts as string[]) : []
  } catch {
    return []
  }
}

export async function isTrusted(url: string): Promise<boolean> {
  const host = normalizeHost(url)
  if (!host) return false
  return (await getTrustedHosts()).includes(host)
}

export async function trustHost(urlOrHost: string): Promise<string[]> {
  const host = normalizeHost(urlOrHost)
  const hosts = await getTrustedHosts()
  if (host && !hosts.includes(host)) hosts.push(host)
  await browser.storage.local.set({ [TRUSTED_HOSTS_KEY]: hosts })
  return hosts
}

export async function untrustHost(host: string): Promise<string[]> {
  const hosts = (await getTrustedHosts()).filter((h) => h !== host)
  await browser.storage.local.set({ [TRUSTED_HOSTS_KEY]: hosts })
  return hosts
}
