import { Transform } from 'class-transformer'
import { IsEmail, IsString, Matches, MinLength } from 'class-validator'
import { normalizeEmail } from 'src/common/email'

export class RequestEmailChangeDto {
	@Transform(({ value }) => normalizeEmail(value))
	@IsEmail()
	email: string

	@IsString()
	@MinLength(1)
	currentPassword: string
}

export class ConfirmEmailChangeDto {
	@IsString()
	@Matches(/^[a-f0-9]{64}$/)
	token: string
}
