import { IsEmail, IsString, MinLength } from 'class-validator'

export class ForgotPasswordDto {
	@IsEmail()
	email: string
}

export class ResetPasswordDto {
	@IsString()
	token: string

	@MinLength(6, { message: 'Password must be at least 6 characters long' })
	@IsString()
	password: string
}
