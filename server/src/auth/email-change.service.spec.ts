import { UnauthorizedException } from '@nestjs/common'
import { hash } from 'argon2'
import { PrismaService } from 'src/prisma.service'
import { EmailChangeService } from './email-change.service'
import { PasswordResetMailer } from './password-reset-mailer.service'

describe('EmailChangeService', () => {
	it('keeps the old address until a single-use link is confirmed', async () => {
		const user = {
			id: 'user-1', email: 'old@example.com', password: await hash('old-password'),
			legalLocale: 'en', emailVerifiedAt: new Date(), authVersion: 0,
		}
		let record: { userId: string; newEmail: string; tokenHash: string; expiresAt: Date; usedAt: Date | null } | null = null
		const tx = {
			emailChangeToken: {
			updateMany: jest.fn(async ({ where, data }) => {
				if (!record || record.usedAt || (where.tokenHash && where.tokenHash !== record.tokenHash) ||
					(where.expiresAt && record.expiresAt <= where.expiresAt.gt)) return { count: 0 }
				record.usedAt = data.usedAt
				return { count: 1 }
			}),
			create: jest.fn(async ({ data }) => { record = { ...data, usedAt: null }; return record }),
			findUnique: jest.fn(async () => record),
		},
		user: { updateMany: jest.fn().mockResolvedValue({ count: 1 }), update: jest.fn(async ({ data }) => {
			if (data.email !== undefined) user.email = data.email
			if (data.emailVerifiedAt !== undefined) user.emailVerifiedAt = data.emailVerifiedAt
			if (data.authVersion?.increment) user.authVersion += data.authVersion.increment
			return user
		}) },
		refreshSession: { updateMany: jest.fn().mockResolvedValue({ count: 1 }) },
		passwordResetToken: { updateMany: jest.fn().mockResolvedValue({ count: 1 }) },
		emailVerificationToken: { updateMany: jest.fn().mockResolvedValue({ count: 1 }) },
	}
		const prisma = {
			user: { findUnique: jest.fn(async ({ where }) => where.id === user.id ? user : null) },
			emailChangeToken: tx.emailChangeToken,
			$transaction: jest.fn(async callback => callback(tx)),
		}
		const mailer = {
			isConfigured: jest.fn().mockReturnValue(true),
			sendEmailChangeLink: jest.fn().mockResolvedValue(true),
			sendEmailChangeNotice: jest.fn().mockResolvedValue(true),
		}
		const service = new EmailChangeService(prisma as unknown as PrismaService, mailer as unknown as PasswordResetMailer)

		await expect(service.request(user.id, 'new@example.com', 'wrong'))
			.rejects.toBeInstanceOf(UnauthorizedException)
		await service.request(user.id, 'new@example.com', 'old-password')
		expect(user.email).toBe('old@example.com')
		expect(mailer.sendEmailChangeNotice).toHaveBeenCalledWith('old@example.com', 'en')
		const link = mailer.sendEmailChangeLink.mock.calls[0][1] as string
		const token = new URL(link).searchParams.get('token')!
		await expect(service.confirm(token)).resolves.toMatchObject({ userId: user.id })
		expect(user.email).toBe('new@example.com')
		expect(user.authVersion).toBe(1)
		expect(tx.refreshSession.updateMany).toHaveBeenCalled()
		expect(tx.passwordResetToken.updateMany).toHaveBeenCalledWith({
			where: { userId: user.id, usedAt: null }, data: { usedAt: expect.any(Date) },
		})
		expect(tx.emailVerificationToken.updateMany).toHaveBeenCalledWith({
			where: { userId: user.id, usedAt: null }, data: { usedAt: expect.any(Date) },
		})
		await expect(service.confirm(token)).rejects.toThrow('Invalid or expired email change link')
		mailer.sendEmailChangeNotice.mockResolvedValueOnce(false)
		await expect(service.request(user.id, 'third@example.com', 'old-password'))
			.rejects.toThrow('Email delivery failed')
		expect(mailer.sendEmailChangeLink).toHaveBeenCalledTimes(1)
	})

	it('rejects an issuance request whose verified password snapshot was superseded', async () => {
		const user = { id: 'user-1', email: 'old@example.com', password: await hash('old-password'), authVersion: 0 }
		const tx = {
			user: { updateMany: jest.fn().mockResolvedValue({ count: 0 }) },
			emailChangeToken: { create: jest.fn(), updateMany: jest.fn() },
		}
		const prisma = {
			user: { findUnique: jest.fn(async ({ where }) => where.id ? user : null) },
			$transaction: jest.fn(async callback => callback(tx)),
		}
		const mailer = { isConfigured: jest.fn().mockReturnValue(true), sendEmailChangeNotice: jest.fn(), sendEmailChangeLink: jest.fn() }
		const service = new EmailChangeService(prisma as unknown as PrismaService, mailer as unknown as PasswordResetMailer)
		await expect(service.request(user.id, 'new@example.com', 'old-password')).rejects.toBeInstanceOf(UnauthorizedException)
		expect(tx.emailChangeToken.create).not.toHaveBeenCalled()
		expect(mailer.sendEmailChangeLink).not.toHaveBeenCalled()
	})
})
