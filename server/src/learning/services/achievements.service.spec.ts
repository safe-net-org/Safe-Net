import { Prisma } from '@prisma/client'
import { PrismaService } from 'src/prisma.service'
import { AchievementStatsCollector } from '../achievements/achievement-stats.collector'
import { AchievementsService } from './achievements.service'

describe('AchievementsService concurrent awards', () => {
	function setup() {
		const prisma = {
			achievement: { findUnique: jest.fn().mockResolvedValue({ id: 'achievement-1', xpReward: 10 }) },
			userAchievement: {
				findUnique: jest.fn().mockResolvedValue(null),
				create: jest.fn().mockReturnValue(Promise.resolve({})),
			},
			user: { update: jest.fn().mockReturnValue(Promise.resolve({})) },
			$transaction: jest.fn().mockResolvedValue([]),
		}
		return { prisma, service: new AchievementsService(prisma as unknown as PrismaService, {} as AchievementStatsCollector) }
	}

	it('treats the duplicate-award transaction loser as an already awarded achievement', async () => {
		const { prisma, service } = setup()
		prisma.$transaction.mockRejectedValueOnce(new Prisma.PrismaClientKnownRequestError('Duplicate award', {
			code: 'P2002', clientVersion: '7.8.0',
		}))
		await expect(service.awardAchievement('user-1', 'FIRST_LOGIN')).resolves.toBe(false)
	})

	it('increments bonus XP in the same transaction as the new award', async () => {
		const { prisma, service } = setup()
		await expect(service.awardAchievement('user-1', 'FIRST_LOGIN')).resolves.toBe(true)
		expect(prisma.user.update).toHaveBeenCalledWith({ where: { id: 'user-1' }, data: { bonusXp: { increment: 10 } } })
		expect(prisma.$transaction).toHaveBeenCalledWith(expect.arrayContaining([expect.any(Promise)]))
	})

	it('propagates database errors unrelated to a duplicate award', async () => {
		const { prisma, service } = setup()
		const failure = new Error('Database unavailable')
		prisma.$transaction.mockRejectedValueOnce(failure)
		await expect(service.awardAchievement('user-1', 'FIRST_LOGIN')).rejects.toBe(failure)
	})
})
