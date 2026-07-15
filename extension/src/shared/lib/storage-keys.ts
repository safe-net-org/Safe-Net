export const STORAGE_KEYS = {
  globalStats: 'global_stats',
  tab: (tabId: number) => `tab_${tabId}`,
  cache: (url: string) => `cache_${btoa(url).slice(0, 50)}`,
} as const
