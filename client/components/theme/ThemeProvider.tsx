'use client'

import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useSyncExternalStore,
	type PropsWithChildren
} from 'react'

export const THEME_STORAGE_KEY = 'safenet-theme'

export type ThemePreference = 'system' | 'light' | 'dark'
export type ResolvedTheme = 'light' | 'dark'

interface ThemeContextValue {
	theme: ThemePreference
	resolvedTheme: ResolvedTheme
	mounted: boolean
	setTheme: (theme: ThemePreference) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)
let memoryThemePreference: ThemePreference = 'system'

function isThemePreference(value: string | null): value is ThemePreference {
	return value === 'system' || value === 'light' || value === 'dark'
}

function getSystemTheme(): ResolvedTheme {
	return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function getThemePreference(): ThemePreference {
	try {
		const stored = window.localStorage.getItem(THEME_STORAGE_KEY)
		if (isThemePreference(stored)) {
			memoryThemePreference = stored
		}
		return memoryThemePreference
	} catch {
		return memoryThemePreference
	}
}

function getResolvedTheme(): ResolvedTheme {
	const theme = getThemePreference()
	return theme === 'system' ? getSystemTheme() : theme
}

function applyTheme(theme: ThemePreference): ResolvedTheme {
	const resolved = theme === 'system' ? getSystemTheme() : theme
	const root = document.documentElement

	root.classList.remove('light', 'dark')
	root.classList.add(resolved)
	root.dataset.theme = resolved
	root.dataset.themePreference = theme
	root.style.colorScheme = resolved

	return resolved
}

const listeners = new Set<() => void>()
let stopListeningToBrowser: (() => void) | null = null

function notifyThemeListeners() {
	listeners.forEach(listener => listener())
}

function listenToBrowserTheme() {
	const media = window.matchMedia('(prefers-color-scheme: dark)')
	const handleSystemThemeChange = () => {
		if (getThemePreference() === 'system') {
			applyTheme('system')
			notifyThemeListeners()
		}
	}
	const handleStorageChange = (event: StorageEvent) => {
		if (event.key === THEME_STORAGE_KEY) {
			applyTheme(getThemePreference())
			notifyThemeListeners()
		}
	}

	media.addEventListener('change', handleSystemThemeChange)
	window.addEventListener('storage', handleStorageChange)

	return () => {
		media.removeEventListener('change', handleSystemThemeChange)
		window.removeEventListener('storage', handleStorageChange)
	}
}

function subscribeToTheme(listener: () => void) {
	listeners.add(listener)
	if (listeners.size === 1) {
		stopListeningToBrowser = listenToBrowserTheme()
	}

	return () => {
		listeners.delete(listener)
		if (listeners.size === 0) {
			stopListeningToBrowser?.()
			stopListeningToBrowser = null
		}
	}
}

const subscribeToHydration = () => () => undefined
const getMountedSnapshot = () => true
const getServerMountedSnapshot = () => false
const getServerThemePreference = (): ThemePreference => 'system'
const getServerResolvedTheme = (): ResolvedTheme => 'light'

export const themeBootstrapScript = `
(() => {
  const key = '${THEME_STORAGE_KEY}';
  const root = document.documentElement;
  let preference = 'system';
  try {
    const stored = window.localStorage.getItem(key);
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      preference = stored;
    }
  } catch {}
  const resolved = preference === 'system'
    ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : preference;
  root.classList.remove('light', 'dark');
  root.classList.add(resolved);
  root.dataset.theme = resolved;
  root.dataset.themePreference = preference;
  root.style.colorScheme = resolved;
})();
`

export function ThemeProvider({ children }: PropsWithChildren) {
	const theme = useSyncExternalStore(subscribeToTheme, getThemePreference, getServerThemePreference)
	const resolvedTheme = useSyncExternalStore(
		subscribeToTheme,
		getResolvedTheme,
		getServerResolvedTheme
	)
	const mounted = useSyncExternalStore(
		subscribeToHydration,
		getMountedSnapshot,
		getServerMountedSnapshot
	)

	useEffect(() => {
		applyTheme(theme)
	}, [theme, resolvedTheme])

	const setTheme = useCallback((nextTheme: ThemePreference) => {
		memoryThemePreference = nextTheme
		try {
			window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme)
		} catch {
			// Theme selection still applies when browser storage is unavailable.
		}
		applyTheme(nextTheme)
		notifyThemeListeners()
	}, [])

	const value = useMemo(
		() => ({ theme, resolvedTheme, mounted, setTheme }),
		[theme, resolvedTheme, mounted, setTheme]
	)

	return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme(): ThemeContextValue {
	const context = useContext(ThemeContext)
	if (!context) {
		throw new Error('useTheme must be used within a ThemeProvider')
	}
	return context
}
