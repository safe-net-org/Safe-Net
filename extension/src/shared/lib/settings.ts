/**
 * User settings persisted in extension storage.
 *
 * The VirusTotal API key is optional — the extension is fully functional
 * without it (local heuristics + free DoH/CT/URLhaus feeds). When a key is
 * present, live VirusTotal reputation is layered on top.
 */

export interface Settings {
  /** VirusTotal API key (v3). Empty = VT lookups disabled. */
  vtApiKey: string
  /** Master switch for live threat-intel lookups (VT, URLhaus, DoH, CT). */
  intelEnabled: boolean
  /** Optional ML service URL override. Empty = default localhost:8000. */
  mlServiceUrl: string
}

export const DEFAULT_SETTINGS: Settings = {
  vtApiKey: '',
  intelEnabled: true,
  mlServiceUrl: '',
}

const SETTINGS_KEY = 'safenet_settings'

export async function getSettings(): Promise<Settings> {
  try {
    const store = await browser.storage.local.get(SETTINGS_KEY)
    const saved = store[SETTINGS_KEY] as Partial<Settings> | undefined
    return { ...DEFAULT_SETTINGS, ...(saved ?? {}) }
  } catch {
    return { ...DEFAULT_SETTINGS }
  }
}

export async function saveSettings(patch: Partial<Settings>): Promise<Settings> {
  const current = await getSettings()
  const next: Settings = { ...current, ...patch }
  // Never persist a key with surrounding whitespace.
  next.vtApiKey = next.vtApiKey.trim()
  next.mlServiceUrl = next.mlServiceUrl.trim()
  await browser.storage.local.set({ [SETTINGS_KEY]: next })
  return next
}
