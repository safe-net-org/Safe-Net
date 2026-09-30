import { axiosClassic } from '@/api/axios'
import { removeFromStorage } from '@/services/auth/auth.helper'
import { IFormData, IUser } from '@/services/auth/auth.types'


interface IAuthResponse {
	user: IUser
}
class AuthService {
	async main(type: 'login' | 'register', data: IFormData, token?: string | null) {
		const response = await axiosClassic.post<IAuthResponse>(`/auth/${type}`, data, {
			headers: {
				recaptcha: token
			}
		})
		return response
	}
	async getNewTokens() {
		const response = await axiosClassic.post<IAuthResponse>(
			'/auth/login/access-token',
			undefined,
			{ timeout: 30_000 }
		)
		return response
	}
	async logout() {
		const response = await axiosClassic.post<{ message: string }>('/auth/logout')
		if (response.data) removeFromStorage()
		return response
	}
	async forgotPassword(email: string) {
		const response = await axiosClassic.post<{ message: string }>(
			'/auth/password/forgot',
			{ email }
		)
		return response.data
	}
	async resetPassword(token: string, password: string) {
		const response = await axiosClassic.post<{ message: string }>(
			'/auth/password/reset',
			{ token, password }
		)
		return response.data
	}
	async verifyEmail(token: string) {
		const response = await axiosClassic.post<{ message: string }>('/auth/email/verify', { token })
		return response.data
	}
	async resendVerification(email: string) {
		const response = await axiosClassic.post<{ message: string }>('/auth/email/resend', { email })
		return response.data
	}
	async confirmEmailChange(token: string) {
		const response = await axiosClassic.post<{ message: string }>('/auth/email/change/confirm', { token })
		return response.data
	}
}
const authService = new AuthService()

export default authService
