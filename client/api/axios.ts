import { API_URL } from '@/constants/constants'
import { getAccessToken, removeFromStorage } from '@/services/auth/auth.helper'
import authService from '@/services/auth/auth.service'
import { LOCALE_COOKIE } from '@/i18n/messages'
import axios, { CreateAxiosDefaults } from 'axios'
import { errorCatch, getContentType } from './api.helper'

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
instance.interceptors.request.use((config) => {
	const accessToken = getAccessToken()
	if (config?.headers && accessToken) config.headers.Authorization = `Bearer ${accessToken}`
	const locale = getCurrentLocaleCookie()
	if (config?.headers && locale) config.headers['Accept-Language'] = locale
	return config
})
instance.interceptors.response.use(
	(config) => config,
	async (error) => {
		const originalRequest = error.config
		if (
			(error?.response?.status === 401 ||
				errorCatch(error) === 'jwt expired' ||
				errorCatch(error) === 'jwt must be provided') &&
			error.config &&
			!error.config._isRetry
		) {
			originalRequest._isRetry = true
			try {
				await authService.getNewTokens()
				return instance.request(originalRequest)
			} catch (error) {
				if (errorCatch(error) === 'jwt expired' || errorCatch(error) === 'Refresh token not passed')
					removeFromStorage()
			}
		}
		throw error
	}
)
