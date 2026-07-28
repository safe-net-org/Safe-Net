/**
 * djb2 over the full URL. The previous key was `btoa(url).slice(0, 50)`, which
 * collided for any two URLs sharing their first ~37 characters and threw on
 * raw-unicode URLs — exactly the IDN lookalikes Guard exists to catch.
 */
function hashUrl(url: string): string {
  let hash = 5381
  for (let i = 0; i < url.length; i++) {
    hash = ((hash << 5) + hash + url.charCodeAt(i)) >>> 0
  }
  return hash.toString(36)
}

export const CACHE_KEY_PREFIX = 'cache_'

export const STORAGE_KEYS = {
  globalStats: 'global_stats',
  tab: (tabId: number) => `tab_${tabId}`,
  cache: (url: string) => `${CACHE_KEY_PREFIX}${hashUrl(url)}_${url.length}`,
} as const
