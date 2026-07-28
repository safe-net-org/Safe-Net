/** User settings persisted in extension-local storage. */

export interface Settings {
  /** Interface and warning language. */
  locale: 'en' | 'ru'
  /** VirusTotal API key (v3). Empty = VT lookups disabled. */
  vtApiKey: string
  /** Live domain intelligence (RDAP, DNS, CT, URLhaus, VirusTotal). */
  intelEnabled: boolean
  /** Optional URL-classifier request. Independent from threat intelligence. */
  mlEnabled: boolean
  /** Optional ML endpoint override. Empty = the local development endpoint. */
  mlServiceUrl: string
}

export const DEFAULT_SETTINGS: Settings = {
  locale: 'en',
  vtApiKey: '',
  intelEnabled: false,
  mlEnabled: false,
  mlServiceUrl: '',
}

const SETTINGS_KEY = 'safenet_settings'

/**
 * Normalizes both current and pre-mlEnabled settings.
 *
 * Older releases used `intelEnabled` as the ML gate too. When a saved legacy
 * preference exists, mirroring that explicit value preserves the user's
 * previous behaviour. No saved object means a fresh install and therefore
 * keeps both optional network layers off.
 */
export function normalizeSettings(
  saved?: Partial<Settings> | null,
  fallbackLocale: Settings['locale'] = DEFAULT_SETTINGS.locale,
): Settings {
  const intelEnabled = typeof saved?.intelEnabled === 'boolean'
    ? saved.intelEnabled
    : DEFAULT_SETTINGS.intelEnabled
  const mlEnabled = typeof saved?.mlEnabled === 'boolean'
    ? saved.mlEnabled
    : saved && typeof saved.intelEnabled === 'boolean'
      ? saved.intelEnabled
      : DEFAULT_SETTINGS.mlEnabled

  return {
    locale: saved?.locale === 'ru' || saved?.locale === 'en' ? saved.locale : fallbackLocale,
    vtApiKey: typeof saved?.vtApiKey === 'string' ? saved.vtApiKey.trim() : '',
    intelEnabled,
    mlEnabled,
    mlServiceUrl: typeof saved?.mlServiceUrl === 'string' ? saved.mlServiceUrl.trim() : '',
  }
}

export function getBrowserLocale(): Settings['locale'] {
  try {
    return browser.i18n?.getUILanguage?.().toLowerCase().startsWith('ru') ? 'ru' : 'en'
  } catch {
    return DEFAULT_SETTINGS.locale
  }
}

export async function getSettings(): Promise<Settings> {
  try {
    const store = await browser.storage.local.get(SETTINGS_KEY)
    const saved = store[SETTINGS_KEY] as Partial<Settings> | undefined
    const normalized = normalizeSettings(saved, getBrowserLocale())

    // Persist the one-time legacy split, but never make a read fail because a
    // best-effort migration write was unavailable.
    if (
      saved
      && (typeof saved.mlEnabled !== 'boolean' || (saved.locale !== 'en' && saved.locale !== 'ru'))
    ) {
      try {
        await browser.storage.local.set({ [SETTINGS_KEY]: normalized })
      } catch { /* keep the normalized in-memory value */ }
    }
    return normalized
  } catch {
    return { ...DEFAULT_SETTINGS, locale: getBrowserLocale() }
  }
}

export async function saveSettings(patch: Partial<Settings>): Promise<Settings> {
  const current = await getSettings()
  const next = normalizeSettings({ ...current, ...patch })
  await browser.storage.local.set({ [SETTINGS_KEY]: next })
  return next
}
