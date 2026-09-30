import { instance } from '@/api/axios'
import { IUser } from '@/services/auth/auth.types'


class UserService {
	private _BASE_URL = '/user'
	async fetchProfile() {
		return instance.get<IUser>(`${this._BASE_URL}/profile`)
	}
	async requestEmailChange(email: string, currentPassword: string) {
		return instance.post<{ message: string }>('/auth/email/change/request', { email, currentPassword })
	}
}
const userService = new UserService()
export default userService
