import { UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { UserStatus } from '@prisma/client'
import { hash } from 'argon2'
import { AchievementsService } from 'src/learning/services/achievements.service'
import { PrismaService } from 'src/prisma.service'
import { UserService } from 'src/user/services/user.service'
import { AuthService } from './auth.service'
import {
	AuthTokenPayload,
	JWT_AUDIENCE,
	JWT_ISSUER,
	JWT_TOKEN_TYPE,
} from './jwt.constants'

const ACCESS_SECRET = 'test-access-secret'
const REFRESH_SECRET = 'test-refresh-secret'

describe('AuthService token and credential hardening', () => {
	const jwt = new JwtService()

	function createService(userOverrides: Record<string, unknown> = {}) {
		type Session = {
			id: string
			userId: string
			familyId: string
			expiresAt: Date
			usedAt: Date | null
			revokedAt: Date | null
		}
		const sessions = new Map<string, Session>()
		const refreshSession = {
			create: jest.fn(async ({ data }: { data: Omit<Session, 'usedAt' | 'revokedAt'> }) => {
				const session = { ...data, usedAt: null, revokedAt: null }
				sessions.set(session.id, session)
				return session
			}),
			findUnique: jest.fn(
				async ({ where }: { where: { id: string } }) =>
					sessions.get(where.id) ?? null
			),
			updateMany: jest.fn(
				async ({
					where,
					data,
				}: {
					where: {
						id?: string
						familyId?: string
						usedAt?: null
						revokedAt?: null
						expiresAt?: { gt: Date }
					}
					data: Partial<Session>
				}) => {
					let count = 0
					for (const session of sessions.values()) {
						const matches =
							(where.id === undefined || session.id === where.id) &&
							(where.familyId === undefined ||
								session.familyId === where.familyId) &&
							(where.usedAt === undefined || session.usedAt === where.usedAt) &&
							(where.revokedAt === undefined ||
								session.revokedAt === where.revokedAt) &&
							(where.expiresAt === undefined ||
								session.expiresAt > where.expiresAt.gt)
						if (matches) {
							Object.assign(session, data)
							count += 1
						}
					}
					return { count }
				}
			),
		}
		const prisma = {
			refreshSession,
			$transaction: jest.fn(
				async (callback: (transaction: { refreshSession: typeof refreshSession }) => unknown) =>
					callback({ refreshSession })
			),
		}
		const userService = {
			getByEmail: jest.fn(),
			getById: jest.fn(),
			create: jest.fn(),
			...userOverrides,
		}
		const achievementsService = { awardAchievement: jest.fn() }
		const service = new AuthService(
			jwt,
			userService as unknown as UserService,
			achievementsService as unknown as AchievementsService,
			prisma as unknown as PrismaService,
			new ConfigService({
				JWT_SECRET: ACCESS_SECRET,
				JWT_REFRESH_SECRET: REFRESH_SECRET,
			})
		)
		return { service, userService, achievementsService, prisma, sessions }
	}

	function userFixture(
		password: string | null,
		status: UserStatus = UserStatus.ACTIVE
	) {
		return {
			id: 'user-1',
			email: 'user@example.com',
			name: 'User',
			password,
			rights: [],
			status,
		}
	}

	it('issues separately signed, typed access and refresh tokens', async () => {
		const passwordHash = await hash('123456')
		const { service, userService } = createService()
		userService.getByEmail.mockResolvedValue(userFixture(passwordHash))

		const result = await service.login({
			email: 'user@example.com',
			password: '123456',
		})

		expect(
			jwt.verify(result.accessToken, {
				secret: ACCESS_SECRET,
				issuer: JWT_ISSUER,
				audience: JWT_AUDIENCE,
			})
		).toMatchObject({ id: 'user-1', type: JWT_TOKEN_TYPE.ACCESS })
		expect(
			jwt.verify(result.refreshToken, {
				secret: REFRESH_SECRET,
				issuer: JWT_ISSUER,
				audience: JWT_AUDIENCE,
			})
		).toMatchObject({
			id: 'user-1',
			type: JWT_TOKEN_TYPE.REFRESH,
			sessionId: expect.any(String),
		})
		expect(() =>
			jwt.verify(result.accessToken, { secret: REFRESH_SECRET })
		).toThrow()
		expect(() =>
			jwt.verify(result.refreshToken, { secret: ACCESS_SECRET })
		).toThrow()
	})

	it.each([
		['missing user', null, '123456'],
		['wrong password', userFixture('placeholder'), 'wrong12'],
		['blocked user', userFixture('placeholder', UserStatus.BLOCKED), '123456'],
	])(
		'uses the generic invalid-credentials error for a %s',
		async (_label, storedUser, suppliedPassword) => {
			if (storedUser?.password === 'placeholder') {
				storedUser.password = await hash('123456')
			}
			const { service, userService } = createService()
			userService.getByEmail.mockResolvedValue(storedUser)

			await expect(
				service.login({
					email: 'user@example.com',
					password: suppliedPassword,
				})
			).rejects.toMatchObject({
				message: 'Invalid email or password',
			})
		}
	)

	it('rejects an access-type JWT even when signed with the refresh secret', async () => {
		const { service } = createService()
		const wrongTypeToken = jwt.sign(
			{ id: 'user-1', type: JWT_TOKEN_TYPE.ACCESS },
			{
				secret: REFRESH_SECRET,
				expiresIn: '1h',
				issuer: JWT_ISSUER,
				audience: JWT_AUDIENCE,
			}
		)

		await expect(service.getNewTokens(wrongTypeToken)).rejects.toBeInstanceOf(
			UnauthorizedException
		)
	})

	it('preserves the refresh response shape and excludes the password', async () => {
		const { service, userService } = createService()
		const passwordHash = await hash('123456')
		userService.getByEmail.mockResolvedValue(userFixture(passwordHash))
		userService.getById.mockResolvedValue(userFixture('password-hash'))
		const { refreshToken } = await service.login({
			email: 'user@example.com',
			password: '123456',
		})

		const result = await service.getNewTokens(refreshToken)

		expect(result).toEqual({
			user: expect.objectContaining({ id: 'user-1' }),
			accessToken: expect.any(String),
			refreshToken: expect.any(String),
		})
		expect(result.user).not.toHaveProperty('password')
	})

	it('rotates refresh sessions and revokes the whole family on replay', async () => {
		const { service, userService } = createService()
		const passwordHash = await hash('123456')
		userService.getByEmail.mockResolvedValue(userFixture(passwordHash))
		userService.getById.mockResolvedValue(userFixture(passwordHash))

		const first = await service.login({
			email: 'user@example.com',
			password: '123456',
		})
		const second = await service.getNewTokens(first.refreshToken)

		const firstPayload = jwt.verify<AuthTokenPayload>(first.refreshToken, {
			secret: REFRESH_SECRET,
			issuer: JWT_ISSUER,
			audience: JWT_AUDIENCE,
		})
		const secondPayload = jwt.verify<AuthTokenPayload>(second.refreshToken, {
			secret: REFRESH_SECRET,
			issuer: JWT_ISSUER,
			audience: JWT_AUDIENCE,
		})
		expect(secondPayload.sessionId).not.toBe(firstPayload.sessionId)

		await expect(service.getNewTokens(first.refreshToken)).rejects.toBeInstanceOf(
			UnauthorizedException
		)
		await expect(service.getNewTokens(second.refreshToken)).rejects.toBeInstanceOf(
			UnauthorizedException
		)
	})

	it('revokes the current refresh session during logout', async () => {
		const { service, userService } = createService()
		const passwordHash = await hash('123456')
		userService.getByEmail.mockResolvedValue(userFixture(passwordHash))
		userService.getById.mockResolvedValue(userFixture(passwordHash))

		const { refreshToken } = await service.login({
			email: 'user@example.com',
			password: '123456',
		})
		await service.revokeRefreshToken(refreshToken)

		await expect(service.getNewTokens(refreshToken)).rejects.toBeInstanceOf(
			UnauthorizedException
		)
	})
})
