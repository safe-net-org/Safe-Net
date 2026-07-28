import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { getBrowserLocale, getSettings, saveSettings } from '@/src/shared/lib/settings'
import {
  translate,
  type ExtensionLocale,
  type ExtensionMessageKey,
} from './messages'

interface ExtensionI18n {
  locale: ExtensionLocale
  setLocale: (locale: ExtensionLocale) => Promise<void>
  t: (key: ExtensionMessageKey, values?: Record<string, string | number>) => string
}

const ExtensionI18nContext = createContext<ExtensionI18n | null>(null)

export function ExtensionLocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<ExtensionLocale>(getBrowserLocale)

  useEffect(() => {
    let active = true
    getSettings().then((settings) => {
      if (active) setLocaleState(settings.locale)
    }).catch(() => {})
    return () => { active = false }
  }, [])

  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  const setLocale = useCallback(async (next: ExtensionLocale) => {
    setLocaleState(next)
    await saveSettings({ locale: next })
  }, [])

  const value = useMemo<ExtensionI18n>(() => ({
    locale,
    setLocale,
    t: (key, values) => translate(locale, key, values),
  }), [locale, setLocale])

  return (
    <ExtensionI18nContext.Provider value={value}>
      {children}
    </ExtensionI18nContext.Provider>
  )
}

export function useExtensionI18n(): ExtensionI18n {
  const value = useContext(ExtensionI18nContext)
  if (!value) throw new Error('useExtensionI18n must be used inside ExtensionLocaleProvider')
  return value
}
