export enum UserRole {
	USER = 'USER',
	ADMIN = 'ADMIN',
}

export const UserRoleLabel: Record<UserRole, string> = {
	[UserRole.USER]: 'User',
	[UserRole.ADMIN]: 'Admin',
}

export interface ITokenInside {
	id: string
	rights: UserRole[]
	iat: number
	exp: number
}
export type TProtectUserData = Omit<ITokenInside, 'iat' | 'exp'> & {
	name?: string
	email?: string
}
export interface IUser {
	id: string
	name?: string
	email: string
	rights: UserRole[]
}
export interface IFormData extends Pick<IUser, 'name' | 'email'> {
	password: string
	termsAccepted?: boolean
	privacyAccepted?: boolean
	legalVersion?: string
	legalLocale?: 'en' | 'ru'
}
