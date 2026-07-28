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
			},
			course: {
				findMany: jest.fn().mockResolvedValue([]),
			},
			courseProgress: {
				createMany: jest.fn().mockResolvedValue({ count: 0 }),
			},
		}
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
		})
		prisma.user.update.mockResolvedValue({
			name: 'Ada',
			email: 'ada@example.com',
		})

		await service.update('user-1', {
			email: ' ADA@Example.COM ',
			password: 'new-password',
			currentPassword: 'old-password',
		})

		const data = prisma.user.update.mock.calls[0][0].data
		expect(data.email).toBe('ada@example.com')
		expect(data.password).not.toBe('new-password')
		expect(await verify(data.password, 'new-password')).toBe(true)
		expect(data).not.toHaveProperty('currentPassword')
	})
})
