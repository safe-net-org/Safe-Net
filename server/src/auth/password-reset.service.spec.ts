import { BadRequestException, Logger } from '@nestjs/common'
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
		const transaction = {
			user: { update: jest.fn().mockResolvedValue({ id: 'user-1' }), updateMany: jest.fn().mockResolvedValue({ count: 1 }) },
			passwordResetToken: {
				create: jest.fn().mockResolvedValue({ id: 'token-1' }),
				findUnique: jest.fn().mockResolvedValue({ userId: 'user-1', usedAt: null, expiresAt: new Date(Date.now() + 60_000) }),
				updateMany: jest.fn().mockResolvedValue({ count: 1 }),
			},
			refreshSession: { updateMany: jest.fn().mockResolvedValue({ count: 1 }) },
			emailChangeToken: { updateMany: jest.fn().mockResolvedValue({ count: 1 }) },
			emailVerificationToken: { updateMany: jest.fn().mockResolvedValue({ count: 1 }) },
		}
		const prisma = {
			user: {
				findUnique: jest.fn().mockResolvedValue({
					id: 'user-1',
					email: 'user@example.com',
					legalLocale: 'en',
					authVersion: 0,
				}),
			},
			passwordResetToken: {
				create: jest.fn().mockResolvedValue({ id: 'token-1' }),
			},
			$transaction: jest.fn(async callback => callback(transaction)),
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
			transaction,
		}
	}

	it('never logs raw reset details in production, even if the flag is set', async () => {
		process.env.NODE_ENV = 'production'
		process.env.PASSWORD_RESET_DEBUG_LOG = 'true'
		const warn = jest.spyOn(Logger.prototype, 'warn').mockImplementation()

		await createService().service.requestReset(' USER@Example.COM ')

		expect(warn).not.toHaveBeenCalled()
	})

	it('consumes a reset token atomically before changing the password', async () => {
		const { service, transaction } = createService()

		await service.resetPassword('a'.repeat(64), 'new-password')

		expect(transaction.passwordResetToken.updateMany).toHaveBeenNthCalledWith(
			1,
			expect.objectContaining({
				where: expect.objectContaining({ usedAt: null }),
			})
		)
		expect(transaction.user.update).toHaveBeenCalledTimes(2)
		expect(transaction.emailChangeToken.updateMany).toHaveBeenCalledWith({
			where: { userId: 'user-1', usedAt: null }, data: { usedAt: expect.any(Date) },
		})
		expect(transaction.emailVerificationToken.updateMany).toHaveBeenCalledWith({
			where: { userId: 'user-1', usedAt: null }, data: { usedAt: expect.any(Date) },
		})
		expect(transaction.refreshSession.updateMany).toHaveBeenCalledWith(
			expect.objectContaining({ where: { userId: 'user-1', revokedAt: null } })
		)
	})

	it('rejects an already-consumed reset token before changing the password', async () => {
		const { service, transaction } = createService()
		transaction.passwordResetToken.findUnique.mockResolvedValueOnce({ userId: 'user-1', usedAt: new Date(), expiresAt: new Date(Date.now() + 60_000) })

		await expect(service.resetPassword('a'.repeat(64), 'new-password')).rejects.toBeInstanceOf(
			BadRequestException
		)
		expect(transaction.user.update).not.toHaveBeenCalled()
	})

	it('does not issue recovery to a stale email snapshot after credentials changed', async () => {
		const { service, transaction, mailer } = createService()
		transaction.user.updateMany.mockResolvedValueOnce({ count: 0 })
		await expect(service.requestReset('user@example.com')).resolves.toHaveProperty('message')
		expect(transaction.passwordResetToken.create).not.toHaveBeenCalled()
		expect(mailer.sendResetLink).not.toHaveBeenCalled()
	})

	it('rolls back when another credential transition invalidated the link while waiting for the user lock', async () => {
		const { service, transaction } = createService()
		transaction.passwordResetToken.updateMany.mockResolvedValueOnce({ count: 0 })
		await expect(service.resetPassword('a'.repeat(64), 'new-password')).rejects.toBeInstanceOf(BadRequestException)
		expect(transaction.user.update).toHaveBeenCalledTimes(1)
		expect(transaction.user.update).not.toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ password: expect.any(String) }) }))
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
		const log = jest.spyOn(Logger.prototype, 'log').mockImplementation()
		const { service, mailer } = createService(true)

		await service.requestReset(' USER@Example.COM ')

		expect(mailer.sendResetLink).toHaveBeenCalledWith(
			'user@example.com',
			expect.stringMatching(
				/^http:\/\/localhost:3000\/\?auth=reset&token=[a-f0-9]{64}$/
			),
			'en'
		)
		expect(warn).not.toHaveBeenCalled()
		expect(log).toHaveBeenCalledWith(
			'Password reset email accepted by delivery provider'
		)
	})

	it('logs safe SMTP diagnostics without exposing recipient or reset details', async () => {
		const error = jest
			.spyOn(Logger.prototype, 'error')
			.mockImplementation()
		const { service, mailer } = createService()
		mailer.sendResetLink.mockRejectedValue({
			code: 'EAUTH',
			command: 'AUTH PLAIN',
			responseCode: 535,
			message:
				'Authentication failed for user@example.com token=secret-reset-token',
		})

		await service.requestReset('user@example.com')

		expect(error).toHaveBeenCalledWith(
			'Password reset email delivery failed (code=EAUTH, command=AUTH PLAIN, responseCode=535)'
		)
		expect(error.mock.calls.join(' ')).not.toContain('user@example.com')
		expect(error.mock.calls.join(' ')).not.toContain('secret-reset-token')
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

	it('uses SMTP_FROM when optional Resend values are blank', () => {
		const mailer = new PasswordResetMailer(
			new ConfigService({
				RESEND_API_KEY: '',
				RESEND_FROM: '',
				SMTP_HOST: 'smtp.example.com',
				SMTP_FROM: 'Safe Net <no-reply@example.com>',
			})
		)

		expect(mailer.isConfigured()).toBe(true)
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
