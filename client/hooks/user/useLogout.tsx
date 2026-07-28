'use client'

import { toast } from 'sonner'

import { useI18n } from '@/i18n/LocaleProvider'
import authService from '@/services/auth/auth.service'

export function useLogout() {
	const { t } = useI18n()

	const logout = async (redirectTo?: string) => {
		try {
			await authService.logout()
			toast.success(t.nav.logoutSuccess)

			if (redirectTo) {
				// Full page reload on redirect
				window.location.href = redirectTo
			} else {
				// If no redirect is specified, just refresh the current page
				window.location.reload()
			}
		} catch (error) {
			toast.error(t.nav.logoutError)
			console.error('Logout error:', error)
		}
	}

	return { logout }
}
