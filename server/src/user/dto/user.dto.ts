import { Transform } from 'class-transformer'
import {
	IsEmail,
	IsNotEmpty,
	IsOptional,
	IsString,
	MinLength,
	ValidateIf,
} from 'class-validator'
import { normalizeEmail } from 'src/common/email'

export class UserDto {
	@Transform(({ value }) => normalizeEmail(value))
	@IsEmail()
	@IsOptional()
	email?: string

	@IsString()
	@IsOptional()
	name?: string

	@MinLength(8, { message: 'Password must be at least 8 characters long' })
	@IsString()
	@IsOptional()
	password?: string

	@ValidateIf((dto) => dto.password !== undefined)
	@IsNotEmpty()
	@IsString()
	currentPassword?: string
}
