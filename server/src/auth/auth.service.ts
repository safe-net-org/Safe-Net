import {
	Injectable,
	NotFoundException,
	UnauthorizedException,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { UserStatus } from '@prisma/client'
import { verify } from 'argon2'
import { Response } from 'express'
import { AchievementsService } from 'src/learning/services/achievements.service'
import { PrismaService } from 'src/prisma.service'
import { UserService } from 'src/user/services/user.service'
import { AuthLoginDto, AuthRegisterDto } from './dto/auth.dto'
@Injectable()
export class AuthService {
	/** Must match the refresh token's own expiry, or the cookie dies while the
	 * token is still valid (or worse, outlives it). */
	EXPIRE_DAY_REFRESH_TOKEN = 7
	REFRESH_TOKEN_NAME = 'refresh_token'
	private readonly ACCESS_TOKEN_EXPIRY = '1h'
	private readonly REFRESH_TOKEN_EXPIRY = '7d'
	constructor(
		private jwt: JwtService,
		private UserService: UserService,
		private AchievementsService: AchievementsService,
		private prisma: PrismaService
	) {}
	async login(dto: AuthLoginDto) {
		const { password, ...user } = await this.validateUser(dto)
		const tokens = this.issueTokens(user.id)
		return {
			user,
			...tokens,
		}
	}
	async register(dto: AuthRegisterDto) {
		const oldUserEmail = await this.UserService.getByEmail(dto.email)
		if (oldUserEmail)
			throw new UnauthorizedException(
				'A user with this email already exists'
			)

		const { password, ...user } = await this.UserService.create(dto)
		const tokens = this.issueTokens(user.id)

		await this.AchievementsService.awardAchievement(user.id, 'FIRST_LOGIN')

		return {
			user,
			...tokens,
		}
	}
	// `newPassword` was removed: it changed any account's password given only an
	// email address — no reset token, no authentication. It was unreachable
	// (never wired to a controller), but a single import away from being a
	// full account-takeover endpoint. A real reset flow needs a single-use,
	// expiring token delivered out of band before this comes back.

	private issueTokens(userId: string) {
		const data = { id: userId }
		const accessToken = this.jwt.sign(data, {
			expiresIn: this.ACCESS_TOKEN_EXPIRY,
		})
		const refreshToken = this.jwt.sign(data, {
			expiresIn: this.REFRESH_TOKEN_EXPIRY,
		})
		return {
			accessToken,
			refreshToken,
		}
	}
	private async validateUser(dto: AuthLoginDto) {
		const user = await this.UserService.getByEmail(dto.email)
		if (!user) throw new NotFoundException('User not found')
		const isValid = await verify(user.password, dto.password)
		if (!isValid) throw new UnauthorizedException('Incorrect password')
		if (user.status === UserStatus.BLOCKED)
			throw new UnauthorizedException('User is blocked')
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
		const result = await this.jwt.verifyAsync(refreshToken)
		if (!result)
			throw new UnauthorizedException('Invalid refresh token')
		const { password, ...user } = await this.UserService.getById(result.id)
		const tokens = this.issueTokens(user.id)
		return {
			user,
			...tokens,
		}
	}
	removeRefreshTokenFromResponse(res: Response) {
		res.cookie(this.REFRESH_TOKEN_NAME, '', {
			httpOnly: true,
			expires: new Date(0),
			...this.getCookieSecurityOptions(),
		})
	}
}
