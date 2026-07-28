import {
	ArgumentMetadata,
	BadRequestException,
	ValidationPipe,
} from '@nestjs/common'
import { AuthLoginDto, AuthRegisterDto } from './auth.dto'
import { CURRENT_LEGAL_VERSION } from '../legal-consent'

const bodyMetadata = (
	metatype: ArgumentMetadata['metatype']
): ArgumentMetadata => ({
	type: 'body',
	metatype,
	data: undefined,
})

describe('authentication DTO contracts', () => {
	const pipe = new ValidationPipe({
		transform: true,
		whitelist: true,
		forbidNonWhitelisted: true,
	})

	const validRegistration = {
		name: 'Ada',
		email: '  ADA@Example.COM ',
		password: 'password1',
		termsAccepted: true,
		privacyAccepted: true,
		legalVersion: CURRENT_LEGAL_VERSION,
		legalLocale: 'en',
	}

	it('accepts and normalizes the current registration contract', async () => {
		const result = await pipe.transform(
			validRegistration,
			bodyMetadata(AuthRegisterDto)
		)

		expect(result).toMatchObject({
			...validRegistration,
			email: 'ada@example.com',
		})
	})

	it.each([
		['terms acceptance', { termsAccepted: false }],
		['privacy acceptance', { privacyAccepted: false }],
		['current legal version', { legalVersion: '2026-01-01' }],
		['supported legal locale', { legalLocale: 'de' }],
	])('rejects registration without valid %s', async (_label, override) => {
		await expect(
			pipe.transform(
				{ ...validRegistration, ...override },
				bodyMetadata(AuthRegisterDto)
			)
		).rejects.toBeInstanceOf(BadRequestException)
	})

	it('rejects non-contract consent fields', async () => {
		await expect(
			pipe.transform(
				{ ...validRegistration, termsAcceptedAt: new Date().toISOString() },
				bodyMetadata(AuthRegisterDto)
			)
		).rejects.toBeInstanceOf(BadRequestException)
	})

	it('requires eight characters for a new registration password', async () => {
		await expect(
			pipe.transform(
				{ ...validRegistration, password: '1234567' },
				bodyMetadata(AuthRegisterDto)
			)
		).rejects.toBeInstanceOf(BadRequestException)
	})

	it('continues accepting legacy six-character passwords at login', async () => {
		const result = await pipe.transform(
			{ email: ' LEGACY@EXAMPLE.COM ', password: '123456' },
			bodyMetadata(AuthLoginDto)
		)

		expect(result).toMatchObject({
			email: 'legacy@example.com',
			password: '123456',
		})
	})
})
