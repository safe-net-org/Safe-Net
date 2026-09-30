import { BadRequestException } from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'
import { PasswordResetMailer } from './password-reset-mailer.service'
import { EmailVerificationService } from './email-verification.service'

describe('EmailVerificationService', () => {
	it('consumes a verification token exactly once under concurrent requests', async () => {
		let consumed = false
		const token = 'a'.repeat(64)
		const prisma = {
			$transaction: jest.fn(async callback =>
				callback({
					emailVerificationToken: {
						updateMany: jest.fn(async () => {
							if (consumed) return { count: 0 }
							consumed = true
							return { count: 1 }
						}),
						findUnique: jest.fn().mockResolvedValue({ userId: 'user-1', usedAt: null, expiresAt: new Date(Date.now() + 60_000) }),
					},
					user: { update: jest.fn().mockResolvedValue({ id: 'user-1', authVersion: 0 }) },
				})
			),
		}
		const service = new EmailVerificationService(
			prisma as unknown as PrismaService,
			{} as PasswordResetMailer
		)

		const results = await Promise.allSettled(
			Array.from({ length: 100 }, () => service.verify(token))
		)

		expect(results.filter(result => result.status === 'fulfilled')).toHaveLength(1)
		expect(results.filter(result => result.status === 'rejected')).toHaveLength(99)
		for (const result of results) {
			if (result.status === 'rejected') {
				expect(result.reason).toBeInstanceOf(BadRequestException)
			}
		}
	})

	it('does not send a verification capability after its account snapshot was superseded', async () => {
		const tx = {
			user: { updateMany: jest.fn().mockResolvedValue({ count: 0 }) },
			emailVerificationToken: { create: jest.fn(), updateMany: jest.fn() },
		}
		const prisma = { $transaction: jest.fn(async callback => callback(tx)) }
		const mailer = { sendVerificationLink: jest.fn() }
		const service = new EmailVerificationService(prisma as unknown as PrismaService, mailer as unknown as PasswordResetMailer)
		await service.sendForUser({ id: 'user-1', email: 'old@example.com', authVersion: 0 })
		expect(tx.emailVerificationToken.create).not.toHaveBeenCalled()
		expect(mailer.sendVerificationLink).not.toHaveBeenCalled()
	})

	it('reclaims the link after taking the user lock and returns the observed session generation', async () => {
		const tokenStore = {
			findUnique: jest.fn().mockResolvedValue({ userId: 'user-1', usedAt: null, expiresAt: new Date(Date.now() + 60_000) }),
			updateMany: jest.fn().mockResolvedValue({ count: 1 }),
		}
		const user = { update: jest.fn().mockResolvedValue({ id: 'user-1', authVersion: 2 }) }
		const prisma = { $transaction: jest.fn(async callback => callback({ user, emailVerificationToken: tokenStore })) }
		const service = new EmailVerificationService(prisma as unknown as PrismaService, {} as PasswordResetMailer)
		await expect(service.verify('a'.repeat(64))).resolves.toMatchObject({ userId: 'user-1', authVersion: 2 })
		expect(user.update.mock.invocationCallOrder[0]).toBeLessThan(tokenStore.updateMany.mock.invocationCallOrder[0])
		tokenStore.updateMany.mockResolvedValueOnce({ count: 0 })
		await expect(service.verify('a'.repeat(64))).rejects.toBeInstanceOf(BadRequestException)
	})
})
