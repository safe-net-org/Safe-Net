import {
	IsNotEmpty,
	IsOptional,
	IsString,
	MinLength,
	ValidateIf,
} from 'class-validator'

export class UserDto {
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
