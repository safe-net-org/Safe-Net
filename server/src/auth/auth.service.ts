import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { UserStatus } from '@prisma/client'
import { verify } from 'argon2'
import { randomUUID } from 'crypto'
import { Response } from 'express'
import { AchievementsService } from 'src/learning/services/achievements.service'
import { PrismaService } from 'src/prisma.service'
import { UserService } from 'src/user/services/user.service'
import { AuthLoginDto, AuthRegisterDto } from './dto/auth.dto'
import { EmailVerificationService } from './email-verification.service'
import {
	AuthTokenPayload,
	getRequiredJwtSecrets,
	JWT_AUDIENCE,
	JWT_ISSUER,
	JWT_TOKEN_TYPE,
	JwtSecrets,
} from './jwt.constants'

@Injectable()
export class AuthService {
	/** Must match the refresh token's own expiry, or the cookie dies while the
	 * token is still valid (or worse, outlives it). */
	EXPIRE_DAY_REFRESH_TOKEN = 7
	REFRESH_TOKEN_NAME = 'refresh_token'
	private readonly ACCESS_TOKEN_EXPIRY = '1h'
	private readonly REFRESH_TOKEN_EXPIRY = '7d'
	private readonly jwtSecrets: JwtSecrets

	constructor(
		private readonly jwt: JwtService,
		private readonly userService: UserService,
		private readonly achievementsService: AchievementsService,
		private readonly prisma: PrismaService,
		private readonly emailVerificationService: EmailVerificationService,
		configService: ConfigService
	) {
		this.jwtSecrets = getRequiredJwtSecrets(configService)
	}

	async login(dto: AuthLoginDto) {
		const { password, ...user } = await this.validateUser(dto)
		const tokens = await this.issueInitialTokens(user.id, user.authVersion)
		return {
			user,
			...tokens,
		}
	}

	async createVerifiedSession(userId: string, expectedAuthVersion: number) {
		const user = await this.userService.getById(userId)
		if (!user || user.status === UserStatus.BLOCKED || !user.emailVerifiedAt || user.authVersion !== expectedAuthVersion) {
			throw new UnauthorizedException('Unable to create a session')
		}
		const { password: _password, ...safeUser } = user
		return { user: safeUser, ...(await this.issueInitialTokens(user.id, user.authVersion)) }
	}
	async register(dto: AuthRegisterDto) {
		try {
			const { password, ...user } = await this.userService.create(dto)
			await this.emailVerificationService.sendForUser(user)
			await this.achievementsService.awardAchievement(user.id, 'FIRST_LOGIN')
			return { message: 'Check your email to verify your account before signing in.' }
		} catch (error) {
			// The database unique constraint, rather than a check-then-insert, is
			// the authority under concurrent registrations.
			if (
				typeof error === 'object' &&
				error !== null &&
				'code' in error &&
				(error as { code?: unknown }).code === 'P2002'
			) {
				throw new ConflictException('A user with this email already exists')
			}
			throw error
		}
	}
	// `newPassword` was removed: it changed any account's password given only an
	// email address — no reset token, no authentication. It was unreachable
	// (never wired to a controller), but a single import away from being a
	// full account-takeover endpoint. A real reset flow needs a single-use,
	// expiring token delivered out of band before this comes back.

	private buildTokens(userId: string, sessionId: string, authVersion: number) {
		const accessPayload: AuthTokenPayload = {
			id: userId,
			type: JWT_TOKEN_TYPE.ACCESS,
			authVersion,
		}
		const refreshPayload: AuthTokenPayload = {
			id: userId,
			type: JWT_TOKEN_TYPE.REFRESH,
			sessionId,
			authVersion,
		}
		const accessToken = this.jwt.sign(accessPayload, {
			secret: this.jwtSecrets.access,
			expiresIn: this.ACCESS_TOKEN_EXPIRY,
			issuer: JWT_ISSUER,
			audience: JWT_AUDIENCE,
			algorithm: 'HS256',
		})
		const refreshToken = this.jwt.sign(refreshPayload, {
			secret: this.jwtSecrets.refresh,
			expiresIn: this.REFRESH_TOKEN_EXPIRY,
			issuer: JWT_ISSUER,
			audience: JWT_AUDIENCE,
			algorithm: 'HS256',
		})
		return {
			accessToken,
			refreshToken,
		}
	}

	private getRefreshExpiry() {
		return new Date(Date.now() + this.EXPIRE_DAY_REFRESH_TOKEN * 24 * 60 * 60 * 1000)
	}

	private async issueInitialTokens(userId: string, authVersion: number) {
		const session = await this.prisma.refreshSession.create({
			data: {
				id: randomUUID(),
				userId,
				familyId: randomUUID(),
				expiresAt: this.getRefreshExpiry(),
			},
		})

		return this.buildTokens(userId, session.id, authVersion)
	}
	private async validateUser(dto: AuthLoginDto) {
		const user = await this.userService.getByEmail(dto.email)
		if (!user?.password) {
			throw new UnauthorizedException('Invalid email or password')
		}

		const isValid = await verify(user.password, dto.password).catch(() => false)
		if (!isValid || user.status === UserStatus.BLOCKED) {
			throw new UnauthorizedException('Invalid email or password')
		}
		if (!user.emailVerifiedAt) {
			throw new UnauthorizedException('Verify your email before signing in')
		}

		return user
	}
	addRefreshTokenToResponse(res: Response, refreshToken: string) {
		const expiresIn = new Date()
		expiresIn.setDate(expiresIn.getDate() + this.EXPIRE_DAY_REFRESH_TOKEN)

		res.cookie(this.REFRESH_TOKEN_NAME, refreshToken, {
			httpOnly: true,
			expires: expiresIn,
			...this.getCookieSecurityOptions(),
		})
	}
	addAccessTokenToResponse(res: Response, accessToken: string) {
		res.cookie('access_token', accessToken, {
			httpOnly: true,
			expires: new Date(Date.now() + 60 * 60 * 1000),
			...this.getCookieSecurityOptions(),
		})
	}

	/**
	 * `secure` was hardcoded to false, which shipped the refresh token over
	 * plain HTTP in production. Driven by NODE_ENV instead, so local dev still
	 * works without HTTPS.
	 */
	private getCookieSecurityOptions() {
		const isProduction = process.env.NODE_ENV === 'production'
		return {
			secure: isProduction,
			sameSite: isProduction ? ('none' as const) : ('lax' as const),
		}
	}

	async getNewTokens(refreshToken: string) {
		let result: AuthTokenPayload
		try {
			result = await this.jwt.verifyAsync<AuthTokenPayload>(refreshToken, {
				secret: this.jwtSecrets.refresh,
				issuer: JWT_ISSUER,
				audience: JWT_AUDIENCE,
				algorithms: ['HS256'],
			})
		} catch {
			throw new UnauthorizedException('Invalid refresh token')
		}

		if (
			!result ||
			result.type !== JWT_TOKEN_TYPE.REFRESH ||
			typeof result.id !== 'string' ||
			!result.id ||
			typeof result.sessionId !== 'string' ||
			!result.sessionId
		) {
			throw new UnauthorizedException('Invalid refresh token')
		}

		const now = new Date()
		const session = await this.prisma.refreshSession.findUnique({
			where: { id: result.sessionId },
		})
		if (
			!session ||
			session.userId !== result.id ||
			session.expiresAt <= now ||
			session.revokedAt ||
			session.usedAt
		) {
			if (session) {
				await this.revokeRefreshFamily(session.familyId, now)
			}
			throw new UnauthorizedException('Invalid refresh token')
		}

		const storedUser = await this.userService.getById(result.id)
		if (!storedUser || storedUser.status === UserStatus.BLOCKED || !storedUser.emailVerifiedAt ||
			result.authVersion !== storedUser.authVersion) {
			await this.revokeRefreshFamily(session.familyId, now)
			throw new UnauthorizedException('Invalid refresh token')
		}

		const nextSessionId = randomUUID()
		const rotated = await this.prisma.$transaction(async tx => {
			const consumed = await tx.refreshSession.updateMany({
				where: {
					id: session.id,
					usedAt: null,
					revokedAt: null,
					expiresAt: { gt: now },
				},
				data: { usedAt: now },
			})
			if (consumed.count !== 1) {
				await tx.refreshSession.updateMany({
					where: { familyId: session.familyId, revokedAt: null },
					data: { revokedAt: now },
				})
				return false
			}

			await tx.refreshSession.create({
				data: {
					id: nextSessionId,
					userId: result.id,
					familyId: session.familyId,
					expiresAt: this.getRefreshExpiry(),
				},
			})
			return true
		})
		if (!rotated) {
			throw new UnauthorizedException('Invalid refresh token')
		}

		const { password: _password, ...user } = storedUser
		const tokens = this.buildTokens(user.id, nextSessionId, storedUser.authVersion)
		return {
			user,
			...tokens,
		}
	}

	private async revokeRefreshFamily(familyId: string, revokedAt = new Date()) {
		await this.prisma.refreshSession.updateMany({
			where: { familyId, revokedAt: null },
			data: { revokedAt },
		})
	}

	async revokeRefreshToken(refreshToken?: string) {
		if (!refreshToken) return

		let payload: AuthTokenPayload
		try {
			payload = await this.jwt.verifyAsync<AuthTokenPayload>(refreshToken, {
				secret: this.jwtSecrets.refresh,
				issuer: JWT_ISSUER,
				audience: JWT_AUDIENCE,
				algorithms: ['HS256'],
			})
		} catch {
			// Logout is intentionally idempotent. An invalid/expired cookie is
			// still removed by the controller without exposing token details.
			return
		}
		if (payload.type !== JWT_TOKEN_TYPE.REFRESH ||
			typeof payload.sessionId !== 'string' || typeof payload.id !== 'string' ||
			typeof payload.authVersion !== 'number' || !Number.isSafeInteger(payload.authVersion) || payload.authVersion < 0) return
		const now = new Date()
		await this.prisma.$transaction(async tx => {
			const session = await tx.refreshSession.findUnique({ where: { id: payload.sessionId } })
			if (!session || session.userId !== payload.id || session.expiresAt <= now || session.revokedAt) return
			// A simultaneous refresh can consume the cookie before logout reaches
			// the server. Its persisted session still proves the current account
			// generation; an older generation cannot revoke a later login.
			const invalidated = await tx.user.updateMany({
				where: { id: payload.id, authVersion: payload.authVersion },
				data: { authVersion: { increment: 1 } },
			})
			if (invalidated.count !== 1) return
			// Logout is global: invalidate every access token by version and
			// every refresh token by revoking all active sessions.
			await tx.refreshSession.updateMany({
				where: { userId: payload.id, revokedAt: null }, data: { revokedAt: now },
			})
		})
	}
	removeRefreshTokenFromResponse(res: Response) {
		res.cookie(this.REFRESH_TOKEN_NAME, '', {
			httpOnly: true,
			expires: new Date(0),
			...this.getCookieSecurityOptions(),
		})
	}
	removeAccessTokenFromResponse(res: Response) {
		res.cookie('access_token', '', {
			httpOnly: true,
			expires: new Date(0),
			...this.getCookieSecurityOptions(),
		})
	}
}
