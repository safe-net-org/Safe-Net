import { Injectable } from '@nestjs/common'
import { TaskType } from '@prisma/client'
import { PrismaService } from 'src/prisma.service'
import { AchievementStats } from './achievement-catalog'

/** Tasks handled by the phishing simulator rather than plain option picking. */
const SIMULATOR_TASK_TYPES: TaskType[] = [
	TaskType.PHISHING_EMAIL,
	TaskType.PHISHING_SITE,
]

const COMEBACK_GAP_DAYS = 14
const NIGHT_HOURS = { from: 0, to: 4 } as const
const EARLY_MORNING_HOURS = { from: 5, to: 7 } as const
const FAST_TEST_MIN_SCORE = 90
const FAST_TEST_TIME_RATIO = 0.5
const MS_PER_DAY = 24 * 60 * 60 * 1000

interface AttemptRecord {
	taskId: string
	isCorrect: boolean
	createdAt: Date
	type: TaskType
	courseId: string
}

/**
 * Builds the single stats snapshot every achievement rule reads.
 *
 * One batch of queries per evaluation, then everything is computed in memory.
 * The alternative — a query per achievement — runs after every single task
 * answer, which does not scale past a handful of rules.
 */
@Injectable()
export class AchievementStatsCollector {
	constructor(private readonly prisma: PrismaService) {}

	async collect(userId: string): Promise<AchievementStats> {
		const [
			xpAggregate,
			certificates,
			completedLessons,
			stages,
			rawAttempts,
			testResults,
			testAverages,
			totalLessons,
			totalTasks,
			totalTests,
		] = await Promise.all([
			this.prisma.courseProgress.aggregate({
				where: { userId },
				_sum: { totalXp: true },
			}),
			this.prisma.certificate.findMany({
				where: { userId },
				select: { courseId: true, course: { select: { slug: true } } },
			}),
			this.prisma.completedLesson.findMany({
				where: { userId },
				select: { lessonId: true },
			}),
			this.prisma.stage.findMany({
				select: {
					order: true,
					courses: { select: { id: true, tests: { select: { id: true } } } },
				},
			}),
			this.prisma.taskAttempt.findMany({
				where: { userId },
				orderBy: { createdAt: 'asc' },
				select: {
					taskId: true,
					isCorrect: true,
					createdAt: true,
					task: {
						select: { type: true, lesson: { select: { courseId: true } } },
					},
				},
			}),
			this.prisma.testResult.findMany({
				where: { userId },
				select: { testId: true, score: true, time: true, passed: true },
			}),
			this.prisma.testResult.groupBy({
				by: ['testId'],
				_avg: { time: true },
			}),
			this.prisma.lesson.count(),
			this.prisma.task.count(),
			this.prisma.test.count(),
		])

		const attempts: AttemptRecord[] = rawAttempts.map(attempt => ({
			taskId: attempt.taskId,
			isCorrect: attempt.isCorrect,
			createdAt: attempt.createdAt,
			type: attempt.task.type,
			courseId: attempt.task.lesson.courseId,
		}))

		const certifiedCourseIds = new Set(certificates.map(c => c.courseId))
		const attemptsByTask = this.groupByTask(attempts)
		const activeDays = this.distinctActiveDays(attempts)
		const solvedTaskIds = new Set(
			attempts.filter(a => a.isCorrect).map(a => a.taskId)
		)
		const passedTestIds = new Set(
			testResults.filter(r => r.passed).map(r => r.testId)
		)

		return {
			totalXp: xpAggregate._sum.totalXp ?? 0,
			certificateCount: certificates.length,
			completedLessonCount: completedLessons.length,
			completedStageOrders: stages
				.filter(
					stage =>
						stage.courses.length > 0 &&
						stage.courses.every(course => certifiedCourseIds.has(course.id))
				)
				.map(stage => stage.order),
			completedCourseSlugs: certificates.map(c => c.course.slug.toLowerCase()),

			phishingFirstTryCorrect: this.countFirstTryCorrect(
				attemptsByTask,
				SIMULATOR_TASK_TYPES
			),
			allPhishingFirstTry: this.allFirstTryCorrect(
				attemptsByTask,
				SIMULATOR_TASK_TYPES,
				await this.countTasksOfTypes(SIMULATOR_TASK_TYPES)
			),
			// A phishing task only grades correct when every red flag was found
			// and nothing innocent was flagged, so a correct simulator attempt
			// *is* a clean sweep of that message's red flags.
			foundAllRedFlagsInOneEmail: attempts.some(
				attempt =>
					attempt.isCorrect && SIMULATOR_TASK_TYPES.includes(attempt.type)
			),

			currentCorrectStreak: this.currentCorrectStreak(attempts),
			flawlessCourseCount: this.countFlawlessCourses(attempts, certifiedCourseIds),
			perfectTestCount: testResults.filter(r => r.score === 100).length,
			stagesWithAllTestsPerfect: this.countStagesWithPerfectTests(
				stages,
				testResults
			),

			longestDayStreak: this.longestDayStreak(activeDays),
			hasComeback: this.hasComeback(activeDays),
			wrongThenRightCount: this.countWrongThenRight(attemptsByTask),
			maxTasksInOneDay: this.maxSolvedInOneDay(attempts),

			isCompletionist:
				totalLessons > 0 &&
				completedLessons.length >= totalLessons &&
				totalTasks > 0 &&
				solvedTaskIds.size >= totalTasks &&
				(totalTests === 0 || passedTestIds.size >= totalTests),

			solvedAtNight: this.solvedWithinHours(attempts, NIGHT_HOURS),
			solvedEarlyMorning: this.solvedWithinHours(attempts, EARLY_MORNING_HOURS),
			hasFastPerfectTest: this.hasFastPerfectTest(testResults, testAverages),
		}
	}

	private groupByTask(attempts: AttemptRecord[]): Map<string, AttemptRecord[]> {
		const grouped = new Map<string, AttemptRecord[]>()
		for (const attempt of attempts) {
			const existing = grouped.get(attempt.taskId)
			if (existing) existing.push(attempt)
			else grouped.set(attempt.taskId, [attempt])
		}
		return grouped
	}

	private async countTasksOfTypes(types: TaskType[]): Promise<number> {
		return this.prisma.task.count({ where: { type: { in: types } } })
	}

	/** A task counts as first-try only if its earliest attempt was correct. */
	private countFirstTryCorrect(
		attemptsByTask: Map<string, AttemptRecord[]>,
		types: TaskType[]
	): number {
		let count = 0
		for (const taskAttempts of attemptsByTask.values()) {
			const first = taskAttempts[0]
			if (types.includes(first.type) && first.isCorrect) count++
		}
		return count
	}

	private allFirstTryCorrect(
		attemptsByTask: Map<string, AttemptRecord[]>,
		types: TaskType[],
		totalTasksOfType: number
	): boolean {
		if (totalTasksOfType === 0) return false
		return this.countFirstTryCorrect(attemptsByTask, types) >= totalTasksOfType
	}

	private currentCorrectStreak(attempts: AttemptRecord[]): number {
		let streak = 0
		for (let i = attempts.length - 1; i >= 0; i--) {
			if (!attempts[i].isCorrect) break
			streak++
		}
		return streak
	}

	private countFlawlessCourses(
		attempts: AttemptRecord[],
		certifiedCourseIds: Set<string>
	): number {
		const coursesWithMistake = new Set(
			attempts.filter(a => !a.isCorrect).map(a => a.courseId)
		)
		let count = 0
		for (const courseId of certifiedCourseIds) {
			if (!coursesWithMistake.has(courseId)) count++
		}
		return count
	}

	private countStagesWithPerfectTests(
		stages: { courses: { tests: { id: string }[] }[] }[],
		testResults: { testId: string; score: number }[]
	): number {
		const perfectTestIds = new Set(
			testResults.filter(r => r.score === 100).map(r => r.testId)
		)
		let count = 0
		for (const stage of stages) {
			const stageTestIds = stage.courses.flatMap(c => c.tests.map(t => t.id))
			if (stageTestIds.length === 0) continue
			if (stageTestIds.every(id => perfectTestIds.has(id))) count++
		}
		return count
	}

	/** Distinct UTC calendar days with activity, ascending. */
	private distinctActiveDays(attempts: AttemptRecord[]): number[] {
		const days = new Set<number>()
		for (const attempt of attempts) {
			days.add(this.toUtcDayIndex(attempt.createdAt))
		}
		return [...days].sort((a, b) => a - b)
	}

	private toUtcDayIndex(date: Date): number {
		return Math.floor(
			Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) /
				MS_PER_DAY
		)
	}

	private longestDayStreak(activeDays: number[]): number {
		if (activeDays.length === 0) return 0
		let longest = 1
		let current = 1
		for (let i = 1; i < activeDays.length; i++) {
			if (activeDays[i] === activeDays[i - 1] + 1) current++
			else current = 1
			if (current > longest) longest = current
		}
		return longest
	}

	private hasComeback(activeDays: number[]): boolean {
		for (let i = 1; i < activeDays.length; i++) {
			if (activeDays[i] - activeDays[i - 1] >= COMEBACK_GAP_DAYS) return true
		}
		return false
	}

	/** Tasks first answered wrong, later answered correctly. */
	private countWrongThenRight(
		attemptsByTask: Map<string, AttemptRecord[]>
	): number {
		let count = 0
		for (const taskAttempts of attemptsByTask.values()) {
			const firstWasWrong = !taskAttempts[0].isCorrect
			const laterCorrect = taskAttempts.slice(1).some(a => a.isCorrect)
			if (firstWasWrong && laterCorrect) count++
		}
		return count
	}

	private maxSolvedInOneDay(attempts: AttemptRecord[]): number {
		const solvedPerDay = new Map<number, Set<string>>()
		for (const attempt of attempts) {
			if (!attempt.isCorrect) continue
			const day = this.toUtcDayIndex(attempt.createdAt)
			const tasks = solvedPerDay.get(day) ?? new Set<string>()
			tasks.add(attempt.taskId)
			solvedPerDay.set(day, tasks)
		}
		let max = 0
		for (const tasks of solvedPerDay.values()) {
			if (tasks.size > max) max = tasks.size
		}
		return max
	}

	private solvedWithinHours(
		attempts: AttemptRecord[],
		range: { from: number; to: number }
	): boolean {
		return attempts.some(attempt => {
			if (!attempt.isCorrect) return false
			const hour = attempt.createdAt.getUTCHours()
			return hour >= range.from && hour < range.to
		})
	}

	/**
	 * Fast only relative to how long this specific test usually takes, so a
	 * short test does not hand out the achievement for free.
	 */
	private hasFastPerfectTest(
		testResults: { testId: string; score: number; time: number }[],
		testAverages: { testId: string; _avg: { time: number | null } }[]
	): boolean {
		const averageByTest = new Map(
			testAverages.map(entry => [entry.testId, entry._avg.time])
		)
		return testResults.some(result => {
			if (result.score < FAST_TEST_MIN_SCORE) return false
			const average = averageByTest.get(result.testId)
			if (!average) return false
			return result.time < average * FAST_TEST_TIME_RATIO
		})
	}
}
