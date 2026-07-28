import { Transform } from 'class-transformer'
import { IsEmail, IsString, MinLength } from 'class-validator'
import { normalizeEmail } from 'src/common/email'

export class ForgotPasswordDto {
	@Transform(({ value }) => normalizeEmail(value))
	@IsEmail()
	email: string
}

export class ResetPasswordDto {
	@IsString()
	token: string

	@MinLength(8, { message: 'Password must be at least 8 characters long' })
	@IsString()
	password: string
}
