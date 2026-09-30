import { Transform } from 'class-transformer'
import { IsEmail, IsString, Matches, MinLength } from 'class-validator'
import { normalizeEmail } from 'src/common/email'

export class ForgotPasswordDto {
	@Transform(({ value }) => normalizeEmail(value))
	@IsEmail()
	email: string
}

export class VerifyEmailDto {
	@IsString()
	@Matches(/^[a-f0-9]{64}$/)
	token: string
}

export class ResetPasswordDto {
	@IsString()
	token: string

	@MinLength(8, { message: 'Password must be at least 8 characters long' })
	@IsString()
	password: string
}
