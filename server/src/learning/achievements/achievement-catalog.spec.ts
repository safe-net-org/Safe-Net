import { ACHIEVEMENTS, AchievementStats } from './achievement-catalog'

const emptyStats: AchievementStats = {
	totalXp: 0,
	certificateCount: 0,
	completedLessonCount: 0,
	completedStageOrders: [],
	completedCourseSlugs: [],
	phishingFirstTryCorrect: 0,
	allPhishingFirstTry: false,
	foundAllRedFlagsInOneEmail: false,
	currentCorrectStreak: 0,
	flawlessCourseCount: 0,
	perfectTestCount: 0,
	stagesWithAllTestsPerfect: 0,
	longestDayStreak: 0,
	hasComeback: false,
	wrongThenRightCount: 0,
	maxTasksInOneDay: 0,
	isCompletionist: false,
	solvedAtNight: false,
	solvedEarlyMorning: false,
	hasFastPerfectTest: false,
}

describe('achievement catalog', () => {
	it('has unique codes', () => {
		const codes = ACHIEVEMENTS.map(a => a.code)
		expect(new Set(codes).size).toBe(codes.length)
	})

	// The bug this catalog exists to prevent: seed.ts defined PERFECT_SCORE
	// while the service awarded PERFECT_STREAK, so it could never be earned.
	// Every code must now be reachable through a rule.
	it('gives every achievement a rule, except the one awarded at registration', () => {
		const withoutRule = ACHIEVEMENTS.filter(a => !a.isEarned).map(a => a.code)
		expect(withoutRule).toEqual(['FIRST_LOGIN'])
	})

	it('awards nothing to a brand-new user', () => {
		const earned = ACHIEVEMENTS.filter(a => a.isEarned?.(emptyStats))
		expect(earned).toEqual([])
	})

	it('awards everything to a user who has done everything', () => {
		const maxedStats: AchievementStats = {
			totalXp: 100_000,
			certificateCount: 21,
			completedLessonCount: 24,
			completedStageOrders: [1, 2, 3, 4, 5, 6, 7, 8],
			completedCourseSlugs: [],
			phishingFirstTryCorrect: 100,
			allPhishingFirstTry: true,
			foundAllRedFlagsInOneEmail: true,
			currentCorrectStreak: 100,
			flawlessCourseCount: 21,
			perfectTestCount: 21,
			stagesWithAllTestsPerfect: 8,
			longestDayStreak: 365,
			hasComeback: true,
			wrongThenRightCount: 50,
			maxTasksInOneDay: 100,
			isCompletionist: true,
			solvedAtNight: true,
			solvedEarlyMorning: true,
			hasFastPerfectTest: true,
		}

		const unearned = ACHIEVEMENTS.filter(
			a => a.isEarned && !a.isEarned(maxedStats)
		).map(a => a.code)

		expect(unearned).toEqual([])
	})

	it('keeps tier progressions monotonic', () => {
		const streakTiers: [string, keyof AchievementStats, number][] = [
			['STREAK_3', 'longestDayStreak', 3],
			['STREAK_7', 'longestDayStreak', 7],
			['STREAK_30', 'longestDayStreak', 30],
		]

		// A 7-day streak must satisfy the 3-day tier but not the 30-day one.
		const stats = { ...emptyStats, longestDayStreak: 7 }
		const earned = streakTiers
			.filter(([code]) =>
				ACHIEVEMENTS.find(a => a.code === code)?.isEarned?.(stats)
			)
			.map(([code]) => code)

		expect(earned).toEqual(['STREAK_3', 'STREAK_7'])
	})

	it('never rewards zero XP', () => {
		expect(ACHIEVEMENTS.every(a => a.xpReward > 0)).toBe(true)
	})
})
