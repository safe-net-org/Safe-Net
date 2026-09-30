import {
	Body,
	Controller,
	HttpCode,
	Post,
	Req,
	Res,
	UnauthorizedException,
} from '@nestjs/common'
import { Throttle } from '@nestjs/throttler'
import { Request, Response } from 'express'
import { AuthService } from './auth.service'
import { Auth } from './decorators/auth.decorator'
import { CurrentUser } from './decorators/user.decorator'
import { ConfirmEmailChangeDto, RequestEmailChangeDto } from './dto/email-change.dto'
import { EmailChangeService } from './email-change.service'
import { AuthLoginDto, AuthRegisterDto } from './dto/auth.dto'
import {
	ForgotPasswordDto,
	ResetPasswordDto,
	VerifyEmailDto,
} from './dto/password-reset.dto'
import { EmailVerificationService } from './email-verification.service'
import { PasswordResetService } from './password-reset.service'

const ONE_MINUTE_MS = 60_000
/** Credential endpoints are the brute-force target, so they get their own cap. */
const AUTH_ATTEMPTS_PER_MINUTE = 5

@Controller('auth')
export class AuthController {
	constructor(
		private readonly authService: AuthService,
		private readonly passwordResetService: PasswordResetService,
		private readonly emailVerificationService: EmailVerificationService,
		private readonly emailChangeService: EmailChangeService
	) {}
	// ValidationPipe is now global (see main.ts) — the per-route @UsePipes it
	// replaced was the reason every other DTO went unvalidated.
	@Throttle({ default: { ttl: ONE_MINUTE_MS, limit: AUTH_ATTEMPTS_PER_MINUTE } })
	@HttpCode(200)
	@Post('login')
	async login(
		@Body() dto: AuthLoginDto,
		@Res({ passthrough: true }) res: Response
	) {
		const { accessToken, refreshToken, ...response } = await this.authService.login(dto)
		this.authService.addAccessTokenToResponse(res, accessToken)
		this.authService.addRefreshTokenToResponse(res, refreshToken)
		return response
	}
	@Throttle({ default: { ttl: ONE_MINUTE_MS, limit: AUTH_ATTEMPTS_PER_MINUTE } })
	@HttpCode(200)
	@Post('register')
	async register(
		@Body() dto: AuthRegisterDto,
		@Res({ passthrough: true }) res: Response
	) {
		return this.authService.register(dto)
	}

	@HttpCode(200)
	@Post('login/access-token')
	async getNewTokens(
		@Req() req: Request,
		@Res({ passthrough: true }) res: Response
	) {
		const refreshTokenFromCookies =
			req.cookies[this.authService.REFRESH_TOKEN_NAME]
		if (!refreshTokenFromCookies) {
			this.authService.removeRefreshTokenFromResponse(res)
			throw new UnauthorizedException('Refresh token not passed')
		}
		const { accessToken, refreshToken, ...response } = await this.authService.getNewTokens(
			refreshTokenFromCookies
		)
		this.authService.addAccessTokenToResponse(res, accessToken)
		this.authService.addRefreshTokenToResponse(res, refreshToken)
		return response
	}

	@HttpCode(200)
	@Post('logout')
	async logout(
		@Req() req: Request,
		@Res({ passthrough: true }) res: Response
	) {
		await this.authService.revokeRefreshToken(
			req.cookies[this.authService.REFRESH_TOKEN_NAME]
		)
		this.authService.removeRefreshTokenFromResponse(res)
		this.authService.removeAccessTokenFromResponse(res)
		return { message: 'Logout success' }
	}

	// Rate-limited hard: these are the surface for account enumeration and
	// token guessing.
	@Throttle({ default: { ttl: ONE_MINUTE_MS, limit: AUTH_ATTEMPTS_PER_MINUTE } })
	@HttpCode(200)
	@Post('password/forgot')
	async forgotPassword(@Body() dto: ForgotPasswordDto) {
		return this.passwordResetService.requestReset(dto.email)
	}

	@Throttle({ default: { ttl: ONE_MINUTE_MS, limit: AUTH_ATTEMPTS_PER_MINUTE } })
	@HttpCode(200)
	@Post('password/reset')
	async resetPassword(@Body() dto: ResetPasswordDto) {
		return this.passwordResetService.resetPassword(dto.token, dto.password)
	}

	@Throttle({ default: { ttl: ONE_MINUTE_MS, limit: AUTH_ATTEMPTS_PER_MINUTE } })
	@HttpCode(200)
	@Post('email/resend')
	async resendVerification(@Body() dto: ForgotPasswordDto) {
		return this.emailVerificationService.resend(dto.email)
	}

	@Throttle({ default: { ttl: ONE_MINUTE_MS, limit: AUTH_ATTEMPTS_PER_MINUTE } })
	@HttpCode(200)
	@Post('email/verify')
	async verifyEmail(
		@Body() dto: VerifyEmailDto,
		@Res({ passthrough: true }) res: Response
	) {
		const { userId, authVersion, ...response } = await this.emailVerificationService.verify(dto.token)
		const { accessToken, refreshToken } = await this.authService.createVerifiedSession(userId, authVersion)
		this.authService.addAccessTokenToResponse(res, accessToken)
		this.authService.addRefreshTokenToResponse(res, refreshToken)
		return response
	}

	@Auth()
	@Throttle({ default: { ttl: ONE_MINUTE_MS, limit: AUTH_ATTEMPTS_PER_MINUTE } })
	@HttpCode(200)
	@Post('email/change/request')
	async requestEmailChange(
		@CurrentUser('id') userId: string,
		@Body() dto: RequestEmailChangeDto
	) {
		return this.emailChangeService.request(userId, dto.email, dto.currentPassword)
	}

	@Throttle({ default: { ttl: ONE_MINUTE_MS, limit: AUTH_ATTEMPTS_PER_MINUTE } })
	@HttpCode(200)
	@Post('email/change/confirm')
	async confirmEmailChange(
		@Body() dto: ConfirmEmailChangeDto,
		@Res({ passthrough: true }) res: Response
	) {
		const { userId, authVersion, ...response } = await this.emailChangeService.confirm(dto.token)
		const { accessToken, refreshToken } = await this.authService.createVerifiedSession(userId, authVersion)
		this.authService.addAccessTokenToResponse(res, accessToken)
		this.authService.addRefreshTokenToResponse(res, refreshToken)
		return response
	}
}
