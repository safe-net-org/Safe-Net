import { ConfigService } from '@nestjs/config'

export const JWT_ISSUER = 'safe-net-api'
export const JWT_AUDIENCE = 'safe-net-web'

export const JWT_TOKEN_TYPE = {
	ACCESS: 'access',
	REFRESH: 'refresh',
} as const

export type JwtTokenType = (typeof JWT_TOKEN_TYPE)[keyof typeof JWT_TOKEN_TYPE]

export interface AuthTokenPayload {
	id: string
	type: JwtTokenType
	sessionId?: string
}

export interface JwtSecrets {
	access: string
	refresh: string
}

export function getRequiredJwtSecrets(
	configService: ConfigService
): JwtSecrets {
	const access = configService.get<string>('JWT_SECRET')?.trim()
	const refresh = configService.get<string>('JWT_REFRESH_SECRET')?.trim()

	if (!access) {
		throw new Error('JWT_SECRET is required')
	}
	if (!refresh) {
		throw new Error('JWT_REFRESH_SECRET is required')
	}
	if (access === refresh) {
		throw new Error('JWT_SECRET and JWT_REFRESH_SECRET must be different')
	}

	return { access, refresh }
}
