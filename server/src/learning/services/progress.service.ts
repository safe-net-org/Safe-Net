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
import { AchievementsService } from './achievements.service'

@Injectable()
export class ProgressService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly achievementsService: AchievementsService
	) {}

	async getLessonWithTasks(
		lessonId: string,
		userId: string
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

		return {
			id: lesson.id,
			courseTitle: course.title,
			courseSlug: course.slug,
			order: lesson.order,
			title: lesson.title,
			estimatedDuration: lesson.estimatedDuration,
			blocks: lesson.blocks.map(block => ({
				id: block.id,
				order: block.order,
				type: block.type,
				title: block.title,
				content: block.content,
			})),
			tasks: lesson.tasks.map(task => ({
				id: task.id,
				order: task.order,
				type: task.type,
				title: task.title,
				question: task.question ?? undefined,
				points: task.points,
				difficulty: task.difficulty,
				...buildSimulatorContent(task.meta),
				options: task.options.map(o => ({
					id: o.id,
					text: o.text,
				})),
			})),
		}
	}

	async answerTask(
		taskId: string,
		userId: string,
		dto: AnswerTaskDto
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
				task.meta as PhishingTaskMeta | null,
				dto.selectedSpans ?? []
			)
			isCorrect = phishingEvaluation.isCorrect
		} else if (TEXT_TASK_TYPES.includes(task.type)) {
			isCorrect = evaluateTextAnswer(task.correctAnswer, dto.textAnswer)
		}

		// XP is awarded only for the first correct answer
		const awardedXp = isCorrect && !previousCorrectAttempt ? task.points : 0

		// Create the attempt record
		await this.prisma.taskAttempt.create({
			data: {
				userId,
				taskId: task.id,
				selectedOptionIds: dto.selectedOptionIds || [],
				textAnswer: dto.textAnswer,
				isCorrect,
				awardedXp,
			},
		})

		// Recalculate course progress
		const totalTasksInCourse = await this.prisma.task.count({
			where: {
				lesson: {
					courseId: course.id,
				},
			},
		})

		const solvedCorrectTasks = await this.prisma.taskAttempt.findMany({
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

		const totalXpAgg = await this.prisma.taskAttempt.aggregate({
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
		await this.prisma.courseProgress.upsert({
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
		const certificateId = await this.checkAndIssueCertificate(userId, course.id)
		certificateIssued = !!certificateId

		// ✅ Check and award achievements
		const newAchievements =
			await this.achievementsService.checkAndAwardAchievements(userId)

		return {
			taskId: task.id,
			isCorrect,
			explanation: task.explanation,
			awardedXp,
			totalXp,
			courseProgress: progressPercent,
			lessonCompleted,
			certificateIssued,
			newAchievements,
			...this.buildPhishingFeedback(task.meta, phishingEvaluation),
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

	async checkAndIssueCertificate(
		userId: string,
		courseId: string
	): Promise<string | null> {
		const [
			totalLessons,
			completedLessons,
			totalTasks,
			solvedTasksData,
			courseTests,
			passedTestResults,
		] = await this.prisma.$transaction([
			this.prisma.lesson.count({
				where: { courseId },
			}),
			this.prisma.completedLesson.count({
				where: {
					userId,
					lesson: { courseId },
				},
			}),
			this.prisma.task.count({
				where: {
					lesson: { courseId },
				},
			}),
			this.prisma.taskAttempt.findMany({
				where: {
					userId,
					task: {
						lesson: { courseId },
					},
					isCorrect: true,
				},
				distinct: ['taskId'],
				select: { taskId: true },
			}),
			this.prisma.test.findMany({
				where: { courseId },
				select: { id: true },
			}),
			this.prisma.testResult.findMany({
				where: {
					userId,
					test: { courseId },
					passed: true,
				},
				distinct: ['testId'],
				select: { testId: true },
			}),
		])

		const solvedTasks = solvedTasksData.length
		const totalTests = courseTests.length
		const passedTests = passedTestResults.length

		// Check full course completion
		if (totalLessons === 0 || completedLessons < totalLessons) {
			return null
		}

		if (totalTasks === 0 || solvedTasks < totalTasks) {
			return null
		}

		if (totalTests > 0 && passedTests < totalTests) {
			return null
		}

		// Check for an existing certificate
		const existingCertificate = await this.prisma.certificate.findFirst({
			where: { userId, courseId },
		})

		if (existingCertificate) {
			return existingCertificate.id
		}

		// Generate and create a new certificate
		const certificateNumber = await this.generateCertificateNumber()

		const certificate = await this.prisma.certificate.create({
			data: {
				userId,
				courseId,
				certificateNumber,
			},
		})

		return certificate.id
	}

	private async generateCertificateNumber(): Promise<string> {
		let attempts = 0
		const maxAttempts = 5

		while (attempts < maxAttempts) {
			const date = new Date()
			const year = date.getFullYear()
			const month = String(date.getMonth() + 1).padStart(2, '0')
			const day = String(date.getDate()).padStart(2, '0')
			const random = Math.floor(Math.random() * 100000)
				.toString()
				.padStart(5, '0')

			const certificateNumber = `CERT-${year}${month}${day}-${random}`

			const exists = await this.prisma.certificate.findUnique({
				where: { certificateNumber },
			})

			if (!exists) {
				return certificateNumber
			}

			attempts++
		}

		throw new Error('Failed to generate unique certificate number')
	}
}
