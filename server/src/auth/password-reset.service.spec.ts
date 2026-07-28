import { Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PrismaService } from 'src/prisma.service'
import { PasswordResetMailer } from './password-reset-mailer.service'
import { buildPasswordResetEmail } from './password-reset-mailer.service'
import { PasswordResetService } from './password-reset.service'

const mockResendSend = jest.fn()

jest.mock('resend', () => ({
	Resend: jest.fn().mockImplementation(() => ({
		emails: { send: mockResendSend },
	})),
}))

describe('PasswordResetService reset-link logging', () => {
	const originalNodeEnv = process.env.NODE_ENV
	const originalDebugFlag = process.env.PASSWORD_RESET_DEBUG_LOG

	afterEach(() => {
		if (originalNodeEnv === undefined) delete process.env.NODE_ENV
		else process.env.NODE_ENV = originalNodeEnv
		if (originalDebugFlag === undefined)
			delete process.env.PASSWORD_RESET_DEBUG_LOG
		else process.env.PASSWORD_RESET_DEBUG_LOG = originalDebugFlag
		jest.restoreAllMocks()
		mockResendSend.mockReset()
	})

	function createService(delivered = false) {
		const prisma = {
			user: {
				findUnique: jest.fn().mockResolvedValue({
					id: 'user-1',
					email: 'user@example.com',
					legalLocale: 'en',
				}),
			},
			passwordResetToken: {
				create: jest.fn().mockResolvedValue({ id: 'token-1' }),
			},
		}
		const mailer = {
			sendResetLink: jest.fn().mockResolvedValue(delivered),
		}
		return {
			service: new PasswordResetService(
				prisma as unknown as PrismaService,
				mailer as unknown as PasswordResetMailer
			),
			mailer,
		}
	}

	it('never logs raw reset details in production, even if the flag is set', async () => {
		process.env.NODE_ENV = 'production'
		process.env.PASSWORD_RESET_DEBUG_LOG = 'true'
		const warn = jest.spyOn(Logger.prototype, 'warn').mockImplementation()

		await createService().service.requestReset(' USER@Example.COM ')

		expect(warn).not.toHaveBeenCalled()
	})

	it('requires an explicit debug flag outside production', async () => {
		process.env.NODE_ENV = 'development'
		process.env.PASSWORD_RESET_DEBUG_LOG = 'false'
		const warn = jest.spyOn(Logger.prototype, 'warn').mockImplementation()

		await createService().service.requestReset('user@example.com')

		expect(warn).not.toHaveBeenCalled()
	})

	it('allows reset-link logging only with the development flag', async () => {
		process.env.NODE_ENV = 'development'
		process.env.PASSWORD_RESET_DEBUG_LOG = 'true'
		const warn = jest.spyOn(Logger.prototype, 'warn').mockImplementation()

		await createService().service.requestReset(' USER@Example.COM ')

		expect(warn).toHaveBeenCalledWith(
			expect.stringContaining(
				'Development-only password reset link for user@example.com'
			)
		)
	})

	it('delivers through SMTP and never logs the reset link when delivery succeeds', async () => {
		process.env.NODE_ENV = 'development'
		process.env.PASSWORD_RESET_DEBUG_LOG = 'true'
		const warn = jest.spyOn(Logger.prototype, 'warn').mockImplementation()
		const { service, mailer } = createService(true)

		await service.requestReset(' USER@Example.COM ')

		expect(mailer.sendResetLink).toHaveBeenCalledWith(
			'user@example.com',
			expect.stringMatching(
				/^http:\/\/localhost:3000\/reset-password\?token=[a-f0-9]{64}$/
			),
			'en'
		)
		expect(warn).not.toHaveBeenCalled()
	})

	it('builds localized HTML and plaintext reset messages', () => {
		const message = buildPasswordResetEmail(
			'https://safe.example/reset-password?token=abc&source=test',
			'ru'
		)

		expect(message.subject).toBe('Сброс пароля SafeNet')
		expect(message.text).toContain('действует 30 минут')
		expect(message.html).toContain('Создать новый пароль')
		expect(message.html).toContain('token=abc&amp;source=test')
	})

	it('requires SMTP delivery configuration in production', () => {
		process.env.NODE_ENV = 'production'
		expect(
			() =>
				new PasswordResetMailer(new ConfigService({ SMTP_HOST: '', SMTP_FROM: '' }))
		).toThrow(
			'RESEND_API_KEY and RESEND_FROM, or SMTP_HOST and SMTP_FROM, are required in production'
		)
	})

	it('uses the Resend API when configured', async () => {
		mockResendSend.mockResolvedValue({ data: { id: 'email-1' }, error: null })
		const mailer = new PasswordResetMailer(
			new ConfigService({
				RESEND_API_KEY: 're_test',
				RESEND_FROM: 'Safe Net <no-reply@example.com>',
			})
		)

		await expect(
			mailer.sendResetLink('user@example.com', 'https://safe.example/reset?token=abc', 'en')
		).resolves.toBe(true)
		expect(mockResendSend).toHaveBeenCalledWith(
			expect.objectContaining({
				from: 'Safe Net <no-reply@example.com>',
				to: 'user@example.com',
				subject: 'Reset your SafeNet password',
			})
		)
	})
})
