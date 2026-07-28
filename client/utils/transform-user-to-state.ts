import { IUser, UserRole } from '@/services/auth/auth.types'


export type TUserDataState = {
	id: string
	name?: string
	email?: string
	rights: UserRole[]
	isLoggedIn: boolean
	isAdmin: boolean
}
function isUser(value: unknown): value is IUser {
	if (!value || typeof value !== 'object') return false
	const candidate = value as Partial<IUser>
	return (
		typeof candidate.id === 'string' &&
		typeof candidate.email === 'string' &&
		Array.isArray(candidate.rights)
	)
}

export const transformUserToState = (value: unknown): TUserDataState | null => {
	const nested =
		value && typeof value === 'object' && 'user' in value
			? (value as { user?: unknown }).user
			: value
	if (!isUser(nested)) {
		return null
	}
	const result = {
		id: nested.id,
		name: nested.name,
		email: nested.email,
		rights: nested.rights,
		isLoggedIn: true,
		isAdmin: nested.rights.includes(UserRole.ADMIN)
	}
	return result
}
