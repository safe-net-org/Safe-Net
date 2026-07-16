'use client'

import {
	createContext,
	useContext,
	useEffect,
	useState,
	type PropsWithChildren,
} from 'react'
import { LOCALES, messages, type Locale, type Messages } from './messages'

const STORAGE_KEY = 'safenet-locale'
const DEFAULT_LOCALE: Locale = 'en'

interface LocaleContextValue {
	locale: Locale
	setLocale: (locale: Locale) => void
	t: Messages
}

const LocaleContext = createContext<LocaleContextValue | null>(null)

function readInitialLocale(): Locale {
	if (typeof window === 'undefined') return DEFAULT_LOCALE
	const stored = window.localStorage.getItem(STORAGE_KEY)
	if (stored && (LOCALES as string[]).includes(stored)) return stored as Locale
	// Fall back to the browser language, else English.
	const browser = window.navigator.language.slice(0, 2)
	return browser === 'ru' ? 'ru' : DEFAULT_LOCALE
}

export function LocaleProvider({ children }: PropsWithChildren) {
	// Start from the default on both server and first client render to avoid a
	// hydration mismatch; adopt the stored/browser locale after mount.
	const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE)

	useEffect(() => {
		setLocaleState(readInitialLocale())
	}, [])

	useEffect(() => {
		if (typeof document !== 'undefined') {
			document.documentElement.lang = locale
		}
	}, [locale])

	const setLocale = (next: Locale) => {
		setLocaleState(next)
		if (typeof window !== 'undefined') {
			window.localStorage.setItem(STORAGE_KEY, next)
		}
	}

	return (
		<LocaleContext.Provider value={{ locale, setLocale, t: messages[locale] }}>
			{children}
		</LocaleContext.Provider>
	)
}

/** Access the current locale, a setter, and the translated message tree `t`. */
export function useI18n(): LocaleContextValue {
	const ctx = useContext(LocaleContext)
	if (!ctx) {
		throw new Error('useI18n must be used within a LocaleProvider')
	}
	return ctx
}
