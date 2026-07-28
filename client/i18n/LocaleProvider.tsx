'use client'

import {
	createContext,
	useContext,
	useEffect,
	useState,
	type PropsWithChildren,
} from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { LOCALE_COOKIE, messages, type Locale, type Messages } from './messages'

const STORAGE_KEY = 'safenet-locale'
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365

interface LocaleContextValue {
	locale: Locale
	setLocale: (locale: Locale) => void
	t: Messages
}

const LocaleContext = createContext<LocaleContextValue | null>(null)

function writeCookie(locale: Locale) {
	document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=${COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`
}

interface LocaleProviderProps extends PropsWithChildren {
	/** Locale the server already decided (from the cookie or Accept-Language) — used as-is, no client override needed. */
	initialLocale: Locale
}

export function LocaleProvider({ children, initialLocale }: LocaleProviderProps) {
	// The server already resolved the correct locale (cookie or Accept-Language),
	// so the client can render it directly on first paint — no flash, no swap.
	const [locale, setLocaleState] = useState<Locale>(initialLocale)
	const queryClient = useQueryClient()
	const router = useRouter()

	useEffect(() => {
		document.documentElement.lang = locale
	}, [locale])

	const setLocale = (next: Locale) => {
		const changed = next !== locale
		setLocaleState(next)
		window.localStorage.setItem(STORAGE_KEY, next)
		writeCookie(next)
		if (changed) {
			// Server-rendered content (course/lesson/test text) is fetched in
			// whatever language the request's Accept-Language header said at the
			// time — refetch everything so switching languages updates it
			// immediately instead of only on the next full page load.
			queryClient.invalidateQueries()
			// Legal pages and other server components read the locale cookie on
			// the server. Refresh after the synchronous cookie write so they
			// change language in the same interaction as client components.
			router.refresh()
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
