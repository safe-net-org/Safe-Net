import {
	ForbiddenException,
	Injectable,
	NotFoundException,
} from '@nestjs/common'
import { TaskType } from '@prisma/client'
import { PrismaService } from '../../prisma.service'
import { AnswerResultDto } from '../dto/answer-result.dto'
import { AnswerTaskDto } from '../dto/answer-task.dto'
import { LessonDetailsDto } from '../dto/lesson-details.dto'
import { buildSimulatorContent } from '../answers/simulator-content'
import {
	evaluateChoiceAnswer,
	evaluatePhishingAnswer,
	evaluateTextAnswer,
	PhishingEvaluation,
	PhishingTaskMeta,
	SIMULATOR_TASK_TYPES,
	TEXT_TASK_TYPES,
} from '../answers/task-answer.evaluator'
import { CertificatesService } from './certificates.service'
import { AchievementsService } from './achievements.service'
import { Locale, pickLocalized } from '../../i18n/locale'

@Injectable()
export class ProgressService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly achievementsService: AchievementsService,
		private readonly certificatesService: CertificatesService
	) {}

	async getLessonWithTasks(
		lessonId: string,
		userId: string,
		locale: Locale
	): Promise<LessonDetailsDto> {
		const lesson = await this.prisma.lesson.findUnique({
			where: { id: lessonId },
			include: {
				blocks: {
					orderBy: { order: 'asc' },
				},
				tasks: {
					orderBy: { order: 'asc' },
					include: {
						options: {
							orderBy: { order: 'asc' },
						},
					},
				},
			},
		})

		if (!lesson) throw new NotFoundException('Lesson not found')

		const course = await this.prisma.course.findUnique({
			where: { id: lesson.courseId },
		})

		if (!course) throw new NotFoundException('Course not found')

		const solvedTasks = await this.prisma.taskAttempt.findMany({
			where: { userId, task: { lessonId }, isCorrect: true },
			distinct: ['taskId'],
			select: { taskId: true },
		})
		const completedTaskIds = new Set(solvedTasks.map(attempt => attempt.taskId))

		return {
			id: lesson.id,
			courseTitle: pickLocalized(locale, course.title, course.titleRu),
			courseSlug: course.slug,
			order: lesson.order,
			title: pickLocalized(locale, lesson.title, lesson.titleRu),
			estimatedDuration: lesson.estimatedDuration,
			blocks: lesson.blocks.map(block => ({
				id: block.id,
				order: block.order,
				type: block.type,
				title: pickLocalized(locale, block.title, block.titleRu),
				content: pickLocalized(locale, block.content, block.contentRu),
			})),
			tasks: lesson.tasks.map(task => ({
				id: task.id,
				order: task.order,
				type: task.type,
				title: pickLocalized(locale, task.title, task.titleRu),
				question: pickLocalized(locale, task.question, task.questionRu) ?? undefined,
				points: task.points,
				completed: completedTaskIds.has(task.id),
				difficulty: task.difficulty,
				...buildSimulatorContent(pickLocalized(locale, task.meta, task.metaRu)),
				options: task.options.map(o => ({
					id: o.id,
					text: pickLocalized(locale, o.text, o.textRu),
				})),
			})),
		}
	}

	async answerTask(
		taskId: string,
		userId: string,
		dto: AnswerTaskDto,
		locale: Locale
): Promise<AnswerResultDto> {
		const task = await this.prisma.task.findUnique({
			where: { id: taskId },
			include: {
				lesson: {
					include: {
						course: true,
					},
				},
				options: true,
			},
		})

		if (!task) throw new NotFoundException('Task not found')

		const course = task.lesson.course

		const user = await this.prisma.user.findUnique({
			where: { id: userId },
		})

		if (!user) throw new ForbiddenException('User not found or unauthorized')

		// Check whether there was already a correct attempt
		const previousCorrectAttempt = await this.prisma.taskAttempt.findFirst({
			where: {
				userId,
				taskId: task.id,
				isCorrect: true,
			},
		})

		// Check answer correctness
		let isCorrect = false
		let phishingEvaluation: PhishingEvaluation | undefined

		if (
			task.type === TaskType.SINGLE_CHOICE ||
			task.type === TaskType.MULTI_CHOICE
		) {
			isCorrect = evaluateChoiceAnswer(
				task.options.filter(option => option.isCorrect).map(option => option.id),
				dto.selectedOptionIds || []
			)
		} else if (SIMULATOR_TASK_TYPES.includes(task.type)) {
			phishingEvaluation = evaluatePhishingAnswer(
				pickLocalized(locale, task.meta, task.metaRu) as PhishingTaskMeta | null,
				dto.selectedSpans ?? []
			)
			isCorrect = phishingEvaluation.isCorrect
		} else if (TEXT_TASK_TYPES.includes(task.type)) {
			isCorrect = evaluateTextAnswer(
				pickLocalized(locale, task.correctAnswer, task.correctAnswerRu),
				dto.textAnswer
			)
		}

		// XP is awarded only for the first correct answer
		let awardedXp = isCorrect && !previousCorrectAttempt ? task.points : 0

		// Create the attempt record
		const attemptData = {
				userId,
				taskId: task.id,
				selectedOptionIds: dto.selectedOptionIds || [],
				textAnswer: dto.textAnswer,
				isCorrect,
				awardedXp,
				xpAwardKey: awardedXp > 0 ? `${userId}:${task.id}` : null,
			}
		try {
			await this.prisma.taskAttempt.create({ data: attemptData })
		} catch (error) {
			if (!attemptData.xpAwardKey || typeof error !== 'object' || error === null ||
				!('code' in error) || error.code !== 'P2002') throw error
			// Another request won the unique award key. Keep this attempt, with
			// zero XP, so concurrent answers remain visible in the history.
			awardedXp = 0
			await this.prisma.taskAttempt.create({
				data: { ...attemptData, awardedXp: 0, xpAwardKey: null },
			})
		}

		const { progressPercent, totalXp } = await this.prisma.$transaction(async tx => {
			// Serialize snapshots for this learner. Otherwise a slower answer can
			// overwrite a newer course total after answering a different task.
			await tx.$queryRaw`SELECT "id" FROM "users" WHERE "id" = ${userId} FOR UPDATE`
			// Recalculate course progress
			const totalTasksInCourse = await tx.task.count({
				where: {
					lesson: {
						courseId: course.id,
					},
				},
			})

			const solvedCorrectTasks = await tx.taskAttempt.findMany({
				where: {
					userId,
					task: {
						lesson: {
							courseId: course.id,
						},
					},
					isCorrect: true,
				},
				distinct: ['taskId'],
				select: { taskId: true },
			})

			const totalXpAgg = await tx.taskAttempt.aggregate({
				where: {
					userId,
					task: {
						lesson: {
							courseId: course.id,
						},
					},
				},
				_sum: {
					awardedXp: true,
				},
			})

			const progressPercent =
				totalTasksInCourse > 0
					? Math.min(
							100,
							Math.round((solvedCorrectTasks.length / totalTasksInCourse) * 100)
						)
					: 0

			const totalXp = totalXpAgg._sum?.awardedXp ?? 0

			// Update course progress
			await tx.courseProgress.upsert({
				where: {
					userId_courseId: {
						userId,
						courseId: course.id,
					},
				},
				create: {
					userId,
					courseId: course.id,
					progress: progressPercent,
					totalXp,
				},
				update: {
					progress: progressPercent,
					totalXp,
				},
			})
			return { progressPercent, totalXp }
		})

		// Check lesson completion
		const lessonTasks = await this.prisma.task.findMany({
			where: { lessonId: task.lessonId },
			select: { id: true },
		})

		const solvedTasksInLesson = await this.prisma.taskAttempt.findMany({
			where: {
				userId,
				task: { lessonId: task.lessonId },
				isCorrect: true,
			},
			select: { taskId: true },
			distinct: ['taskId'],
		})

		const lessonCompleted =
			lessonTasks.length > 0 &&
			solvedTasksInLesson.length === lessonTasks.length

		if (lessonCompleted) {
			await this.prisma.completedLesson.upsert({
				where: {
					userId_lessonId: {
						userId,
						lessonId: task.lessonId,
					},
				},
				create: {
					userId,
					lessonId: task.lessonId,
				},
				update: {},
			})
		}

		// Check and issue certificate
		let certificateIssued = false
		const certificateId = await this.certificatesService.checkAndIssueCertificate(userId, course.id)
		certificateIssued = !!certificateId

		// ✅ Check and award achievements
		const newAchievements =
			await this.achievementsService.checkAndAwardAchievements(userId)

		return {
			taskId: task.id,
			isCorrect,
			explanation: pickLocalized(locale, task.explanation, task.explanationRu),
			awardedXp,
			totalXp,
			courseProgress: progressPercent,
			lessonCompleted,
			certificateIssued,
			newAchievements,
			...this.buildPhishingFeedback(
				pickLocalized(locale, task.meta, task.metaRu),
				phishingEvaluation
			),
		}
	}

	/**
	 * Turns a simulator evaluation into learner-facing feedback. Returns an
	 * empty object for non-simulator tasks so the fields stay absent rather
	 * than null.
	 */
	private buildPhishingFeedback(
		meta: unknown,
		evaluation: PhishingEvaluation | undefined
	) {
		if (!evaluation) return {}

		const redFlags = (meta as PhishingTaskMeta | null)?.redFlags ?? []
		const found = new Set(evaluation.foundFlagIds)

		return {
			redFlagFeedback: redFlags.map(flag => ({
				id: flag.id,
				span: flag.span,
				reason: flag.reason,
				found: found.has(flag.id),
			})),
			falsePositives: evaluation.falsePositives,
		}
	}

}
