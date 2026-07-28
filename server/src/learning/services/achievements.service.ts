import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'
import {
	ACHIEVEMENTS,
	AchievementCode,
} from '../achievements/achievement-catalog'
import { AchievementStatsCollector } from '../achievements/achievement-stats.collector'
import { Locale, pickLocalized } from '../../i18n/locale'

@Injectable()
export class AchievementsService {
	private readonly logger = new Logger(AchievementsService.name)

	constructor(
		private readonly prisma: PrismaService,
		private readonly statsCollector: AchievementStatsCollector
	) {}

	async getUserAchievements(userId: string, locale: Locale) {
		const achievements = await this.prisma.userAchievement.findMany({
			where: { userId },
			include: {
				achievement: true,
			},
			orderBy: {
				earnedAt: 'desc',
			},
		})

		return achievements.map(ua => ({
			id: ua.id,
			earnedAt: ua.earnedAt.toISOString(),
			achievement: {
				id: ua.achievement.id,
				code: ua.achievement.code,
				title: pickLocalized(locale, ua.achievement.title, ua.achievement.titleRu),
				description: pickLocalized(locale, ua.achievement.description, ua.achievement.descriptionRu),
				icon: ua.achievement.icon,
				category: ua.achievement.category,
				tier: ua.achievement.tier,
				xpReward: ua.achievement.xpReward,
			},
		}))
	}

	async getAllAchievements(locale: Locale) {
		const achievements = await this.prisma.achievement.findMany({
			orderBy: [{ category: 'asc' }, { order: 'asc' }],
		})
		return achievements.map(a => ({
			...a,
			title: pickLocalized(locale, a.title, a.titleRu),
			description: pickLocalized(locale, a.description, a.descriptionRu),
		}))
	}

	async getAchievementById(id: string, locale: Locale) {
		const achievement = await this.prisma.achievement.findUnique({
			where: { id },
		})

		if (!achievement) {
			throw new NotFoundException('Achievement not found')
		}

		return {
			...achievement,
			title: pickLocalized(locale, achievement.title, achievement.titleRu),
			description: pickLocalized(locale, achievement.description, achievement.descriptionRu),
		}
	}

	/**
	 * `achievementCode` is the literal union from the catalog, so a code that
	 * does not exist fails to compile instead of silently doing nothing.
	 */
	async awardAchievement(
		userId: string,
		achievementCode: AchievementCode
	): Promise<boolean> {
		const achievement = await this.prisma.achievement.findUnique({
			where: { code: achievementCode },
		})

		if (!achievement) {
			// The code is valid but absent from the DB — the seed is out of sync
			// with the catalog. Logged rather than thrown: this runs inside
			// registration and task answering, and a missing achievement row must
			// not break either. Silence is what hid two permanently unearnable
			// achievements before.
			this.logger.error(
				`Achievement "${achievementCode}" exists in the catalog but not in the database. Re-run the seed.`
			)
			return false
		}

		// The unique constraint on (userId, achievementId) is what actually makes
		// awarding idempotent; this check just avoids a noisy failed insert.
		const existingAward = await this.prisma.userAchievement.findUnique({
			where: {
				userId_achievementId: {
					userId,
					achievementId: achievement.id,
				},
			},
		})

		if (existingAward) {
			return false
		}

		await this.prisma.$transaction([
			this.prisma.userAchievement.create({
				data: {
					userId,
					achievementId: achievement.id,
				},
			}),
			this.prisma.user.update({
				where: { id: userId },
				data: { bonusXp: { increment: achievement.xpReward } },
			}),
		])

		return true
	}


	/**
	 * Evaluates every catalog rule against one stats snapshot and awards
	 * whatever is newly earned. Returns the codes awarded by this call.
	 *
	 * Safe to call after any progress event: awarding is idempotent, so a rule
	 * that is already satisfied simply awards nothing on later calls.
	 */
	async checkAndAwardAchievements(userId: string): Promise<AchievementCode[]> {
		const stats = await this.statsCollector.collect(userId)
		const awardedCodes: AchievementCode[] = []

		for (const achievement of ACHIEVEMENTS) {
			// FIRST_LOGIN has no rule — it is awarded at registration, since no
			// stats snapshot can observe "an account was created".
			if (!achievement.isEarned) continue
			if (!achievement.isEarned(stats)) continue

			const awarded = await this.awardAchievement(userId, achievement.code)
			if (awarded) awardedCodes.push(achievement.code)
		}

		return awardedCodes
	}
}
