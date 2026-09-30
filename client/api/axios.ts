import { API_URL } from '@/constants/constants'
import { removeFromStorage } from '@/services/auth/auth.helper'
import authService from '@/services/auth/auth.service'
import { LOCALE_COOKIE } from '@/i18n/messages'
import axios, { CreateAxiosDefaults } from 'axios'
import { errorCatch, getContentType } from '@/api/api.helper'

const axiosOptions: CreateAxiosDefaults = {
	baseURL: API_URL,
	headers: getContentType(),
	withCredentials: true
}

/** Read straight from `document.cookie` rather than the React context — this
 *  interceptor runs outside any component tree, wherever an api call happens. */
function getCurrentLocaleCookie(): string | undefined {
	if (typeof document === 'undefined') return undefined
	const match = document.cookie.match(new RegExp(`(?:^|; )${LOCALE_COOKIE}=([^;]+)`))
	return match?.[1]
}

export const axiosClassic = axios.create(axiosOptions)
export const instance = axios.create(axiosOptions)
const AUTH_GENERATION_KEY = 'safenet-auth-generation'
const REFRESH_LOCK_DB = 'safenet-auth-coordination'
const REFRESH_LOCK_STORE = 'locks'
const REFRESH_LOCK_NAME = 'refresh'
const REFRESH_LOCK_LEASE_MS = 45_000
let refreshInFlight: Promise<void> | null = null
let refreshLockDb: Promise<IDBDatabase> | null = null

interface RefreshLockRecord {
	name: string
	owner: string
	expiresAt: number
}

function authGeneration(): string | null {
	try { return window.localStorage.getItem(AUTH_GENERATION_KEY) } catch { return null }
}

async function refreshOnce(requestGeneration: string | null): Promise<void> {
	if (refreshInFlight) return refreshInFlight
	refreshInFlight = (async () => {
		const refresh = async () => {
			// Another tab may have rotated the cookie while this request was in flight.
			if (authGeneration() !== requestGeneration) return
			await authService.getNewTokens()
			try { window.localStorage.setItem(AUTH_GENERATION_KEY, crypto.randomUUID()) } catch { /* storage unavailable */ }
		}
		if (typeof navigator !== 'undefined' && navigator.locks) {
			await navigator.locks.request('safenet-auth-refresh', refresh)
		} else {
			await withIndexedDbRefreshLock(requestGeneration, refresh)
		}
	})().finally(() => { refreshInFlight = null })
	return refreshInFlight
}

function openRefreshLockDb(): Promise<IDBDatabase> {
	if (refreshLockDb) return refreshLockDb
	refreshLockDb = new Promise((resolve, reject) => {
		if (typeof indexedDB === 'undefined') {
			reject(new Error('Cross-tab refresh coordination is unavailable'))
			return
		}
		const request = indexedDB.open(REFRESH_LOCK_DB, 1)
		request.onupgradeneeded = () => {
			const db = request.result
			if (!db.objectStoreNames.contains(REFRESH_LOCK_STORE)) {
				db.createObjectStore(REFRESH_LOCK_STORE, { keyPath: 'name' })
			}
		}
		request.onsuccess = () => resolve(request.result)
		request.onerror = () => reject(request.error ?? new Error('Unable to open refresh coordination store'))
		request.onblocked = () => reject(new Error('Refresh coordination store is blocked'))
	})
	refreshLockDb.catch(() => { refreshLockDb = null })
	return refreshLockDb
}

async function withIndexedDbRefreshLock(
	requestGeneration: string | null,
	refresh: () => Promise<void>
): Promise<void> {
	const db = await openRefreshLockDb()
	const owner = crypto.randomUUID()
	const deadline = Date.now() + 60_000
	while (Date.now() < deadline) {
		if (authGeneration() !== requestGeneration) return
		if (await acquireRefreshLock(db, owner)) {
			try {
				if (authGeneration() === requestGeneration) await refresh()
			} finally {
				await releaseRefreshLock(db, owner)
			}
			return
		}
		await new Promise(resolve => setTimeout(resolve, 60 + Math.floor(Math.random() * 90)))
	}
	throw new Error('Timed out waiting for another tab to refresh the session')
}

function acquireRefreshLock(db: IDBDatabase, owner: string): Promise<boolean> {
	return new Promise((resolve, reject) => {
		const transaction = db.transaction(REFRESH_LOCK_STORE, 'readwrite')
		const store = transaction.objectStore(REFRESH_LOCK_STORE)
		let acquired = false
		const request = store.get(REFRESH_LOCK_NAME)
		request.onsuccess = () => {
			const current = request.result as RefreshLockRecord | undefined
			if (!current || current.expiresAt <= Date.now()) {
				const record: RefreshLockRecord = {
					name: REFRESH_LOCK_NAME,
					owner,
					expiresAt: Date.now() + REFRESH_LOCK_LEASE_MS,
				}
				store.put(record)
				acquired = true
			}
		}
		transaction.oncomplete = () => resolve(acquired)
		transaction.onerror = () => reject(transaction.error ?? new Error('Unable to acquire refresh lock'))
		transaction.onabort = () => reject(transaction.error ?? new Error('Refresh lock transaction aborted'))
	})
}

function releaseRefreshLock(db: IDBDatabase, owner: string): Promise<void> {
	return new Promise((resolve, reject) => {
		const transaction = db.transaction(REFRESH_LOCK_STORE, 'readwrite')
		const store = transaction.objectStore(REFRESH_LOCK_STORE)
		const request = store.get(REFRESH_LOCK_NAME)
		request.onsuccess = () => {
			const current = request.result as RefreshLockRecord | undefined
			if (current?.owner === owner) store.delete(REFRESH_LOCK_NAME)
		}
		transaction.oncomplete = () => resolve()
		transaction.onerror = () => reject(transaction.error ?? new Error('Unable to release refresh lock'))
		transaction.onabort = () => reject(transaction.error ?? new Error('Refresh lock release aborted'))
	})
}

instance.interceptors.request.use((config) => {
	const locale = getCurrentLocaleCookie()
	if (config?.headers && locale) config.headers['Accept-Language'] = locale
	if (!(config as typeof config & { _isRetry?: boolean })._isRetry) {
		(config as typeof config & { _authGeneration?: string | null })._authGeneration = authGeneration()
	}
	return config
})
instance.interceptors.response.use(
	(config) => config,
	async (error) => {
		const originalRequest = error.config as typeof error.config & { _isRetry?: boolean; _authGeneration?: string | null }
		if (
			(error?.response?.status === 401 ||
				errorCatch(error) === 'jwt expired' ||
				errorCatch(error) === 'jwt must be provided') &&
			originalRequest &&
			!originalRequest._isRetry
		) {
			originalRequest._isRetry = true
			try {
				await refreshOnce(originalRequest._authGeneration ?? null)
				return instance.request(originalRequest)
			} catch (error) {
				if (
					(axios.isAxiosError(error) && error.response?.status === 401) ||
					errorCatch(error) === 'jwt expired' ||
					errorCatch(error) === 'Refresh token not passed'
				)
					removeFromStorage()
			}
		}
		throw error
	}
)
