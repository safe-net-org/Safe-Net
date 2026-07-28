import {
	ArgumentMetadata,
	BadRequestException,
	ValidationPipe,
} from '@nestjs/common'
import { UserDto } from './user.dto'

describe('UserDto password update contract', () => {
	const pipe = new ValidationPipe({
		transform: true,
		whitelist: true,
		forbidNonWhitelisted: true,
	})
	const metadata: ArgumentMetadata = {
		type: 'body',
		metatype: UserDto,
		data: undefined,
	}

	it('requires the current password when a new password is supplied', async () => {
		await expect(
			pipe.transform({ password: 'new-password' }, metadata)
		).rejects.toBeInstanceOf(BadRequestException)
	})

	it('requires at least eight characters for a new password', async () => {
		await expect(
			pipe.transform(
				{ password: '1234567', currentPassword: 'old-password' },
				metadata
			)
		).rejects.toBeInstanceOf(BadRequestException)
	})

	it('accepts a valid password-change request', async () => {
		await expect(
			pipe.transform(
				{ password: 'new-password', currentPassword: 'old-password' },
				metadata
			)
		).resolves.toMatchObject({
			password: 'new-password',
			currentPassword: 'old-password',
		})
	})

	it('does not expose consent audit fields through profile updates', async () => {
		await expect(
			pipe.transform({ name: 'Ada', legalVersion: 'older-version' }, metadata)
		).rejects.toBeInstanceOf(BadRequestException)
	})
})
