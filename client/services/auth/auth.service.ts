import { axiosClassic } from '@/api/axios'
import { removeFromStorage, saveTokenStorage } from './auth.helper'
import { IFormData, IUser } from './auth.types'


interface IAuthResponse {
	accessToken: string
	user: IUser
}
export enum EnumTokens {
	'ACCESS_TOKEN' = 'accessToken',
	'REFRESH_TOKEN' = 'refreshToken'
}
class AuthService {
	async main(type: 'login' | 'register', data: IFormData, token?: string | null) {
		const response = await axiosClassic.post<IAuthResponse>(`/auth/${type}`, data, {
			headers: {
				recaptcha: token
			}
		})
		if (response.data.accessToken) saveTokenStorage(response.data.accessToken)
		return response
	}
	async getNewTokens() {
		const response = await axiosClassic.post<IAuthResponse>('/auth/login/access-token')
		if (response.data.accessToken) saveTokenStorage(response.data.accessToken)
		return response
	}
	async getNewTokensByRefresh(refreshToken: string) {
		const response = await axiosClassic.post<IAuthResponse>(
			'/auth/login/access-token',
			{},
			{
				headers: {
					Cookie: `refreshToken=${refreshToken}`
				}
			}
		)
		return response.data
	}
	async logout() {
		const response = await axiosClassic.post<boolean>('/auth/logout')
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
}
export default new AuthService()
