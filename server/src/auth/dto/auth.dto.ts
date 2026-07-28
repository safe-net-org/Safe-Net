import { Transform } from 'class-transformer'
import {
	Equals,
	IsBoolean,
	IsEmail,
	IsIn,
	IsOptional,
	IsString,
	MinLength,
} from 'class-validator'
import { normalizeEmail } from 'src/common/email'
import {
	CURRENT_LEGAL_VERSION,
	LEGAL_LOCALES,
	LegalLocale,
} from '../legal-consent'

export class AuthRegisterDto {
	@IsString()
	name: string

	@Transform(({ value }) => normalizeEmail(value))
	@IsEmail()
	email: string

	@MinLength(8, { message: 'Password must be at least 8 characters long' })
	@IsString()
	password: string

	@Equals(true, { message: 'Terms must be accepted' })
	@IsBoolean()
	termsAccepted: true

	@Equals(true, { message: 'Privacy policy must be accepted' })
	@IsBoolean()
	privacyAccepted: true

	@Equals(CURRENT_LEGAL_VERSION, {
		message: `Legal version must be ${CURRENT_LEGAL_VERSION}`,
	})
	@IsString()
	legalVersion: typeof CURRENT_LEGAL_VERSION

	@IsIn(LEGAL_LOCALES)
	@IsOptional()
	legalLocale?: LegalLocale
}

export class AuthLoginDto {
	@Transform(({ value }) => normalizeEmail(value))
	@IsEmail()
	email: string

	@MinLength(6, { message: 'Password must be at least 6 characters long' })
	@IsString()
	password: string
}
