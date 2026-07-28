import { UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { UserStatus } from '@prisma/client'
import { UserService } from 'src/user/services/user.service'
import { JWT_AUDIENCE, JWT_ISSUER, JWT_TOKEN_TYPE } from './jwt.constants'
import { JwtStrategy } from './jwt.strategy'

const ACCESS_SECRET = 'test-access-secret'
const REFRESH_SECRET = 'test-refresh-secret'

function configService() {
	return new ConfigService({
		JWT_SECRET: ACCESS_SECRET,
		JWT_REFRESH_SECRET: REFRESH_SECRET,
	})
}

function userFixture(overrides: Record<string, unknown> = {}) {
	return {
		id: 'user-1',
		email: 'user@example.com',
		name: 'User',
		password: 'password-hash',
		rights: [],
		status: UserStatus.ACTIVE,
		...overrides,
	}
}

function authenticate(strategy: JwtStrategy, token: string): Promise<unknown> {
	return new Promise((resolve, reject) => {
		const passportStrategy = strategy as unknown as {
			success: (user: unknown) => void
			fail: (reason: unknown) => void
			error: (error: unknown) => void
			authenticate: (request: unknown) => void
		}
		passportStrategy.success = resolve
		passportStrategy.fail = reject
		passportStrategy.error = reject
		passportStrategy.authenticate({
			headers: { authorization: `Bearer ${token}` },
		})
	})
}

describe('JwtStrategy', () => {
	const jwt = new JwtService()

	function createStrategy(findResult: unknown) {
		const userService = {
			getById: jest.fn().mockResolvedValue(findResult),
		}
		return {
			strategy: new JwtStrategy(
				configService(),
				userService as unknown as UserService
			),
			userService,
		}
	}

	function signAccess(overrides: Record<string, unknown> = {}) {
		return jwt.sign(
			{ id: 'user-1', type: JWT_TOKEN_TYPE.ACCESS, ...overrides },
			{
				secret: ACCESS_SECRET,
				expiresIn: '1h',
				issuer: JWT_ISSUER,
				audience: JWT_AUDIENCE,
			}
		)
	}

	it('verifies expiration, issuer and audience at the Passport boundary', () => {
		const { strategy } = createStrategy(userFixture())
		const options = (
			strategy as unknown as {
				_verifOpts: {
					ignoreExpiration: boolean
					issuer: string
					audience: string
				}
			}
		)._verifOpts

		expect(options).toMatchObject({
			ignoreExpiration: false,
			issuer: JWT_ISSUER,
			audience: JWT_AUDIENCE,
		})
	})

	it('rejects an expired access token', async () => {
		const { strategy } = createStrategy(userFixture())
		const token = jwt.sign(
			{ id: 'user-1', type: JWT_TOKEN_TYPE.ACCESS },
			{
				secret: ACCESS_SECRET,
				expiresIn: -1,
				issuer: JWT_ISSUER,
				audience: JWT_AUDIENCE,
			}
		)

		await expect(authenticate(strategy, token)).rejects.toBeDefined()
	})

	it('rejects a token with the wrong issuer', async () => {
		const { strategy } = createStrategy(userFixture())
		const token = jwt.sign(
			{ id: 'user-1', type: JWT_TOKEN_TYPE.ACCESS },
			{
				secret: ACCESS_SECRET,
				expiresIn: '1h',
				issuer: 'other-service',
				audience: JWT_AUDIENCE,
			}
		)

		await expect(authenticate(strategy, token)).rejects.toBeDefined()
	})

	it('rejects refresh tokens on access-token routes', async () => {
		const { strategy } = createStrategy(userFixture())

		await expect(
			strategy.validate({
				id: 'user-1',
				type: JWT_TOKEN_TYPE.REFRESH,
			})
		).rejects.toBeInstanceOf(UnauthorizedException)
	})

	it.each([
		['missing', null],
		['blocked', userFixture({ status: UserStatus.BLOCKED })],
	])('rejects a %s user', async (_label, user) => {
		const { strategy } = createStrategy(user)

		await expect(
			strategy.validate({
				id: 'user-1',
				type: JWT_TOKEN_TYPE.ACCESS,
			})
		).rejects.toBeInstanceOf(UnauthorizedException)
	})

	it('attaches a current user without the password', async () => {
		const { strategy } = createStrategy(userFixture())
		const user = await strategy.validate({
			id: 'user-1',
			type: JWT_TOKEN_TYPE.ACCESS,
		})

		expect(user).toMatchObject({ id: 'user-1', email: 'user@example.com' })
		expect(user).not.toHaveProperty('password')
	})

	it('accepts a correctly scoped access token end to end', async () => {
		const { strategy, userService } = createStrategy(userFixture())
		const user = await authenticate(strategy, signAccess())

		expect(user).not.toHaveProperty('password')
		expect(userService.getById).toHaveBeenCalledWith('user-1')
	})
})
