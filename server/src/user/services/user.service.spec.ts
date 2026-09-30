import { UnauthorizedException } from '@nestjs/common'
import { verify, hash } from 'argon2'
import { AuthRegisterDto } from 'src/auth/dto/auth.dto'
import { CURRENT_LEGAL_VERSION } from 'src/auth/legal-consent'
import { PrismaService } from 'src/prisma.service'
import { UserService } from './user.service'

describe('UserService security-sensitive writes', () => {
	function createService() {
		const prisma = {
			user: {
				findUnique: jest.fn(),
				create: jest.fn(),
				update: jest.fn(),
				updateMany: jest.fn().mockResolvedValue({ count: 1 }),
				findUniqueOrThrow: jest.fn().mockResolvedValue({ name: 'Ada', email: 'ada@example.com' }),
			},
			course: {
				findMany: jest.fn().mockResolvedValue([]),
			},
			courseProgress: {
				createMany: jest.fn().mockResolvedValue({ count: 0 }),
			},
			refreshSession: {
				updateMany: jest.fn().mockResolvedValue({ count: 1 }),
			},
			passwordResetToken: { updateMany: jest.fn().mockResolvedValue({ count: 1 }) },
			emailChangeToken: { updateMany: jest.fn().mockResolvedValue({ count: 1 }) },
			emailVerificationToken: { updateMany: jest.fn().mockResolvedValue({ count: 1 }) },
			$transaction: jest.fn(),
		}
		prisma.$transaction.mockImplementation(async callback => callback(prisma))
		return {
			service: new UserService(prisma as unknown as PrismaService),
			prisma,
		}
	}

	it('persists normalized email and immutable registration consent evidence', async () => {
		const { service, prisma } = createService()
		prisma.user.create.mockImplementation(async ({ data }) => ({
			id: 'user-1',
			...data,
		}))
		const dto: AuthRegisterDto = {
			name: 'Ada',
			email: ' ADA@Example.COM ',
			password: 'password1',
			termsAccepted: true,
			privacyAccepted: true,
			legalVersion: CURRENT_LEGAL_VERSION,
			legalLocale: 'ru',
		}

		await service.create(dto)

		const data = prisma.user.create.mock.calls[0][0].data
		expect(data).toMatchObject({
			email: 'ada@example.com',
			legalVersion: CURRENT_LEGAL_VERSION,
			legalLocale: 'ru',
			termsAcceptedAt: expect.any(Date),
			privacyAcceptedAt: expect.any(Date),
		})
		expect(data.termsAcceptedAt).toBe(data.privacyAcceptedAt)
		expect(data).not.toHaveProperty('termsAccepted')
		expect(data).not.toHaveProperty('privacyAccepted')
		expect(data.password).not.toBe(dto.password)
	})

	it('requires the current password before changing a password', async () => {
		const { service, prisma } = createService()
		prisma.user.findUnique.mockResolvedValue({
			id: 'user-1',
			password: await hash('old-password'),
			authVersion: 0,
		})

		await expect(
			service.update('user-1', {
				password: 'new-password',
				currentPassword: 'wrong-password',
			})
		).rejects.toBeInstanceOf(UnauthorizedException)
		expect(prisma.user.update).not.toHaveBeenCalled()
	})

	it('hashes the new password and never sends credential DTO fields to Prisma', async () => {
		const { service, prisma } = createService()
		prisma.user.findUnique.mockResolvedValue({
			id: 'user-1',
			password: await hash('old-password'),
			authVersion: 0,
		})
		prisma.user.update.mockResolvedValue({
			name: 'Ada',
			email: 'ada@example.com',
		})

		await service.update('user-1', {
			password: 'new-password',
			currentPassword: 'old-password',
		})

		const data = prisma.user.updateMany.mock.calls[0][0].data
		expect(data.email).toBeUndefined()
		expect(data.authVersion).toEqual({ increment: 1 })
		expect(data.password).not.toBe('new-password')
		expect(await verify(data.password, 'new-password')).toBe(true)
		expect(data).not.toHaveProperty('currentPassword')
		expect(prisma.refreshSession.updateMany).toHaveBeenCalledWith(
			expect.objectContaining({
				where: { userId: 'user-1', revokedAt: null },
			})
		)
		expect(prisma.passwordResetToken.updateMany).toHaveBeenCalledWith({ where: { userId: 'user-1', usedAt: null }, data: { usedAt: expect.any(Date) } })
		expect(prisma.emailChangeToken.updateMany).toHaveBeenCalledWith({ where: { userId: 'user-1', usedAt: null }, data: { usedAt: expect.any(Date) } })
		expect(prisma.emailVerificationToken.updateMany).toHaveBeenCalledWith({ where: { userId: 'user-1', usedAt: null }, data: { usedAt: expect.any(Date) } })
	})

	it('rejects a password verified before a concurrent credential transition', async () => {
		const { service, prisma } = createService()
		prisma.user.findUnique.mockResolvedValue({ id: 'user-1', password: await hash('old-password'), authVersion: 0 })
		prisma.user.updateMany.mockResolvedValueOnce({ count: 0 })
		await expect(service.update('user-1', { password: 'new-password', currentPassword: 'old-password' })).rejects.toBeInstanceOf(UnauthorizedException)
		expect(prisma.refreshSession.updateMany).not.toHaveBeenCalled()
		expect(prisma.passwordResetToken.updateMany).not.toHaveBeenCalled()
	})
})
